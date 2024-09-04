import { WritingScore } from "@/types/skills";
import {
  WRITING_BAND_DESCRIPTORS_LINK,
  OVERALL_SCORE_CALCULATION_LINK,
} from "@/constants";
import { BsQuestionLg as QuestionIcon } from "react-icons/bs";
import { cn } from "@/lib/utils";

interface ScoreCardProps {
  title: WritingScore;
  score: number;
  className?: string;
}

export default function ScoreCard({ title, score, className }: ScoreCardProps) {
  const descriptionLink =
    title == "Overall"
      ? OVERALL_SCORE_CALCULATION_LINK
      : WRITING_BAND_DESCRIPTORS_LINK;

  return (
    <div
      className={cn(
        "relative h-36 min-w-36 rounded-lg bg-muted/50 p-6 md:h-36 md:w-48 lg:w-52",
        className,
      )}
    >
      <a href={descriptionLink} target="_blank" rel="noopener noreferrer">
        <QuestionIcon className="absolute bottom-2 right-2 size-4 fill-muted-foreground/35 transition-colors hover:fill-muted-foreground" />
      </a>
      <div className="flex h-full flex-col">
        <div className="flex-1">
          <h3 className="text-center text-sm font-medium leading-snug lg:text-base">
            {title}
          </h3>
        </div>
        <div className="flex flex-1 flex-col items-center justify-end">
          <span className="text-center font-montserrat text-2xl font-bold text-primary md:text-3xl">
            {typeof score === "number" && !isNaN(score) ? score.toFixed(1) : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
