import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get opportunities with pagination, search, and filtering
  app.get("/api/opportunities", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const searchQuery = req.query.search as string;
      const location = req.query.location as string;
      
      const result = await storage.getOpportunities(page, limit, searchQuery, location);
      
      res.json({
        opportunities: result.opportunities,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch opportunities" });
    }
  });

  // Get unique locations for filtering
  app.get("/api/locations", async (req, res) => {
    try {
      const locations = await storage.getUniqueLocations();
      res.json({ locations: ['All', ...locations] });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  // Refresh opportunities from Google Sheets
  app.post("/api/opportunities/refresh", async (req, res) => {
    try {
      await storage.refreshOpportunitiesFromSheet();
      res.json({ message: "Opportunities refreshed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to refresh opportunities" });
    }
  });

  // Get single opportunity
  app.get("/api/opportunities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const opportunity = await storage.getOpportunity(id);
      
      if (!opportunity) {
        return res.status(404).json({ message: "Opportunity not found" });
      }
      
      res.json(opportunity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch opportunity" });
    }
  });

  // Get user preferences (mock for demo - using default preferences)
  app.get("/api/preferences", async (req, res) => {
    try {
      // For demo purposes, return default preferences
      const defaultPreferences = {
        discipline: "Music",
        location: "Lagos",
        availability: "Remote"
      };
      
      res.json(defaultPreferences);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
