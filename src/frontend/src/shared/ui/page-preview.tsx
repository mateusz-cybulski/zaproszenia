"use client";

import { useState } from "react";

import { cn } from "@/shared/lib/css";
import { Skeleton } from "@/shared/ui/skeleton";
import { Spinner } from "@/shared/ui/spinner";

type PagePreviewProps = {
  src: string;
  alt: string;
  widthMm: number;
  heightMm: number;
  loading?: "lazy" | "eager";
  className?: string;
};

// A rendered page in a box with the page's proportions from the first paint, so nothing moves
// when the image arrives; a skeleton stands in until then.
export function PagePreview({ src, alt, widthMm, heightMm, loading, className }: PagePreviewProps) {
  const [settled, setSettled] = useState<{ src: string; failed: boolean } | null>(null);
  const loaded = settled?.src === src && !settled.failed;
  const failed = settled?.src === src && settled.failed;

  return (
    <div
      className={cn("relative overflow-hidden rounded-md border bg-white shadow-sm", className)}
      // Inline: the ratio comes from data, and Tailwind cannot build class names at runtime.
      style={{ aspectRatio: `${widthMm} / ${heightMm}` }}
    >
      {!loaded && !failed && (
        <Skeleton className="absolute inset-0 grid place-items-center rounded-none">
          <Spinner className="text-muted-foreground" />
        </Skeleton>
      )}
      {failed && (
        <p className="absolute inset-0 grid place-items-center p-3 text-center text-xs text-muted-foreground">
          Nie udało się wczytać podglądu.
        </p>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        // A cached image can load before React attaches onLoad: check it once mounted.
        ref={(image) => {
          if (image?.complete && image.naturalWidth > 0 && settled?.src !== src) {
            setSettled({ src, failed: false });
          }
        }}
        src={src}
        alt={alt}
        loading={loading}
        onLoad={() => setSettled({ src, failed: false })}
        onError={() => setSettled({ src, failed: true })}
        className={cn("size-full transition-opacity", loaded ? "opacity-100" : "opacity-0")}
      />
    </div>
  );
}
