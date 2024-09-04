import {
  speakingSkills,
  SpeakingSkill,
  writingSkills,
  WritingSkill,
  Skill,
  writingScores,
  WritingScore,
} from "@/types/skills";

export function isSpeakingSkill(skill: Skill): skill is SpeakingSkill {
  return speakingSkills.includes(skill as SpeakingSkill);
}

export function isWritingSkill(skill: Skill): skill is WritingSkill {
  return writingSkills .includes(skill as WritingSkill);
}

export function isWritingScore(score: string): score is WritingScore {
  return writingScores.includes(score as WritingScore);
}

export function getSkillAbbreviation(skill: Skill): string {
  return skill[0] + skill[skill.length - 1];
}

export function calculateOverallWritingTaskScore(scores: number[]) {
  if (scores.length !== 4) {
    return NaN;
  }

  const total = scores.reduce((a, b) => a + b, 0);
  const average = total / 4;

  // For Task 1 or 2, the score is rounded down to the nearest half
  const overallScore = average - (average % 0.5);
  return overallScore;
}

