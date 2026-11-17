"use server";

import { redirect, unstable_rethrow } from "next/navigation";

import { apiFetch, writeSessionCookie } from "@/shared/api/index.server";
import { firebaseClientConfig } from "@/shared/config";
import { routes } from "@/shared/routes";

export type StartSessionResult = { error: string };

type SessionDto = { session_cookie: string; expires_in: number };

/**
 * Exchanges a fresh Identity Platform ID token for a session cookie (httpOnly), then reloads
 * the home page signed in. Server Actions check that the request comes from this site, so
 * another site cannot sign a visitor into an attacker's account.
 */
export async function startSessionAction(idToken: string): Promise<StartSessionResult> {
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

  const session = (await response.json()) as SessionDto;
  await writeSessionCookie(session.session_cookie, session.expires_in);
  redirect(routes.home());
}
