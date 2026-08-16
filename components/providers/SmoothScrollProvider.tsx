"use client";

import Lenis from "lenis";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useMediaQuery } from "../hooks/useMediaQuery";

/**
 * L'instance Lenis est un système externe : on la publie via un store
 * plutôt qu'un `useState`, sinon l'effet déclencherait un rendu en cascade.
 * Les abonnés sont prévenus dès qu'elle existe — nécessaire car les effets
 * des enfants tournent avant celui du provider.
 */
type LenisStore = {
  subscribe: (onChange: () => void) => () => void;
  get: () => Lenis | null;
  set: (instance: Lenis | null) => void;
};

function createLenisStore(): LenisStore {
  let current: Lenis | null = null;
  const listeners = new Set<() => void>();

  return {
    subscribe(onChange) {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
    get: () => current,
    set(instance) {
      current = instance;
      listeners.forEach((listener) => listener());
    },
  };
}

const noopSubscribe = () => () => {};
const getNull = () => null;

const LenisContext = createContext<LenisStore | null>(null);

export function useLenis() {
  const store = useContext(LenisContext);

  return useSyncExternalStore(
    store?.subscribe ?? noopSubscribe,
    store?.get ?? getNull,
    getNull, // serveur
  );
}

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialiseur paresseux : le store est créé une seule fois et n'est
  // jamais remplacé, donc aucun rendu supplémentaire.
  const [store] = useState(createLenisStore);

  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    if (reduced) return;

    const instance = new Lenis({
      duration: 1.15,
      // Exponentielle décroissante : rapide au départ, longue traîne.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.6,
      // Sur mobile on garde le scroll natif : plus fluide et moins gourmand.
      syncTouch: false,
    });

    instance.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => instance.raf(time * 1000); // gsap en s, lenis en ms
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    store.set(instance);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33); // valeurs par défaut de GSAP
      store.set(null);
      instance.destroy();
    };
  }, [reduced, store]);

  return (
    <LenisContext.Provider value={store}>{children}</LenisContext.Provider>
  );
}
