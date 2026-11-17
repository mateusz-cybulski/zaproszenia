import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from "firebase/auth";
import { type FormEvent, useState, useTransition } from "react";

import type { FirebaseClientConfig } from "@/shared/config";
import { authErrorMessage, clientAuth, continueUrl } from "@/shared/lib/firebase-auth";
import { routes } from "@/shared/routes";

export const MIN_PASSWORD_LENGTH = 8;

function passwordError(password: string, repeated: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Hasło musi mieć co najmniej ${MIN_PASSWORD_LENGTH} znaków.`;
  }
  if (password !== repeated) {
    return "Hasła różnią się.";
  }
  return null;
}

export function useRegister(config: FirebaseClientConfig) {
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const invalid = passwordError(password, String(form.get("password-repeat") ?? ""));
    setError(invalid);
    if (invalid) {
      return;
    }

    startTransition(async () => {
      const auth = clientAuth(config);
      try {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(user, continueUrl(routes.homeVerified()));
        await signOut(auth);
        setSentTo(email);
      } catch (signUpError) {
        setError(authErrorMessage(signUpError));
      }
    });
  }

  return { error, sentTo, pending, submit };
}
