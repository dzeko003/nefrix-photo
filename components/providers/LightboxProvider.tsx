"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useLenis } from "@/components/providers/SmoothScrollProvider";
import Photo from "../ui/Photo";

export type Slide = {
  photo: string;
  alt: string;
  title: string;
  meta?: string;
};

type LightboxApi = {
  open: (slides: Slide[], index: number) => void;
};

const LightboxContext = createContext<LightboxApi>({ open: () => {} });

export const useLightbox = () => useContext(LightboxContext);

type State = { slides: Slide[]; index: number };

export function LightboxProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State | null>(null);
  const lenis = useLenis();

  const root = useRef<HTMLDivElement>(null);
  const figure = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  const open = useCallback((slides: Slide[], index: number) => {
    if (!slides.length) return;
    opener.current = document.activeElement as HTMLElement | null;
    setState({ slides, index });
  }, []);

  const close = useCallback(() => {
    if (prefersReducedMotion() || !root.current) {
      setState(null);
      return;
    }
    // On démonte à la fin de la sortie, sinon l'overlay disparaîtrait d'un coup.
    gsap.to(root.current, {
      autoAlpha: 0,
      duration: 0.32,
      ease: "power2.in",
      onComplete: () => setState(null),
    });
  }, []);

  const go = useCallback((step: number) => {
    setState((s) => {
      if (!s) return s;
      const n = s.slides.length;
      // Modulo « positif » : -1 doit retomber sur la dernière image.
      return { ...s, index: (s.index + step + n) % n };
    });
  }, []);

  const isOpen = state !== null;

  // --- Verrou du scroll + clavier + focus --------------------------------
  useEffect(() => {
    if (!isOpen) return;

    lenis?.stop();
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Tab") {
        // Piège à focus minimal : la visionneuse n'a que des boutons, on
        // recycle donc la liste à chaque extrémité. Le `:not([tabindex="-1"])`
        // est indispensable — sans lui, le fond cliquable (non tabulable)
        // compterait comme premier élément et Maj+Tab s'échapperait du dialogue.
        const items = root.current?.querySelectorAll<HTMLElement>(
          'button:not([tabindex="-1"])',
        );
        if (!items?.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    closeBtn.current?.focus();

    return () => {
      window.removeEventListener("keydown", onKey);
      html.style.overflow = previousOverflow;
      lenis?.start();
      opener.current?.focus?.();
    };
  }, [isOpen, lenis, close, go]);

  // --- Entrée de l'overlay ------------------------------------------------
  useEffect(() => {
    if (!isOpen || prefersReducedMotion() || !root.current) return;
    gsap.fromTo(
      root.current,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.4, ease: "power2.out" },
    );
  }, [isOpen]);

  // --- Changement d'image -------------------------------------------------
  const index = state?.index;
  useEffect(() => {
    if (index === undefined || prefersReducedMotion() || !figure.current)
      return;
    gsap.fromTo(
      figure.current,
      { autoAlpha: 0, scale: 0.985, y: 12 },
      { autoAlpha: 1, scale: 1, y: 0, duration: 0.55, ease: "swift" },
    );
  }, [index]);

  const api = useMemo<LightboxApi>(() => ({ open }), [open]);
  const current = state ? state.slides[state.index] : null;

  return (
    <LightboxContext.Provider value={api}>
      {children}

      {state && current && (
        <div
          ref={root}
          role="dialog"
          aria-modal="true"
          aria-label={`Image ${state.index + 1} sur ${state.slides.length} — ${current.title}`}
          className="fixed inset-0 z-[85]"
        >
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={close}
            data-cursor="Fermer"
            className="absolute inset-0 w-full cursor-default bg-void/94 backdrop-blur-xl"
          />

          <div className="pointer-events-none relative flex h-full flex-col">
            <div className="container-x flex items-center justify-between pt-6">
              <span className="meta text-muted">
                {String(state.index + 1).padStart(2, "0")}
                <span className="mx-1.5 opacity-40">/</span>
                {String(state.slides.length).padStart(2, "0")}
              </span>

              <button
                ref={closeBtn}
                type="button"
                onClick={close}
                data-cursor="Fermer"
                aria-label="Fermer"
                className="pointer-events-auto flex size-11 items-center justify-center rounded-full border border-ink/20 text-ink transition-colors duration-300 hover:border-accent hover:bg-accent hover:text-void"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden>
                  <path
                    d="M1 1l13 13M14 1L1 14"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                </svg>
              </button>
            </div>

            <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-5">
              <div ref={figure} className="pointer-events-auto">
                <Photo
                  name={current.photo}
                  alt={current.alt}
                  loading="eager"
                  sizes="(max-width: 768px) 92vw, 78vw"
                  className="h-auto max-h-[68svh] w-auto max-w-[92vw] rounded-md object-contain"
                />
              </div>
            </div>
            <div className="container-x flex flex-col gap-5 pb-8 sm:flex-row sm:items-end sm:justify-between">
              <figcaption className="max-w-md">
                <p className="text-xl font-medium tracking-tight text-ink">
                  {current.title}
                </p>
                {current.meta && (
                  <p className="mt-1.5 text-sm text-muted">{current.meta}</p>
                )}
              </figcaption>

              <div className="pointer-events-auto flex gap-3">
                {(
                  [
                    ["Précédente", -1, "M9 2L3 8l6 6"],
                    ["Suivante", 1, "M6 2l6 6-6 6"],
                  ] as const
                ).map(([label, step, d]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => go(step)}
                    aria-label={`Image ${label.toLowerCase()}`}
                    data-cursor={step < 0 ? "Préc." : "Suiv."}
                    className="flex size-12 items-center justify-center rounded-full border border-ink/20 text-ink transition-colors duration-300 hover:border-accent hover:bg-accent hover:text-void"
                  >
                    <svg width="15" height="16" viewBox="0 0 15 16" aria-hidden>
                      <path
                        d={d}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.4"
                      />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </LightboxContext.Provider>
  );
}
