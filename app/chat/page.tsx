"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { toast } from "sonner";
import {
  Menu,
  Share,
  Send,
  Mic,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  PenLine,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

import { useI18n } from "@/lib/i18n/provider";
import { supabase } from "@/lib/supabase/client";
import type { WritingSubmission, SpeakingQuestionData } from "@/lib/types";

import RobotIcon from "@/components/icons/logo";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { UserProfileMenu } from "@/components/user-profile-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { WritingModal } from "@/components/writing/writing-modal";
import { StartWritingModal } from "@/components/writing/start-writing-modal";
import { SubmitEssayModal } from "@/components/writing/submit-essay-modal";
import { SpeakingModal } from "@/components/speaking/speaking-modal";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { ChatMessages } from "@/components/chat/chat-messages";

type ViewState = "default" | "chat";

interface ConversationItem {
  id: string;
  title: string;
  type: string;
  updatedAt: string;
}

/** Extract the plain-text content from a UIMessage's parts array. */
function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

function ChatPageInner() {
  const router = useRouter();
  const { t, setLanguage } = useI18n();

  // View state
  const [view, setView] = useState<ViewState>("default");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Modal state
  const [writingModalOpen, setWritingModalOpen] = useState(false);
  const [startWritingModalOpen, setStartWritingModalOpen] = useState(false);
  const [submitEssayModalOpen, setSubmitEssayModalOpen] = useState(false);
  const [speakingModalOpen, setSpeakingModalOpen] = useState(false);

  // Auth state
  const [user, setUser] = useState<any>(null);

  // Conversation state
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  // Input state (managed manually in AI SDK v6)
  const [input, setInput] = useState("");

  // Ref to track active conversation id inside callbacks
  const activeConversationIdRef = useRef(activeConversationId);
  activeConversationIdRef.current = activeConversationId;

  // Track whether the active conversation has been named
  const conversationNamedRef = useRef(false);

  // Guard against double-sending during async operations
  const sendingRef = useRef(false);

  // Transport — stable instance; body is a function that reads the ref
  // so we never recreate the transport (which would reset useChat internals).
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({ conversationId: activeConversationIdRef.current }),
      }),
    [],
  );

  // useChat (AI SDK v6)
  const { messages, sendMessage, setMessages, status } = useChat({
    transport,
    onFinish: async ({ message, messages: finishedMessages }) => {
      const convId = activeConversationIdRef.current;
      // Auto-name the conversation after the first assistant response
      if (!conversationNamedRef.current && convId && message.role === "assistant") {
        conversationNamedRef.current = true;
        const firstUserMsg = finishedMessages.find((m) => m.role === "user");
        if (!firstUserMsg) return;
        try {
          const res = await fetch("/api/chat/name", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: getMessageText(firstUserMsg),
              conversationId: convId,
            }),
          });
          if (res.ok) {
            const { title } = await res.json();
            setConversations((prev) =>
              prev.map((c) => (c.id === convId ? { ...c, title } : c)),
            );
          }
        } catch {
          // Naming failure is non-critical
        }
      }
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  // Reset sending guard when the chat finishes responding
  useEffect(() => {
    if (status === "ready") {
      sendingRef.current = false;
    }
  }, [status]);

  // Detect if the AI is searching the knowledge base.
  // Stay true until the assistant actually starts generating text (not just tool results).
  const isSearchingKnowledge = useMemo(() => {
    if (!isLoading) return false;
    let hasToolCall = false;
    let hasTextAfterTool = false;
    for (const msg of messages) {
      if (msg.role !== "assistant") continue;
      for (const part of msg.parts) {
        if (
          part.type === "tool-searchIeltsKnowledge" ||
          part.type === "tool-getIeltsDocument"
        ) {
          hasToolCall = true;
          hasTextAfterTool = false;
        }
        if (hasToolCall && part.type === "text" && (part as any).text?.trim()) {
          hasTextAfterTool = true;
        }
      }
    }
    return hasToolCall && !hasTextAfterTool;
  }, [messages, isLoading]);

  // Map UIMessages to the shape ChatMessages expects.
  // Multi-step tool usage creates separate assistant UIMessages per step;
  // merge consecutive assistant messages so only one bubble is shown.
  const displayMessages = useMemo(() => {
    const mapped = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: getMessageText(m),
      }));

    const merged: typeof mapped = [];
    for (const msg of mapped) {
      const prev = merged[merged.length - 1];
      if (prev && prev.role === "assistant" && msg.role === "assistant") {
        // Merge consecutive assistant messages (from multi-step tool calls)
        const combined = (prev.content + "\n\n" + msg.content).trim();
        if (combined) prev.content = combined;
      } else if (msg.role === "assistant" && !msg.content.trim()) {
        // Skip empty assistant messages (tool-call-only steps)
        continue;
      } else {
        merged.push({ ...msg });
      }
    }
    return merged;
  }, [messages]);

  // Auth handling
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        loadConversations(data.user.id);
      } else {
        setConversationsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadConversations(session.user.id);
      } else {
        setUser(null);
        setConversations([]);
        setConversationsLoading(false);
        setActiveConversationId(null);
        setMessages([]);
        setInput("");
        setView("default");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Onboarding check
  useEffect(() => {
    const completed = localStorage.getItem("examinai-onboarding-complete");
    if (!completed) {
      setShowOnboarding(true);
    }
  }, []);

  // Conversation management
  const loadConversations = useCallback(async (userId: string) => {
    setConversationsLoading(true);
    try {
      const res = await fetch(`/api/conversations?userId=${userId}`);
      if (res.ok) {
        const { conversations: convs } = await res.json();
        setConversations(convs ?? []);
      }
    } catch {
      // Silent failure for conversation loading
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  async function selectConversation(id: string) {
    // Check if this is a writing/speaking conversation — open in dedicated interface
    const conv = conversations.find((c) => c.id === id);
    if (conv?.type === "writing") {
      setMobileSidebarOpen(false);
      router.push(`/writing?conversation_id=${id}`);
      return;
    }
    if (conv?.type === "speaking") {
      setMobileSidebarOpen(false);
      router.push(`/speaking?conversation_id=${id}`);
      return;
    }

    try {
      setActiveConversationId(id);
      conversationNamedRef.current = true; // Existing conversations already have names
      const res = await fetch(`/api/conversations/${id}/messages`);
      if (!res.ok) throw new Error();
      const { messages: msgs } = await res.json();
      setMessages(
        (msgs ?? []).map((m: any) => ({
          id: m.id,
          role: m.role,
          parts: [{ type: "text" as const, text: m.content }],
        })),
      );
      setView("chat");
      setMobileSidebarOpen(false);
    } catch {
      toast.error(t.common.error);
    }
  }

  async function handleDeleteConversation(id: string) {
    try {
      await fetch("/api/conversations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setMessages([]);
        setView("default");
      }
    } catch {
      toast.error(t.common.error);
    }
  }

  function startRenaming(conv: ConversationItem) {
    setEditingConversationId(conv.id);
    setEditingTitle(conv.title || "");
  }

  async function handleRenameConversation(id: string) {
    const trimmed = editingTitle.trim();
    setEditingConversationId(null);
    if (!trimmed) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: trimmed } : c)),
    );
    try {
      await fetch("/api/conversations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title: trimmed }),
      });
    } catch {
      toast.error(t.common.error);
    }
  }

  function handleNewChat() {
    setActiveConversationId(null);
    setMessages([]);
    setInput("");
    setView("default");
    setMobileSidebarOpen(false);
    conversationNamedRef.current = false;
  }

  // Writing flow — navigates to /writing route
  async function handleStartWriting(taskNumbers: ("1" | "2")[]) {
    try {
      const res = await fetch("/api/writing/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskNumbers }),
      });
      if (!res.ok) throw new Error();
      const { questions } = await res.json();
      const params = new URLSearchParams();
      for (const q of questions) {
        if (q.taskNumber === "1") params.set("task_1_id", q.id);
        else params.set("task_2_id", q.id);
      }
      setStartWritingModalOpen(false);
      router.push(`/writing?${params.toString()}`);
    } catch {
      toast.error(t.common.error);
    }
  }

  async function handleSubmitExistingEssay(submission: WritingSubmission & { imageFile?: File }) {
    setSubmitEssayModalOpen(false);
    const { imageFile, ...rest } = submission;

    if (imageFile) {
      const ext = imageFile.name.split(".").pop() || "png";
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("writing-submissions")
        .upload(fileName, imageFile, { contentType: imageFile.type });
      if (!error) {
        const { data } = supabase.storage
          .from("writing-submissions")
          .getPublicUrl(fileName);
        rest.imageUrl = data.publicUrl;
      }
    }

    sessionStorage.setItem("writing-submission", JSON.stringify(rest));
    router.push("/writing");
  }

  // Speaking flow — navigates to /speaking route
  function handleStartSpeaking(questions: SpeakingQuestionData[]) {
    setSpeakingModalOpen(false);
    sessionStorage.setItem("speaking-questions", JSON.stringify(questions));
    router.push("/speaking");
  }

  // Share
  async function handleShare() {
    if (!activeConversationId) return;
    try {
      const res = await fetch(`/api/conversations/${activeConversationId}/share`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      const { shareId } = await res.json();
      const url = `${window.location.origin}/shared/${shareId}`;
      await navigator.clipboard.writeText(url);
      toast.success(t.chat.linkCopied);
    } catch {
      toast.error(t.common.error);
    }
  }

  // Message sending
  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading || sendingRef.current) return;
    sendingRef.current = true;
    setInput("");

    let convId = activeConversationId;

    if (view === "default") {
      if (!convId) {
        try {
          const res = await fetch("/api/conversations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user?.id, type: "general" }),
          });
          if (!res.ok) throw new Error();
          const conv = await res.json();
          convId = conv.id;
          setActiveConversationId(convId);
          activeConversationIdRef.current = convId!;
          setConversations((prev) => [conv, ...prev]);
        } catch {
          toast.error(t.common.error);
          sendingRef.current = false;
          return;
        }
      }
      setView("chat");
    }

    // Save user message to DB (fire-and-forget so streaming starts immediately)
    if (convId) {
      fetch(`/api/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "user", content: text }),
      }).catch(() => {
        // Non-critical: message still sent via useChat
      });
    }

    sendMessage({ text });
  }

  // Onboarding complete
  function handleOnboardingComplete(lang: string) {
    setShowOnboarding(false);
    localStorage.setItem("examinai-onboarding-complete", "true");
    if (lang === "en" || lang === "vi") {
      setLanguage(lang);
    }
  }

  // Sidebar content
  const SidebarContent = ({ showCollapseButton = false }: { showCollapseButton?: boolean }) => (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between p-4">
        <Button
          variant="outline"
          className="flex-1 justify-start gap-2"
          onClick={handleNewChat}
        >
          <Plus className="size-4" />
          {t.common.newChat}
        </Button>
        {showCollapseButton && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <PanelLeftClose className="size-4" />
            <span className="sr-only">{t.chat.collapseSidebar}</span>
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-4 py-2">
          {conversationsLoading ? (
            <>
              <div className="space-y-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2 px-2 h-9">
                    <Skeleton className="size-4 shrink-0 rounded" />
                    <Skeleton
                      className="h-4 rounded-md"
                      style={{ width: `${60 + ((i * 17) % 30)}%` }}
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
          <>
          <div className="space-y-1">
            {conversations.map((conv) => (
              <div key={conv.id} className="group relative flex items-center">
                {editingConversationId === conv.id ? (
                  <div className="flex items-center w-full gap-1 px-2 h-9">
                    <input
                      autoFocus
                      className="flex-1 min-w-0 bg-transparent text-sm font-heading font-medium outline-none border-b border-primary/50 px-1"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRenameConversation(conv.id);
                        if (e.key === "Escape") setEditingConversationId(null);
                      }}
                      onBlur={() => handleRenameConversation(conv.id)}
                      maxLength={255}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleRenameConversation(conv.id);
                      }}
                    >
                      <Check className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setEditingConversationId(null);
                      }}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button
                      variant={activeConversationId === conv.id ? "secondary" : "ghost"}
                      className="w-full justify-start px-2 text-[13px] font-medium overflow-hidden h-9 pr-10"
                      onClick={() => selectConversation(conv.id)}
                      title={conv.title || t.common.newChat}
                    >
                      <span className="truncate">
                        {conv.title || t.common.newChat}
                      </span>
                    </Button>
                    <div className={`absolute right-1 flex items-center opacity-0 transition-opacity group-hover:opacity-100 pl-4 rounded-r-full bg-gradient-to-l ${activeConversationId === conv.id ? "from-secondary via-secondary" : "from-muted via-muted"} to-transparent`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          startRenaming(conv);
                        }}
                      >
                        <Pencil className="size-3.5" />
                        <span className="sr-only">{t.chat.renameConversation}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 rounded-full text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConversationToDelete(conv.id);
                        }}
                      >
                        <Trash2 className="size-3.5" />
                        <span className="sr-only">{t.chat.deleteConversation}</span>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          </>
          )}
        </div>
      </ScrollArea>

      <Dialog
        open={conversationToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setConversationToDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.chat.deleteConversation}</DialogTitle>
            <DialogDescription>
              {t.chat.deleteConfirmation}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConversationToDelete(null)}
            >
              {t.common.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (conversationToDelete) {
                  handleDeleteConversation(conversationToDelete);
                  setConversationToDelete(null);
                }
              }}
            >
              {t.common.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  return (
    <>
      <OnboardingFlow open={showOnboarding} onComplete={handleOnboardingComplete} />

      <WritingModal
        open={writingModalOpen}
        onOpenChange={setWritingModalOpen}
        onStartWriting={() => {
          setWritingModalOpen(false);
          setStartWritingModalOpen(true);
        }}
        onSubmitEssay={() => {
          setWritingModalOpen(false);
          setSubmitEssayModalOpen(true);
        }}
      />
      <StartWritingModal
        open={startWritingModalOpen}
        onOpenChange={setStartWritingModalOpen}
        onStart={handleStartWriting}
      />
      <SubmitEssayModal
        open={submitEssayModalOpen}
        onOpenChange={setSubmitEssayModalOpen}
        onSubmit={handleSubmitExistingEssay}
      />
      <SpeakingModal
        open={speakingModalOpen}
        onOpenChange={setSpeakingModalOpen}
        onStart={handleStartSpeaking}
      />

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
                <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
                  <SheetTrigger render={<Button variant="ghost" size="icon" className="-ml-2" />}>
                    <Menu className="size-5" />
                    <span className="sr-only">{t.chat.toggleSidebar}</span>
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
                  <span className="sr-only">{t.chat.expandSidebar}</span>
                </Button>
              )}

              <div className="flex items-center gap-2">
                <span className="font-brand text-xl font-bold tracking-tight text-foreground hidden sm:inline-block">
                  Examin<span className="text-primary">ai</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeConversationId && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex gap-1.5 h-9 rounded-full px-4"
                    onClick={handleShare}
                  >
                    <Share className="size-3.5" />
                    <span>{t.common.share}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="sm:hidden rounded-full"
                    onClick={handleShare}
                  >
                    <Share className="size-4" />
                  </Button>
                </>
              )}

              <UserProfileMenu />
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex flex-1 flex-col relative min-w-0 bg-background/50 overflow-hidden">
            {(view === "default" || view === "chat") && (
              <>
                <div className="flex-1 overflow-y-auto px-4 pt-4 md:px-8 md:pt-8">
                  <div className="mx-auto max-w-3xl flex flex-col h-full">
                    {view === "default" && messages.length === 0 ? (
                      <div className="flex flex-col h-full justify-center">
                        <div className="text-center mb-8">
                          <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full border">
                            <RobotIcon className="size-10 text-foreground" />
                          </div>
                          <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {t.chat.howCanIHelp}
                          </h1>
                          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                            {t.chat.howCanIHelpSubtitle}
                          </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 mt-4 max-w-2xl mx-auto w-full">
                          {/* Writing Card */}
                          <Card
                            className="cursor-pointer hover:border-primary hover:shadow-md hover:bg-primary/[0.02] hover:ring-[3px] hover:ring-primary/20 group overflow-hidden border-[0.5px] rounded-2xl shadow-none py-0 transition-all"
                            onClick={() => setWritingModalOpen(true)}
                          >
                            <CardContent className="px-0 py-0">
                              <div className="flex flex-col h-full">
                                <div className="w-full flex items-start justify-center">
                                  <div className="w-44 h-44">
                                    <DotLottieReact src="/animations/writing.lottie" loop autoplay />
                                  </div>
                                </div>
                                <div className="px-6 pb-6">
                                  <h3 className="font-semibold text-xl flex items-center gap-2">
                                    <PenLine className="size-5 text-primary" />
                                    {t.chat.writing}
                                  </h3>
                                  <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
                                    {t.chat.writingDescription}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Speaking Card */}
                          <Card
                            className="cursor-pointer hover:border-primary hover:shadow-md hover:bg-primary/[0.02] hover:ring-[3px] hover:ring-primary/20 group overflow-hidden border-[0.5px] rounded-2xl shadow-none py-0 transition-all"
                            onClick={() => setSpeakingModalOpen(true)}
                          >
                            <CardContent className="px-0 py-0">
                              <div className="flex flex-col h-full">
                                <div className="w-full flex items-start justify-center">
                                  <div className="w-44 h-44">
                                    <DotLottieReact src="/animations/speaking.lottie" loop autoplay />
                                  </div>
                                </div>
                                <div className="px-6 pb-6">
                                  <h3 className="font-semibold text-xl flex items-center gap-2">
                                    <Mic className="size-5 text-primary" />
                                    {t.chat.speaking}
                                  </h3>
                                  <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
                                    {t.chat.speakingDescription}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    ) : (
                      <ChatMessages messages={displayMessages} isLoading={isLoading} isSearchingKnowledge={isSearchingKnowledge} />
                    )}
                  </div>
                </div>

                {/* Input Area */}
                <div className="shrink-0 px-3 pb-3 sm:px-4 sm:pb-4 bg-background">
                  <form onSubmit={handleSendMessage} className="mx-auto max-w-3xl relative">
                    <div className="relative flex items-center rounded-full border bg-background focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all overflow-hidden">
                      <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t.chat.typeMessage}
                        className="min-h-0 max-h-[200px] w-full resize-none border-0 focus-visible:ring-0 px-4 py-2.5 text-base shadow-none bg-transparent"
                        rows={1}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                      />
                      <div className="flex items-center gap-0 pr-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full text-muted-foreground hover:text-foreground shrink-0 size-9"
                          type="button"
                          onClick={() => setSpeakingModalOpen(true)}
                        >
                          <Mic className="size-5" />
                          <span className="sr-only">{t.speaking.tapToSpeak}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full shrink-0 transition-transform active:scale-95 size-9 text-muted-foreground hover:text-foreground"
                          type="submit"
                          disabled={!input.trim() || isLoading}
                        >
                          <Send className="size-4" />
                          <span className="sr-only">{t.common.sendMessage}</span>
                        </Button>
                      </div>
                    </div>
                    <div className="text-center mt-2">
                      <p className="text-[10px] text-muted-foreground/70">
                        {t.common.aiDisclaimer}
                      </p>
                    </div>
                  </form>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

export default function ChatPage() {
  return <ChatPageInner />;
}
