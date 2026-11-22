"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { z } from "zod";

import { apiFetch, parseResponse, writeSessionCookie } from "@/shared/api/index.server";
import { firebaseClientConfig } from "@/shared/config";
import { routes } from "@/shared/routes";

export type StartSessionResult = { error: string };

const sessionDtoSchema = z.object({ session_cookie: z.string(), expires_in: z.int() });

// Server Actions check the request origin, so another site cannot sign a visitor into an
// attacker's account.
// On success it redirects, so the caller receives undefined.
export async function startSessionAction(idToken: string): Promise<StartSessionResult | undefined> {
  if (!firebaseClientConfig()) {
    return { error: "Logowanie jest wyłączone." };
  }
  if (typeof idToken !== "string" || !idToken) {
    return { error: "Nie udało się zalogować. Spróbuj ponownie." };
  }

  let response: Response;
  try {
    response = await apiFetch("/auth/session", {
      method: "POST",
      body: JSON.stringify({ id_token: idToken }),
      onUnauthorized: "return",
    });
  } catch (error) {
    unstable_rethrow(error);
    return { error: "Nie udało się połączyć z serwerem. Spróbuj ponownie." };
  }
  if (response.status === 403) {
    return { error: "Najpierw potwierdź adres e-mail linkiem z wiadomości." };
  }
  if (response.status === 401) {
    return { error: "Logowanie wygasło. Zaloguj się ponownie." };
  }
  if (!response.ok) {
    return { error: "Usługa logowania jest chwilowo niedostępna. Spróbuj ponownie." };
  }

  const session = await parseResponse(response, sessionDtoSchema);
  await writeSessionCookie(session.session_cookie, session.expires_in);
  redirect(routes.events());
}
