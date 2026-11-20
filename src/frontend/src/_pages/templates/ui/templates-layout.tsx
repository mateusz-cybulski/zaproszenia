import type { ReactNode } from "react";

type TemplatesLayoutProps = { children: ReactNode; modal: ReactNode };

export function TemplatesLayout({ children, modal }: TemplatesLayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
