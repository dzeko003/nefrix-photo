"use client";

import Lenis from "lenis";
import React, { createContext, useContext, useState } from "react";

const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  //   const reduced = useMediaQuer("(prefers-reduced-motion: reduce)");
  return <div>SmoothScrollProvider</div>;
}
