"use client";

import { useState, useEffect } from "react";
import {
  Globe,
  Moon,
  Sun,
  PaintbrushVertical,
  LogOut,
  LogIn,
  Check,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { supabase } from "@/lib/supabase/client";
import { USFlag, VietnamFlag } from "@/components/icons/flags";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

export function UserProfileMenu() {
  const { t, language, setLanguage } = useI18n();
  const [user, setUser] = useState<any>(null);
  const [, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("examinai-theme") || "light";
    setTheme(saved as "light" | "dark");
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);

  function toggleTheme(newTheme: "light" | "dark") {
    setTheme(newTheme);
    localStorage.setItem("examinai-theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  }

  async function handleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/chat` },
    });
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-full" />}>
        <Avatar className="size-8 cursor-pointer">
          <AvatarImage src={user?.user_metadata?.avatar_url ?? ""} alt="User" />
          <AvatarFallback className="bg-primary/10 text-primary">
            {user ? (user.user_metadata?.full_name?.[0] ?? "U") : "G"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2">
            <Globe className="size-4" />
            <span>{t.common.language}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setLanguage("en")}>
                <USFlag className="mr-1 size-4 shrink-0 rounded-[2px]" />English{language === "en" && <Check className="ml-auto size-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("vi")}>
                <VietnamFlag className="mr-1 size-4 shrink-0 rounded-[2px]" />Tiếng Việt{language === "vi" && <Check className="ml-auto size-4" />}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2">
            <PaintbrushVertical className="size-4" />
            <span>{t.common.theme}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => toggleTheme("light")}>
                <Sun className="mr-0.5 size-4" />{t.common.light}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleTheme("dark")}>
                <Moon className="mr-0.5 size-4" />{t.common.dark}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSeparator />
        {user ? (
          <DropdownMenuItem
            className="text-destructive cursor-pointer focus:bg-destructive/10 focus:text-destructive gap-2"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" />
            {t.common.signOut}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem className="gap-2" onClick={handleSignIn}>
            <LogIn className="size-4" />
            {t.common.signIn}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
