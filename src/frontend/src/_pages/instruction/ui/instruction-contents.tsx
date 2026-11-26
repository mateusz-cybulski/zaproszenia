import type { InstructionSection } from "../model/instruction-content";

type InstructionContentsProps = { label: string; sections: InstructionSection[] };

export function InstructionContents({ label, sections }: InstructionContentsProps) {
  return (
    <nav
      aria-labelledby="instruction-contents"
      className="grid content-start gap-3 lg:sticky lg:top-8"
    >
      <h2 id="instruction-contents" className="text-sm font-semibold">
        {label}
      </h2>
      <ol className="grid gap-1 text-sm max-lg:grid-cols-2">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="block rounded-md px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              {section.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
