import type { ReactNode } from "react";

type EventsLayoutProps = { children: ReactNode; modal: ReactNode };

export function EventsLayout({ children, modal }: EventsLayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
