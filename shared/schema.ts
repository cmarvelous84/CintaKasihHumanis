import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
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
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum - hanya Super Admin, Teacher, dan Student
export const userRoleEnum = pgEnum('user_role', ['super_admin', 'teacher', 'student']);

// Permission types enum
export const permissionEnum = pgEnum('permission_type', [
  'manage_users', 'manage_modules', 'manage_content', 'manage_quizzes', 
  'manage_assignments', 'grade_assignments', 'view_analytics', 'manage_certificates',
  'moderate_forums', 'manage_enrollments', 'system_settings', 'backup_data',
  'manage_quotes', 'manage_website_settings'
]);

// Question types enum - expanded like Moodle  
export const questionTypeEnum = pgEnum('question_type', [
  'multiple_choice', 'true_false', 'essay', 'short_answer', 
  'matching', 'fill_in_blank', 'numerical', 'ordering', 
  'drag_drop', 'hotspot', 'calculated'
]);

// Enhanced content schemas for validation
const questionTagsSchema = z.array(z.string());
const stageContentSchema = z.object({
  type: z.enum(['video', 'pdf', 'infographic', 'quiz', 'assignment', 'reflection', 'text', 'interactive']),
  url: z.string().optional(),
  embedCode: z.string().optional(),
  text: z.string().optional(),
  videoId: z.string().optional(),
  pdfUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const interactionRequirementSchema = z.object({
  scrollCompletion: z.number().min(0).max(100).optional(),
  videoWatchPercentage: z.number().min(0).max(100).optional(),
  formInteraction: z.boolean().optional(),
  clickTracking: z.array(z.string()).optional(),
  minimumInteractions: z.number().optional(),
});

// Stage content types enum
export const stageContentTypeEnum = pgEnum('stage_content_type', [
  'video', 'pdf', 'infographic', 'quiz', 'assignment', 'reflection', 'text', 'interactive', 
  'multiple_choice', 'true_false', 'essay', 'short_answer', 'matching', 'fill_in_blank', 
  'numerical', 'ordering', 'drag_drop', 'hotspot', 'calculated', 'mp3'
]);

// Interaction types enum
export const interactionTypeEnum = pgEnum('interaction_type', [
  'scroll_completion', 'video_watch_percentage', 'form_interaction', 'time_spent', 'click_tracking'
]);

// Users table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default('student').notNull(),
  isActive: boolean("is_active").default(true),
  department: varchar("department"),
  specialization: text("specialization"),
  bio: text("bio"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Role permissions table
export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  role: userRoleEnum("role").notNull(),
  permission: permissionEnum("permission").notNull(),
  isGranted: boolean("is_granted").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User specific permissions (overrides)
export const userPermissions = pgTable("user_permissions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  permission: permissionEnum("permission").notNull(),
  isGranted: boolean("is_granted").notNull(),
  grantedBy: varchar("granted_by").references(() => users.id),
  reason: text("reason"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Learning modules
export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  competencies: text("competencies"),
  duration: integer("duration"), // in minutes
  isActive: boolean("is_active").default(true),
  difficultyLevel: varchar("difficulty_level", { length: 20 }).default('beginner'), // beginner, intermediate, advanced  
  learningTrack: varchar("learning_track", { length: 50 }).default('general'), // karakter, wisdom, compassion, general
  prerequisiteModules: jsonb("prerequisite_modules"), // array of module IDs that must be completed first
  pointsReward: integer("points_reward").default(50), // points awarded for module completion
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Module stages/steps
export const moduleStages = pgTable("module_stages", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").references(() => modules.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  content: text("content"), // JSON content for videos, PDFs, etc.
  orderIndex: integer("order_index").notNull(),
  minTimeMinutes: integer("min_time_minutes"), // minimum time to spend
  prerequisiteStageId: integer("prerequisite_stage_id"),
  isActive: boolean("is_active").default(true),
  stageType: varchar("stage_type", { length: 50 }).default('learning'), // learning, quiz, assignment, forum
  videoUrl: text("video_url"),
  fileUrl: text("file_url"),
  assignmentInstructions: text("assignment_instructions"),
  maxScore: integer("max_score"),
  difficultyLevel: varchar("difficulty_level", { length: 20 }).default('beginner'), // beginner, intermediate, advanced
  learningTrack: varchar("learning_track", { length: 50 }).default('general'), // karakter, wisdom, compassion, general
  pointsReward: integer("points_reward").default(10), // points awarded for completion
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Questions bank
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").references(() => modules.id).notNull(),
  stageId: integer("stage_id").references(() => moduleStages.id),
  questionType: questionTypeEnum("question_type").notNull(),
  questionText: text("question_text").notNull(),
  options: jsonb("options"), // For multiple choice, matching, ordering questions
  correctAnswer: text("correct_answer"), // Can be string, array, or object (stored as text for compatibility)
  explanation: text("explanation"), // Answer explanation
  points: integer("points").default(1),
  difficulty: varchar("difficulty", { length: 20 }).default('medium'), // easy, medium, hard
  tags: jsonb("tags"), // structured tags for better filtering
  metadata: jsonb("metadata"), // additional question metadata (tolerance for numerical, etc.)
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Quizzes
export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").references(() => modules.id).notNull(),
  stageId: integer("stage_id").references(() => moduleStages.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  timeLimit: integer("time_limit"), // in minutes
  passingScore: integer("passing_score").default(70),
  maxAttempts: integer("max_attempts").default(3),
  randomizeQuestions: boolean("randomize_questions").default(true),
  shuffleAnswers: boolean("shuffle_answers").default(true),
  oneQuestionPerPage: boolean("one_question_per_page").default(true),
  preventBackNavigation: boolean("prevent_back_navigation").default(true),
  showResultsImmediately: boolean("show_results_immediately").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Quiz questions relationship
export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").references(() => quizzes.id).notNull(),
  questionId: integer("question_id").references(() => questions.id).notNull(),
  orderIndex: integer("order_index"),
});

// Assignments
export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").references(() => modules.id).notNull(),
  stageId: integer("stage_id").references(() => moduleStages.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  instructions: text("instructions"),
  maxScore: integer("max_score").default(100),
  dueDate: timestamp("due_date"),
  rubric: jsonb("rubric"), // grading rubric
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User module enrollments
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  moduleId: integer("module_id").references(() => modules.id).notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  finalScore: decimal("final_score", { precision: 5, scale: 2 }),
});

// User stage progress
export const stageProgress = pgTable("stage_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  stageId: integer("stage_id").references(() => moduleStages.id).notNull(),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  timeSpent: integer("time_spent"), // in seconds
  interactionData: jsonb("interaction_data"), // scroll, video watch percentage, etc.
  validationMet: boolean("validation_met").default(false), // requirements satisfied
  lastActiveAt: timestamp("last_active_at").defaultNow(),
});

// Quiz attempts
export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  quizId: integer("quiz_id").references(() => quizzes.id).notNull(),
  score: decimal("score", { precision: 5, scale: 2 }),
  totalQuestions: integer("total_questions"),
  correctAnswers: integer("correct_answers"),
  startedAt: timestamp("started_at").defaultNow(),
  submittedAt: timestamp("submitted_at"),
  answers: jsonb("answers"), // user's answers
});

// Assignment submissions
export const assignmentSubmissions = pgTable("assignment_submissions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  assignmentId: integer("assignment_id").references(() => assignments.id).notNull(),
  content: text("content"),
  fileUrl: varchar("file_url"),
  score: decimal("score", { precision: 5, scale: 2 }),
  feedback: text("feedback"),
  gradedBy: varchar("graded_by").references(() => users.id),
  submittedAt: timestamp("submitted_at").defaultNow(),
  gradedAt: timestamp("graded_at"),
});

