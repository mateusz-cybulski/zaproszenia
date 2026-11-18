"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { Input } from "@/shared/ui/input";

import { SEARCH_DELAY_MS, SEARCH_MAX_LENGTH } from "../config/search";

export function GuestSearch({ initialSearch }: { initialSearch: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(initialSearch);
  const [pushedSearch, setPushedSearch] = useState(initialSearch);
  const [seenSearch, setSeenSearch] = useState(initialSearch);
  const [, startTransition] = useTransition();

  // Only a cleared URL comes from outside (the sidebar link). Any other change is a response
  // to an earlier keystroke, and adopting it would overwrite what was typed since.
  if (initialSearch !== seenSearch) {
    setSeenSearch(initialSearch);
    if (initialSearch === "" && pushedSearch !== "") {
      setSearch("");
      setPushedSearch("");
    }
  }

  useEffect(() => {
    const query = search.trim();
    if (query === initialSearch) {
      return;
    }
    const timeout = setTimeout(() => {
      const url = query ? `${pathname}?${new URLSearchParams({ q: query })}` : pathname;
      setPushedSearch(query);
      startTransition(() => router.replace(url, { scroll: false }));
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [search, initialSearch, pathname, router]);

  return (
    <div className="relative w-full max-w-sm">
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        aria-label="Szukaj gości"
        placeholder="Szukaj po nazwisku lub instytucji"
        className="pl-8"
        maxLength={SEARCH_MAX_LENGTH}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
    </div>
  );
}
