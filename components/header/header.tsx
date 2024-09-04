import ControlArea from "./control-area";
import ProfileArea from "./profile-area/profile-area";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-background px-4 lg:px-12 h-16">
      <ControlArea />
      <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-comfortaa text-xl font-bold">
        Examin
        <span className="text-primary">ai</span>
      </p>
      <ProfileArea />
    </header>
  );
}
