"use client";

import { Skill } from "@/types/skills";
import useConversationStore from "@/stores/conversationStore";
import { SKILL_DESCRIPTION } from "@/constants";
import { SKILL_ICON } from "@/constants";

export interface SkillCardProps {
  skill: Skill;
}

export default function SkillCard({ skill }: SkillCardProps) {
  const description = SKILL_DESCRIPTION[skill];
  const Icon = SKILL_ICON[skill];
  const setSkill = useConversationStore((state) => state.setSkill);

  return (
    <div
      className="rounded-lg border p-4 transition-colors hover:cursor-pointer hover:border-primary hover:bg-primary/10 lg:max-w-64 lg:p-6 dark:hover:bg-primary/15"
      onClick={() => setSkill(skill)}
    >
      <div className="flex items-center lg:items-start lg:flex-col gap-1.5 lg:gap-1">
        <Icon className="size-4 fill-primary" />
        <h2 className="text-base font-medium lg:text-lg">
          {skill}
        </h2>
      </div>
      <p className="mt-1.5 lg:mt-2 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
