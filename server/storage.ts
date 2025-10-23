import { db } from "./db";
import { 
  users, holdings, conversations, messages, trades, watchlist,
  type User, type InsertUser, 
  type Holding, type InsertHolding,
  type Conversation, type InsertConversation,
  type Message, type InsertMessage,
  type Trade, type InsertTrade,
  type Watchlist, type InsertWatchlist
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Holdings operations
  getUserHoldings(userId: string): Promise<Holding[]>;
  getHolding(id: string): Promise<Holding | undefined>;
  createHolding(holding: InsertHolding): Promise<Holding>;
  updateHolding(id: string, holding: Partial<InsertHolding>): Promise<Holding | undefined>;
  deleteHolding(id: string): Promise<boolean>;
  
  // Conversation operations
  getUserConversations(userId: string): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  endConversation(id: string): Promise<Conversation | undefined>;
  
  // Message operations
  getConversationMessages(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Trade operations
  getUserTrades(userId: string): Promise<Trade[]>;
  getPendingTrades(userId: string): Promise<Trade[]>;
  getTrade(id: string): Promise<Trade | undefined>;
  createTrade(trade: InsertTrade): Promise<Trade>;
  updateTradeStatus(id: string, status: 'approved' | 'executed' | 'rejected'): Promise<Trade | undefined>;
  
  // Watchlist operations
  getUserWatchlist(userId: string): Promise<Watchlist[]>;
  addToWatchlist(watchlist: InsertWatchlist): Promise<Watchlist>;
  removeFromWatchlist(id: string): Promise<boolean>;
}

export class DbStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Holdings operations
  async getUserHoldings(userId: string): Promise<Holding[]> {
    return db.select().from(holdings).where(eq(holdings.userId, userId));
  }

  async getHolding(id: string): Promise<Holding | undefined> {
    const result = await db.select().from(holdings).where(eq(holdings.id, id)).limit(1);
    return result[0];
  }

  async createHolding(holding: InsertHolding): Promise<Holding> {
    const result = await db.insert(holdings).values(holding).returning();
    return result[0];
  }

  async updateHolding(id: string, holding: Partial<InsertHolding>): Promise<Holding | undefined> {
    const result = await db.update(holdings)
      .set({ ...holding, updatedAt: new Date() })
      .where(eq(holdings.id, id))
      .returning();
    return result[0];
  }

  async deleteHolding(id: string): Promise<boolean> {
    const result = await db.delete(holdings).where(eq(holdings.id, id)).returning();
    return result.length > 0;
  }

  // Conversation operations
  async getUserConversations(userId: string): Promise<Conversation[]> {
    return db.select().from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.startedAt));
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const result = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
    return result[0];
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const result = await db.insert(conversations).values(conversation).returning();
    return result[0];
  }

  async endConversation(id: string): Promise<Conversation | undefined> {
    const result = await db.update(conversations)
      .set({ endedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    return result[0];
  }

  // Message operations
  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return db.select().from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values(message).returning();
    return result[0];
  }

  // Trade operations
  async getUserTrades(userId: string): Promise<Trade[]> {
    return db.select().from(trades)
      .where(eq(trades.userId, userId))
      .orderBy(desc(trades.createdAt));
  }

  async getPendingTrades(userId: string): Promise<Trade[]> {
    return db.select().from(trades)
      .where(and(eq(trades.userId, userId), eq(trades.status, 'pending')))
      .orderBy(desc(trades.createdAt));
  }

  async getTrade(id: string): Promise<Trade | undefined> {
    const result = await db.select().from(trades).where(eq(trades.id, id)).limit(1);
    return result[0];
  }

  async createTrade(trade: InsertTrade): Promise<Trade> {
    const result = await db.insert(trades).values(trade).returning();
    return result[0];
  }

  async updateTradeStatus(id: string, status: 'approved' | 'executed' | 'rejected'): Promise<Trade | undefined> {
    const update: any = { status };
    if (status === 'executed') {
      update.executedAt = new Date();
    }
    const result = await db.update(trades)
      .set(update)
      .where(eq(trades.id, id))
      .returning();
    return result[0];
  }

  // Watchlist operations
  async getUserWatchlist(userId: string): Promise<Watchlist[]> {
    return db.select().from(watchlist)
      .where(eq(watchlist.userId, userId))
      .orderBy(desc(watchlist.addedAt));
  }

  async addToWatchlist(item: InsertWatchlist): Promise<Watchlist> {
    const result = await db.insert(watchlist).values(item).returning();
    return result[0];
  }

  async removeFromWatchlist(id: string): Promise<boolean> {
    const result = await db.delete(watchlist).where(eq(watchlist.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DbStorage();
