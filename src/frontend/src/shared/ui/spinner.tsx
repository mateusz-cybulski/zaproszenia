import { LoaderCircle } from "lucide-react";

import { cn } from "@/shared/lib/css";

type SpinnerProps = React.ComponentProps<"svg"> & {
  // Next to text that already says what is happening ("Zapisywanie…"), the spinner is decoration.
  decorative?: boolean;
};

function Spinner({ className, decorative = false, ...props }: SpinnerProps) {
  return (
    <LoaderCircle
      data-slot="spinner"
      {...(decorative ? { "aria-hidden": true } : { role: "status", "aria-label": "Ładowanie" })}
      // h-4 w-4, not size-4: buttons and badges size icons whose class has no "size-".
      className={cn("h-4 w-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };
