import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const conversions = pgTable("conversions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  originalFilename: text("original_filename").notNull(),
  originalFilePath: text("original_file_path").notNull(),
  convertedFilePath: text("converted_file_path"),
  intensity: text("intensity", { enum: ["soft", "medium", "heavy"] }).notNull(),
  status: text("status", { enum: ["pending", "processing", "completed", "failed"] }).notNull().default("pending"),
  progress: integer("progress").notNull().default(0),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertConversionSchema = createInsertSchema(conversions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export type InsertConversion = z.infer<typeof insertConversionSchema>;
export type Conversion = typeof conversions.$inferSelect;
