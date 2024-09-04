"use client";

import useSidebarStore from "@/stores/sidebarStore";
import SidebarContent from "./sidebar-content";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function Sidebar() {
  const [isDesktopSidebarOpen, isMobileSidebarOpen, setIsMobileSidebarOpen] =
    useSidebarStore((state) => [
      state.isDesktopSidebarOpen,
      state.isMobileSidebarOpen,
      state.setIsMobileSidebarOpen,
    ]);

  return (
    <>
      {/* Desktop version */}
      <div
        className={`${
          isDesktopSidebarOpen ? "w-72" : "w-0"
        } sticky top-0 hidden h-svh flex-shrink-0 bg-muted transition-all duration-300 lg:block`}
      >
        <div className="relative flex h-full w-full flex-col px-3 py-6">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile version */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="flex h-full flex-col px-3 py-12">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
