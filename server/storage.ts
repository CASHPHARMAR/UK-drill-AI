import { type Conversion, type InsertConversion } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createConversion(conversion: InsertConversion): Promise<Conversion>;
  getConversion(id: string): Promise<Conversion | undefined>;
  updateConversion(id: string, updates: Partial<Conversion>): Promise<Conversion | undefined>;
  getAllConversions(): Promise<Conversion[]>;
}

export class MemStorage implements IStorage {
  private conversions: Map<string, Conversion>;

  constructor() {
    this.conversions = new Map();
  }

  async createConversion(insertConversion: InsertConversion): Promise<Conversion> {
    const id = randomUUID();
    const conversion: Conversion = {
      ...insertConversion,
      id,
      createdAt: new Date(),
      completedAt: null,
      progress: insertConversion.progress ?? 0,
      status: insertConversion.status ?? "pending",
      convertedFilePath: insertConversion.convertedFilePath ?? null,
      metadata: insertConversion.metadata ?? null,
    };
    this.conversions.set(id, conversion);
    return conversion;
  }

  async getConversion(id: string): Promise<Conversion | undefined> {
    return this.conversions.get(id);
  }

  async updateConversion(id: string, updates: Partial<Conversion>): Promise<Conversion | undefined> {
    const existing = this.conversions.get(id);
    if (!existing) return undefined;

    const updated: Conversion = { ...existing, ...updates };
    this.conversions.set(id, updated);
    return updated;
  }

  async getAllConversions(): Promise<Conversion[]> {
    return Array.from(this.conversions.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const storage = new MemStorage();
