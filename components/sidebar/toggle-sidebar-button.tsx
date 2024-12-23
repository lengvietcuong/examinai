"use client";

import useSidebarStore from "@/stores/sidebarStore";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IoChevronBack as ArrowIcon } from "react-icons/io5";

export default function ToggleSidebarButton({
  className,
}: {
  className?: string;
}) {
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useSidebarStore(
    (state) => [state.isDesktopSidebarOpen, state.setIsDesktopSidebarOpen],
  );

  return (
    <div className={className}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              aria-label="Toggle sidebar"
              onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
            >
              <ArrowIcon
                className={`size-6 stroke-muted-foreground/35 transition-all hover:cursor-pointer hover:stroke-muted-foreground ${
                  isDesktopSidebarOpen ? "" : "rotate-180"
                }`}
              />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{`${isDesktopSidebarOpen ? "Close" : "Open"} sidebar`}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
