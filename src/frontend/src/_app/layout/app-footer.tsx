const MORFEUSZ_URL = "https://morfeusz.sgjp.pl/";

// Morfeusz 2 and SGJP are BSD-licensed; a hosted service need not credit them, but we do.
export function AppFooter() {
  return (
    <footer className="border-t px-8 py-4 text-xs text-muted-foreground">
      Odmiana imion, nazwisk i nazw:{" "}
      <a href={MORFEUSZ_URL} className="underline underline-offset-4 hover:text-foreground">
        Morfeusz 2
      </a>{" "}
      i Słownik gramatyczny języka polskiego (SGJP), licencja BSD.
    </footer>
  );
}
