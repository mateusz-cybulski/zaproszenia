import Image from "next/image";

import { SCREENSHOT_SCALE, SCREENSHOTS, type ScreenshotName } from "../config/screenshots";

type InstructionFigureProps = { screenshot: ScreenshotName; alt: string; caption: string };

export function InstructionFigure({ screenshot, alt, caption }: InstructionFigureProps) {
  const image = SCREENSHOTS[screenshot];
  const width = image.width / SCREENSHOT_SCALE;

  return (
    <figure className="grid justify-items-start gap-2">
      <Image
        src={image}
        alt={alt}
        placeholder="blur"
        sizes={`(min-width: 1280px) ${Math.min(width, 768)}px, 100vw`}
        style={{ width }}
        className="h-auto max-w-full rounded-lg border shadow-sm"
      />
      <figcaption className="text-sm text-muted-foreground">{caption}</figcaption>
    </figure>
  );
}
