import type { ReactNode } from "react";

type GuestsLayoutProps = { children: ReactNode; modal: ReactNode };

export function GuestsLayout({ children, modal }: GuestsLayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
