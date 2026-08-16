"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

/**
 * Point d'entrée unique pour GSAP.
 *
 * `gsap.registerPlugin` est idempotent, mais le centraliser ici évite
 * d'oublier un enregistrement dans un composant et garantit que les
 * plugins ne sont touchés que côté client (ScrollTrigger a besoin de
 * `window`, il planterait pendant le rendu serveur).
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, useGSAP);

  // Courbes maison, réutilisées partout pour que le site ait « une » signature.
  CustomEase.create("swift", "0.16, 1, 0.3, 1");
  CustomEase.create("quart", "0.76, 0, 0.24, 1");

  gsap.defaults({ ease: "swift", duration: 1 });
}

/** Respecte le réglage système « réduire les animations ». */
export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export { gsap, ScrollTrigger, SplitText, CustomEase, useGSAP };
