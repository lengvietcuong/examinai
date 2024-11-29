import { SpeakingSkill } from "@/types/skills";
import speakingQuestions from "@/public/speaking-questions.json";

export function getSpeakingExaminerInstructions(skill: SpeakingSkill): string {
  return `You are a friendly IELTS examiner for ${skill}. Your task is to ask the candidate a series of questions and provide brief reactions to their answers. Here are the detailed instructions:
Ask the candidate the following questions, one at a time:
${getRandomQuestions(skill, 3)}

${getPartSpecificNotes(skill)}

When the candidate responds, you will:
1. Give a brief reaction in one sentence.
2. Ask the next question (or repeat the same one if they did not answer properly). Create new questions if the list is exhausted. In terms of formatting, always write the question on a separate line for readability.

Now, ask the first question (you don't need to say anything else).
`;
}

function getPartSpecificNotes(skill: SpeakingSkill) {
  return skill === "Speaking Part 2"
    ? `Format Part 2 questions as follows:
<description>.
You should say:
* <hint1>
* <hint2>
...`
    : `When coming to a topic for the first time, include the phrase "Let's talk about <topic>." along with the question. Also, feel free to modify questions to flexibly adapt to the conversation.`;
}

export function getIsFeedbackNeededPrompt(question: string, response: string) {
  return `Below is a candidate's response in an informal IELTS Speaking test:
Question: ${question}
Response: ${response}

A candidate is said to have 'passed' a question if they provided an answer to it. The answer does not need to be direct or detailed. However, if their response was off-topic or they asked the examiner something instead, they have not passed.

Given this information, did the candidate pass this question? Respond with 'yes' or 'no' only.`;
}

export function getSpeakingCorrectionsPrompt(
  question: string,
  answer: string,
): string {
  return `You are an IELTS Speaking examiner who has been tasked with correcting a candidate's answer. Here's their response:
Question: ${question}
Answer: ${answer}

Rewrite the response with all language mistakes corrected. You should only modify what's wrong and leave the rest unchanged. Note that this is an informal speaking test, so informal expressions are perfectly acceptable and should be left as-is. Do not output anything else besides the corrected version.
Good examples:
- "I thinks video games is a double-edged knife." -> "I think video games are a double-edged sword."
- "My teacher could not explain me the concepts understandably" -> "My teacher could not explain the concepts simply."
BAD examples:
- "I don't wanna go to museums cause there's nothing interesting for me." -> "I do not want to go to museums because there is nothing interesting for me." (do not correct informal expressions as they are accepted in this context)
- "Nah" -> "No" (similarly, do not correct interjections)
- "It is so annoying when I cannot skip an ad on YouTube." -> "It's so annoying when I can't skip an ad on YouTube. ("It is" and "cannot" are already correct and should not be changed)`;
}

export function getSpeakingSuggestionsPrompt(
  question: string,
  answer: string,
): string {
  return `You are an IELTS Speaking examiner who has been tasked with helping a candidate expand their answer. Here's their response:
Question: ${question}
Answer: ${answer}

Now, provide 3 ideas to extend it. Each idea should have a title and an example sentence. Because this is an informal speaking exam, ensure the ideas are simple, concrete, and demonstrated using conversational language. Format your output exactly as follows:
1. **<idea1_title>**
    - <idea1_example_sentence>
2. **<idea2_title>**
    - <idea2_example_sentence>
3. **<idea3_title>**
    - <idea3_example_sentence>`;
}

export function getSpeakingImprovedPrompt(
  question: string,
  answer: string,
): string {
  return `You are an IELTS examiner who has been tasked with helping a candidate improve the language used in their answer. Here's their response:
Question: ${question}
Answer: ${answer}

Write an improved version of the response that uses more refined language. Maintain a conversational tone throughout. You may sprinkle in creative and humourous expressions (e.g. quotes, idioms, metaphors, etc.) to make it more engaging. However, refrain from incorporating too many advanced lexical features. Then, define all the new vocabulary and phrases that are not in the original. Only short definitions are required.

Format your output as follows (without <> tags):
<improved_version>
### Vocabulary and phrases:
* **<item1>**: <brief_definition1>
* **<item2>**: <brief_definition2>
...`;
}

function getRandomQuestions(skill: SpeakingSkill, sampleSize: number): string {
  const partNumber = skill[skill.length - 1] as "1" | "2" | "3";
  const partQuestions = speakingQuestions[`part${partNumber}`];
  const questions = sample(partQuestions, sampleSize);

  let questionsString: string;
  if (partNumber === "2") {
    // Topic cards are stored in a 1D array
    questionsString = (questions as string[]).join("\n\n");
  } else {
    // Multiple topics, each with multiple questions (2D array)
    questionsString = (questions as string[][])
      .map((innerArray) => innerArray.join("\n"))
      .join("\n\n");
  }

  return questionsString;
}

function sample<T>(array: T[] | T[][], size: number): T[] | T[][] {
  const shuffled = array.slice();
  let currentIndex = shuffled.length;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // Swap it with the current element.
    [shuffled[currentIndex], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[currentIndex],
    ];
  }

  return shuffled.slice(0, size);
}
