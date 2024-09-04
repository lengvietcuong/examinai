"use client";

import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { PiStudentBold as StudentIcon } from "react-icons/pi";

export default function SignInButton() {
  return (
    <>
      {/* Desktop version */}
      <Button
        onClick={async () =>
          await signInWithPopup(auth, new GoogleAuthProvider())
        }
        variant="outline"
        size="lg"
        className="hidden lg:inline-flex border-muted-foreground/35 bg-background hover:border-primary/5 hover:bg-primary/5 hover:text-primary dark:hover:border-primary/15 dark:hover:bg-primary/15"
      >
        <StudentIcon className="mr-2 size-5" />
        Sign in
      </Button>
      
      {/* Mobile version */}
      <Button
        onClick={async () =>
          await signInWithPopup(auth, new GoogleAuthProvider())
        }
        variant="outline"
        size="sm"
        className="lg:hidden size-10 rounded-full p-0"
      >
        <StudentIcon className="size-4" />
      </Button>
    </>
  );
}