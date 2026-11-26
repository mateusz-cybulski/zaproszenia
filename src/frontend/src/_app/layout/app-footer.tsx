import Link from "next/link";

import { routes } from "@/shared/routes";

const MORFEUSZ_URL = "https://morfeusz.sgjp.pl/";
const LINK = "underline underline-offset-4 hover:text-foreground";

// Morfeusz 2 and SGJP are BSD-licensed; a hosted service need not credit them, but we do.
export function AppFooter() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t px-8 py-4 text-xs text-muted-foreground">
      <p>
        Odmiana imion, nazwisk i nazw:{" "}
        <a href={MORFEUSZ_URL} className={LINK}>
          Morfeusz 2
        </a>{" "}
        i Słownik gramatyczny języka polskiego (SGJP), licencja BSD.
      </p>
      <Link href={routes.instructionPolish()} className={LINK}>
        Instrukcja obsługi
      </Link>
    </footer>
  );
}
