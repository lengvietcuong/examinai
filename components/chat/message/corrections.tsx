import { Fragment } from "react";

type CorrectionsProps = { original: string; corrected: string };

const TAG_STYLES = {
  "--": "bg-red-500/45 text-foreground dark:bg-red-900/70",
  "++": "bg-green-500/45 text-foreground dark:bg-green-900/80",
};

function renderPart(part: string, key: number) {
  const startTag = part.slice(0, 2);
  const endTag = part.slice(-2);
  if (startTag === endTag && startTag in TAG_STYLES) {
    return (
      <span
        key={key}
        className={TAG_STYLES[startTag as keyof typeof TAG_STYLES]}
      >
        {part.slice(2, -2)}
      </span>
    );
  }

  return <Fragment key={key}>{part}</Fragment>;
}

function renderTextWithHighlights(text: string) {
  // Split the text into the following:
  // 1. Highlighted parts (enclosed in ++ or --)
  // 2. Newline characters
  // 3. Rest of the text

  const pattern = /(--.*?--|\+\+.*?\+\+)/g;
  return <>{text.split(pattern).map(renderPart)}</>;
}

export default function Corrections({ original, corrected }: CorrectionsProps) {
  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-10">
      <p className="whitespace-pre-wrap flex-1 text-muted-foreground/75">
        {renderTextWithHighlights(original)}
      </p>
      <div className="hidden md:block self-stretch border-l border-muted-foreground/35" />
      <hr className="md:hidden border-t border-muted-foreground/35"/>
      <p className="whitespace-pre-wrap flex-1 text-muted-foreground/75">
        {renderTextWithHighlights(corrected)}
      </p>
    </div>
  );
}
