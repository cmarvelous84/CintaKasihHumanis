import express from "express";
import { storage } from "../storage";
import { z } from "zod";
import { insertWebsiteSettingSchema } from "@shared/schema";

const router = express.Router();

// Get all website settings
router.get("/", async (req: express.Request, res: express.Response) => {
  try {
    const settings = await storage.getWebsiteSettings();
    res.json(settings);
  } catch (error) {
    console.error("Get website settings error:", error);
    res.status(500).json({ message: "Failed to fetch website settings" });
  }
});

// Get settings by category
router.get("/category/:category", async (req: express.Request, res: express.Response) => {
  try {
    const { category } = req.params;
    const settings = await storage.getWebsiteSettingsByCategory(category);
    res.json(settings);
  } catch (error) {
    console.error("Get settings by category error:", error);
    res.status(500).json({ message: "Failed to fetch settings" });
  }
});

// Get specific setting
router.get("/:key", async (req: express.Request, res: express.Response) => {
  try {
    const { key } = req.params;
    const setting = await storage.getWebsiteSetting(key);
    if (!setting) {
      return res.status(404).json({ message: "Setting not found" });
    }
    res.json(setting);
  } catch (error) {
    console.error("Get setting error:", error);
    res.status(500).json({ message: "Failed to fetch setting" });
  }
});

// Create new setting (super admin only)
router.post("/", async (req: express.Request, res: express.Response) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const validatedData = insertWebsiteSettingSchema.parse(req.body);
    const setting = await storage.createWebsiteSetting({
      ...validatedData,
      updatedBy: req.session.user.id,
    });
    
    res.status(201).json(setting);
  } catch (error) {
    console.error("Create setting error:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid data", errors: error.errors });
    } else {
      res.status(500).json({ message: "Failed to create setting" });
    }
  }
});

// Update setting (super admin only)
router.put("/:key", async (req: express.Request, res: express.Response) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { key } = req.params;
    const validatedData = insertWebsiteSettingSchema.partial().parse(req.body);
    const setting = await storage.updateWebsiteSetting(key, {
      ...validatedData,
      updatedBy: req.session.user.id,
    });
    
    if (!setting) {
      return res.status(404).json({ message: "Setting not found" });
    }
    
    res.json(setting);
  } catch (error) {
    console.error("Update setting error:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid data", errors: error.errors });
    } else {
      res.status(500).json({ message: "Failed to update setting" });
    }
  }
});

export default router;