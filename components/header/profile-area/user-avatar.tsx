"use client";

import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Image from "next/image";
import { PiStudentBold as StudentIcon } from "react-icons/pi";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  className?: string;
  fallBackClassName?: string;
}

export default function UserAvatar({ className, fallBackClassName }: UserAvatarProps) {
  const [user] = useAuthState(auth);

  return user && user.photoURL ? (
    <Image
      src={user?.photoURL}
      className={cn("size-full rounded-full", className)}
      alt="User avatar"
      width={40}
      height={40}
    />
  ) : (
    <StudentIcon className={cn("size-full rounded-full", fallBackClassName)} />
  );
}
