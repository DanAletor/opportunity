import { 
  users, 
  opportunities, 
  userPreferences,
  type User, 
  type InsertUser,
  type Opportunity,
  type InsertOpportunity,
  type UserPreferences,
  type InsertUserPreferences
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getOpportunities(page?: number, limit?: number, searchQuery?: string, location?: string): Promise<{ opportunities: Opportunity[], total: number }>;
  getOpportunity(id: number): Promise<Opportunity | undefined>;
  createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity>;
  refreshOpportunitiesFromSheet(): Promise<void>;
  getUniqueLocations(): Promise<string[]>;
  
  getUserPreferences(userId: number): Promise<UserPreferences | undefined>;
  createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;
  updateUserPreferences(userId: number, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences | undefined>;
}

export class DatabaseStorage implements IStorage {
  private users: Map<number, User>;
  private opportunities: Map<number, Opportunity>;
  private userPreferences: Map<number, UserPreferences>;
  private currentUserId: number;
  private currentOpportunityId: number;
  private currentPreferencesId: number;
  private lastSheetUpdate: number;

  constructor() {
    this.users = new Map();
    this.opportunities = new Map();
    this.userPreferences = new Map();
    this.currentUserId = 1;
    this.currentOpportunityId = 1;
    this.currentPreferencesId = 1;
    this.lastSheetUpdate = 0;
    
    // Load opportunities from Google Sheets
    this.refreshOpportunitiesFromSheet();
  }

  async refreshOpportunitiesFromSheet(): Promise<void> {
    try {
      // Google Sheets CSV export URL for the public sheet
      const sheetId = "1laNnvgOuZ1ovpg6Ql_NAzfi2lojrg8ijn2cA2noZpos";
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      
      const response = await fetch(csvUrl);
      const csvText = await response.text();
      
      // Parse CSV data
      const lines = csvText.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      // Clear existing opportunities
      this.opportunities.clear();
      this.currentOpportunityId = 1;
      
      // Process each row (skip header)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = this.parseCSVLine(line);
        if (values.length < headers.length) continue;
        
        // Parse the Google Sheets data properly
        // Looking at the data structure, it appears to be: Title, URL, Date, Description, etc.
        const opportunity: InsertOpportunity = {
          title: values[0] || '',
          description: values[3] || values[1] || '',
          type: values[2] || 'Opportunity',
          deadline: values[3] ? values[3].substring(0, 100) : 'TBD',
          location: values[4] || 'Global',
          continent: values[5] || 'Global',
          link: (values[1] && values[1].startsWith('http')) ? values[1] : null,
          organization: values[7] || null,
        };
        
        if (opportunity.title) {
          await this.createOpportunity(opportunity);
        }
      }
      
      this.lastSheetUpdate = Date.now();
      console.log(`Loaded ${this.opportunities.size} opportunities from Google Sheets`);
    } catch (error) {
      console.error('Failed to load opportunities from Google Sheets:', error);
    }
  }

  private parseCSVLine(line: string): string[] {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getOpportunities(page: number = 1, limit: number = 5, searchQuery?: string, location?: string): Promise<{ opportunities: Opportunity[], total: number }> {
    // Auto-refresh from sheet if it's been more than 5 minutes
    const now = Date.now();
    if (now - this.lastSheetUpdate > 5 * 60 * 1000) {
      await this.refreshOpportunitiesFromSheet();
    }

    let allOpportunities = Array.from(this.opportunities.values());
    
    // Apply search filter
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      allOpportunities = allOpportunities.filter(opp => 
        opp.title.toLowerCase().includes(query) ||
        opp.description.toLowerCase().includes(query) ||
        opp.type.toLowerCase().includes(query) ||
        opp.location.toLowerCase().includes(query) ||
        (opp.organization && opp.organization.toLowerCase().includes(query))
      );
    }
    
    // Apply location filter
    if (location && location !== 'All') {
      allOpportunities = allOpportunities.filter(opp => 
        opp.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    const total = allOpportunities.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const opportunities = allOpportunities.slice(startIndex, endIndex);
    
    return { opportunities, total };
  }

  async getUniqueLocations(): Promise<string[]> {
    const allOpportunities = Array.from(this.opportunities.values());
    const locations = new Set<string>();
    
    allOpportunities.forEach(opp => {
      if (opp.location && opp.location.trim()) {
        locations.add(opp.location.trim());
      }
    });
    
    return Array.from(locations).sort();
  }

  async getOpportunity(id: number): Promise<Opportunity | undefined> {
    return this.opportunities.get(id);
  }

  async createOpportunity(insertOpportunity: InsertOpportunity): Promise<Opportunity> {
    const id = this.currentOpportunityId++;
    const opportunity: Opportunity = { 
      ...insertOpportunity, 
      id,
      link: insertOpportunity.link || null,
      organization: insertOpportunity.organization || null
    };
    this.opportunities.set(id, opportunity);
    return opportunity;
  }

  async getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
    return Array.from(this.userPreferences.values()).find(
      (prefs) => prefs.userId === userId,
    );
  }

  async createUserPreferences(insertPreferences: InsertUserPreferences): Promise<UserPreferences> {
    const id = this.currentPreferencesId++;
    const preferences: UserPreferences = { 
      ...insertPreferences, 
      id,
      userId: insertPreferences.userId || null
    };
    this.userPreferences.set(id, preferences);
    return preferences;
  }

  async updateUserPreferences(userId: number, updates: Partial<InsertUserPreferences>): Promise<UserPreferences | undefined> {
    const existing = await this.getUserPreferences(userId);
    if (!existing) return undefined;
    
    const updated: UserPreferences = { ...existing, ...updates };
    this.userPreferences.set(existing.id, updated);
    return updated;
  }
}

export const storage = new DatabaseStorage();
