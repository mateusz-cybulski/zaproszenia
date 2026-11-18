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
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background/95 px-8 py-4 backdrop-blur">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </header>
      <div className="grid gap-6 p-8">{children}</div>
    </>
  );
}