// Certificates
export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  moduleId: integer("module_id").references(() => modules.id).notNull(),
  certificateNumber: varchar("certificate_number").unique().notNull(),
  finalScore: decimal("final_score", { precision: 5, scale: 2 }),
  issuedAt: timestamp("issued_at").defaultNow(),
  verificationCode: varchar("verification_code").unique(),
  templateData: jsonb("template_data"), // logo, signature, etc.
});

// Forum discussions
export const forumTopics = pgTable("forum_topics", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").references(() => modules.id),
  stageId: integer("stage_id").references(() => moduleStages.id),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Forum replies
export const forumReplies = pgTable("forum_replies", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").references(() => forumTopics.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  enrollments: many(enrollments),
  stageProgress: many(stageProgress),
  quizAttempts: many(quizAttempts),
  assignmentSubmissions: many(assignmentSubmissions),
  certificates: many(certificates),
  forumTopics: many(forumTopics),
  forumReplies: many(forumReplies),
  userPermissions: many(userPermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  // No direct user relation needed for role permissions
}));

export const userPermissionsRelations = relations(userPermissions, ({ one }) => ({
  user: one(users, { fields: [userPermissions.userId], references: [users.id] }),
  grantedByUser: one(users, { fields: [userPermissions.grantedBy], references: [users.id] }),
}));

