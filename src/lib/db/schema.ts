import { pgTable, text, timestamp, varchar, integer, json, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  displayName: varchar("display_name", { length: 255 }),
  avatarUrl: text("avatar_url"),
  timezone: varchar("timezone", { length: 100 }).default("UTC").notNull(),
  themePreference: varchar("theme_preference", { length: 20 }).default("system").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userAiSettings = pgTable("user_ai_settings", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  encryptedGeminiKey: text("encrypted_gemini_key"),
  defaultModel: varchar("default_model", { length: 100 }).default("gemini-1.5-flash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const socialAccounts = pgTable("social_accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  platform: varchar("platform", { length: 50 }).notNull(), // 'facebook' | 'instagram' | 'x' | 'linkedin'
  accountName: varchar("account_name", { length: 255 }).notNull(),
  platformUserId: varchar("platform_user_id", { length: 255 }).notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  status: varchar("status", { length: 50 }).default("connected").notNull(), // 'connected' | 'expired' | 'disconnected'
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  mediaUrls: json("media_urls").$type<string[]>().default([]).notNull(),
  targetPlatforms: json("target_platforms").$type<string[]>().default([]).notNull(),
  status: varchar("status", { length: 50 }).default("draft").notNull(), // 'draft' | 'scheduled' | 'published' | 'failed'
  scheduledAt: timestamp("scheduled_at"),
  publishedAt: timestamp("published_at"),
  publishedUrl: text("published_url"),
  failureReason: text("failure_reason"),
  retryCount: integer("retry_count").default(0).notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const platformPostVariants = pgTable("platform_post_variants", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  platform: varchar("platform", { length: 50 }).notNull(),
  content: text("content").notNull(),
  mediaUrls: json("media_urls").$type<string[]>().default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ideas = pgTable("ideas", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("idea").notNull(), // 'idea' | 'draft' | 'scheduled' | 'published'
  tags: json("tags").$type<string[]>().default([]).notNull(),
  images: json("images").$type<string[]>().default([]).notNull(),
  convertedPostId: text("converted_post_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const media = pgTable("media", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileKey: varchar("file_key", { length: 500 }).notNull(),
  fileUrl: text("file_url").notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  fileSize: integer("file_size").notNull(),
  mediaType: varchar("media_type", { length: 20 }).notNull(), // 'image' | 'video'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activityLogs = pgTable("activity_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  eventType: varchar("event_type", { length: 100 }).notNull(), // 'login' | 'publish' | 'schedule' | 'ai_generation' | 'account_connected' | 'error'
  description: text("description").notNull(),
  metadata: json("metadata").$type<Record<string, any>>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const schedules = pgTable("schedules", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  qstashMessageId: varchar("qstash_message_id", { length: 255 }),
  scheduledAt: timestamp("scheduled_at").notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // 'pending' | 'executed' | 'cancelled' | 'failed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
