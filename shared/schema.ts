import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, pgEnum, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  fullName: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Portfolio holdings
export const holdings = pgTable("holdings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  symbol: text("symbol").notNull(),
  quantity: decimal("quantity", { precision: 18, scale: 8 }).notNull(),
  averageCost: decimal("average_cost", { precision: 18, scale: 2 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertHoldingSchema = createInsertSchema(holdings).omit({
  id: true,
  updatedAt: true,
});

export type InsertHolding = z.infer<typeof insertHoldingSchema>;
export type Holding = typeof holdings.$inferSelect;

// Conversations
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  startedAt: true,
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

// Message role enum
export const messageRoleEnum = pgEnum("message_role", ["user", "assistant"]);

// Messages
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  role: messageRoleEnum("role").notNull(),
  content: text("content").notNull(),
  audioUrl: text("audio_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Trade status and type enums
export const tradeTypeEnum = pgEnum("trade_type", ["buy", "sell"]);
export const tradeStatusEnum = pgEnum("trade_status", ["pending", "approved", "executed", "rejected"]);

// Trades
export const trades = pgTable("trades", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  symbol: text("symbol").notNull(),
  type: tradeTypeEnum("type").notNull(),
  quantity: decimal("quantity", { precision: 18, scale: 8 }).notNull(),
  price: decimal("price", { precision: 18, scale: 2 }).notNull(),
  status: tradeStatusEnum("status").notNull().default('pending'),
  reasoning: text("reasoning"),
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  executedAt: timestamp("executed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTradeSchema = createInsertSchema(trades).omit({
  id: true,
  createdAt: true,
  executedAt: true,
});

export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Trade = typeof trades.$inferSelect;

// Watchlist
export const watchlist = pgTable("watchlist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  symbol: text("symbol").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const insertWatchlistSchema = createInsertSchema(watchlist).omit({
  id: true,
  addedAt: true,
});

export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;
export type Watchlist = typeof watchlist.$inferSelect;

// Question depth enum
export const questionDepthEnum = pgEnum("question_depth", ["none", "simple", "moderate", "deep"]);

// Interface mode enum
export const interfaceModeEnum = pgEnum("interface_mode", ["amanda", "hybrid", "terminal"]);

// Message metrics (per-message analysis)
export const messageMetrics = pgTable("message_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messageId: varchar("message_id").notNull().references(() => messages.id, { onDelete: 'cascade' }),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  wordCount: integer("word_count").notNull(),
  characterCount: integer("character_count").notNull(),
  hasQuestion: boolean("has_question").notNull().default(false),
  questionDepth: questionDepthEnum("question_depth").notNull().default('none'),
  technicalTermCount: integer("technical_term_count").notNull().default(0),
  urgencySignals: text("urgency_signals").array(),
  responseTimeSeconds: integer("response_time_seconds"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMessageMetricsSchema = createInsertSchema(messageMetrics).omit({
  id: true,
  createdAt: true,
});

export type InsertMessageMetrics = z.infer<typeof insertMessageMetricsSchema>;
export type MessageMetrics = typeof messageMetrics.$inferSelect;

// Conversation analysis (aggregate scores)
export const conversationAnalysis = pgTable("conversation_analysis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: 'cascade' }).unique(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  hurriedScore: decimal("hurried_score", { precision: 5, scale: 2 }).notNull().default('0'),
  analyticalScore: decimal("analytical_score", { precision: 5, scale: 2 }).notNull().default('0'),
  conversationalScore: decimal("conversational_score", { precision: 5, scale: 2 }).notNull().default('0'),
  recommendedMode: interfaceModeEnum("recommended_mode"),
  messageCount: integer("message_count").notNull().default(0),
  avgResponseTimeSeconds: integer("avg_response_time_seconds"),
  lastAnalyzedAt: timestamp("last_analyzed_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertConversationAnalysisSchema = createInsertSchema(conversationAnalysis).omit({
  id: true,
  lastAnalyzedAt: true,
  updatedAt: true,
});

export type InsertConversationAnalysis = z.infer<typeof insertConversationAnalysisSchema>;
export type ConversationAnalysis = typeof conversationAnalysis.$inferSelect;
