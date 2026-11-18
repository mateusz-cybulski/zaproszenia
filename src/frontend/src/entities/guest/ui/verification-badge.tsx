import { LoaderCircle } from "lucide-react";

import { cn } from "@/shared/lib/css";
import { Badge } from "@/shared/ui/badge";

import { verificationStatusLabels, verificationStatusStyles } from "../config/verification-status";
import type { VerificationStatus } from "../model/guest";

type VerificationBadgeProps = {
  status: VerificationStatus;
  busy?: boolean;
  className?: string;
};

export function VerificationBadge({ status, busy = false, className }: VerificationBadgeProps) {
  const { className: statusClassName, icon: Icon } = verificationStatusStyles[status];
  return (
    <Badge variant="outline" className={cn(statusClassName, className)}>
      {busy ? <LoaderCircle className="animate-spin" /> : <Icon />}
      {busy ? "Weryfikuję…" : verificationStatusLabels[status]}
    </Badge>
  );
}
