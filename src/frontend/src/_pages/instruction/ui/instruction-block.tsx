import { Lightbulb } from "lucide-react";

import type { InstructionBlock as Block } from "../model/instruction-content";
import { InstructionFigure } from "./instruction-figure";
import { RichText } from "./rich-text";

export function InstructionBlock({ block }: { block: Block }) {
  switch (block.type) {
    case "text":
      return (
        <p>
          <RichText text={block.text} />
        </p>
      );
    case "steps":
      return (
        <ol className="grid list-decimal gap-2 pl-6 marker:text-muted-foreground">
          {block.items.map((item) => (
            <li key={item}>
              <RichText text={item} />
            </li>
          ))}
        </ol>
      );
    case "list":
      return (
        <ul className="grid list-disc gap-2 pl-6 marker:text-muted-foreground">
          {block.items.map((item) => (
            <li key={item}>
              <RichText text={item} />
            </li>
          ))}
        </ul>
      );
    case "terms":
      return (
        <dl className="grid grid-cols-[max-content_minmax(0,1fr)] gap-x-6 gap-y-2 rounded-lg border p-4">
          {block.items.map(({ term, description }) => (
            <div key={term} className="col-span-2 grid grid-cols-subgrid">
              <dt className="font-medium text-foreground">{term}</dt>
              <dd>
                <RichText text={description} />
              </dd>
            </div>
          ))}
        </dl>
      );
    case "tip":
      return (
        <p className="flex gap-3 rounded-lg border bg-muted/50 p-4">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span>
            <RichText text={block.text} />
          </span>
        </p>
      );
    case "figure":
      return (
        <InstructionFigure screenshot={block.screenshot} alt={block.alt} caption={block.caption} />
      );
  }
}
