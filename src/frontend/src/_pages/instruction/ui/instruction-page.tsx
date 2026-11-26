import Link from "next/link";

import { routes } from "@/shared/routes";
import { Button } from "@/shared/ui/button";

import type { InstructionContent } from "../model/instruction-content";
import { InstructionBlock } from "./instruction-block";
import { InstructionContents } from "./instruction-contents";
import { LanguageSwitch } from "./language-switch";

// The root layout says the document is Polish; lang on the wrapper covers the English version.
export function InstructionPage({ content }: { content: InstructionContent }) {
  return (
    <div lang={content.language} className="min-h-dvh bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-8 py-4">
          <Link href={routes.home()} className="mr-auto text-lg font-semibold tracking-tight">
            Zaproszenia
          </Link>
          <LanguageSwitch current={content.language} label={content.languageLabel} />
          <Button asChild size="sm">
            <Link href={routes.home()}>{content.backToApp}</Link>
          </Button>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-10 px-8 py-10 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <InstructionContents label={content.contentsLabel} sections={content.sections} />
        <main className="grid max-w-3xl min-w-0 gap-12 leading-relaxed text-foreground/90">
          <div className="grid gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              {content.title}
            </h1>
            <p className="text-lg text-muted-foreground">{content.intro}</p>
          </div>
          {content.sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-title`}
              className="grid scroll-mt-8 gap-4"
            >
              <h2
                id={`${section.id}-title`}
                className="text-xl font-semibold tracking-tight text-foreground"
              >
                {section.title}
              </h2>
              {section.blocks.map((block, index) => (
                <InstructionBlock key={index} block={block} />
              ))}
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
