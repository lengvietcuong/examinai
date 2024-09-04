import { ScoreReport } from "@/types/messages";
import ScoreCard from "./score-card";
import { TiInfoOutline as WarningIcon} from "react-icons/ti";

interface ScoresProps {
  scores: ScoreReport;
}

export default function Scores({ scores }: ScoresProps) {
  return (
    <>
      <div className="flex items-center gap-2 mb-2 lg:mb-4">
        <WarningIcon className="size-4 fill-muted-foreground" />
        <p className="text-muted-foreground text-sm">Scores are only estimates. Examinai is not a real examiner.</p>
      </div>
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="grid grid-cols-2 gap-4">
          {"Task Achievement" in scores ? (
            <ScoreCard
              title="Task Achievement"
              score={scores["Task Achievement"] || NaN}
            />
          ) : (
            <ScoreCard
              title="Task Response"
              score={scores["Task Response"] || NaN}
            />
          )}
          <ScoreCard
            title="Coherence & Cohesion"
            score={scores["Coherence & Cohesion"] || NaN}
          />
          <ScoreCard
            title="Lexical Resource"
            score={scores["Lexical Resource"] || NaN}
          />
          <ScoreCard
            title="Grammatical Range & Accuracy"
            score={scores["Grammatical Range & Accuracy"] || NaN}
          />
          <ScoreCard
            className="md:hidden"
            title="Overall"
            score={scores["Overall"] || NaN}
          />
        </div>
        <div className="hidden self-stretch border-l border-muted-foreground/35 md:block" />
        <ScoreCard
          className="hidden md:block"
          title="Overall"
          score={scores["Overall"] || NaN}
        />
      </div>
    </>
  );
}
