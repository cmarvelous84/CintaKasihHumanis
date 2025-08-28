import type { Express } from "express";
import { storage } from "../storage";
// Import for session-based auth
import "../types/session";
import {
  insertModuleStageSchema,
  insertStageProgressSchema,
  insertQuestionSchema,
  type UserRole,
} from "@shared/schema";
import { z } from "zod";

function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

function requireRole(requiredRoles: string[]) {
  return async (req: any, res: any, next: any) => {
    if (!req.session?.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUser(req.session.user.id);
    if (!user || !requiredRoles.includes(user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    req.currentUser = user;
    next();
  };
}

export function registerStageRoutes(app: Express) {
  // Get stages for a module
  app.get('/api/modules/:moduleId/stages', requireAuth, async (req, res) => {
    try {
      const moduleId = parseInt(req.params.moduleId);
      const stages = await storage.getModuleStages(moduleId);
      res.json(stages);
    } catch (error) {
      console.error("Error fetching module stages:", error);
      res.status(500).json({ message: "Failed to fetch module stages" });
    }
  });

  // Get all stages across all modules (for super admin)
  app.get('/api/stages/all', requireAuth, requireRole(['super_admin']), async (req, res) => {
    try {
      const stages = await storage.getAllStages();
      res.json(stages);
    } catch (error) {
      console.error("Error fetching all stages:", error);
      res.status(500).json({ message: "Failed to fetch all stages" });
    }
  });

  // Get stage statistics (for super admin)
  app.get('/api/admin/stage-statistics', requireAuth, requireRole(['super_admin']), async (req, res) => {
    try {
      const stats = await storage.getStageStatistics();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stage statistics:", error);
      res.status(500).json({ message: "Failed to fetch stage statistics" });
    }
  });

  // Create a new stage
  app.post('/api/stages', requireAuth, requireRole(['super_admin', 'teacher']), async (req, res) => {
    try {
      console.log('🔥 POST /api/stages - Raw body:', JSON.stringify(req.body, null, 2));
      
      const { questions, ...stageData } = req.body;
      
      console.log('🔥 Stage data to validate:', JSON.stringify(stageData, null, 2));
      console.log('🔥 Questions data:', JSON.stringify(questions, null, 2));
      
      // Create the stage first
      const parsedStageData = insertModuleStageSchema.parse(stageData);
      const stage = await storage.createModuleStage(parsedStageData);
      
      // If there are questions, create them and link to the stage
      if (questions && questions.length > 0) {
        console.log('🔥 Processing questions, count:', questions.length);
        for (const [index, questionData] of questions.entries()) {
          console.log(`🔥 Question ${index}:`, JSON.stringify(questionData, null, 2));
          
          try {
            const questionToCreate = insertQuestionSchema.parse({
              ...questionData,
              moduleId: stage.moduleId,
              stageId: stage.id,
            });
            console.log(`🔥 Question ${index} validated:`, JSON.stringify(questionToCreate, null, 2));
            await storage.createQuestion(questionToCreate);
          } catch (qError) {
            console.error(`🔥 Question ${index} validation failed:`, qError);
            throw qError;
          }
        }
      }
      
      res.status(201).json(stage);
    } catch (error) {
      console.error("🔥 Error creating module stage:", error);
      if (error instanceof z.ZodError) {
        console.error("🔥 Zod validation errors:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors,
          received: req.body 
        });
      }
      res.status(500).json({ message: "Failed to create module stage" });
    }
  });

  // Get a single stage
  app.get('/api/stages/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const stage = await storage.getModuleStage(id);
      if (!stage) {
        return res.status(404).json({ message: "Stage not found" });
      }
      
      // Get questions for this stage
      const stageQuestions = await storage.getStageQuestions(id);
      
      res.json({ ...stage, questions: stageQuestions });
    } catch (error) {
      console.error("Error fetching stage:", error);
      res.status(500).json({ message: "Failed to fetch stage" });
    }
  });

  // Update a stage
  app.patch('/api/stages/:id', requireAuth, requireRole(['super_admin', 'teacher']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { questions, ...stageData } = req.body;
      
      // Update the stage
      const parsedStageData = insertModuleStageSchema.partial().parse(stageData);
      const stage = await storage.updateModuleStage(id, parsedStageData);
      if (!stage) {
        return res.status(404).json({ message: "Stage not found" });
      }
      
      // Handle questions if provided
      if (questions !== undefined) {
        // Delete existing questions for this stage
        await storage.deleteStageQuestions(id);
        
        // Create new questions
        for (const questionData of questions) {
          const questionToCreate = insertQuestionSchema.parse({
            ...questionData,
            moduleId: stage.moduleId,
            stageId: stage.id,
          });
          await storage.createQuestion(questionToCreate);
        }
      }
      
      res.json(stage);
    } catch (error) {
      console.error("Error updating stage:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update stage" });
    }
  });

  // Delete a stage
  app.delete('/api/stages/:id', requireAuth, requireRole(['super_admin', 'teacher']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Delete questions first
      await storage.deleteStageQuestions(id);
      
      // Then delete the stage
      const success = await storage.deleteModuleStage(id);
      if (!success) {
        return res.status(404).json({ message: "Stage not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting stage:", error);
      res.status(500).json({ message: "Failed to delete stage" });
    }
  });

  // Get questions for a stage
  app.get('/api/stages/:stageId/questions', requireAuth, async (req, res) => {
    try {
      const stageId = parseInt(req.params.stageId);
      const questions = await storage.getStageQuestions(stageId);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching stage questions:", error);
      res.status(500).json({ message: "Failed to fetch stage questions" });
    }
  });

  // Create a question for a stage
  app.post('/api/stages/:stageId/questions', requireAuth, requireRole(['super_admin', 'teacher']), async (req, res) => {
    try {
      const stageId = parseInt(req.params.stageId);
      const stage = await storage.getModuleStage(stageId);
      
      if (!stage) {
        return res.status(404).json({ message: "Stage not found" });
      }
      
      const questionData = insertQuestionSchema.parse({
        ...req.body,
        moduleId: stage.moduleId,
        stageId: stageId,
      });
      
      const question = await storage.createQuestion(questionData);
      res.status(201).json(question);
    } catch (error) {
      console.error("Error creating question:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create question" });
    }
  });

  // Update a question
  app.patch('/api/questions/:id', requireAuth, requireRole(['super_admin', 'teacher']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const questionData = insertQuestionSchema.partial().parse(req.body);
      const question = await storage.updateQuestion(id, questionData);
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      res.json(question);
    } catch (error) {
      console.error("Error updating question:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update question" });
    }
  });

  // Delete a question
  app.delete('/api/questions/:id', requireAuth, requireRole(['super_admin', 'teacher']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteQuestion(id);
      
      if (!success) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting question:", error);
      res.status(500).json({ message: "Failed to delete question" });
    }
  });

  // Get user progress for a stage
  app.get('/api/stages/:stageId/progress', requireAuth, async (req: any, res) => {
    try {
      const stageId = parseInt(req.params.stageId);
      const userId = req.user.claims.sub;
      const progress = await storage.getUserStageProgress(userId, stageId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching stage progress:", error);
      res.status(500).json({ message: "Failed to fetch stage progress" });
    }
  });

  // Update user progress for a stage
  app.post('/api/stages/:stageId/progress', requireAuth, async (req: any, res) => {
    try {
      const stageId = parseInt(req.params.stageId);
      const userId = req.user.claims.sub;
      
      const progressData = insertStageProgressSchema.parse({
        ...req.body,
        userId,
        stageId,
      });
      
      const progress = await storage.updateStageProgress(progressData);
      res.json(progress);
    } catch (error) {
      console.error("Error updating stage progress:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update stage progress" });
    }
  });

  // Mark stage as completed
  app.post('/api/stages/:stageId/complete', requireAuth, async (req: any, res) => {
    try {
      const stageId = parseInt(req.params.stageId);
      const userId = req.user.claims.sub;
      
      const progress = await storage.completeStage(userId, stageId);
      res.json(progress);
    } catch (error) {
      console.error("Error completing stage:", error);
      res.status(500).json({ message: "Failed to complete stage" });
    }
  });

  // Validate stage interaction requirements
  app.post('/api/stages/:stageId/validate', requireAuth, async (req: any, res) => {
    try {
      const stageId = parseInt(req.params.stageId);
      const userId = req.user.claims.sub;
      const { interactionData } = req.body;
      
      const isValid = await storage.validateStageInteraction(userId, stageId, interactionData);
      res.json({ isValid, message: isValid ? "Requirements met" : "Requirements not met" });
    } catch (error) {
      console.error("Error validating stage interaction:", error);
      res.status(500).json({ message: "Failed to validate stage interaction" });
    }
  });
}