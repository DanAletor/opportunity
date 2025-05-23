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

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getOpportunities(page?: number, limit?: number): Promise<{ opportunities: Opportunity[], total: number }>;
  getOpportunity(id: number): Promise<Opportunity | undefined>;
  createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity>;
  
  getUserPreferences(userId: number): Promise<UserPreferences | undefined>;
  createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;
  updateUserPreferences(userId: number, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private opportunities: Map<number, Opportunity>;
  private userPreferences: Map<number, UserPreferences>;
  private currentUserId: number;
  private currentOpportunityId: number;
  private currentPreferencesId: number;

  constructor() {
    this.users = new Map();
    this.opportunities = new Map();
    this.userPreferences = new Map();
    this.currentUserId = 1;
    this.currentOpportunityId = 1;
    this.currentPreferencesId = 1;
    
    // Seed with sample opportunities
    this.seedOpportunities();
  }

  private seedOpportunities() {
    const sampleOpportunities: InsertOpportunity[] = [
      {
        title: "Music Production Grant",
        description: "Funding for emerging music producers",
        type: "Grant",
        deadline: "May 31, 2024",
        eligibility: "Nigeria"
      },
      {
        title: "Open Call for Sound Artists",
        description: "Seeking exploratory sound-based works",
        type: "Exhibition",
        deadline: "June 7, 2024",
        eligibility: "International"
      },
      {
        title: "Residency Program in Ghana",
        description: "Artistic residency for music composers",
        type: "Residency",
        deadline: "July 15, 2024",
        eligibility: "Ghana"
      },
      {
        title: "Digital Music Innovation Fund",
        description: "Supporting innovative music technology projects",
        type: "Grant",
        deadline: "August 20, 2024",
        eligibility: "International"
      },
      {
        title: "Collaborative Music Workshop",
        description: "Multi-genre collaboration opportunity for musicians",
        type: "Workshop",
        deadline: "September 10, 2024",
        eligibility: "Lagos"
      },
      {
        title: "African Music Heritage Project",
        description: "Documentation and preservation of traditional music",
        type: "Project",
        deadline: "October 15, 2024",
        eligibility: "Africa"
      },
      {
        title: "Youth Music Mentorship Program",
        description: "Mentoring young musicians in production techniques",
        type: "Mentorship",
        deadline: "November 30, 2024",
        eligibility: "Nigeria"
      },
      {
        title: "Global Music Exchange",
        description: "International collaboration for world music fusion",
        type: "Exchange",
        deadline: "December 20, 2024",
        eligibility: "International"
      }
    ];

    sampleOpportunities.forEach(opportunity => {
      this.createOpportunity(opportunity);
    });
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

  async getOpportunities(page: number = 1, limit: number = 5): Promise<{ opportunities: Opportunity[], total: number }> {
    const allOpportunities = Array.from(this.opportunities.values());
    const total = allOpportunities.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const opportunities = allOpportunities.slice(startIndex, endIndex);
    
    return { opportunities, total };
  }

  async getOpportunity(id: number): Promise<Opportunity | undefined> {
    return this.opportunities.get(id);
  }

  async createOpportunity(insertOpportunity: InsertOpportunity): Promise<Opportunity> {
    const id = this.currentOpportunityId++;
    const opportunity: Opportunity = { ...insertOpportunity, id };
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
    const preferences: UserPreferences = { ...insertPreferences, id };
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

export const storage = new MemStorage();
