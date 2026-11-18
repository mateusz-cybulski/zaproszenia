import { GuestEditDialog } from "./guest-edit-dialog";
import { GuestsPage, type GuestsPageProps } from "./guests-page";

type GuestRouteParams = { params: Promise<{ id: string }> };

export async function GuestEditModal({ params }: GuestRouteParams) {
  const { id } = await params;
  return <GuestEditDialog id={id} dismissal="back" />;
}

export async function GuestsEditPage({ params, searchParams }: GuestRouteParams & GuestsPageProps) {
  const { id } = await params;
  return (
    <>
      <GuestsPage searchParams={searchParams} />
      <GuestEditDialog id={id} dismissal="to-list" />
    </>
  );
}
