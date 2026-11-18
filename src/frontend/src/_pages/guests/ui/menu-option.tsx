import type { LucideIcon } from "lucide-react";

type MenuOptionProps = { icon: LucideIcon; title: string; description: string };

export function MenuOption({ icon: Icon, title, description }: MenuOptionProps) {
  return (
    <>
      <Icon aria-hidden />
      <span className="grid">
        <span>{title}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </span>
    </>
  );
}
