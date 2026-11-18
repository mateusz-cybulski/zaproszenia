import {
  CircleAlert,
  CircleDashed,
  CircleX,
  type LucideIcon,
  Sparkles,
  UserCheck,
} from "lucide-react";

import type { VerificationStatus } from "../model/guest";

export const verificationStatusLabels: Record<VerificationStatus, string> = {
  pending: "Do weryfikacji",
  verified_ai: "Zweryfikowany (AI)",
  verified_manual: "Zweryfikowany",
  needs_review: "Wymaga przejrzenia",
  failed: "Błąd weryfikacji",
};

export const verificationStatusStyles: Record<
  VerificationStatus,
  { className: string; icon: LucideIcon }
> = {
  pending: { className: "text-muted-foreground", icon: CircleDashed },
  verified_ai: { className: "border-success/30 bg-success/10 text-success", icon: Sparkles },
  verified_manual: { className: "border-success/30 bg-success/10 text-success", icon: UserCheck },
  needs_review: { className: "border-warning/30 bg-warning/10 text-warning", icon: CircleAlert },
  failed: { className: "border-destructive/30 bg-destructive/10 text-destructive", icon: CircleX },
};
