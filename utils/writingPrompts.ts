import { WritingSkill } from "@/types/skills";
import bandDescriptors from "@/public/band-descriptors.json";

export function getWritingScoresPrompt(
  skill: WritingSkill,
  question: string,
  essay: string,
) {
  // Add 'lenient' because the model is too strict by default
  return `You are a lenient IELTS examiner. Below is a candidate's essay for ${skill}:
Question: ${question}
Essay: ${essay}

Your task is to grade the essay based on the following 4 criteria (each is given a score which is a whole number from 0-9):
${skill === "Writing Task 1" ? "Task Achievement" : "Task Response"}
Coherence & Cohesion
Lexical Resource
Grammatical Range & Accuracy

Format your output exactly as follows (do not write anything else):
${skill === "Writing Task 1" ? "Task Achievement" : "Task Response"}: <score>
Coherence & Cohesion: <score>
Lexical Resource: <score>
Grammatical Range & Accuracy: <score>`;
}

export function getWritingCorrectionsPrompt(essay: string) {
  return `### GIVEN THE ESSAY: ${essay} ### AFTER CORRECTING ALL LANGUAGE MISTAKES, THE ESSAY BECOMES: `;
}

export function getWritingSuggestionsPrompt(question: string, essay: string) {
  return `Below is an IELTS candidate's essay:
Question: ${question}
Essay: ${essay}

Provide 3 ideas to extend existing arguments, each with an example sentence. Ensure the ideas are simple, concrete, and dig deeper into what's already written (i.e. you must expand vertically, not horizontally). Format your output exactly as follows (do not write anything else):
1. **<idea1_title>**
    - <example1>
2. **<idea2_title>**
    - <example2>
3. **<idea3_title>**
    - <example3>`;
}

export function getWritingImprovedPrompt(question: string, essay: string) {
  return `You are an IELTS examiner who has been tasked with improving a candidate's writing. Here's their essay:
Question: ${question}
Essay: ${essay}

Now, write an improved version by using more sophisticated language and elaborating on existing arguments. However, refrain from overuse of advanced lexical features. Ensure a formal and academic tone throughout. Then, define all the new vocabulary that is not in the original. Only short definitions are required. 
Format your output as follows (without tags):
<rewritten_version>
### Vocabulary
* **<item1>**: <brief_definition1>
* **<item2>**: <brief_definition2>
...`;
}

// This is currently unused because the model does not seem to understand the band descriptors
function getBandDescriptors(skill: WritingSkill): string {
  const taskNumber = skill[skill.length - 1] as "1" | "2";
  const criteria = bandDescriptors["writing"][`task${taskNumber}`];
  let formattedString = "";

  for (const [criterion, bandScores] of Object.entries(criteria)) {
    formattedString += `${toTitleCase(criterion.replace("and", "&"))}:`;
    for (const [bandScore, description] of Object.entries(bandScores)) {
      formattedString += `\n${toTitleCase(bandScore)}\n${description}:`;
    }
    formattedString += "\n\n";
  }

  return formattedString;
}

function toTitleCase(str: string): string {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
