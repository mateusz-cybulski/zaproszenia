import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { pageItems } from "@/shared/lib/pagination";
import { Button } from "@/shared/ui/button";

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  // The URL of a page; the first page is expected without a page parameter.
  hrefForPage: (page: number) => string;
};

export function Pagination({ page, pageSize, total, hrefForPage }: PaginationProps) {
  if (total === 0) {
    return null;
  }
  const pageCount = Math.ceil(total / pageSize);
  // A page past the end (an old link, or its last items just removed) is shown as empty.
  const beyondEnd = page > pageCount;
  const current = Math.min(page, pageCount);
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  const summary = beyondEnd
    ? `Ta strona jest pusta. Wszystkich: ${total}.`
    : `${first}–${last} z ${total}`;

  return (
    <nav aria-label="Strony" className="flex items-center justify-between gap-4 text-sm">
      <p className="text-muted-foreground">{summary}</p>
      {(pageCount > 1 || beyondEnd) && (
        <ul className="flex items-center gap-1">
          <li>
            <PageLink
              href={page > 1 ? hrefForPage(Math.min(page - 1, pageCount)) : null}
              label="Poprzednia strona"
            >
              <ChevronLeft />
            </PageLink>
          </li>
          {pageItems(current, pageCount).map((item, index) => (
            <li key={item === "gap" ? `gap-${index}` : item}>
              {item === "gap" ? (
                <span className="px-1.5 text-muted-foreground" aria-hidden>
                  …
                </span>
              ) : (
                <Button
                  asChild
                  variant={item === page ? "outline" : "ghost"}
                  size="icon-sm"
                  aria-current={item === page ? "page" : undefined}
                >
                  <Link href={hrefForPage(item)} scroll={false} aria-label={`Strona ${item}`}>
                    {item}
                  </Link>
                </Button>
              )}
            </li>
          ))}
          <li>
            <PageLink
              href={page < pageCount ? hrefForPage(page + 1) : null}
              label="Następna strona"
            >
              <ChevronRight />
            </PageLink>
          </li>
        </ul>
      )}
    </nav>
  );
}

type PageLinkProps = { href: string | null; label: string; children: ReactNode };

function PageLink({ href, label, children }: PageLinkProps) {
  if (href === null) {
    return (
      <Button variant="ghost" size="icon-sm" disabled aria-label={label}>
        {children}
      </Button>
    );
  }
  return (
    <Button asChild variant="ghost" size="icon-sm">
      <Link href={href} scroll={false} aria-label={label}>
        {children}
      </Link>
    </Button>
  );
}
