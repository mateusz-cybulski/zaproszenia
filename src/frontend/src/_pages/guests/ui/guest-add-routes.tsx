import { GuestAddDialog } from "./guest-add-dialog";
import { GuestsPage, type GuestsPageProps } from "./guests-page";

export function GuestAddModal() {
  return <GuestAddDialog dismissal="back" />;
}

export function GuestsAddPage({ searchParams }: GuestsPageProps) {
  return (
    <>
      <GuestsPage searchParams={searchParams} />
      <GuestAddDialog dismissal="to-list" />
    </>
  );
}
