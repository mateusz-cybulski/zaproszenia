import Link from "next/link";

import { routes } from "@/shared/routes";
import { Button } from "@/shared/ui/button";

export function RegistrationSent({ email }: { email: string }) {
  return (
    <div role="status" className="grid gap-4 text-sm">
      <p>
        Konto założone. Wysłaliśmy link potwierdzający na <strong>{email}</strong>. Kliknij go, a
        potem zaloguj się.
      </p>
      <p className="text-muted-foreground">Nie widzisz wiadomości? Sprawdź folder ze spamem.</p>
      <Button asChild size="lg" className="w-full">
        <Link href={routes.home()}>Przejdź do logowania</Link>
      </Button>
    </div>
  );
}