export const modulesRelations = relations(modules, ({ one, many }) => ({
  createdByUser: one(users, { fields: [modules.createdBy], references: [users.id] }),
  stages: many(moduleStages),
  questions: many(questions),
  quizzes: many(quizzes),
  assignments: many(assignments),
  enrollments: many(enrollments),
  certificates: many(certificates),
  forumTopics: many(forumTopics),
}));

export const moduleStagesRelations = relations(moduleStages, ({ one, many }) => ({
  module: one(modules, { fields: [moduleStages.moduleId], references: [modules.id] }),
  prerequisiteStage: one(moduleStages, { fields: [moduleStages.prerequisiteStageId], references: [moduleStages.id] }),
  questions: many(questions),
  quizzes: many(quizzes),
  assignments: many(assignments),
  stageProgress: many(stageProgress),
  forumTopics: many(forumTopics),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  module: one(modules, { fields: [questions.moduleId], references: [modules.id] }),
  stage: one(moduleStages, { fields: [questions.stageId], references: [moduleStages.id] }),
  quizQuestions: many(quizQuestions),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  module: one(modules, { fields: [quizzes.moduleId], references: [modules.id] }),
  stage: one(moduleStages, { fields: [quizzes.stageId], references: [moduleStages.id] }),
  quizQuestions: many(quizQuestions),
  attempts: many(quizAttempts),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, { fields: [enrollments.userId], references: [users.id] }),
  module: one(modules, { fields: [enrollments.moduleId], references: [modules.id] }),
}));

export const forumTopicsRelations = relations(forumTopics, ({ one, many }) => ({
  user: one(users, { fields: [forumTopics.userId], references: [users.id] }),
  module: one(modules, { fields: [forumTopics.moduleId], references: [modules.id] }),
  stage: one(moduleStages, { fields: [forumTopics.stageId], references: [moduleStages.id] }),
  replies: many(forumReplies),
}));

