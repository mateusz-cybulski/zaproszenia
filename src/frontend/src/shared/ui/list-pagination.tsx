import { pageItems } from "@/shared/lib/pagination";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/ui/pagination";

type ListPaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  // The URL of a page; the first page is expected without a page parameter.
  hrefForPage: (page: number) => string;
};

// A paged list's footer: what is shown out of how many, and links to the other pages.
export function ListPagination({ page, pageSize, total, hrefForPage }: ListPaginationProps) {
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
    <div className="flex items-center justify-between gap-4 text-sm">
      <p className="text-muted-foreground">{summary}</p>
      {(pageCount > 1 || beyondEnd) && (
        <Pagination aria-label="Strony" className="mx-0 w-auto">
          <PaginationContent>
            {page > 1 && (
              <PaginationItem>
                <PaginationPrevious
                  href={hrefForPage(Math.min(page - 1, pageCount))}
                  scroll={false}
                  text="Poprzednia"
                  aria-label="Poprzednia strona"
                />
              </PaginationItem>
            )}
            {pageItems(current, pageCount).map((item, index) => (
              <PaginationItem key={item === "gap" ? `gap-${index}` : item}>
                {item === "gap" ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href={hrefForPage(item)}
                    scroll={false}
                    isActive={item === page}
                    aria-label={`Strona ${item}`}
                  >
                    {item}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            {page < pageCount && (
              <PaginationItem>
                <PaginationNext
                  href={hrefForPage(page + 1)}
                  scroll={false}
                  text="Następna"
                  aria-label="Następna strona"
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
