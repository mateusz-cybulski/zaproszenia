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
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };
