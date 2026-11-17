import { Button } from "@/shared/ui/button";

import { logoutAction } from "./logout-action";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="outline" size="sm">
        Wyloguj się
      </Button>
    </form>
  );
}
