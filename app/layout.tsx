import type { Metadata } from "next";
import { Archivo, Fraunces, Figtree } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nefrix Photography — portraits, mariages et Brazzaville",
  description:
    "Photographe à Brazzaville. Portraits, mariages coutumiers et paysages du fleuve Congo, à la lumière disponible. Séries personnelles et tirages en édition limitée.",
  openGraph: {
    title: "Nefrix Photography",
    description:
      "Portraits, mariages coutumiers et paysages du fleuve Congo, photographiés à la lumière disponible.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={cn(
        "antialiased",
        archivo.variable,
        fraunces.variable,
        "font-sans",
        figtree.variable,
      )}
    >
      <body className="grain"></body>
    </html>
  );
}
