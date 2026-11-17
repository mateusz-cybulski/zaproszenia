import type { Metadata } from "next";
import { Geist } from "next/font/google";
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/css";

import "../styles/globals.css";

const geist = Geist({ subsets: ["latin", "latin-ext"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "Zaproszenia",
  description: "Lista gości",
};

export function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pl" className={cn("font-sans antialiased", geist.variable)}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
