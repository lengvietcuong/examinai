"use client";

import UserAvatar from "./user-avatar";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PiSignOutBold as SignOutIcon } from "react-icons/pi";

export default function UserProfile() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar className="size-9 lg:size-10" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={async () => {
            await signOut(auth);
            window.location.reload();
          }}
          className="px-3.5 py-2.5 hover:cursor-pointer"
        >
          <SignOutIcon className="mr-2 size-5" />
          <span className="font-montserrat text-base">Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
