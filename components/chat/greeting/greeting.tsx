import RobotIcon from "@/components/icons/robot-icon";
import WelcomeText from "./welcome-text";
import SkillSelection from "./skill-selection";

export default function Greeting() {
  return (
    <div className="md:w-3/4 md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 xl:w-fit">
      <div className="mx-auto mb-1 grid size-12 place-items-center rounded-full border md:mb-2 md:size-14 lg:mb-3 lg:size-16">
        <RobotIcon className="mx-auto size-7 fill-foreground md:size-8 lg:size-10" />
      </div>
      <WelcomeText />
      <SkillSelection />
    </div>
  );
}
