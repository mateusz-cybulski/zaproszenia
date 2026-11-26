import { redirect } from "next/navigation";
import { connection } from "next/server";

import { getViewer } from "@/entities/viewer/index.server";
import { routes } from "@/shared/routes";

import { LoginScreen } from "./login-screen";

export async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // FIREBASE_API_KEY and API_URL exist only at runtime on Cloud Run, so render on every request.
  await connection();
  if (await getViewer()) {
    redirect(routes.events());
  }
  const { verified, "password-changed": passwordChanged } = await searchParams;
  return (
    <LoginScreen
      notice={verified === "1" ? "verified" : passwordChanged === "1" ? "password-changed" : null}
    />
  );
}
