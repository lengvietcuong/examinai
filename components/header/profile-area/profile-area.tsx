"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import UserProfile from "./user-profile";
import SignInButton from "./sign-in-button";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileArea() {
  const [user, loading] = useAuthState(auth);

  if (loading) return <Skeleton className="size-10 rounded-full" />;

  return user ? <UserProfile /> : <SignInButton />;
}
