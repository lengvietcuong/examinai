import { db } from "@/lib/db";
import {
  conversations,
  messages,
  writingQuestions,
  speakingQuestions,
  ieltsKnowledge,
  profiles,
} from "./schema";
import { eq, sql, desc, asc } from "drizzle-orm";

// Writing questions

export async function getRandomWritingQuestions(
  taskNumbers: ("1" | "2")[]
) {
  const results = [];
  for (const taskNumber of taskNumbers) {
    const [question] = await db
      .select()
      .from(writingQuestions)
      .where(eq(writingQuestions.taskNumber, taskNumber))
      .orderBy(sql`RANDOM()`)
      .limit(1);
    if (question) results.push(question);
  }
  return results;
}

export async function getWritingQuestionsById(ids: string[]) {
  const results = [];
  for (const id of ids) {
    const [question] = await db
      .select()
      .from(writingQuestions)
      .where(eq(writingQuestions.id, id));
    if (question) results.push(question);
  }
  return results;
}

// Speaking questions

export async function getRandomSpeakingQuestions(
  partNumbers: ("1" | "2" | "3")[]
) {
  const results = [];
  for (const partNumber of partNumbers) {
    const [question] = await db
      .select()
      .from(speakingQuestions)
      .where(eq(speakingQuestions.partNumber, partNumber))
      .orderBy(sql`RANDOM()`)
      .limit(1);
    if (question) results.push(question);
  }
  return results;
}

// IELTS Knowledge

export async function getIeltsKnowledge() {
  return db.select().from(ieltsKnowledge);
}

export async function getIeltsKnowledgeByTitle(title: string) {
  return db
    .select()
    .from(ieltsKnowledge)
    .where(eq(ieltsKnowledge.title, title));
}

// Conversations

export async function createConversation(data: {
  userId?: string;
  type?: "general" | "writing" | "speaking";
  title?: string;
}) {
  const [conversation] = await db
    .insert(conversations)
    .values({
      userId: data.userId || null,
      type: data.type || "general",
      title: data.title || null,
    })
    .returning();
  return conversation;
}

export async function getConversation(id: string) {
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id));
  return conversation;
}

export async function getUserConversations(userId: string) {
  return db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.updatedAt));
}

export async function updateConversationTitle(id: string, title: string) {
  await db
    .update(conversations)
    .set({ title, updatedAt: new Date() })
    .where(eq(conversations.id, id));
}

export async function deleteConversation(id: string) {
  await db.delete(conversations).where(eq(conversations.id, id));
}

export async function setConversationShareId(id: string) {
  const shareId = crypto.randomUUID();
  await db
    .update(conversations)
    .set({ shareId, updatedAt: new Date() })
    .where(eq(conversations.id, id));
  return shareId;
}

export async function getConversationByShareId(shareId: string) {
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.shareId, shareId));
  return conversation;
}

// Messages

export async function getMessages(conversationId: string) {
  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));
}

export async function addMessage(data: {
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
}) {
  const [message] = await db.insert(messages).values(data).returning();
  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, data.conversationId));
  return message;
}

// Profiles

export async function getProfile(userId: string) {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId));
  return profile;
}

export async function upsertProfile(data: {
  id: string;
  displayName?: string;
  avatarUrl?: string;
  language?: string;
  theme?: string;
  speakingAutoplay?: boolean;
}) {
  const [profile] = await db
    .insert(profiles)
    .values({
      id: data.id,
      displayName: data.displayName,
      avatarUrl: data.avatarUrl,
      language: data.language || "en",
      theme: data.theme || "light",
      ...(data.speakingAutoplay !== undefined && { speakingAutoplay: data.speakingAutoplay }),
    })
    .onConflictDoUpdate({
      target: profiles.id,
      set: {
        displayName: data.displayName,
        avatarUrl: data.avatarUrl,
        ...(data.language && { language: data.language }),
        ...(data.theme && { theme: data.theme }),
        ...(data.speakingAutoplay !== undefined && { speakingAutoplay: data.speakingAutoplay }),
        updatedAt: new Date(),
      },
    })
    .returning();
  return profile;
}

export async function updateSpeakingAutoplay(userId: string, autoplay: boolean) {
  await db
    .update(profiles)
    .set({ speakingAutoplay: autoplay, updatedAt: new Date() })
    .where(eq(profiles.id, userId));
}
