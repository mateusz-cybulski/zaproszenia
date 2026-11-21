"use client";

import { XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/shared/lib/css";
import { Button } from "@/shared/ui/button";

function Dialog(props: ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger(props: ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        data-slot="dialog-overlay"
        className="fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
      />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-4rem)] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl bg-popover text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close asChild>
          <Button variant="ghost" size="icon-sm" className="absolute top-4.5 right-4.5">
            <XIcon />
            <span className="sr-only">Zamknij</span>
          </Button>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

// The header stays put with the close button; only DialogBody scrolls under it.
function DialogHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("grid shrink-0 gap-1.5 border-b px-6 pt-6 pr-14 pb-4", className)}
      {...props}
    />
  );
}

type DialogTitleBarProps = ComponentProps<"div"> & { start?: ReactNode; end?: ReactNode };

// The header of a dialog whose subject has a name: switches on the left, the name in the middle,
// the main action on the right. The sides share the space equally, so the name is centred; when
// the dialog is too narrow (e.g. 200% zoom) they keep their content and the name gets narrower.
function DialogTitleBar({ start, end, children, className, ...props }: DialogTitleBarProps) {
  return (
    <div
      data-slot="dialog-title-bar"
      className={cn(
        "grid shrink-0 grid-cols-[minmax(max-content,1fr)_minmax(0,18rem)_minmax(max-content,1fr)] items-center gap-3 border-b px-6 py-4",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-3">{start}</div>
      <div className="min-w-0">{children}</div>
      {/* Room for the close button inside the column, so both sides stay equal and the name centred. */}
      <div className="flex items-center justify-end gap-3 pr-8">{end}</div>
    </div>
  );
}

function DialogBody({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-body"
      className={cn("grid min-h-0 gap-4 overflow-y-auto p-6", className)}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-base leading-none font-medium", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTitleBar,
  DialogTrigger,
};
