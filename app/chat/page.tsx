"use client";

import { useState } from "react";
import {
  Menu,
  Share,
  Settings,
  Send,
  Mic,
  Plus,
  MessageSquare,
  Globe,
  Moon,
  Sun,
  LogOut,
  LogIn,
  PanelLeftClose,
  PanelLeftOpen,
  PenLine
} from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

import RobotIcon from "@/components/icons/logo";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Mock auth state
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Mock conversation history
  const history = [
    { id: 1, title: "IELTS Writing Task 2 Practice", date: "Today" },
    { id: 2, title: "Speaking Part 1: Hometown", date: "Yesterday" },
    { id: 3, title: "General IELTS Advice", date: "Previous 7 Days" },
  ];

  const SidebarContent = ({ showCollapseButton = false }: { showCollapseButton?: boolean }) => (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between p-4">
        <Button variant="outline" className="flex-1 justify-start gap-2 rounded-xl">
          <Plus className="size-4" />
          New Chat
        </Button>
        {showCollapseButton && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <PanelLeftClose className="size-4" />
            <span className="sr-only">Collapse sidebar</span>
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-4 py-2">
          {history.length > 0 && (
            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
              Recent
            </div>
          )}
          <div className="space-y-1">
            {history.map((chat) => (
              <Button
                key={chat.id}
                variant="ghost"
                className="w-full justify-start gap-2 px-2 text-sm font-medium overflow-hidden h-10"
              >
                <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{chat.title}</span>
              </Button>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      {sidebarOpen && (
        <aside className="hidden md:flex w-64 shrink-0 flex-col border-r bg-sidebar">
          <SidebarContent showCollapseButton />
        </aside>
      )}

      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center justify-between px-4 md:px-6 z-10">
          <div className="flex items-center gap-2">
            {/* Mobile Sidebar Trigger */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger render={<Button variant="ghost" size="icon" className="-ml-2" />}>
                  <Menu className="size-5" />
                  <span className="sr-only">Toggle sidebar</span>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            </div>

            {/* Expand sidebar button when collapsed */}
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex rounded-full text-muted-foreground hover:text-foreground"
                onClick={() => setSidebarOpen(true)}
              >
                <PanelLeftOpen className="size-5" />
                <span className="sr-only">Expand sidebar</span>
              </Button>
            )}

            <div className="flex items-center gap-2">
              <span className="font-brand text-xl font-bold tracking-tight text-foreground hidden sm:inline-block">
                Examin<span className="text-primary">ai</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex gap-1.5 h-9 rounded-full px-4">
              <Share className="size-3.5" />
              <span>Share</span>
            </Button>
            <Button variant="ghost" size="icon" className="sm:hidden rounded-full">
              <Share className="size-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-full" />}>
                <Avatar className="size-8 cursor-pointer">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {isAuthenticated ? "U" : "G"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="gap-2">
                    <Globe className="size-4" />
                    <span>Language</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem>English</DropdownMenuItem>
                      <DropdownMenuItem>Vietnamese</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="gap-2">
                    {theme === "light" ? <Sun className="size-4" /> : <Moon className="size-4" />}
                    <span>Theme</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => setTheme("light")}>
                        <Sun className="mr-2 size-4" /> Light
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("dark")}>
                        <Moon className="mr-2 size-4" /> Dark
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuSeparator />
                {isAuthenticated ? (
                  <DropdownMenuItem className="text-destructive focus:text-destructive gap-2">
                    <LogOut className="size-4" />
                    Sign out
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem className="gap-2">
                    <LogIn className="size-4" />
                    Sign in
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Chat Area */}
        <main className="flex flex-1 flex-col relative min-w-0 bg-background/50 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="mx-auto max-w-3xl flex flex-col h-full justify-center">

              <div className="text-center mb-8">
                <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full border">
                  <RobotIcon className="size-10 text-primary" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  How can I help you today?
                </h1>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 mt-4 max-w-2xl mx-auto w-full">
                {/* Writing Card */}
                <Card className="cursor-pointer transition-all hover:border-primary/50 group overflow-hidden border-[0.5px] rounded-2xl shadow-none py-0">
                  <CardContent className="px-0 py-0">
                    <div className="flex flex-col h-full">
                      <div className="w-full flex items-start justify-center">
                        <div className="w-36 h-36">
                          <DotLottieReact src="/animations/writing.lottie" loop autoplay />
                        </div>
                      </div>
                      <div className="px-5 pb-5">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <PenLine className="size-5 text-primary" />
                          Writing
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          Take a timed test or submit an existing essay for detailed AI feedback.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Speaking Card */}
                <Card className="cursor-pointer transition-all hover:border-primary/50 group overflow-hidden border-[0.5px] rounded-2xl shadow-none py-0">
                  <CardContent className="px-0 py-0">
                    <div className="flex flex-col h-full">
                      <div className="w-full flex items-start justify-center">
                        <div className="w-36 h-36">
                          <DotLottieReact src="/animations/speaking.lottie" loop autoplay />
                        </div>
                      </div>
                      <div className="px-5 pb-5">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Mic className="size-5 text-primary" />
                          Speaking
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          Practice with a realistic AI examiner that asks questions and gives real-time feedback.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>

          {/* Input Area */}
          <div className="shrink-0 p-4 md:p-6 bg-background">
            <div className="mx-auto max-w-3xl relative">
              <div className="relative flex items-center rounded-2xl border bg-background focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all overflow-hidden">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Send a message..."
                  className="min-h-0 max-h-[200px] w-full resize-none border-0 focus-visible:ring-0 px-4 py-2.5 text-base shadow-none bg-transparent"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      // Submit message
                    }
                  }}
                />
                <div className="flex items-center gap-0 pr-2">
                  <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground shrink-0 size-9" type="button">
                    <Mic className="size-5" />
                    <span className="sr-only">Use microphone</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full shrink-0 transition-transform active:scale-95 size-9 text-muted-foreground hover:text-foreground" disabled={!message.trim()}>
                    <Send className="size-4" />
                    <span className="sr-only">Send message</span>
                  </Button>
                </div>
              </div>
              <div className="text-center mt-2">
                <p className="text-xs text-muted-foreground/70">
                  AI can make mistakes. Consider verifying important information.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
