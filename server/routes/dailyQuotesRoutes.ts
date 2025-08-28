import express from "express";
import { storage } from "../storage";
import { z } from "zod";
import { insertDailyQuoteSchema } from "@shared/schema";

const router = express.Router();

// Get all daily quotes
router.get("/", async (req: express.Request, res: express.Response) => {
  try {
    const quotes = await storage.getDailyQuotes();
    res.json(quotes);
  } catch (error) {
    console.error("Get daily quotes error:", error);
    res.status(500).json({ message: "Failed to fetch daily quotes" });
  }
});

// Get today's quote (random active quote)
router.get("/today", async (req: express.Request, res: express.Response) => {
  try {
    const quote = await storage.getRandomActiveQuote();
    if (!quote) {
      return res.status(404).json({ message: "No active quotes found" });
    }
    res.json(quote);
  } catch (error) {
    console.error("Get today's quote error:", error);
    res.status(500).json({ message: "Failed to fetch today's quote" });
  }
});

// Get random active quote
router.get("/random", async (req: express.Request, res: express.Response) => {
  try {
    const quote = await storage.getRandomActiveQuote();
    if (!quote) {
      return res.status(404).json({ message: "No active quotes found" });
    }
    res.json(quote);
  } catch (error) {
    console.error("Get random quote error:", error);
    res.status(500).json({ message: "Failed to fetch random quote" });
  }
});

// Get specific quote
router.get("/:id", async (req: express.Request, res: express.Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid quote ID" });
    }

    const quote = await storage.getDailyQuote(id);
    if (!quote) {
      return res.status(404).json({ message: "Quote not found" });
    }

    res.json(quote);
  } catch (error) {
    console.error("Get quote error:", error);
    res.status(500).json({ message: "Failed to fetch quote" });
  }
});

// Create new quote (admin only)
router.post("/", async (req: express.Request, res: express.Response) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const validatedData = insertDailyQuoteSchema.parse(req.body);
    const quote = await storage.createDailyQuote({
      ...validatedData,
      createdBy: req.session.user.id,
    });
    
    res.status(201).json(quote);
  } catch (error) {
    console.error("Create quote error:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid data", errors: error.errors });
    } else {
      res.status(500).json({ message: "Failed to create quote" });
    }
  }
});

// Update quote (admin only)
router.put("/:id", async (req: express.Request, res: express.Response) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid quote ID" });
    }

    const validatedData = insertDailyQuoteSchema.partial().parse(req.body);
    const quote = await storage.updateDailyQuote(id, validatedData);
    
    if (!quote) {
      return res.status(404).json({ message: "Quote not found" });
    }
    
    res.json(quote);
  } catch (error) {
    console.error("Update quote error:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid data", errors: error.errors });
    } else {
      res.status(500).json({ message: "Failed to update quote" });
    }
  }
});

// Delete quote (admin only)
router.delete("/:id", async (req: express.Request, res: express.Response) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid quote ID" });
    }

    const success = await storage.deleteDailyQuote(id);
    if (!success) {
      return res.status(404).json({ message: "Quote not found" });
    }
    
    res.json({ message: "Quote deleted successfully" });
  } catch (error) {
    console.error("Delete quote error:", error);
    res.status(500).json({ message: "Failed to delete quote" });
  }
});

export default router;