import type { Metadata } from "next";
import { Geist } from "next/font/google";
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/css";
import { DialogOpenerTracker } from "@/shared/lib/dialogs";
import { themeScript } from "@/shared/lib/theme";

import "../styles/globals.css";

const geist = Geist({ subsets: ["latin", "latin-ext"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "Zaproszenia",
  description: "Lista gości",
};

export function RootLayout({ children }: { children: ReactNode }) {
  return (
    // The theme script sets the "dark" class before React hydrates.
    <html
      lang="pl"
      className={cn("font-sans antialiased", geist.variable)}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <DialogOpenerTracker />
        {children}
      </body>
    </html>
  );
}
