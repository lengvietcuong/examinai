"use client";

import useConversationStore from "@/stores/conversationStore";
import useSidebarStore from "@/stores/sidebarStore";
import { Button } from "../ui/button";
import NewChatButton from "../sidebar/new-chat-button";
import { SKILL_ICON } from "@/constants";
import { IoMenu as HamburgerMenuIcon } from "react-icons/io5";

export default function ControlArea() {
  const skill = useConversationStore((state) => state.skill);
  const [isDesktopSidebarOpen, isMobileSidebarOpen, setIsMobileSidebarOpen] =
    useSidebarStore((state) => [
      state.isDesktopSidebarOpen,
      state.isMobileSidebarOpen,
      state.setIsMobileSidebarOpen,
    ]);

  const SkillIcon = skill ? SKILL_ICON[skill] : null;
  return (
    <div className="flex items-center">
      <Button
        variant="outline"
        className="mr-2 size-9 rounded-full p-0 lg:hidden"
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      >
        <HamburgerMenuIcon className="size-4 stroke-primary" />
      </Button>

      {/* On desktop, the icon new chat button is only displayed when the sidebar is closed */}
      {!isDesktopSidebarOpen && (
        <NewChatButton variant="icon" className="mr-6 hidden lg:flex" />
      )}

      {/* On mobile, the icon new chat button is always displayed */}
      <NewChatButton variant="icon" className="lg:hidden" />

      {SkillIcon && (
        <SkillIcon className="mr-2 hidden size-4 fill-primary lg:inline-block" />
      )}
      <p className="hidden font-montserrat text-sm font-medium lg:inline-block">
        {skill}
      </p>
    </div>
  );
}
