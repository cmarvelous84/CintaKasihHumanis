var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express4 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  DEFAULT_ROLE_PERMISSIONS: () => DEFAULT_ROLE_PERMISSIONS,
  assignmentSubmissions: () => assignmentSubmissions,
  assignments: () => assignments,
  certificates: () => certificates,
  dailyQuotes: () => dailyQuotes,
  enrollments: () => enrollments,
  enrollmentsRelations: () => enrollmentsRelations,
  forumReplies: () => forumReplies,
  forumRepliesRelations: () => forumRepliesRelations,
  forumTopics: () => forumTopics,
  forumTopicsRelations: () => forumTopicsRelations,
  insertAssignmentSchema: () => insertAssignmentSchema,
  insertAssignmentSubmissionSchema: () => insertAssignmentSubmissionSchema,
  insertCertificateSchema: () => insertCertificateSchema,
  insertDailyQuoteSchema: () => insertDailyQuoteSchema,
  insertEnrollmentSchema: () => insertEnrollmentSchema,
  insertForumReplySchema: () => insertForumReplySchema,
  insertForumTopicSchema: () => insertForumTopicSchema,
  insertModuleAssignmentSchema: () => insertModuleAssignmentSchema,
  insertModuleSchema: () => insertModuleSchema,
  insertModuleStageSchema: () => insertModuleStageSchema,
  insertQuestionSchema: () => insertQuestionSchema,
  insertQuizAttemptSchema: () => insertQuizAttemptSchema,
  insertQuizSchema: () => insertQuizSchema,
  insertRolePermissionSchema: () => insertRolePermissionSchema,
  insertStageProgressSchema: () => insertStageProgressSchema,
  insertUserPermissionSchema: () => insertUserPermissionSchema,
  insertUserSchema: () => insertUserSchema,
  insertWebsiteSettingSchema: () => insertWebsiteSettingSchema,
  interactionTypeEnum: () => interactionTypeEnum,
  moduleAssignments: () => moduleAssignments,
  moduleStages: () => moduleStages,
  moduleStagesRelations: () => moduleStagesRelations,
  modules: () => modules,
  modulesRelations: () => modulesRelations,
  permissionEnum: () => permissionEnum,
  questionTypeEnum: () => questionTypeEnum,
  questions: () => questions,
  questionsRelations: () => questionsRelations,
  quizAttempts: () => quizAttempts,
  quizQuestions: () => quizQuestions,
  quizzes: () => quizzes,
  quizzesRelations: () => quizzesRelations,
  rolePermissions: () => rolePermissions,
  rolePermissionsRelations: () => rolePermissionsRelations,
  sessions: () => sessions,
  stageContentTypeEnum: () => stageContentTypeEnum,
  stageProgress: () => stageProgress,
  userPermissions: () => userPermissions,
  userPermissionsRelations: () => userPermissionsRelations,
  userRoleEnum: () => userRoleEnum,
  users: () => users,
  usersRelations: () => usersRelations,
  websiteSettings: () => websiteSettings
});
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  pgEnum,
  serial,
  decimal,
  unique
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var userRoleEnum = pgEnum("user_role", ["super_admin", "teacher", "student"]);
var permissionEnum = pgEnum("permission_type", [
  "manage_users",
  "manage_modules",
  "manage_content",
  "manage_quizzes",
  "manage_assignments",
  "grade_assignments",
  "view_analytics",
  "manage_certificates",
  "moderate_forums",
  "manage_enrollments",
  "system_settings",
  "backup_data",
  "manage_quotes",
  "manage_website_settings"
]);
var questionTypeEnum = pgEnum("question_type", [
  "multiple_choice",
  "true_false",
  "essay",
  "short_answer",
  "matching",
  "fill_in_blank",
  "numerical",
  "ordering",
  "drag_drop",
  "hotspot",
  "calculated"
]);
var questionTagsSchema = z.array(z.string());
var stageContentSchema = z.object({
  type: z.enum(["video", "pdf", "infographic", "quiz", "assignment", "reflection", "text", "interactive"]),
  url: z.string().optional(),
  embedCode: z.string().optional(),
  text: z.string().optional(),
  videoId: z.string().optional(),
  pdfUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  metadata: z.record(z.any()).optional()
});
var interactionRequirementSchema = z.object({
  scrollCompletion: z.number().min(0).max(100).optional(),
  videoWatchPercentage: z.number().min(0).max(100).optional(),
  formInteraction: z.boolean().optional(),
  clickTracking: z.array(z.string()).optional(),
  minimumInteractions: z.number().optional()
});
var stageContentTypeEnum = pgEnum("stage_content_type", [
  "video",
  "pdf",
  "infographic",
  "quiz",
  "assignment",
  "reflection",
  "text",
  "interactive",
  "multiple_choice",
  "true_false",
  "essay",
  "short_answer",
  "matching",
  "fill_in_blank",
  "numerical",
  "ordering",
  "drag_drop",
  "hotspot",
  "calculated",
  "mp3"
]);
var interactionTypeEnum = pgEnum("interaction_type", [
  "scroll_completion",
  "video_watch_percentage",
  "form_interaction",
  "time_spent",
  "click_tracking"
]);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default("student").notNull(),
  isActive: boolean("is_active").default(true),
  department: varchar("department"),
  specialization: text("specialization"),
  bio: text("bio"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  role: userRoleEnum("role").notNull(),
  permission: permissionEnum("permission").notNull(),
  isGranted: boolean("is_granted").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var userPermissions = pgTable("user_permissions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  permission: permissionEnum("permission").notNull(),
  isGranted: boolean("is_granted").notNull(),
  grantedBy: varchar("granted_by").references(() => users.id),
  reason: text("reason"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow()
});
var modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  competencies: text("competencies"),
  duration: integer("duration"),
  // in minutes
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var moduleStages = pgTable("module_stages", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").references(() => modules.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  content: text("content"),
  // JSON content for videos, PDFs, etc.
  orderIndex: integer("order_index").notNull(),
  minTimeMinutes: integer("min_time_minutes"),
  // minimum time to spend
  prerequisiteStageId: integer("prerequisite_stage_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").references(() => modules.id).notNull(),
  stageId: integer("stage_id").references(() => moduleStages.id),
  questionType: questionTypeEnum("question_type").notNull(),
  questionText: text("question_text").notNull(),
  options: jsonb("options"),
  // For multiple choice, matching, ordering questions
  correctAnswer: text("correct_answer"),
  // Can be string, array, or object (stored as text for compatibility)
  explanation: text("explanation"),
  // Answer explanation
  points: integer("points").default(1),
  difficulty: varchar("difficulty", { length: 20 }).default("medium"),
  // easy, medium, hard
  tags: jsonb("tags"),
  // structured tags for better filtering
  metadata: jsonb("metadata"),
  // additional question metadata (tolerance for numerical, etc.)
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").references(() => modules.id).notNull(),
  stageId: integer("stage_id").references(() => moduleStages.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  timeLimit: integer("time_limit"),
  // in minutes
  passingScore: integer("passing_score").default(70),
  maxAttempts: integer("max_attempts").default(3),
  randomizeQuestions: boolean("randomize_questions").default(true),
  shuffleAnswers: boolean("shuffle_answers").default(true),
  oneQuestionPerPage: boolean("one_question_per_page").default(true),
  preventBackNavigation: boolean("prevent_back_navigation").default(true),
  showResultsImmediately: boolean("show_results_immediately").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").references(() => quizzes.id).notNull(),
  questionId: integer("question_id").references(() => questions.id).notNull(),
  orderIndex: integer("order_index")
});
var assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").references(() => modules.id).notNull(),
  stageId: integer("stage_id").references(() => moduleStages.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  instructions: text("instructions"),
  maxScore: integer("max_score").default(100),
  dueDate: timestamp("due_date"),
  rubric: jsonb("rubric"),
  // grading rubric
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  moduleId: integer("module_id").references(() => modules.id).notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  finalScore: decimal("final_score", { precision: 5, scale: 2 })
});
var stageProgress = pgTable("stage_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  stageId: integer("stage_id").references(() => moduleStages.id).notNull(),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  timeSpent: integer("time_spent"),
  // in seconds
  interactionData: jsonb("interaction_data"),
  // scroll, video watch percentage, etc.
  validationMet: boolean("validation_met").default(false),
  // requirements satisfied
  lastActiveAt: timestamp("last_active_at").defaultNow()
});
var quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  quizId: integer("quiz_id").references(() => quizzes.id).notNull(),
  score: decimal("score", { precision: 5, scale: 2 }),
  totalQuestions: integer("total_questions"),
  correctAnswers: integer("correct_answers"),
  startedAt: timestamp("started_at").defaultNow(),
  submittedAt: timestamp("submitted_at"),
  answers: jsonb("answers")
  // user's answers
});
var assignmentSubmissions = pgTable("assignment_submissions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  assignmentId: integer("assignment_id").references(() => assignments.id).notNull(),
  content: text("content"),
  fileUrl: varchar("file_url"),
  score: decimal("score", { precision: 5, scale: 2 }),
  feedback: text("feedback"),
  gradedBy: varchar("graded_by").references(() => users.id),
  submittedAt: timestamp("submitted_at").defaultNow(),
  gradedAt: timestamp("graded_at")
});
var certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  moduleId: integer("module_id").references(() => modules.id).notNull(),
  certificateNumber: varchar("certificate_number").unique().notNull(),
  finalScore: decimal("final_score", { precision: 5, scale: 2 }),
  issuedAt: timestamp("issued_at").defaultNow(),
  verificationCode: varchar("verification_code").unique(),
  templateData: jsonb("template_data")
  // logo, signature, etc.
});
var forumTopics = pgTable("forum_topics", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").references(() => modules.id),
  stageId: integer("stage_id").references(() => moduleStages.id),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var forumReplies = pgTable("forum_replies", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").references(() => forumTopics.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var usersRelations = relations(users, ({ many }) => ({
  enrollments: many(enrollments),
  stageProgress: many(stageProgress),
  quizAttempts: many(quizAttempts),
  assignmentSubmissions: many(assignmentSubmissions),
  certificates: many(certificates),
  forumTopics: many(forumTopics),
  forumReplies: many(forumReplies),
  userPermissions: many(userPermissions)
}));
var rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  // No direct user relation needed for role permissions
}));
var userPermissionsRelations = relations(userPermissions, ({ one }) => ({
  user: one(users, { fields: [userPermissions.userId], references: [users.id] }),
  grantedByUser: one(users, { fields: [userPermissions.grantedBy], references: [users.id] })
}));
var modulesRelations = relations(modules, ({ one, many }) => ({
  createdByUser: one(users, { fields: [modules.createdBy], references: [users.id] }),
  stages: many(moduleStages),
  questions: many(questions),
  quizzes: many(quizzes),
  assignments: many(assignments),
  enrollments: many(enrollments),
  certificates: many(certificates),
  forumTopics: many(forumTopics)
}));
var moduleStagesRelations = relations(moduleStages, ({ one, many }) => ({
  module: one(modules, { fields: [moduleStages.moduleId], references: [modules.id] }),
  prerequisiteStage: one(moduleStages, { fields: [moduleStages.prerequisiteStageId], references: [moduleStages.id] }),
  questions: many(questions),
  quizzes: many(quizzes),
  assignments: many(assignments),
  stageProgress: many(stageProgress),
  forumTopics: many(forumTopics)
}));
var questionsRelations = relations(questions, ({ one, many }) => ({
  module: one(modules, { fields: [questions.moduleId], references: [modules.id] }),
  stage: one(moduleStages, { fields: [questions.stageId], references: [moduleStages.id] }),
  quizQuestions: many(quizQuestions)
}));
var quizzesRelations = relations(quizzes, ({ one, many }) => ({
  module: one(modules, { fields: [quizzes.moduleId], references: [modules.id] }),
  stage: one(moduleStages, { fields: [quizzes.stageId], references: [moduleStages.id] }),
  quizQuestions: many(quizQuestions),
  attempts: many(quizAttempts)
}));
var enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, { fields: [enrollments.userId], references: [users.id] }),
  module: one(modules, { fields: [enrollments.moduleId], references: [modules.id] })
}));
var forumTopicsRelations = relations(forumTopics, ({ one, many }) => ({
  user: one(users, { fields: [forumTopics.userId], references: [users.id] }),
  module: one(modules, { fields: [forumTopics.moduleId], references: [modules.id] }),
  stage: one(moduleStages, { fields: [forumTopics.stageId], references: [moduleStages.id] }),
  replies: many(forumReplies)
}));
var forumRepliesRelations = relations(forumReplies, ({ one }) => ({
  topic: one(forumTopics, { fields: [forumReplies.topicId], references: [forumTopics.id] }),
  user: one(users, { fields: [forumReplies.userId], references: [users.id] })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
  id: true,
  createdAt: true
});
var insertUserPermissionSchema = createInsertSchema(userPermissions).omit({
  id: true,
  createdAt: true
});
var insertModuleSchema = createInsertSchema(modules).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertModuleStageSchema = createInsertSchema(moduleStages).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  createdAt: true
});
var insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  createdAt: true
});
var insertAssignmentSchema = createInsertSchema(assignments).omit({
  id: true,
  createdAt: true
});
var insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  enrolledAt: true
});
var insertStageProgressSchema = createInsertSchema(stageProgress).omit({
  id: true,
  startedAt: true
});
var insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({
  id: true,
  startedAt: true
});
var insertAssignmentSubmissionSchema = createInsertSchema(assignmentSubmissions).omit({
  id: true,
  submittedAt: true
});
var insertCertificateSchema = createInsertSchema(certificates).omit({
  id: true,
  issuedAt: true
});
var insertForumTopicSchema = createInsertSchema(forumTopics).omit({
  id: true,
  createdAt: true
});
var insertForumReplySchema = createInsertSchema(forumReplies).omit({
  id: true,
  createdAt: true
});
var DEFAULT_ROLE_PERMISSIONS = {
  super_admin: [
    "manage_users",
    "manage_modules",
    "manage_content",
    "manage_quizzes",
    "manage_assignments",
    "grade_assignments",
    "view_analytics",
    "manage_certificates",
    "moderate_forums",
    "manage_enrollments",
    "system_settings",
    "backup_data",
    "manage_quotes",
    "manage_website_settings"
  ],
  teacher: [
    "manage_content",
    "manage_quizzes",
    "grade_assignments",
    "view_analytics"
  ],
  student: []
};
var dailyQuotes = pgTable("daily_quotes", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  author: varchar("author", { length: 255 }),
  category: varchar("category", { length: 100 }),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var websiteSettings = pgTable("website_settings", {
  id: serial("id").primaryKey(),
  settingKey: varchar("setting_key", { length: 100 }).notNull().unique(),
  settingValue: text("setting_value"),
  settingType: varchar("setting_type", { length: 50 }).default("text"),
  // text, image, json, boolean
  description: text("description"),
  category: varchar("category", { length: 100 }).default("general"),
  // general, appearance, contact, footer
  isRequired: boolean("is_required").default(false),
  updatedBy: varchar("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});
var moduleAssignments = pgTable("module_assignments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  moduleId: integer("module_id").references(() => modules.id).notNull(),
  assignedBy: varchar("assigned_by").references(() => users.id).notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
  isActive: boolean("is_active").default(true)
}, (table) => ({
  // Ensure one assignment per user per module
  uniqueUserModule: unique().on(table.userId, table.moduleId)
}));
var insertDailyQuoteSchema = createInsertSchema(dailyQuotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertWebsiteSettingSchema = createInsertSchema(websiteSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertModuleAssignmentSchema = createInsertSchema(moduleAssignments).omit({
  id: true,
  assignedAt: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, desc, and, sql as sql2 } from "drizzle-orm";
var DatabaseStorage = class {
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getAllUsers() {
    const allUsers = await db.select().from(users).orderBy(users.createdAt);
    return allUsers;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  async getUserByEmailFromAuth(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  // Module operations
  async getModules() {
    return await db.select().from(modules).where(eq(modules.isActive, true)).orderBy(desc(modules.createdAt));
  }
  async getModule(id) {
    const [module] = await db.select().from(modules).where(eq(modules.id, id));
    return module;
  }
  async createModule(module) {
    const [newModule] = await db.insert(modules).values(module).returning();
    return newModule;
  }
  async updateModule(id, module) {
    const [updatedModule] = await db.update(modules).set({ ...module, updatedAt: /* @__PURE__ */ new Date() }).where(eq(modules.id, id)).returning();
    return updatedModule;
  }
  async deleteModule(id) {
    const result = await db.update(modules).set({ isActive: false }).where(eq(modules.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  // Module stage operations
  async getModuleStages(moduleId) {
    const stages = await db.select().from(moduleStages).where(and(eq(moduleStages.moduleId, moduleId), eq(moduleStages.isActive, true))).orderBy(moduleStages.orderIndex);
    return stages;
  }
  async getModuleStage(id) {
    const [stage] = await db.select().from(moduleStages).where(eq(moduleStages.id, id));
    return stage;
  }
  async createModuleStage(stage) {
    const result = await db.insert(moduleStages).values(stage).returning();
    const stages = Array.isArray(result) ? result : [result];
    return stages[0];
  }
  async updateModuleStage(id, stage) {
    const [updatedStage] = await db.update(moduleStages).set({ ...stage, updatedAt: /* @__PURE__ */ new Date() }).where(eq(moduleStages.id, id)).returning();
    return updatedStage;
  }
  async deleteModuleStage(id) {
    const result = await db.update(moduleStages).set({ isActive: false }).where(eq(moduleStages.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  // Question operations
  async getQuestions(moduleId) {
    if (moduleId) {
      return await db.select().from(questions).where(and(eq(questions.isActive, true), eq(questions.moduleId, moduleId))).orderBy(desc(questions.createdAt));
    }
    return await db.select().from(questions).where(eq(questions.isActive, true)).orderBy(desc(questions.createdAt));
  }
  async getQuestion(id) {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question;
  }
  async createQuestion(question) {
    const [newQuestion] = await db.insert(questions).values(question).returning();
    return newQuestion;
  }
  async updateQuestion(id, question) {
    const [updatedQuestion] = await db.update(questions).set(question).where(eq(questions.id, id)).returning();
    return updatedQuestion;
  }
  async deleteQuestion(id) {
    const result = await db.update(questions).set({ isActive: false }).where(eq(questions.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  // Get questions for a specific stage
  async getStageQuestions(stageId) {
    return await db.select().from(questions).where(and(eq(questions.stageId, stageId), eq(questions.isActive, true))).orderBy(questions.createdAt);
  }
  // Delete all questions for a stage
  async deleteStageQuestions(stageId) {
    const result = await db.update(questions).set({ isActive: false }).where(eq(questions.stageId, stageId));
    return result.rowCount !== null && result.rowCount >= 0;
  }
  // Quiz operations
  async getQuizzes(moduleId) {
    if (moduleId) {
      return await db.select().from(quizzes).where(and(eq(quizzes.isActive, true), eq(quizzes.moduleId, moduleId))).orderBy(desc(quizzes.createdAt));
    }
    return await db.select().from(quizzes).where(eq(quizzes.isActive, true)).orderBy(desc(quizzes.createdAt));
  }
  async getQuiz(id) {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz;
  }
  async createQuiz(quiz) {
    const [newQuiz] = await db.insert(quizzes).values(quiz).returning();
    return newQuiz;
  }
  async updateQuiz(id, quiz) {
    const [updatedQuiz] = await db.update(quizzes).set(quiz).where(eq(quizzes.id, id)).returning();
    return updatedQuiz;
  }
  async deleteQuiz(id) {
    const result = await db.update(quizzes).set({ isActive: false }).where(eq(quizzes.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  // Assignment operations
  async getAssignments(moduleId) {
    if (moduleId) {
      return await db.select().from(assignments).where(and(eq(assignments.isActive, true), eq(assignments.moduleId, moduleId))).orderBy(desc(assignments.createdAt));
    }
    return await db.select().from(assignments).where(eq(assignments.isActive, true)).orderBy(desc(assignments.createdAt));
  }
  async getAssignment(id) {
    const [assignment] = await db.select().from(assignments).where(eq(assignments.id, id));
    return assignment;
  }
  async createAssignment(assignment) {
    const [newAssignment] = await db.insert(assignments).values(assignment).returning();
    return newAssignment;
  }
  async updateAssignment(id, assignment) {
    const [updatedAssignment] = await db.update(assignments).set(assignment).where(eq(assignments.id, id)).returning();
    return updatedAssignment;
  }
  async deleteAssignment(id) {
    const result = await db.update(assignments).set({ isActive: false }).where(eq(assignments.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  // Enrollment operations
  async getUserEnrollments(userId) {
    return await db.select({
      id: enrollments.id,
      userId: enrollments.userId,
      moduleId: enrollments.moduleId,
      enrolledAt: enrollments.enrolledAt,
      completedAt: enrollments.completedAt,
      finalScore: enrollments.finalScore,
      module: modules
    }).from(enrollments).innerJoin(modules, eq(enrollments.moduleId, modules.id)).where(eq(enrollments.userId, userId)).orderBy(desc(enrollments.enrolledAt));
  }
  async getModuleEnrollments(moduleId) {
    return await db.select({
      id: enrollments.id,
      userId: enrollments.userId,
      moduleId: enrollments.moduleId,
      enrolledAt: enrollments.enrolledAt,
      completedAt: enrollments.completedAt,
      finalScore: enrollments.finalScore,
      user: users
    }).from(enrollments).innerJoin(users, eq(enrollments.userId, users.id)).where(eq(enrollments.moduleId, moduleId)).orderBy(desc(enrollments.enrolledAt));
  }
  async createEnrollment(enrollment) {
    const [newEnrollment] = await db.insert(enrollments).values(enrollment).returning();
    return newEnrollment;
  }
  async updateEnrollment(id, enrollment) {
    const [updatedEnrollment] = await db.update(enrollments).set(enrollment).where(eq(enrollments.id, id)).returning();
    return updatedEnrollment;
  }
  // Progress tracking
  async getUserStageProgress(userId, stageId) {
    const [progress] = await db.select().from(stageProgress).where(and(eq(stageProgress.userId, userId), eq(stageProgress.stageId, stageId)));
    return progress;
  }
  async getUserModuleProgress(userId, moduleId) {
    return await db.select({
      id: stageProgress.id,
      userId: stageProgress.userId,
      stageId: stageProgress.stageId,
      startedAt: stageProgress.startedAt,
      completedAt: stageProgress.completedAt,
      timeSpent: stageProgress.timeSpent,
      interactionData: stageProgress.interactionData,
      validationMet: stageProgress.validationMet,
      lastActiveAt: stageProgress.lastActiveAt
    }).from(stageProgress).innerJoin(moduleStages, eq(stageProgress.stageId, moduleStages.id)).where(and(eq(stageProgress.userId, userId), eq(moduleStages.moduleId, moduleId)));
  }
  async createStageProgress(progress) {
    const [newProgress] = await db.insert(stageProgress).values(progress).returning();
    return newProgress;
  }
  async updateStageProgressById(id, progress) {
    const [updatedProgress] = await db.update(stageProgress).set(progress).where(eq(stageProgress.id, id)).returning();
    return updatedProgress;
  }
  // Quiz attempts
  async getUserQuizAttempts(userId, quizId) {
    return await db.select().from(quizAttempts).where(and(eq(quizAttempts.userId, userId), eq(quizAttempts.quizId, quizId))).orderBy(desc(quizAttempts.startedAt));
  }
  async createQuizAttempt(attempt) {
    const [newAttempt] = await db.insert(quizAttempts).values(attempt).returning();
    return newAttempt;
  }
  async updateQuizAttempt(id, attempt) {
    const [updatedAttempt] = await db.update(quizAttempts).set(attempt).where(eq(quizAttempts.id, id)).returning();
    return updatedAttempt;
  }
  // Assignment submissions
  async getUserAssignmentSubmissions(userId, assignmentId) {
    return await db.select().from(assignmentSubmissions).where(and(eq(assignmentSubmissions.userId, userId), eq(assignmentSubmissions.assignmentId, assignmentId))).orderBy(desc(assignmentSubmissions.submittedAt));
  }
  async getAssignmentSubmissions(assignmentId) {
    return await db.select({
      id: assignmentSubmissions.id,
      userId: assignmentSubmissions.userId,
      assignmentId: assignmentSubmissions.assignmentId,
      content: assignmentSubmissions.content,
      fileUrl: assignmentSubmissions.fileUrl,
      score: assignmentSubmissions.score,
      feedback: assignmentSubmissions.feedback,
      gradedBy: assignmentSubmissions.gradedBy,
      submittedAt: assignmentSubmissions.submittedAt,
      gradedAt: assignmentSubmissions.gradedAt,
      user: users
    }).from(assignmentSubmissions).innerJoin(users, eq(assignmentSubmissions.userId, users.id)).where(eq(assignmentSubmissions.assignmentId, assignmentId)).orderBy(desc(assignmentSubmissions.submittedAt));
  }
  async createAssignmentSubmission(submission) {
    const [newSubmission] = await db.insert(assignmentSubmissions).values(submission).returning();
    return newSubmission;
  }
  async updateAssignmentSubmission(id, submission) {
    const [updatedSubmission] = await db.update(assignmentSubmissions).set(submission).where(eq(assignmentSubmissions.id, id)).returning();
    return updatedSubmission;
  }
  // Certificates
  async getUserCertificates(userId) {
    return await db.select().from(certificates).where(eq(certificates.userId, userId)).orderBy(desc(certificates.issuedAt));
  }
  async getCertificateByNumber(certificateNumber) {
    const [certificate] = await db.select().from(certificates).where(eq(certificates.certificateNumber, certificateNumber));
    return certificate;
  }
  async createCertificate(certificate) {
    const [newCertificate] = await db.insert(certificates).values(certificate).returning();
    return newCertificate;
  }
  // Forum operations
  async getForumTopics(moduleId, stageId) {
    const conditions = [eq(forumTopics.isActive, true)];
    if (moduleId) {
      conditions.push(eq(forumTopics.moduleId, moduleId));
    }
    if (stageId) {
      conditions.push(eq(forumTopics.stageId, stageId));
    }
    return await db.select({
      id: forumTopics.id,
      moduleId: forumTopics.moduleId,
      stageId: forumTopics.stageId,
      userId: forumTopics.userId,
      title: forumTopics.title,
      content: forumTopics.content,
      isActive: forumTopics.isActive,
      createdAt: forumTopics.createdAt,
      user: users,
      replyCount: sql2`COUNT(${forumReplies.id})`
    }).from(forumTopics).leftJoin(forumReplies, eq(forumTopics.id, forumReplies.topicId)).innerJoin(users, eq(forumTopics.userId, users.id)).where(and(...conditions)).groupBy(forumTopics.id, users.id).orderBy(desc(forumTopics.createdAt));
  }
  async getForumTopic(id) {
    const [topic] = await db.select({
      id: forumTopics.id,
      moduleId: forumTopics.moduleId,
      stageId: forumTopics.stageId,
      userId: forumTopics.userId,
      title: forumTopics.title,
      content: forumTopics.content,
      isActive: forumTopics.isActive,
      createdAt: forumTopics.createdAt,
      user: users
    }).from(forumTopics).innerJoin(users, eq(forumTopics.userId, users.id)).where(eq(forumTopics.id, id));
    return topic;
  }
  async getForumReplies(topicId) {
    return await db.select({
      id: forumReplies.id,
      topicId: forumReplies.topicId,
      userId: forumReplies.userId,
      content: forumReplies.content,
      createdAt: forumReplies.createdAt,
      user: users
    }).from(forumReplies).innerJoin(users, eq(forumReplies.userId, users.id)).where(eq(forumReplies.topicId, topicId)).orderBy(forumReplies.createdAt);
  }
  async createForumTopic(topic) {
    const [newTopic] = await db.insert(forumTopics).values(topic).returning();
    return newTopic;
  }
  async createForumReply(reply) {
    const [newReply] = await db.insert(forumReplies).values(reply).returning();
    return newReply;
  }
  // Role and Permission operations
  async deleteUser(userId) {
    const result = await db.delete(users).where(eq(users.id, userId));
    return (result.rowCount ?? 0) > 0;
  }
  async updateUserRole(userId, role) {
    const [updatedUser] = await db.update(users).set({ role, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, userId)).returning();
    return updatedUser;
  }
  async updateUserProfile(userId, data) {
    const [updatedUser] = await db.update(users).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, userId)).returning();
    return updatedUser;
  }
  async getRolePermissions(role) {
    return await db.select().from(rolePermissions).where(eq(rolePermissions.role, role));
  }
  async updateRolePermissions(role, permissions) {
    await db.delete(rolePermissions).where(eq(rolePermissions.role, role));
    if (permissions.length > 0) {
      const permissionData = permissions.map((permission) => ({
        role,
        permission,
        isGranted: true,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }));
      await db.insert(rolePermissions).values(permissionData);
    }
  }
  async getUserPermissions(userId) {
    return await db.select().from(userPermissions).where(eq(userPermissions.userId, userId));
  }
  async grantUserPermission(permission) {
    const [newPermission] = await db.insert(userPermissions).values(permission).returning();
    return newPermission;
  }
  async revokeUserPermission(userId, permission) {
    const result = await db.delete(userPermissions).where(and(
      eq(userPermissions.userId, userId),
      eq(userPermissions.permission, permission)
    ));
    return result.rowCount !== null && result.rowCount > 0;
  }
  async checkUserPermission(userId, permission) {
    const user = await this.getUser(userId);
    if (!user) return false;
    const rolePerms = await db.select().from(rolePermissions).where(and(
      eq(rolePermissions.role, user.role),
      eq(rolePermissions.permission, permission),
      eq(rolePermissions.isGranted, true)
    ));
    if (rolePerms.length > 0) {
      const userOverride = await db.select().from(userPermissions).where(and(
        eq(userPermissions.userId, userId),
        eq(userPermissions.permission, permission)
      ));
      if (userOverride.length === 0) return true;
      return userOverride[0].isGranted;
    }
    const userPerm = await db.select().from(userPermissions).where(and(
      eq(userPermissions.userId, userId),
      eq(userPermissions.permission, permission),
      eq(userPermissions.isGranted, true)
    ));
    return userPerm.length > 0;
  }
  async bulkUpdateRolePermissions(role, permissions) {
    await db.delete(rolePermissions).where(eq(rolePermissions.role, role));
    if (permissions.length > 0) {
      const permissionValues = permissions.map((permission) => ({
        role,
        permission,
        isGranted: true
      }));
      await db.insert(rolePermissions).values(permissionValues);
    }
  }
  // Enhanced stage progress operations
  async updateStageProgress(progressData) {
    const existing = await this.getUserStageProgress(progressData.userId, progressData.stageId);
    if (existing) {
      const [updated] = await db.update(stageProgress).set({
        ...progressData,
        lastActiveAt: /* @__PURE__ */ new Date()
      }).where(and(
        eq(stageProgress.userId, progressData.userId),
        eq(stageProgress.stageId, progressData.stageId)
      )).returning();
      return updated;
    } else {
      const [newProgress] = await db.insert(stageProgress).values({
        ...progressData,
        lastActiveAt: /* @__PURE__ */ new Date()
      }).returning();
      return newProgress;
    }
  }
  async completeStage(userId, stageId) {
    const existing = await this.getUserStageProgress(userId, stageId);
    if (existing) {
      const [updated] = await db.update(stageProgress).set({
        completedAt: /* @__PURE__ */ new Date(),
        validationMet: true,
        lastActiveAt: /* @__PURE__ */ new Date()
      }).where(and(
        eq(stageProgress.userId, userId),
        eq(stageProgress.stageId, stageId)
      )).returning();
      return updated;
    } else {
      const [newProgress] = await db.insert(stageProgress).values({
        userId,
        stageId,
        completedAt: /* @__PURE__ */ new Date(),
        validationMet: true,
        timeSpent: 0,
        lastActiveAt: /* @__PURE__ */ new Date()
      }).returning();
      return newProgress;
    }
  }
  async validateStageInteraction(userId, stageId, interactionData) {
    const stage = await this.getModuleStage(stageId);
    if (!stage || !stage.content) {
      return true;
    }
    let requirements = {};
    try {
      const content = JSON.parse(stage.content);
      requirements = content.interactionRequirements || {};
    } catch {
      return true;
    }
    if (requirements.scrollCompletion && (!interactionData.scrollPercentage || interactionData.scrollPercentage < requirements.scrollCompletion)) {
      return false;
    }
    if (requirements.videoWatchPercentage && (!interactionData.videoWatchPercentage || interactionData.videoWatchPercentage < requirements.videoWatchPercentage)) {
      return false;
    }
    if (requirements.formInteraction && !interactionData.formInteracted) {
      return false;
    }
    return true;
  }
  // Daily quotes operations
  async getDailyQuotes() {
    return await db.select().from(dailyQuotes).orderBy(desc(dailyQuotes.displayOrder), desc(dailyQuotes.createdAt));
  }
  async getDailyQuote(id) {
    const [quote] = await db.select().from(dailyQuotes).where(eq(dailyQuotes.id, id));
    return quote;
  }
  async createDailyQuote(quote) {
    const [newQuote] = await db.insert(dailyQuotes).values(quote).returning();
    return newQuote;
  }
  async updateDailyQuote(id, quote) {
    const [updatedQuote] = await db.update(dailyQuotes).set({ ...quote, updatedAt: /* @__PURE__ */ new Date() }).where(eq(dailyQuotes.id, id)).returning();
    return updatedQuote;
  }
  async deleteDailyQuote(id) {
    const result = await db.delete(dailyQuotes).where(eq(dailyQuotes.id, id));
    return (result.rowCount || 0) > 0;
  }
  async getRandomActiveQuote() {
    const activeQuotes = await db.select().from(dailyQuotes).where(eq(dailyQuotes.isActive, true));
    if (activeQuotes.length === 0) return void 0;
    const randomIndex = Math.floor(Math.random() * activeQuotes.length);
    return activeQuotes[randomIndex];
  }
  // Website settings operations
  async getWebsiteSettings() {
    return await db.select().from(websiteSettings).orderBy(websiteSettings.category, websiteSettings.settingKey);
  }
  async getWebsiteSetting(key) {
    const [setting] = await db.select().from(websiteSettings).where(eq(websiteSettings.settingKey, key));
    return setting;
  }
  async getWebsiteSettingsByCategory(category) {
    return await db.select().from(websiteSettings).where(eq(websiteSettings.category, category));
  }
  async updateWebsiteSetting(key, setting) {
    const [updatedSetting] = await db.update(websiteSettings).set({ ...setting, updatedAt: /* @__PURE__ */ new Date() }).where(eq(websiteSettings.settingKey, key)).returning();
    return updatedSetting;
  }
  async createWebsiteSetting(setting) {
    const [newSetting] = await db.insert(websiteSettings).values(setting).returning();
    return newSetting;
  }
  // Module assignment operations
  async assignModuleToUser(assignment) {
    const [newAssignment] = await db.insert(moduleAssignments).values(assignment).returning();
    return newAssignment;
  }
  async getUserModuleAssignments(userId) {
    return await db.select().from(moduleAssignments).where(and(eq(moduleAssignments.userId, userId), eq(moduleAssignments.isActive, true)));
  }
  async getModuleAssignments(moduleId) {
    return await db.select().from(moduleAssignments).where(and(eq(moduleAssignments.moduleId, moduleId), eq(moduleAssignments.isActive, true)));
  }
  async getTeacherInstructorModules(userId) {
    return await db.select({
      id: modules.id,
      title: modules.title,
      description: modules.description,
      competencies: modules.competencies,
      duration: modules.duration,
      isActive: modules.isActive,
      createdAt: modules.createdAt,
      updatedAt: modules.updatedAt,
      createdBy: modules.createdBy
    }).from(modules).innerJoin(moduleAssignments, eq(modules.id, moduleAssignments.moduleId)).where(
      and(
        eq(moduleAssignments.userId, userId),
        eq(moduleAssignments.isActive, true),
        eq(modules.isActive, true)
      )
    );
  }
  async removeModuleAssignment(userId, moduleId) {
    const result = await db.update(moduleAssignments).set({ isActive: false }).where(
      and(
        eq(moduleAssignments.userId, userId),
        eq(moduleAssignments.moduleId, moduleId)
      )
    ).returning();
    return result.length > 0;
  }
  async getAllModuleAssignments() {
    return await db.select({
      id: moduleAssignments.id,
      userId: moduleAssignments.userId,
      moduleId: moduleAssignments.moduleId,
      assignedBy: moduleAssignments.assignedBy,
      assignedAt: moduleAssignments.assignedAt,
      isActive: moduleAssignments.isActive,
      user: {
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role
      },
      module: {
        id: modules.id,
        title: modules.title,
        description: modules.description
      }
    }).from(moduleAssignments).innerJoin(users, eq(moduleAssignments.userId, users.id)).innerJoin(modules, eq(moduleAssignments.moduleId, modules.id)).where(eq(moduleAssignments.isActive, true));
  }
  // Module Assignment operations
  async getAssignedModules(userId) {
    const assignedModules = await db.select({
      id: modules.id,
      title: modules.title,
      description: modules.description,
      competencies: modules.competencies,
      duration: modules.duration,
      isActive: modules.isActive,
      createdBy: modules.createdBy,
      createdAt: modules.createdAt,
      updatedAt: modules.updatedAt
    }).from(moduleAssignments).innerJoin(modules, eq(moduleAssignments.moduleId, modules.id)).where(
      and(
        eq(moduleAssignments.userId, userId),
        eq(moduleAssignments.isActive, true),
        eq(modules.isActive, true)
      )
    ).orderBy(desc(modules.createdAt));
    return assignedModules;
  }
};
var storage = new DatabaseStorage();

// server/routes/authRoutes.ts
import { Router } from "express";
import { z as z2 } from "zod";
import admin from "firebase-admin";

// server/types/session.ts
import "express-session";

// server/routes/authRoutes.ts
var router = Router();
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID
  });
}
var googleLoginSchema = z2.object({
  uid: z2.string(),
  email: z2.string().email(),
  displayName: z2.string().nullable(),
  photoURL: z2.string().nullable(),
  idToken: z2.string()
});
router.post("/google-login", async (req, res) => {
  try {
    const validatedData = googleLoginSchema.parse(req.body);
    if (process.env.NODE_ENV === "production") {
      let decodedToken;
      try {
        decodedToken = await admin.auth().verifyIdToken(validatedData.idToken);
      } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
      }
      if (decodedToken.uid !== validatedData.uid) {
        return res.status(401).json({ message: "Token UID mismatch" });
      }
    } else {
      console.log("Development mode: Skipping Firebase token verification");
    }
    let user = await storage.getUserByEmailFromAuth(validatedData.email);
    let isNewUser = false;
    if (!user) {
      const names = validatedData.displayName?.split(" ") || ["", ""];
      let userRole = "student";
      if (validatedData.email === "it-system@cintakasihtzuchi.sch.id") {
        userRole = "super_admin";
      }
      user = await storage.upsertUser({
        id: validatedData.uid,
        email: validatedData.email,
        firstName: names[0] || "",
        lastName: names.slice(1).join(" ") || "",
        profileImageUrl: validatedData.photoURL || "",
        role: userRole,
        isActive: true
      });
      isNewUser = true;
    } else {
      let needsUpdate = false;
      let updateData = { ...user };
      if (validatedData.photoURL && user.profileImageUrl !== validatedData.photoURL) {
        updateData.profileImageUrl = validatedData.photoURL;
        needsUpdate = true;
      }
      if (validatedData.email === "it-system@cintakasihtzuchi.sch.id" && user.role !== "super_admin") {
        updateData.role = "super_admin";
        needsUpdate = true;
      }
      updateData.lastLogin = /* @__PURE__ */ new Date();
      needsUpdate = true;
      if (needsUpdate) {
        user = await storage.upsertUser(updateData);
      }
    }
    req.session.user = {
      uid: validatedData.uid,
      id: user.id,
      email: user.email || "",
      firstName: user.firstName || void 0,
      lastName: user.lastName || void 0,
      role: user.role,
      profileImageUrl: user.profileImageUrl || void 0
    };
    res.json({
      user,
      isNewUser
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(400).json({
      message: error instanceof z2.ZodError ? "Invalid data" : "Login failed"
    });
  }
});
router.get("/user", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await storage.getUser(req.session.user.id);
    if (!user) {
      req.session.destroy(() => {
      });
      return res.status(401).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
});
var authRoutes_default = router;

// server/routes/stageRoutes.ts
import { z as z3 } from "zod";
function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}
function requireRole(requiredRoles) {
  return async (req, res, next) => {
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
function registerStageRoutes(app2) {
  app2.get("/api/modules/:moduleId/stages", requireAuth, async (req, res) => {
    try {
      const moduleId = parseInt(req.params.moduleId);
      const stages = await storage.getModuleStages(moduleId);
      res.json(stages);
    } catch (error) {
      console.error("Error fetching module stages:", error);
      res.status(500).json({ message: "Failed to fetch module stages" });
    }
  });
  app2.post("/api/stages", requireAuth, requireRole(["super_admin", "teacher"]), async (req, res) => {
    try {
      const { questions: questions2, ...stageData } = req.body;
      const parsedStageData = insertModuleStageSchema.parse(stageData);
      const stage = await storage.createModuleStage(parsedStageData);
      if (questions2 && questions2.length > 0) {
        for (const questionData of questions2) {
          const questionToCreate = insertQuestionSchema.parse({
            ...questionData,
            moduleId: stage.moduleId,
            stageId: stage.id
          });
          await storage.createQuestion(questionToCreate);
        }
      }
      res.status(201).json(stage);
    } catch (error) {
      console.error("Error creating module stage:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create module stage" });
    }
  });
  app2.get("/api/stages/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const stage = await storage.getModuleStage(id);
      if (!stage) {
        return res.status(404).json({ message: "Stage not found" });
      }
      const stageQuestions = await storage.getStageQuestions(id);
      res.json({ ...stage, questions: stageQuestions });
    } catch (error) {
      console.error("Error fetching stage:", error);
      res.status(500).json({ message: "Failed to fetch stage" });
    }
  });
  app2.patch("/api/stages/:id", requireAuth, requireRole(["super_admin", "teacher"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { questions: questions2, ...stageData } = req.body;
      const parsedStageData = insertModuleStageSchema.partial().parse(stageData);
      const stage = await storage.updateModuleStage(id, parsedStageData);
      if (!stage) {
        return res.status(404).json({ message: "Stage not found" });
      }
      if (questions2 !== void 0) {
        await storage.deleteStageQuestions(id);
        for (const questionData of questions2) {
          const questionToCreate = insertQuestionSchema.parse({
            ...questionData,
            moduleId: stage.moduleId,
            stageId: stage.id
          });
          await storage.createQuestion(questionToCreate);
        }
      }
      res.json(stage);
    } catch (error) {
      console.error("Error updating stage:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update stage" });
    }
  });
  app2.delete("/api/stages/:id", requireAuth, requireRole(["super_admin", "teacher"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteStageQuestions(id);
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
  app2.get("/api/stages/:stageId/questions", requireAuth, async (req, res) => {
    try {
      const stageId = parseInt(req.params.stageId);
      const questions2 = await storage.getStageQuestions(stageId);
      res.json(questions2);
    } catch (error) {
      console.error("Error fetching stage questions:", error);
      res.status(500).json({ message: "Failed to fetch stage questions" });
    }
  });
  app2.post("/api/stages/:stageId/questions", requireAuth, requireRole(["super_admin", "teacher"]), async (req, res) => {
    try {
      const stageId = parseInt(req.params.stageId);
      const stage = await storage.getModuleStage(stageId);
      if (!stage) {
        return res.status(404).json({ message: "Stage not found" });
      }
      const questionData = insertQuestionSchema.parse({
        ...req.body,
        moduleId: stage.moduleId,
        stageId
      });
      const question = await storage.createQuestion(questionData);
      res.status(201).json(question);
    } catch (error) {
      console.error("Error creating question:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create question" });
    }
  });
  app2.patch("/api/questions/:id", requireAuth, requireRole(["super_admin", "teacher"]), async (req, res) => {
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
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update question" });
    }
  });
  app2.delete("/api/questions/:id", requireAuth, requireRole(["super_admin", "teacher"]), async (req, res) => {
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
  app2.get("/api/stages/:stageId/progress", requireAuth, async (req, res) => {
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
  app2.post("/api/stages/:stageId/progress", requireAuth, async (req, res) => {
    try {
      const stageId = parseInt(req.params.stageId);
      const userId = req.user.claims.sub;
      const progressData = insertStageProgressSchema.parse({
        ...req.body,
        userId,
        stageId
      });
      const progress = await storage.updateStageProgress(progressData);
      res.json(progress);
    } catch (error) {
      console.error("Error updating stage progress:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update stage progress" });
    }
  });
  app2.post("/api/stages/:stageId/complete", requireAuth, async (req, res) => {
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
  app2.post("/api/stages/:stageId/validate", requireAuth, async (req, res) => {
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

// server/routes/dailyQuotesRoutes.ts
import express from "express";
import { z as z4 } from "zod";
var router2 = express.Router();
router2.get("/", async (req, res) => {
  try {
    const quotes = await storage.getDailyQuotes();
    res.json(quotes);
  } catch (error) {
    console.error("Get daily quotes error:", error);
    res.status(500).json({ message: "Failed to fetch daily quotes" });
  }
});
router2.get("/today", async (req, res) => {
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
router2.get("/random", async (req, res) => {
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
router2.get("/:id", async (req, res) => {
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
router2.post("/", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const validatedData = insertDailyQuoteSchema.parse(req.body);
    const quote = await storage.createDailyQuote({
      ...validatedData,
      createdBy: req.session.user.id
    });
    res.status(201).json(quote);
  } catch (error) {
    console.error("Create quote error:", error);
    if (error instanceof z4.ZodError) {
      res.status(400).json({ message: "Invalid data", errors: error.errors });
    } else {
      res.status(500).json({ message: "Failed to create quote" });
    }
  }
});
router2.put("/:id", async (req, res) => {
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
    if (error instanceof z4.ZodError) {
      res.status(400).json({ message: "Invalid data", errors: error.errors });
    } else {
      res.status(500).json({ message: "Failed to update quote" });
    }
  }
});
router2.delete("/:id", async (req, res) => {
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
var dailyQuotesRoutes_default = router2;

// server/routes/websiteSettingsRoutes.ts
import express2 from "express";
import { z as z5 } from "zod";
var router3 = express2.Router();
router3.get("/", async (req, res) => {
  try {
    const settings = await storage.getWebsiteSettings();
    res.json(settings);
  } catch (error) {
    console.error("Get website settings error:", error);
    res.status(500).json({ message: "Failed to fetch website settings" });
  }
});
router3.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const settings = await storage.getWebsiteSettingsByCategory(category);
    res.json(settings);
  } catch (error) {
    console.error("Get settings by category error:", error);
    res.status(500).json({ message: "Failed to fetch settings" });
  }
});
router3.get("/:key", async (req, res) => {
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
router3.post("/", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const validatedData = insertWebsiteSettingSchema.parse(req.body);
    const setting = await storage.createWebsiteSetting({
      ...validatedData,
      updatedBy: req.session.user.id
    });
    res.status(201).json(setting);
  } catch (error) {
    console.error("Create setting error:", error);
    if (error instanceof z5.ZodError) {
      res.status(400).json({ message: "Invalid data", errors: error.errors });
    } else {
      res.status(500).json({ message: "Failed to create setting" });
    }
  }
});
router3.put("/:key", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { key } = req.params;
    const validatedData = insertWebsiteSettingSchema.partial().parse(req.body);
    const setting = await storage.updateWebsiteSetting(key, {
      ...validatedData,
      updatedBy: req.session.user.id
    });
    if (!setting) {
      return res.status(404).json({ message: "Setting not found" });
    }
    res.json(setting);
  } catch (error) {
    console.error("Update setting error:", error);
    if (error instanceof z5.ZodError) {
      res.status(400).json({ message: "Invalid data", errors: error.errors });
    } else {
      res.status(500).json({ message: "Failed to update setting" });
    }
  }
});
var websiteSettingsRoutes_default = router3;

// server/routes.ts
import session2 from "express-session";
import connectPg2 from "connect-pg-simple";

// server/replitAuth.ts
import * as client from "openid-client";
import { Strategy } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}
var getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID
    );
  },
  { maxAge: 3600 * 1e3 }
);
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl
    }
  });
}
function updateUserSession(user, tokens) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}
async function upsertUser(claims) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"]
  });
}
async function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(passport.initialize());
  app2.use(passport.session());
  const config = await getOidcConfig();
  const verify = async (tokens, verified) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };
  for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`
      },
      verify
    );
    passport.use(strategy);
  }
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((user, cb) => cb(null, user));
  app2.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"]
    })(req, res, next);
  });
  app2.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login"
    })(req, res, next);
  });
  app2.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`
        }).href
      );
    });
  });
}
var isAuthenticated = async (req, res, next) => {
  const user = req.user;
  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const now = Math.floor(Date.now() / 1e3);
  if (now <= user.expires_at) {
    return next();
  }
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

// server/routes.ts
import { z as z6 } from "zod";
function requireRole2(requiredRoles) {
  return async (req, res, next) => {
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
function requirePermission(permission) {
  return async (req, res, next) => {
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
async function registerRoutes(app2) {
  await setupAuth(app2);
  app2.set("trust proxy", 1);
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg2(session2);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  app2.use(session2({
    secret: process.env.SESSION_SECRET || "dev-secret-key",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl
    }
  }));
  app2.use("/api/auth", authRoutes_default);
  app2.use("/api/daily-quotes", dailyQuotesRoutes_default);
  app2.use("/api/website-settings", requirePermission("manage_website_settings"), websiteSettingsRoutes_default);
  app2.get("/api/users", requireRole2(["super_admin"]), async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      res.json(users2);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.patch("/api/users/:id", requireRole2(["super_admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      if (!role || !["student", "teacher", "instructor", "super_admin"].includes(role)) {
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
  app2.delete("/api/users/:id", requireRole2(["super_admin"]), async (req, res) => {
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
  app2.patch("/api/profile", isAuthenticated, async (req, res) => {
    try {
      const { firstName, lastName } = req.body;
      const userId = req.user.claims.sub;
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
  registerStageRoutes(app2);
  function requireAuth2(req, res, next) {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  }
  function requireSession(req, res, next) {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  }
  app2.get("/api/modules", requireSession, async (req, res) => {
    try {
      const modules2 = await storage.getModules();
      res.json(modules2);
    } catch (error) {
      console.error("Error fetching modules:", error);
      res.status(500).json({ message: "Failed to fetch modules" });
    }
  });
  app2.get("/api/modules/assigned", requireSession, async (req, res) => {
    try {
      const userId = req.session.user.id;
      const user = await storage.getUser(userId);
      if (!user || !["teacher", "instructor"].includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      const assignedModules = await storage.getAssignedModules(userId);
      res.json(assignedModules);
    } catch (error) {
      console.error("Error fetching assigned modules:", error);
      res.status(500).json({ message: "Failed to fetch assigned modules" });
    }
  });
  app2.get("/api/modules/:id", requireSession, async (req, res) => {
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
  app2.post("/api/modules", requireAuth2, requireRole2(["super_admin"]), async (req, res) => {
    try {
      const moduleData = insertModuleSchema.parse({
        ...req.body,
        createdBy: req.currentUser.id
      });
      const module = await storage.createModule(moduleData);
      res.status(201).json(module);
    } catch (error) {
      console.error("Error creating module:", error);
      if (error instanceof z6.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create module" });
    }
  });
  app2.put("/api/modules/:id", requireAuth2, requireRole2(["super_admin"]), async (req, res) => {
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
      if (error instanceof z6.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update module" });
    }
  });
  app2.delete("/api/modules/:id", requireAuth2, requireRole2(["super_admin"]), async (req, res) => {
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
  app2.get("/api/modules/:moduleId/stages", requireSession, async (req, res) => {
    try {
      const moduleId = parseInt(req.params.moduleId);
      const stages = await storage.getModuleStages(moduleId);
      res.json(stages);
    } catch (error) {
      console.error("Error fetching module stages:", error);
      res.status(500).json({ message: "Failed to fetch module stages" });
    }
  });
  app2.post("/api/modules/:moduleId/stages", requireAuth2, requireRole2(["super_admin"]), async (req, res) => {
    try {
      const moduleId = parseInt(req.params.moduleId);
      const stageData = insertModuleStageSchema.parse({
        ...req.body,
        moduleId
      });
      const stage = await storage.createModuleStage(stageData);
      res.status(201).json(stage);
    } catch (error) {
      console.error("Error creating module stage:", error);
      if (error instanceof z6.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create module stage" });
    }
  });
  app2.get("/api/enrollments/my", requireSession, async (req, res) => {
    try {
      const userId = req.session.user.id;
      const enrollments2 = await storage.getUserEnrollments(userId);
      res.json(enrollments2);
    } catch (error) {
      console.error("Error fetching user enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });
  app2.post("/api/enrollments", requireSession, async (req, res) => {
    try {
      const userId = req.session.user.id;
      const enrollmentData = insertEnrollmentSchema.parse({
        ...req.body,
        userId
      });
      const enrollment = await storage.createEnrollment(enrollmentData);
      res.status(201).json(enrollment);
    } catch (error) {
      console.error("Error creating enrollment:", error);
      if (error instanceof z6.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create enrollment" });
    }
  });
  app2.get("/api/progress/modules/:moduleId", requireSession, async (req, res) => {
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
  app2.post("/api/progress/stages", requireSession, async (req, res) => {
    try {
      const userId = req.session.user.id;
      const progressData = insertStageProgressSchema.parse({
        ...req.body,
        userId
      });
      const progress = await storage.createStageProgress(progressData);
      res.status(201).json(progress);
    } catch (error) {
      console.error("Error creating stage progress:", error);
      if (error instanceof z6.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create progress" });
    }
  });
  app2.get("/api/quizzes/:id", requireSession, async (req, res) => {
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
  app2.get("/api/quizzes/:id/questions", requireSession, async (req, res) => {
    try {
      const quizId = parseInt(req.params.id);
      const questions2 = await storage.getQuestions(quizId);
      res.json(questions2);
    } catch (error) {
      console.error("Error fetching quiz questions:", error);
      res.status(500).json({ message: "Failed to fetch quiz questions" });
    }
  });
  app2.get("/api/modules/:moduleId/quizzes", requireSession, async (req, res) => {
    try {
      const moduleId = parseInt(req.params.moduleId);
      const quizzes2 = await storage.getQuizzes(moduleId);
      res.json(quizzes2);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });
  app2.post("/api/quiz-attempts", requireSession, async (req, res) => {
    try {
      const userId = req.session.user.id;
      const attemptData = insertQuizAttemptSchema.parse({
        ...req.body,
        userId
      });
      const attempt = await storage.createQuizAttempt(attemptData);
      res.status(201).json(attempt);
    } catch (error) {
      console.error("Error creating quiz attempt:", error);
      if (error instanceof z6.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create quiz attempt" });
    }
  });
  app2.get("/api/modules/:moduleId/assignments", requireSession, async (req, res) => {
    try {
      const moduleId = parseInt(req.params.moduleId);
      const assignments2 = await storage.getAssignments(moduleId);
      res.json(assignments2);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });
  app2.post("/api/assignment-submissions", requireSession, async (req, res) => {
    try {
      const userId = req.session.user.id;
      const submissionData = insertAssignmentSubmissionSchema.parse({
        ...req.body,
        userId
      });
      const submission = await storage.createAssignmentSubmission(submissionData);
      res.status(201).json(submission);
    } catch (error) {
      console.error("Error creating assignment submission:", error);
      if (error instanceof z6.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create submission" });
    }
  });
  app2.get("/api/certificates/my", requireSession, async (req, res) => {
    try {
      const userId = req.session.user.id;
      const certificates2 = await storage.getUserCertificates(userId);
      res.json(certificates2);
    } catch (error) {
      console.error("Error fetching user certificates:", error);
      res.status(500).json({ message: "Failed to fetch certificates" });
    }
  });
  app2.post("/api/certificates", requireSession, async (req, res) => {
    try {
      const userId = req.session.user.id;
      const certificateData = insertCertificateSchema.parse({
        ...req.body,
        userId,
        certificateNumber: `TZC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        verificationCode: Math.random().toString(36).substr(2, 15)
      });
      const certificate = await storage.createCertificate(certificateData);
      res.status(201).json(certificate);
    } catch (error) {
      console.error("Error creating certificate:", error);
      if (error instanceof z6.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create certificate" });
    }
  });
  app2.get("/api/forum/topics", requireSession, async (req, res) => {
    try {
      const moduleId = req.query.moduleId ? parseInt(req.query.moduleId) : void 0;
      const stageId = req.query.stageId ? parseInt(req.query.stageId) : void 0;
      const topics = await storage.getForumTopics(moduleId, stageId);
      res.json(topics);
    } catch (error) {
      console.error("Error fetching forum topics:", error);
      res.status(500).json({ message: "Failed to fetch forum topics" });
    }
  });
  app2.post("/api/forum/topics", requireSession, async (req, res) => {
    try {
      const userId = req.session.user.id;
      const topicData = insertForumTopicSchema.parse({
        ...req.body,
        userId
      });
      const topic = await storage.createForumTopic(topicData);
      res.status(201).json(topic);
    } catch (error) {
      console.error("Error creating forum topic:", error);
      if (error instanceof z6.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create topic" });
    }
  });
  app2.get("/api/forum/topics/:topicId/replies", requireSession, async (req, res) => {
    try {
      const topicId = parseInt(req.params.topicId);
      const replies = await storage.getForumReplies(topicId);
      res.json(replies);
    } catch (error) {
      console.error("Error fetching forum replies:", error);
      res.status(500).json({ message: "Failed to fetch replies" });
    }
  });
  app2.post("/api/forum/replies", requireSession, async (req, res) => {
    try {
      const userId = req.session.user.id;
      const replyData = insertForumReplySchema.parse({
        ...req.body,
        userId
      });
      const reply = await storage.createForumReply(replyData);
      res.status(201).json(reply);
    } catch (error) {
      console.error("Error creating forum reply:", error);
      if (error instanceof z6.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create reply" });
    }
  });
  app2.get("/api/dashboard/stats", requireSession, async (req, res) => {
    try {
      const userId = req.session.user.id;
      const enrollments2 = await storage.getUserEnrollments(userId);
      const certificates2 = await storage.getUserCertificates(userId);
      const activeModules = enrollments2.filter((e) => !e.completedAt).length;
      const completedModules = enrollments2.filter((e) => e.completedAt).length;
      const certificatesCount = certificates2.length;
      const totalModules = enrollments2.length;
      const overallProgress = totalModules > 0 ? Math.round(completedModules / totalModules * 100) : 0;
      const studyHours = completedModules * 4;
      res.json({
        activeModules,
        overallProgress,
        certificates: certificatesCount,
        studyHours
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });
  app2.get("/api/admin/users", requireSession, requireRole2(["super_admin"]), async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      res.json(users2);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.put("/api/admin/users/:userId/role", requireSession, requireRole2(["super_admin"]), async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      if (!role || !["super_admin", "teacher", "student"].includes(role)) {
        return res.status(400).json({ message: "Invalid role provided" });
      }
      if (role === "super_admin" && req.currentUser.role !== "super_admin") {
        return res.status(403).json({ message: "Only Super Admins can assign Super Admin role" });
      }
      const updatedUser = await storage.updateUserRole(userId, role);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });
  app2.get("/api/admin/roles/:role/permissions", requireSession, requireRole2(["super_admin"]), async (req, res) => {
    try {
      const { role } = req.params;
      const permissions = await storage.getRolePermissions(role);
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching role permissions:", error);
      res.status(500).json({ message: "Failed to fetch role permissions" });
    }
  });
  app2.put("/api/admin/roles/:role/permissions", requireSession, requireRole2(["super_admin"]), async (req, res) => {
    try {
      const { role } = req.params;
      const { permissions } = req.body;
      if (!Array.isArray(permissions)) {
        return res.status(400).json({ message: "Permissions must be an array" });
      }
      await storage.updateRolePermissions(role, permissions);
      res.json({ message: "Role permissions updated successfully" });
    } catch (error) {
      console.error("Error updating role permissions:", error);
      res.status(500).json({ message: "Failed to update role permissions" });
    }
  });
  app2.get("/api/admin/users/:userId/permissions", requireSession, requireRole2(["super_admin"]), async (req, res) => {
    try {
      const { userId } = req.params;
      const permissions = await storage.getUserPermissions(userId);
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching user permissions:", error);
      res.status(500).json({ message: "Failed to fetch user permissions" });
    }
  });
  app2.post("/api/admin/users/:userId/permissions", requireSession, requireRole2(["super_admin"]), async (req, res) => {
    try {
      const { userId } = req.params;
      const permissionData = insertUserPermissionSchema.parse({
        ...req.body,
        userId,
        grantedBy: req.currentUser.id
      });
      const permission = await storage.grantUserPermission(permissionData);
      res.status(201).json(permission);
    } catch (error) {
      console.error("Error granting user permission:", error);
      if (error instanceof z6.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to grant permission" });
    }
  });
  app2.delete("/api/admin/users/:userId/permissions/:permission", requireSession, requireRole2(["super_admin"]), async (req, res) => {
    try {
      const { userId, permission } = req.params;
      const success = await storage.revokeUserPermission(userId, permission);
      if (!success) {
        return res.status(404).json({ message: "Permission not found" });
      }
      res.json({ message: "Permission revoked successfully" });
    } catch (error) {
      console.error("Error revoking user permission:", error);
      res.status(500).json({ message: "Failed to revoke permission" });
    }
  });
  app2.get("/api/permissions/check/:permission", isAuthenticated, async (req, res) => {
    try {
      const { permission } = req.params;
      const userId = req.user.claims.sub;
      const hasPermission = await storage.checkUserPermission(userId, permission);
      res.json({ hasPermission });
    } catch (error) {
      console.error("Error checking permission:", error);
      res.status(500).json({ message: "Failed to check permission" });
    }
  });
  app2.get("/api/admin/permissions", requireAuth2, requirePermission("manage_users"), async (req, res) => {
    const permissions = [
      "manage_users",
      "manage_modules",
      "manage_content",
      "manage_quizzes",
      "manage_assignments",
      "grade_assignments",
      "view_analytics",
      "manage_certificates",
      "moderate_forums",
      "manage_enrollments",
      "system_settings",
      "backup_data"
    ];
    res.json(permissions);
  });
  app2.post("/api/module-assignments", requireAuth2, requireRole2(["super_admin"]), async (req, res) => {
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
      res.status(500).json({ message: "Failed to create assignment", error: error.message });
    }
  });
  app2.get("/api/module-assignments", requireAuth2, requireRole2(["super_admin"]), async (req, res) => {
    try {
      const assignments2 = await storage.getAllModuleAssignments();
      res.json(assignments2);
    } catch (error) {
      console.error("Error fetching module assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });
  app2.get("/api/module-assignments/user/:userId", requireAuth2, async (req, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.session.user.id;
      const currentUser = await storage.getUser(currentUserId);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const hasManagePermission = currentUser.role === "super_admin";
      if (userId !== currentUserId && !hasManagePermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const assignments2 = await storage.getUserModuleAssignments(userId);
      res.json(assignments2);
    } catch (error) {
      console.error("Error fetching user module assignments:", error);
      res.status(500).json({ message: "Failed to fetch user assignments" });
    }
  });
  app2.get("/api/modules/assigned", requireAuth2, async (req, res) => {
    try {
      const userId = req.session.user.id;
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(401).json({ message: "User not found" });
      }
      if (currentUser.role !== "teacher" && currentUser.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied - insufficient role" });
      }
      const modules2 = await storage.getTeacherInstructorModules(userId);
      res.json(modules2);
    } catch (error) {
      console.error("Error fetching assigned modules:", error);
      res.status(500).json({ message: "Failed to fetch assigned modules" });
    }
  });
  app2.delete("/api/module-assignments/:userId/:moduleId", requireAuth2, requireRole2(["super_admin"]), async (req, res) => {
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
  app2.get("/api/teacher/stats", requireAuth2, async (req, res) => {
    try {
      const userId = req.session.user.id;
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(401).json({ message: "User not found" });
      }
      if (currentUser.role !== "teacher") {
        return res.status(403).json({ message: "Access denied - not a teacher" });
      }
      const modules2 = await storage.getTeacherInstructorModules(userId);
      const stats = {
        totalModules: modules2.length,
        totalContent: 0,
        // TODO: Calculate based on stages
        totalStudents: 0,
        // TODO: Calculate based on enrollments
        avgProgress: 0
        // TODO: Calculate average progress
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching teacher stats:", error);
      res.status(500).json({ message: "Failed to fetch teacher stats" });
    }
  });
  app2.get("/api/modules/:id/enrollments", requireAuth2, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.user.id;
      const currentUser = await storage.getUser(userId);
      if (currentUser?.role === "teacher") {
        const assignedModules = await storage.getTeacherInstructorModules(userId);
        const hasAccess = assignedModules.some((module) => module.id === parseInt(id));
        if (!hasAccess) {
          return res.status(403).json({ message: "Not authorized to access this module" });
        }
      } else if (currentUser?.role !== "super_admin") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const enrollments2 = await storage.getModuleEnrollments(parseInt(id));
      res.json(enrollments2);
    } catch (error) {
      console.error("Error fetching module enrollments:", error);
      res.status(500).json({ message: "Failed to fetch module enrollments" });
    }
  });
  app2.get("/api/website-settings", isAuthenticated, async (req, res) => {
    try {
      const settings = await storage.getWebsiteSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching website settings:", error);
      res.status(500).json({ message: "Failed to fetch website settings" });
    }
  });
  app2.get("/api/website-settings/category/:category", isAuthenticated, async (req, res) => {
    try {
      const { category } = req.params;
      const settings = await storage.getWebsiteSettingsByCategory(category);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching website settings by category:", error);
      res.status(500).json({ message: "Failed to fetch website settings" });
    }
  });
  app2.post("/api/website-settings", isAuthenticated, requirePermission("manage_website_settings"), async (req, res) => {
    try {
      const settingData = insertWebsiteSettingSchema.parse(req.body);
      const setting = await storage.createWebsiteSetting(settingData);
      res.status(201).json(setting);
    } catch (error) {
      console.error("Error creating website setting:", error);
      if (error instanceof z6.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create website setting" });
    }
  });
  app2.put("/api/website-settings/:key", isAuthenticated, requirePermission("manage_website_settings"), async (req, res) => {
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
      if (error instanceof z6.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update website setting" });
    }
  });
  app2.get("/api/enrollments/my", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const query = `
        SELECT e.*, m.title as module_title, m.description as module_description
        FROM enrollments e
        JOIN modules m ON e.module_id = m.id
        WHERE e.user_id = $1 AND e.is_active = true
        ORDER BY e.enrolled_at DESC
      `;
      const enrollments2 = await storage.getUserEnrollments(userId);
      res.json(enrollments2 || []);
    } catch (error) {
      console.error("Error fetching user enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });
  app2.post("/api/enrollments", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { moduleId } = req.body;
      if (!moduleId) {
        return res.status(400).json({ message: "Module ID is required" });
      }
      const userEnrollments = await storage.getUserEnrollments(userId);
      const existing = userEnrollments.find((e) => e.moduleId === parseInt(moduleId));
      if (existing) {
        return res.status(409).json({ message: "Already enrolled in this module" });
      }
      const enrollment = await storage.createEnrollment({
        userId,
        moduleId: parseInt(moduleId)
      });
      res.status(201).json(enrollment);
    } catch (error) {
      console.error("Error creating enrollment:", error);
      res.status(500).json({ message: "Failed to create enrollment" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express3 from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express3.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/initializeRolePermissions.ts
async function initializeRolePermissions() {
  console.log("Initializing role permissions...");
  try {
    await db.delete(rolePermissions);
    console.log("Cleared existing role permissions");
    for (const [role, permissions] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
      const rolePermissionData = permissions.map((permission) => ({
        role,
        permission,
        isGranted: true
      }));
      if (rolePermissionData.length > 0) {
        await db.insert(rolePermissions).values(rolePermissionData);
        console.log(`Initialized permissions for role: ${role}`);
      }
    }
    console.log("Successfully initialized all role permissions");
  } catch (error) {
    console.error("Error initializing role permissions:", error);
    throw error;
  }
}

// server/index.ts
var app = express4();
app.use(express4.json());
app.use(express4.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  await initializeRolePermissions();
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
