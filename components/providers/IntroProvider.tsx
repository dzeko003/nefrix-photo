"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { useHydrated, useMediaQuery } from "../hooks/useMediaQuery";

type IntroState = {
  introDone: boolean;
  showPreloader: boolean;
  finishIntro: () => void;
};

const IntroContext = createContext<IntroState>({
  introDone: true,
  showPreloader: false,
  finishIntro: () => {},
});

export const useIntro = () => useContext(IntroContext);

const neverChanges = () => () => {};

export function IntroProvider({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const alreadyPlayed = useSyncExternalStore(
    neverChanges,
    () => sessionStorage.getItem("intro-played") === "1",
    () => false,
  );

  const [finished, setFinished] = useState(false);

  const showPreloader = hydrated && !reduced && !alreadyPlayed && !finished;
  const introDone = hydrated && !showPreloader;

  // Appelé depuis un callback d'animation, pas depuis un effet : légitime.
  const finishIntro = useCallback(() => {
    sessionStorage.setItem("intro-played", "1");
    setFinished(true);
  }, []);

  const value = useMemo(
    () => ({ introDone, showPreloader, finishIntro }),
    [introDone, showPreloader, finishIntro],
  );

  return (
    <IntroContext.Provider value={value}>{children}</IntroContext.Provider>
  );
}
