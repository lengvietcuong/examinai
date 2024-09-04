import { Skill, WritingSkill } from "@/types/skills";
import { IconType } from "react-icons/lib";
import { PiUserBold as PersonIcon } from "react-icons/pi";
import { FaRegListAlt as NotesIcon } from "react-icons/fa";
import { PiBuildingsBold as CityIcon } from "react-icons/pi";
import { FaChartLine as GraphIcon } from "react-icons/fa";
import { BiWorld as GlobeIcon } from "react-icons/bi";

export const SKILL_DESCRIPTION: { [key in Skill]: string } = {
  "Speaking Part 1": "Answer questions about yourself",
  "Speaking Part 2": "Given a topic card, prepare for 1 minute, then speak for 1-2 minutes",
  "Speaking Part 3": "Discuss abstract issues/ideas related to Part 2's topic",
  "Writing Task 1": "Describe visual information (graph, chart, table, map, or diagram)",
  "Writing Task 2": "Respond to a point of view, argument, or problem",
};

export const SKILL_ICON: { [key in Skill]: IconType } = {
  "Speaking Part 1": PersonIcon,
  "Speaking Part 2": NotesIcon,
  "Speaking Part 3": CityIcon,
  "Writing Task 1": GraphIcon,
  "Writing Task 2": GlobeIcon,
};

export const MAX_QUESTION_WORD_COUNT = 100;
export const MAX_ESSAY_WORD_COUNT: { [key in WritingSkill]: number } = {
  "Writing Task 1": 300,
  "Writing Task 2": 500,
};
export const MIN_ESSAY_WORD_COUNT: { [key in WritingSkill]: number } = {
  "Writing Task 1": 150,
  "Writing Task 2": 250,
};

export const ESSAY_QUESTIONS_LINK =
  "https://study4.com/tests/?term=IELTS+Writing";
export const WRITING_BAND_DESCRIPTORS_LINK =
  "https://takeielts.britishcouncil.org/sites/default/files/ielts_writing_band_descriptors.pdf";
export const OVERALL_SCORE_CALCULATION_LINK =
  "https://www.youtube.com/watch?v=IiPMWo4Z9Qs";

export const DEFAULT_CONVERSATION_NAME = "New chat";