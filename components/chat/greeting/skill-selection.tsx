import SkillCard from "./skill-card";

export default function SkillSelection() {
  return (
    <div className="grid animate-slide-up-fade grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-3 xl:w-max xl:grid-cols-3 xl:gap-4">
      <SkillCard skill="Speaking Part 1" />
      <SkillCard skill="Speaking Part 2" />
      <SkillCard skill="Speaking Part 3" />
      <SkillCard skill="Writing Task 1" />
      <SkillCard skill="Writing Task 2" />
    </div>
  );
}
