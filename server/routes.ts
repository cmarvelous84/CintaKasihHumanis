import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import authRoutes from "./routes/authRoutes";
import { registerStageRoutes } from "./routes/stageRoutes";
import dailyQuotesRoutes from "./routes/dailyQuotesRoutes";
import websiteSettingsRoutes from "./routes/websiteSettingsRoutes";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertModuleSchema,
  insertModuleStageSchema,
  insertQuestionSchema,
  insertQuizSchema,
  insertAssignmentSchema,
  insertEnrollmentSchema,
  insertStageProgressSchema,
  insertQuizAttemptSchema,
  insertAssignmentSubmissionSchema,
  insertCertificateSchema,
  insertForumTopicSchema,
  insertForumReplySchema,
  insertUserPermissionSchema,
  insertModuleAssignmentSchema,
  insertDailyQuoteSchema,
  insertWebsiteSettingSchema,
  type UserRole,
  type PermissionType,
} from "@shared/schema";
import { z } from "zod";

// Function to generate presigned upload URL
async function generatePresignedUploadURL(objectPath: string): Promise<string> {
  const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";
  
  // Extract bucket and object name from path
  const pathParts = objectPath.split('/').filter(part => part);
  const bucketName = pathParts[0];
  const objectName = pathParts.slice(1).join('/');
  
  const request = {
    bucket_name: bucketName,
    object_name: objectName,
    method: "PUT",
    expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
  };

  const response = await fetch(
    `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to generate presigned URL: ${response.status}`);
  }

  const { signed_url } = await response.json();
  return signed_url;
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