export const forumRepliesRelations = relations(forumReplies, ({ one }) => ({
  topic: one(forumTopics, { fields: [forumReplies.topicId], references: [forumTopics.id] }),
  user: one(users, { fields: [forumReplies.userId], references: [users.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
  id: true,
  createdAt: true,
});

export const insertUserPermissionSchema = createInsertSchema(userPermissions).omit({
  id: true,
  createdAt: true,
});

export const insertModuleSchema = createInsertSchema(modules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertModuleStageSchema = createInsertSchema(moduleStages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  createdAt: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  createdAt: true,
});

export const insertAssignmentSchema = createInsertSchema(assignments).omit({
  id: true,
  createdAt: true,
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  enrolledAt: true,
});

export const insertStageProgressSchema = createInsertSchema(stageProgress).omit({
  id: true,
  startedAt: true,
});

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({
  id: true,
  startedAt: true,
});

export const insertAssignmentSubmissionSchema = createInsertSchema(assignmentSubmissions).omit({
  id: true,
  submittedAt: true,
});

export const insertCertificateSchema = createInsertSchema(certificates).omit({
  id: true,
  issuedAt: true,
});

export const insertForumTopicSchema = createInsertSchema(forumTopics).omit({
  id: true,
  createdAt: true,
});

export const insertForumReplySchema = createInsertSchema(forumReplies).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type UserPermission = typeof userPermissions.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;
export type InsertUserPermission = z.infer<typeof insertUserPermissionSchema>;

// Role and Permission types
export type UserRole = 'super_admin' | 'teacher' | 'student';
export type PermissionType = 
  | 'manage_users' 
  | 'manage_modules' 
  | 'manage_content' 
  | 'manage_quizzes'
  | 'manage_assignments' 
  | 'grade_assignments' 
  | 'view_analytics' 
  | 'manage_certificates'
  | 'moderate_forums' 
  | 'manage_enrollments' 
  | 'system_settings' 
  | 'backup_data'
  | 'manage_quotes'
  | 'manage_website_settings';

// Default role permissions mapping
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, PermissionType[]> = {
  super_admin: [
    'manage_users', 'manage_modules', 'manage_content', 'manage_quizzes',
    'manage_assignments', 'grade_assignments', 'view_analytics', 'manage_certificates',
    'moderate_forums', 'manage_enrollments', 'system_settings', 'backup_data',
    'manage_quotes', 'manage_website_settings'
  ],
  teacher: [
    'manage_content', 'manage_quizzes', 'grade_assignments', 'view_analytics'
  ],
  student: []
};
export type InsertModule = z.infer<typeof insertModuleSchema>;
export type Module = typeof modules.$inferSelect;
export type InsertModuleStage = z.infer<typeof insertModuleStageSchema>;
export type ModuleStage = typeof moduleStages.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type Assignment = typeof assignments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Enrollment = typeof enrollments.$inferSelect;
export type InsertStageProgress = z.infer<typeof insertStageProgressSchema>;
export type StageProgress = typeof stageProgress.$inferSelect;
export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertAssignmentSubmission = z.infer<typeof insertAssignmentSubmissionSchema>;
export type AssignmentSubmission = typeof assignmentSubmissions.$inferSelect;
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Certificate = typeof certificates.$inferSelect;
export type InsertForumTopic = z.infer<typeof insertForumTopicSchema>;
export type ForumTopic = typeof forumTopics.$inferSelect;
export type InsertForumReply = z.infer<typeof insertForumReplySchema>;
export type ForumReply = typeof forumReplies.$inferSelect;

// Daily quotes/reflections table
export const dailyQuotes = pgTable("daily_quotes", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  author: varchar("author", { length: 255 }),
  category: varchar("category", { length: 100 }),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Website settings table
export const websiteSettings = pgTable("website_settings", {
  id: serial("id").primaryKey(),
  settingKey: varchar("setting_key", { length: 100 }).notNull().unique(),
  settingValue: text("setting_value"),
  settingType: varchar("setting_type", { length: 50 }).default('text'), // text, image, json, boolean
  description: text("description"),
  category: varchar("category", { length: 100 }).default('general'), // general, appearance, contact, footer
  isRequired: boolean("is_required").default(false),
  updatedBy: varchar("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Module assignments for teachers/instructors
export const moduleAssignments = pgTable("module_assignments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  moduleId: integer("module_id").references(() => modules.id).notNull(),
  assignedBy: varchar("assigned_by").references(() => users.id).notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
  isActive: boolean("is_active").default(true),
}, (table) => ({
  // Ensure one assignment per user per module
  uniqueUserModule: unique().on(table.userId, table.moduleId)
}));

// Insert schemas for new tables
export const insertDailyQuoteSchema = createInsertSchema(dailyQuotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWebsiteSettingSchema = createInsertSchema(websiteSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertModuleAssignmentSchema = createInsertSchema(moduleAssignments).omit({
  id: true,
  assignedAt: true,
});

// Type exports for new tables
export type InsertDailyQuote = z.infer<typeof insertDailyQuoteSchema>;
export type DailyQuote = typeof dailyQuotes.$inferSelect;
export type InsertWebsiteSetting = z.infer<typeof insertWebsiteSettingSchema>;
export type WebsiteSetting = typeof websiteSettings.$inferSelect;
export type InsertModuleAssignment = z.infer<typeof insertModuleAssignmentSchema>;
export type ModuleAssignment = typeof moduleAssignments.$inferSelect;

// Gamification Tables

// User points tracking
export const userPoints = pgTable("user_points", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  points: integer("points").default(0),
  totalPoints: integer("total_points").default(0), // lifetime total
  level: integer("level").default(1),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Badges/Achievements
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  iconUrl: varchar("icon_url"),
  type: varchar("type", { length: 50 }).notNull(), // completion, streak, points, special
  criteria: jsonb("criteria"), // requirements to earn badge
  pointsReward: integer("points_reward").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User earned badges
export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  badgeId: integer("badge_id").references(() => badges.id).notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
  progress: jsonb("progress"), // current progress toward badge
});

// Learning streaks
export const learningStreaks = pgTable("learning_streaks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActiveDate: timestamp("last_active_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Points transactions/history
export const pointsTransactions = pgTable("points_transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  points: integer("points").notNull(), // can be positive or negative
  type: varchar("type", { length: 50 }).notNull(), // stage_completion, module_completion, badge_earned, bonus
  sourceId: integer("source_id"), // ID of the stage/module/badge that generated points
  sourceType: varchar("source_type", { length: 50 }), // stage, module, badge, manual
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Gamification insert schemas
export const insertUserPointsSchema = createInsertSchema(userPoints).omit({
  id: true,
  lastUpdated: true,
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
  createdAt: true,
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({
  id: true,
  earnedAt: true,
});

export const insertLearningStreakSchema = createInsertSchema(learningStreaks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastActiveDate: true,
});

export const insertPointsTransactionSchema = createInsertSchema(pointsTransactions).omit({
  id: true,
  createdAt: true,
});

// Gamification type exports
export type InsertUserPoints = z.infer<typeof insertUserPointsSchema>;
export type UserPoints = typeof userPoints.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = typeof badges.$inferSelect;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;
export type InsertLearningStreak = z.infer<typeof insertLearningStreakSchema>;
export type LearningStreak = typeof learningStreaks.$inferSelect;
export type InsertPointsTransaction = z.infer<typeof insertPointsTransactionSchema>;
export type PointsTransaction = typeof pointsTransactions.$inferSelect;
