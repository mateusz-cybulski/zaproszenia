import { FirebaseError, getApp, getApps, initializeApp } from "firebase/app";
import { type Auth, getAuth, inMemoryPersistence, initializeAuth } from "firebase/auth";

import type { FirebaseClientConfig } from "@/shared/config";

// In-memory only: the server keeps the session in an httpOnly cookie.
export function clientAuth(config: FirebaseClientConfig): Auth {
  if (getApps().length) {
    return getAuth(getApp());
  }
  const auth = initializeAuth(initializeApp(config), { persistence: inMemoryPersistence });
  auth.languageCode = "pl";
  return auth;
}

const ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Nieprawidłowy e-mail lub hasło.",
  "auth/invalid-email": "Nieprawidłowy adres e-mail.",
  "auth/missing-email": "Podaj adres e-mail.",
  "auth/missing-password": "Podaj hasło.",
  "auth/email-already-in-use": "Konto z tym adresem już istnieje. Zaloguj się.",
  "auth/weak-password": "Hasło jest za słabe: użyj co najmniej 8 znaków.",
  "auth/password-does-not-meet-requirements":
    "Hasło nie spełnia wymagań: co najmniej 8 znaków, wielka i mała litera oraz cyfra.",
  "auth/too-many-requests": "Zbyt wiele prób. Odczekaj chwilę i spróbuj ponownie.",
  "auth/user-disabled": "To konto zostało zablokowane.",
  "auth/network-request-failed": "Brak połączenia z usługą logowania. Sprawdź internet.",
};

export function authErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError && error.code in ERROR_MESSAGES) {
    return ERROR_MESSAGES[error.code];
  }
  return "Coś poszło nie tak. Spróbuj ponownie.";
}

export function continueUrl(path: string): { url: string } {
  return { url: new URL(path, window.location.origin).toString() };
}
