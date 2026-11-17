"use client";

import { FirebaseError, getApp, getApps, initializeApp } from "firebase/app";
import { type Auth, getAuth, inMemoryPersistence, initializeAuth } from "firebase/auth";

import type { FirebaseClientConfig } from "@/shared/config";

/**
 * Identity Platform in the browser. The SDK keeps no session of its own (in-memory only):
 * right after sign-in the ID token goes to the server, which keeps the session in an
 * httpOnly cookie.
 */
export function clientAuth(config: FirebaseClientConfig): Auth {
  if (getApps().length) {
    return getAuth(getApp());
  }
  const auth = initializeAuth(initializeApp(config), { persistence: inMemoryPersistence });
  auth.languageCode = "pl";
  return auth;
}

const messages: Record<string, string> = {
  "auth/invalid-credential": "Nieprawidłowy e-mail lub hasło.",
  "auth/invalid-email": "Nieprawidłowy adres e-mail.",
  "auth/missing-password": "Podaj hasło.",
  "auth/too-many-requests": "Zbyt wiele prób. Odczekaj chwilę i spróbuj ponownie.",
  "auth/user-disabled": "To konto zostało zablokowane.",
  "auth/network-request-failed": "Brak połączenia z usługą logowania. Sprawdź internet.",
};

export function signInErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError && error.code in messages) {
    return messages[error.code];
  }
  return "Nie udało się zalogować. Spróbuj ponownie.";
}
