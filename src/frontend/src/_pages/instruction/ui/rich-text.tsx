const LABEL = /\*\*(.+?)\*\*/;

// Every odd part of the split is a label the text marked with **…**.
export function RichText({ text }: { text: string }) {
  return text.split(LABEL).map((part, index) =>
    index % 2 === 1 ? (
      <strong key={index} className="font-semibold text-foreground">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}