function requirePermission(permission: PermissionType) {
  return async (req: any, res: any, next: any) => {
    if (!req.session?.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUser(req.session.user.id);
    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }

    const hasPermission = await storage.checkUserPermission(user.id, permission);
    if (!hasPermission) {
      return res.status(403).json({ message: `Permission '${permission}' required` });
    }

    req.currentUser = user;
    next();
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);
  // Session middleware
  app.set("trust proxy", 1);
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  }));

  // Auth routes
  app.use('/api/auth', authRoutes);
  
  // Object upload endpoint for file uploads
  app.post("/api/objects/upload", isAuthenticated, async (req: any, res: any) => {
    try {
      // Generate a unique object path for upload
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const objectPath = `/replit-objstore-e14890ab-4e5b-452b-8f50-c56949f62dec/.private/uploads/${timestamp}_${randomId}`;
      
      // Generate presigned URL for upload
      const uploadURL = await generatePresignedUploadURL(objectPath);
      
      res.json({ uploadURL });
    } catch (error) {
      console.error('Error generating upload URL:', error);
      res.status(500).json({ error: 'Failed to generate upload URL' });
    }
  });

  // New feature routes
  app.use('/api/daily-quotes', dailyQuotesRoutes);
  app.use('/api/website-settings', requirePermission('manage_website_settings'), websiteSettingsRoutes);
  
  // Users endpoints for Super Admin
  app.get('/api/users', requireRole(['super_admin']), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Update user role
  app.patch('/api/users/:id', requireRole(['super_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      if (!role || !['student', 'teacher', 'instructor', 'super_admin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role provided" });
      }

      const updatedUser = await storage.updateUserRole(id, role);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Delete user
  app.delete('/api/users/:id', requireRole(['super_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      
      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Get role permissions
  // Remove duplicate endpoints - using /api/admin/roles/* instead

  // Update user profile
  app.patch('/api/profile', isAuthenticated, async (req, res) => {
    try {
      const { firstName, lastName } = req.body;
      const userId = (req.user as any).claims.sub;
      
      const updatedUser = await storage.updateUserProfile(userId, { firstName, lastName });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  
  // Register stage routes
  registerStageRoutes(app);

  // Protected routes require session
  function requireAuth(req: any, res: any, next: any) {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  }

  // Session-based authentication middleware
  function requireSession(req: any, res: any, next: any) {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  }

  // Module routes - accessible to all authenticated users
  app.get('/api/modules', requireSession, async (req, res) => {
    try {
      const modules = await storage.getModules();
      res.json(modules);
    } catch (error) {
      console.error("Error fetching modules:", error);
      res.status(500).json({ message: "Failed to fetch modules" });
    }
  });

  // Get modules assigned to teachers/instructors
  app.get('/api/modules/assigned', requireSession, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || !['teacher', 'instructor'].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const assignedModules = await storage.getAssignedModules(userId);
      res.json(assignedModules);
    } catch (error) {
      console.error("Error fetching assigned modules:", error);
      res.status(500).json({ message: "Failed to fetch assigned modules" });
    }
  });

  app.get('/api/modules/:id', requireSession, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const module = await storage.getModule(id);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
      res.json(module);
    } catch (error) {
      console.error("Error fetching module:", error);
      res.status(500).json({ message: "Failed to fetch module" });
    }
  });

  app.post('/api/modules', requireAuth, requireRole(['super_admin']), async (req: any, res) => {
    try {
      const moduleData = insertModuleSchema.parse({
        ...req.body,
        createdBy: req.currentUser.id,
      });
      const module = await storage.createModule(moduleData);
      res.status(201).json(module);
    } catch (error) {
      console.error("Error creating module:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create module" });
    }
  });

  app.put('/api/modules/:id', requireAuth, requireRole(['super_admin']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const moduleData = insertModuleSchema.partial().parse(req.body);
      const module = await storage.updateModule(id, moduleData);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
      res.json(module);
    } catch (error) {
      console.error("Error updating module:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update module" });
    }
  });

  app.delete('/api/modules/:id', requireAuth, requireRole(['super_admin']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteModule(id);
      if (!success) {
        return res.status(404).json({ message: "Module not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting module:", error);
      res.status(500).json({ message: "Failed to delete module" });
    }
  });

  // Module stages routes
  app.get('/api/modules/:moduleId/stages', requireSession, async (req, res) => {
    try {
      const moduleId = parseInt(req.params.moduleId);
      const stages = await storage.getModuleStages(moduleId);
      res.json(stages);
    } catch (error) {
      console.error("Error fetching module stages:", error);
      res.status(500).json({ message: "Failed to fetch module stages" });
    }
  });

  app.post('/api/modules/:moduleId/stages', requireAuth, requireRole(['super_admin']), async (req, res) => {
    try {
      const moduleId = parseInt(req.params.moduleId);
      const stageData = insertModuleStageSchema.parse({
        ...req.body,
        moduleId,
      });
      const stage = await storage.createModuleStage(stageData);
      res.status(201).json(stage);
    } catch (error) {
      console.error("Error creating module stage:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create module stage" });
    }
  });

  // Enrollment routes
  app.get('/api/enrollments/my', requireSession, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const enrollments = await storage.getUserEnrollments(userId);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching user enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  app.post('/api/enrollments', requireSession, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const enrollmentData = insertEnrollmentSchema.parse({
        ...req.body,
        userId,
      });
      const enrollment = await storage.createEnrollment(enrollmentData);
      res.status(201).json(enrollment);
    } catch (error) {
      console.error("Error creating enrollment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create enrollment" });
    }
  });

  // Progress tracking routes
  app.get('/api/progress/modules/:moduleId', requireSession, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const moduleId = parseInt(req.params.moduleId);
      const progress = await storage.getUserModuleProgress(userId, moduleId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching module progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  app.post('/api/progress/stages', requireSession, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const progressData = insertStageProgressSchema.parse({
        ...req.body,
        userId,
      });
      const progress = await storage.createStageProgress(progressData);
      res.status(201).json(progress);
    } catch (error) {
      console.error("Error creating stage progress:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create progress" });
    }
  });

  // Quiz routes
  app.get('/api/quizzes/:id', requireSession, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const quiz = await storage.getQuiz(id);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      res.json(quiz);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      res.status(500).json({ message: "Failed to fetch quiz" });
    }
  });

  app.get('/api/quizzes/:id/questions', requireSession, async (req, res) => {
    try {
      const quizId = parseInt(req.params.id);
      const questions = await storage.getQuestions(quizId);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching quiz questions:", error);
      res.status(500).json({ message: "Failed to fetch quiz questions" });
    }
  });

  app.get('/api/modules/:moduleId/quizzes', requireSession, async (req, res) => {
    try {
      const moduleId = parseInt(req.params.moduleId);
      const quizzes = await storage.getQuizzes(moduleId);
      res.json(quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  app.post('/api/quiz-attempts', requireSession, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const attemptData = insertQuizAttemptSchema.parse({
        ...req.body,
        userId,
      });
      const attempt = await storage.createQuizAttempt(attemptData);
      res.status(201).json(attempt);
    } catch (error) {
      console.error("Error creating quiz attempt:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create quiz attempt" });
    }
  });

  // Assignment routes
  app.get('/api/modules/:moduleId/assignments', requireSession, async (req, res) => {
    try {
      const moduleId = parseInt(req.params.moduleId);
      const assignments = await storage.getAssignments(moduleId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  app.post('/api/assignment-submissions', requireSession, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const submissionData = insertAssignmentSubmissionSchema.parse({
        ...req.body,
        userId,
      });
      const submission = await storage.createAssignmentSubmission(submissionData);
      res.status(201).json(submission);
    } catch (error) {
      console.error("Error creating assignment submission:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create submission" });
    }
  });

  // Certificate routes
  app.get('/api/certificates/my', requireSession, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const certificates = await storage.getUserCertificates(userId);
      res.json(certificates);
    } catch (error) {
      console.error("Error fetching user certificates:", error);
      res.status(500).json({ message: "Failed to fetch certificates" });
    }
  });

  app.post('/api/certificates', requireSession, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const certificateData = insertCertificateSchema.parse({
        ...req.body,
        userId,
        certificateNumber: `TZC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        verificationCode: Math.random().toString(36).substr(2, 15),
      });
      const certificate = await storage.createCertificate(certificateData);
      res.status(201).json(certificate);
    } catch (error) {
      console.error("Error creating certificate:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create certificate" });
    }
  });

  // Forum routes
  app.get('/api/forum/topics', requireSession, async (req, res) => {
    try {
      const moduleId = req.query.moduleId ? parseInt(req.query.moduleId as string) : undefined;
      const stageId = req.query.stageId ? parseInt(req.query.stageId as string) : undefined;
      const topics = await storage.getForumTopics(moduleId, stageId);
      res.json(topics);
    } catch (error) {
      console.error("Error fetching forum topics:", error);
      res.status(500).json({ message: "Failed to fetch forum topics" });
    }
  });

  app.post('/api/forum/topics', requireSession, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const topicData = insertForumTopicSchema.parse({
        ...req.body,
        userId,
      });
      const topic = await storage.createForumTopic(topicData);
      res.status(201).json(topic);
    } catch (error) {
      console.error("Error creating forum topic:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create topic" });
    }
  });

  app.get('/api/forum/topics/:topicId/replies', requireSession, async (req, res) => {
    try {
      const topicId = parseInt(req.params.topicId);
      const replies = await storage.getForumReplies(topicId);
      res.json(replies);
    } catch (error) {
      console.error("Error fetching forum replies:", error);
      res.status(500).json({ message: "Failed to fetch replies" });
    }
  });

  app.post('/api/forum/replies', requireSession, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const replyData = insertForumReplySchema.parse({
        ...req.body,
        userId,
      });
      const reply = await storage.createForumReply(replyData);
      res.status(201).json(reply);
    } catch (error) {
      console.error("Error creating forum reply:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create reply" });
    }
  });

  // Dashboard stats routes
  app.get('/api/dashboard/stats', requireSession, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const enrollments = await storage.getUserEnrollments(userId);
      const certificates = await storage.getUserCertificates(userId);
      
      const activeModules = enrollments.filter(e => !e.completedAt).length;
      const completedModules = enrollments.filter(e => e.completedAt).length;
      const certificatesCount = certificates.length;
      
      // Calculate overall progress (simplified)
      const totalModules = enrollments.length;
      const overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
      
      // Calculate total study hours (simplified estimate)
      const studyHours = completedModules * 4; // Assume 4 hours per completed module
      
      res.json({
        activeModules,
        overallProgress,
        certificates: certificatesCount,
        studyHours,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Analytics overview for super admin
  app.get('/api/analytics/overview', requireAuth, requireRole(['super_admin']), async (req: any, res) => {
    try {
      const overview = await storage.getAnalyticsOverview();
      res.json(overview);
    } catch (error) {
      console.error("Error fetching analytics overview:", error);
      res.status(500).json({ message: "Failed to fetch analytics overview" });
    }
  });

  // System Settings API endpoints
  app.get('/api/system/settings', requireSession, requireRole(['super_admin']), async (req: any, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching system settings:", error);
      res.status(500).json({ message: "Failed to fetch system settings" });
    }
  });

  app.put('/api/system/settings', requireSession, requireRole(['super_admin']), async (req: any, res) => {
    try {
      console.log('PUT /api/system/settings - User session:', req.session?.user);
      console.log('PUT /api/system/settings - Request body:', req.body);
      
      const userId = req.session.user.id;
      await storage.updateSystemSettings(req.body, userId);
      
      // Return updated settings
      const updatedSettings = await storage.getSystemSettings();
      console.log('PUT /api/system/settings - Updated settings:', updatedSettings);
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating system settings:", error);
      res.status(500).json({ message: "Failed to update system settings", error: (error as Error).message });
    }
  });

  // Public API endpoint for system settings (no authentication required)
  app.get('/api/public/settings', async (req: any, res) => {
    try {
      const settings = await storage.getSystemSettings();
      
      // Only return public settings (filter out sensitive ones)
      const publicSettings = {
        systemName: settings.systemName,
        systemDescription: settings.systemDescription,
        websiteName: settings.websiteName,
        websiteDescription: settings.websiteDescription,
        contactEmail: settings.contactEmail,
        contactPhone: settings.contactPhone,
        contactAddress: settings.contactAddress,
        footerText: settings.footerText,
        logoUrl: settings.logoUrl,
        faviconUrl: settings.faviconUrl,
        allowGuestAccess: settings.allowGuestAccess,
        defaultLanguage: settings.defaultLanguage
      };
      
      res.json(publicSettings);
    } catch (error) {
      console.error("Error fetching public system settings:", error);
      res.status(500).json({ message: "Failed to fetch system settings" });
    }
  });

  // ========================================
  // COMPREHENSIVE ROLE MANAGEMENT SYSTEM
  // ========================================

  // Get all users - Super Admin only
  app.get('/api/admin/users', requireSession, requireRole(['super_admin']), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Update user role - Super Admin only
  app.put('/api/admin/users/:userId/role', requireSession, requireRole(['super_admin']), async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      
      if (!role || !['super_admin', 'teacher', 'student'].includes(role)) {
        return res.status(400).json({ message: "Invalid role provided" });
      }

      // Prevent non-super-admins from creating super admins
      if (role === 'super_admin' && req.currentUser.role !== 'super_admin') {
        return res.status(403).json({ message: "Only Super Admins can assign Super Admin role" });
      }

      const updatedUser = await storage.updateUserRole(userId, role as UserRole);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Get role permissions - Super Admin only
  app.get('/api/admin/roles/:role/permissions', requireSession, requireRole(['super_admin']), async (req, res) => {
    try {
      const { role } = req.params;
      const permissions = await storage.getRolePermissions(role as UserRole);
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching role permissions:", error);
      res.status(500).json({ message: "Failed to fetch role permissions" });
    }
  });

  // Update role permissions - Super Admin only
  app.put('/api/admin/roles/:role/permissions', requireSession, requireRole(['super_admin']), async (req, res) => {
    try {
      const { role } = req.params;
      const { permissions } = req.body;

      if (!Array.isArray(permissions)) {
        return res.status(400).json({ message: "Permissions must be an array" });
      }

      await storage.updateRolePermissions(role as UserRole, permissions);
      res.json({ message: "Role permissions updated successfully" });
    } catch (error) {
      console.error("Error updating role permissions:", error);
      res.status(500).json({ message: "Failed to update role permissions" });
    }
  });

  // Get user-specific permissions
  app.get('/api/admin/users/:userId/permissions', requireSession, requireRole(['super_admin']), async (req, res) => {
    try {
      const { userId } = req.params;
      const permissions = await storage.getUserPermissions(userId);
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching user permissions:", error);
      res.status(500).json({ message: "Failed to fetch user permissions" });
    }
  });

  // Grant specific permission to user - Super Admin and Admin only
  app.post('/api/admin/users/:userId/permissions', requireSession, requireRole(['super_admin']), async (req: any, res) => {
    try {
      const { userId } = req.params;
      const permissionData = insertUserPermissionSchema.parse({
        ...req.body,
        userId,
        grantedBy: req.currentUser.id,
      });

      const permission = await storage.grantUserPermission(permissionData);
      res.status(201).json(permission);
    } catch (error) {
      console.error("Error granting user permission:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to grant permission" });
    }
  });

  // Revoke specific permission from user - Super Admin and Admin only
  app.delete('/api/admin/users/:userId/permissions/:permission', requireSession, requireRole(['super_admin']), async (req, res) => {
    try {
      const { userId, permission } = req.params;
      const success = await storage.revokeUserPermission(userId, permission as PermissionType);
      
      if (!success) {
        return res.status(404).json({ message: "Permission not found" });
      }

      res.json({ message: "Permission revoked successfully" });
    } catch (error) {
      console.error("Error revoking user permission:", error);
      res.status(500).json({ message: "Failed to revoke permission" });
    }
  });

  // Check if current user has specific permission
  app.get('/api/permissions/check/:permission', isAuthenticated, async (req: any, res) => {
    try {
      const { permission } = req.params;
      const userId = req.user.claims.sub;
      
      const hasPermission = await storage.checkUserPermission(userId, permission as PermissionType);
      res.json({ hasPermission });
    } catch (error) {
      console.error("Error checking permission:", error);
      res.status(500).json({ message: "Failed to check permission" });
    }
  });

  // Get available permissions list
  app.get('/api/admin/permissions', requireAuth, requirePermission('manage_users'), async (req, res) => {
    const permissions = [
      'manage_users', 'manage_modules', 'manage_content', 'manage_quizzes',
      'manage_assignments', 'grade_assignments', 'view_analytics', 'manage_certificates',
      'moderate_forums', 'manage_enrollments', 'system_settings', 'backup_data'
    ];
    res.json(permissions);
  });


  // Module assignment routes
  app.post('/api/module-assignments', requireAuth, requireRole(['super_admin']), async (req: any, res) => {
    try {
      
      const assignerId = req.currentUser.id;

      const result = insertModuleAssignmentSchema.safeParse({
        ...req.body,
        assignedBy: assignerId
      });
      
      console.log("Schema validation result:", result);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error.issues });
      }

      const assignment = await storage.assignModuleToUser(result.data);
      
      res.status(201).json(assignment);
    } catch (error) {
      console.error("Error creating module assignment:", error);
      res.status(500).json({ message: "Failed to create assignment", error: (error as Error).message });
    }
  });

  app.get('/api/module-assignments', requireAuth, requireRole(['super_admin']), async (req, res) => {
    try {
      const assignments = await storage.getAllModuleAssignments();
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching module assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  app.get('/api/module-assignments/user/:userId', requireAuth, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.session.user.id;

      // Users can only see their own assignments unless they have manage_modules permission
      const currentUser = await storage.getUser(currentUserId);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Check if user has manage_modules permission by checking their role
      const hasManagePermission = currentUser.role === 'super_admin';
      if (userId !== currentUserId && !hasManagePermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const assignments = await storage.getUserModuleAssignments(userId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching user module assignments:", error);
      res.status(500).json({ message: "Failed to fetch user assignments" });
    }
  });

  app.get('/api/modules/assigned', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const currentUser = await storage.getUser(userId);
      
      if (!currentUser) {
        return res.status(401).json({ message: "User not found" });
      }
      
      // Only teachers and super_admins can access assigned modules
      if (currentUser.role !== 'teacher' && currentUser.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied - insufficient role" });
      }

      const modules = await storage.getTeacherInstructorModules(userId);
      res.json(modules);
    } catch (error) {
      console.error("Error fetching assigned modules:", error);
      res.status(500).json({ message: "Failed to fetch assigned modules" });
    }
  });

  app.delete('/api/module-assignments/:userId/:moduleId', requireAuth, requireRole(['super_admin']), async (req, res) => {
    try {
      const { userId, moduleId } = req.params;
      const success = await storage.removeModuleAssignment(userId, parseInt(moduleId));
      
      if (success) {
        res.json({ message: "Assignment removed successfully" });
      } else {
        res.status(404).json({ message: "Assignment not found" });
      }
    } catch (error) {
      console.error("Error removing module assignment:", error);
      res.status(500).json({ message: "Failed to remove assignment" });
    }
  });


  // Teacher management routes
  app.get('/api/teacher/stats', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const currentUser = await storage.getUser(userId);
      
      if (!currentUser) {
        return res.status(401).json({ message: "User not found" });
      }
      
      // Only teachers can access teacher stats
      if (currentUser.role !== 'teacher') {
        return res.status(403).json({ message: "Access denied - not a teacher" });
      }
      
      // Get assigned modules
      const modules = await storage.getTeacherInstructorModules(userId);
      
      // Calculate stats
      const stats = {
        totalModules: modules.length,
        totalContent: 0, // TODO: Calculate based on stages
        totalStudents: 0, // TODO: Calculate based on enrollments
        avgProgress: 0 // TODO: Calculate average progress
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching teacher stats:", error);
      res.status(500).json({ message: "Failed to fetch teacher stats" });
    }
  });

  // Get module enrollments for teachers
  app.get('/api/modules/:id/enrollments', requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.user.id;
      const currentUser = await storage.getUser(userId);
      
      // Check if user is teacher assigned to this module or super_admin
      if (currentUser?.role === 'teacher') {
        const assignedModules = await storage.getTeacherInstructorModules(userId);
        const hasAccess = assignedModules.some(module => module.id === parseInt(id));
        if (!hasAccess) {
          return res.status(403).json({ message: "Not authorized to access this module" });
        }
      } else if (currentUser?.role !== 'super_admin') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const enrollments = await storage.getModuleEnrollments(parseInt(id));
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching module enrollments:", error);
      res.status(500).json({ message: "Failed to fetch module enrollments" });
    }
  });

  // Website settings API endpoints
  app.get('/api/website-settings', isAuthenticated, async (req, res) => {
    try {
      const settings = await storage.getWebsiteSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching website settings:", error);
      res.status(500).json({ message: "Failed to fetch website settings" });
    }
  });

  app.get('/api/website-settings/category/:category', isAuthenticated, async (req, res) => {
    try {
      const { category } = req.params;
      const settings = await storage.getWebsiteSettingsByCategory(category);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching website settings by category:", error);
      res.status(500).json({ message: "Failed to fetch website settings" });
    }
  });

  app.post('/api/website-settings', isAuthenticated, requirePermission('manage_website_settings'), async (req, res) => {
    try {
      const settingData = insertWebsiteSettingSchema.parse(req.body);
      const setting = await storage.createWebsiteSetting(settingData);
      res.status(201).json(setting);
    } catch (error) {
      console.error("Error creating website setting:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create website setting" });
    }
  });

  app.put('/api/website-settings/:key', isAuthenticated, requirePermission('manage_website_settings'), async (req, res) => {
    try {
      const { key } = req.params;
      const settingData = insertWebsiteSettingSchema.partial().parse(req.body);
      const setting = await storage.updateWebsiteSetting(key, settingData);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      console.error("Error updating website setting:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update website setting" });
    }
  });

  // Enrollment routes
  app.get('/api/enrollments/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const query = `
        SELECT e.*, m.title as module_title, m.description as module_description
        FROM enrollments e
        JOIN modules m ON e.module_id = m.id
        WHERE e.user_id = $1 AND e.is_active = true
        ORDER BY e.enrolled_at DESC
      `;
      
      // Get user enrollments using storage
      const enrollments = await storage.getUserEnrollments(userId);
      res.json(enrollments || []);
    } catch (error) {
      console.error("Error fetching user enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  app.post('/api/enrollments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { moduleId } = req.body;
      
      if (!moduleId) {
        return res.status(400).json({ message: "Module ID is required" });
      }
      
      // Check if already enrolled
      const userEnrollments = await storage.getUserEnrollments(userId);
      const existing = userEnrollments.find(e => e.moduleId === parseInt(moduleId));
      
      if (existing) {
        return res.status(409).json({ message: "Already enrolled in this module" });
      }
      
      // Create enrollment through storage
      const enrollment = await storage.createEnrollment({
        userId,
        moduleId: parseInt(moduleId),
      });
      
      res.status(201).json(enrollment);
    } catch (error) {
      console.error("Error creating enrollment:", error);
      res.status(500).json({ message: "Failed to create enrollment" });
    }
  });

  // Gamification Routes

  // Get user points and level
  app.get("/api/user/points", requireSession, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const userPoints = await storage.getUserPoints(userId);
      if (!userPoints) {
        // Return default values if no points record exists
        return res.json({
          id: 0,
          userId,
          points: 0,
          totalPoints: 0,
          level: 1,
          lastUpdated: null,
        });
      }

      res.json(userPoints);
    } catch (error) {
      console.error("Error fetching user points:", error);
      res.status(500).json({ error: "Failed to fetch user points" });
    }
  });

  // Get user learning streak
  app.get("/api/user/streak", requireSession, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const streak = await storage.getUserLearningStreak(userId);
      if (!streak) {
        // Return default values if no streak record exists
        return res.json({
          id: 0,
          userId,
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: null,
          createdAt: null,
          updatedAt: null,
        });
      }

      res.json(streak);
    } catch (error) {
      console.error("Error fetching user streak:", error);
      res.status(500).json({ error: "Failed to fetch user streak" });
    }
  });

  // Get leaderboard
  app.get("/api/leaderboard", requireSession, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const leaderboard = await storage.getLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
