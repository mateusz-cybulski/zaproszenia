import type { ReactNode } from "react";

type PageProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function Page({ title, description, actions, children }: PageProps) {
  return (
    <>
      {/* Wraps instead of squeezing the title: at 200% zoom the actions move under it. */}
      <header className="sticky top-0 z-10 flex flex-wrap items-center gap-x-4 gap-y-3 border-b bg-background/95 px-8 py-4 backdrop-blur">
        <div className="min-w-60 flex-1">
          <h1 className="text-lg font-semibold">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </header>
      {/* minmax(0, 1fr): a wide table scrolls in its own container, not the whole page. */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 p-8">{children}</div>
    </>
  );
}
