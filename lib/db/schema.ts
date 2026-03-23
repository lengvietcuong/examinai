import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

// ── Enums ──────────────────────────────────────────────────────────────────

export const conversationTypeEnum = pgEnum("conversation_type", [
  "general",
  "writing",
  "speaking",
]);

export const messageRoleEnum = pgEnum("message_role", [
  "user",
  "assistant",
  "system",
]);

export const writingTaskNumberEnum = pgEnum("writing_task_number", ["1", "2"]);

export const speakingPartNumberEnum = pgEnum("speaking_part_number", [
  "1",
  "2",
  "3",
]);

// ── Profiles ───────────────────────────────────────────────────────────────
// Linked to Supabase auth.users via id

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // matches auth.users.id
  displayName: varchar("display_name", { length: 100 }),
  avatarUrl: text("avatar_url"),
  language: varchar("language", { length: 5 }).default("en").notNull(), // "en" | "vi"
  theme: varchar("theme", { length: 10 }).default("light").notNull(), // "light" | "dark"
  speakingAutoplay: boolean("speaking_autoplay").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Conversations ──────────────────────────────────────────────────────────

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => profiles.id, {
      onDelete: "cascade",
    }),
    type: conversationTypeEnum("type").default("general").notNull(),
    title: varchar("title", { length: 255 }),
    shareId: uuid("share_id").unique(), // non-null = publicly shared; unique constraint provides the index
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("conversations_user_id_idx").on(table.userId)],
);

// ── Messages ───────────────────────────────────────────────────────────────
// Content is plain text for simple messages, or a JSON string for structured
// data (writing submissions, scoring feedback, speaking session config, etc.)

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    role: messageRoleEnum("role").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("messages_conversation_id_idx").on(table.conversationId),
  ],
);

// ── Writing Questions ──────────────────────────────────────────────────────

export const writingQuestions = pgTable("writing_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  testTitle: varchar("test_title", { length: 256 }).notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"), // Supabase Storage URL (Task 1 only)
  sourceUrl: text("source_url"),
  taskNumber: writingTaskNumberEnum("task_number").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Speaking Questions ─────────────────────────────────────────────────────

export const speakingQuestions = pgTable("speaking_questions", {
  id: integer("id").primaryKey(),
  testTitle: varchar("test_title", { length: 256 }).notNull(),
  content: text("content").notNull(),
  sourceUrl: text("source_url"),
  partNumber: speakingPartNumberEnum("part_number").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── IELTS Knowledge Documents ──────────────────────────────────────────────

export const ieltsKnowledge = pgTable("ielts_knowledge", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Type Exports ───────────────────────────────────────────────────────────

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export type WritingQuestion = typeof writingQuestions.$inferSelect;
export type SpeakingQuestion = typeof speakingQuestions.$inferSelect;

export type IeltsKnowledge = typeof ieltsKnowledge.$inferSelect;
