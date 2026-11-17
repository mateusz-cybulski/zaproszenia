"use client";

import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

type ErrorPageProps = {
  error: unknown;
  retry: () => void;
};

export function ErrorPage({ error, retry }: ErrorPageProps) {
  // In production Next hides server error messages; the digest matches the server log entry.
  const digest = error instanceof Error && "digest" in error ? String(error.digest) : undefined;

  return (
    <main className="mx-auto grid w-full max-w-3xl gap-6 p-8">
      <Card>
        <CardHeader>
          <CardTitle>
            <h1>Coś poszło nie tak</h1>
          </CardTitle>
          <CardDescription>
            Nie udało się wczytać danych. Serwer mógł się właśnie uruchamiać, spróbuj ponownie za
            chwilę.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button onClick={() => retry()}>Spróbuj ponownie</Button>
          {digest && <p className="text-sm text-muted-foreground">Kod błędu: {digest}</p>}
        </CardContent>
      </Card>
    </main>
  );
}
