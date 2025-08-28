import {
  users,
  modules,
  moduleStages,
  questions,
  quizzes,
  assignments,
  enrollments,
  stageProgress,
  quizAttempts,
  assignmentSubmissions,
  certificates,
  forumTopics,
  forumReplies,
  rolePermissions,
  userPermissions,
  type User,
  type UpsertUser,
  type Module,
  type InsertModule,
  type ModuleStage,
  type InsertModuleStage,
  type Question,
  type InsertQuestion,
  type Quiz,
  type InsertQuiz,
  type Assignment,
  type InsertAssignment,
  type Enrollment,
  type InsertEnrollment,
  type StageProgress,
  type InsertStageProgress,
  type QuizAttempt,
  type InsertQuizAttempt,
  type AssignmentSubmission,
  type InsertAssignmentSubmission,
  type Certificate,
  type InsertCertificate,
  type ForumTopic,
  type InsertForumTopic,
  type ForumReply,
  type InsertForumReply,
  type RolePermission,
  type UserPermission,
  type InsertRolePermission,
  type InsertUserPermission,
  type UserRole,
  type PermissionType,
  DEFAULT_ROLE_PERMISSIONS,
  dailyQuotes,
  websiteSettings,
  moduleAssignments,
  type DailyQuote,
  type InsertDailyQuote,
  type WebsiteSetting,
  type InsertWebsiteSetting,
  type ModuleAssignment,
  type InsertModuleAssignment,
  userPoints,
  learningStreaks,
  pointsTransactions,
  type UserPoints,
  type LearningStreak,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, like, isNotNull } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByEmailFromAuth(email: string): Promise<User | undefined>;

  // Module operations
  getModules(): Promise<Module[]>;
  getModule(id: number): Promise<Module | undefined>;
  createModule(module: InsertModule): Promise<Module>;
  updateModule(id: number, module: Partial<InsertModule>): Promise<Module | undefined>;
  deleteModule(id: number): Promise<boolean>;

  // Module stage operations
  getModuleStages(moduleId: number): Promise<ModuleStage[]>;
  getAllStages(): Promise<ModuleStage[]>;
  getStageStatistics(): Promise<any>;
  getModuleStage(id: number): Promise<ModuleStage | undefined>;
  createModuleStage(stage: InsertModuleStage): Promise<ModuleStage>;
  updateModuleStage(id: number, stage: Partial<InsertModuleStage>): Promise<ModuleStage | undefined>;
  deleteModuleStage(id: number): Promise<boolean>;

  // Question operations
  getQuestions(moduleId?: number): Promise<Question[]>;
  getQuestion(id: number): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestion(id: number, question: Partial<InsertQuestion>): Promise<Question | undefined>;
  deleteQuestion(id: number): Promise<boolean>;

  // Quiz operations
  getQuizzes(moduleId?: number): Promise<Quiz[]>;
  getQuiz(id: number): Promise<Quiz | undefined>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  updateQuiz(id: number, quiz: Partial<InsertQuiz>): Promise<Quiz | undefined>;
  deleteQuiz(id: number): Promise<boolean>;

  // Assignment operations
  getAssignments(moduleId?: number): Promise<Assignment[]>;
  getAssignment(id: number): Promise<Assignment | undefined>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  updateAssignment(id: number, assignment: Partial<InsertAssignment>): Promise<Assignment | undefined>;
  deleteAssignment(id: number): Promise<boolean>;

  // Enrollment operations
  getUserEnrollments(userId: string): Promise<(Enrollment & { module: Module })[]>;
  getModuleEnrollments(moduleId: number): Promise<(Enrollment & { user: User })[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollment(id: number, enrollment: Partial<InsertEnrollment>): Promise<Enrollment | undefined>;

  // Progress tracking
  getUserStageProgress(userId: string, stageId: number): Promise<StageProgress | undefined>;
  getUserModuleProgress(userId: string, moduleId: number): Promise<StageProgress[]>;
  createStageProgress(progress: InsertStageProgress): Promise<StageProgress>;
  updateStageProgressById(id: number, progress: Partial<InsertStageProgress>): Promise<StageProgress | undefined>;

  // Quiz attempts
  getUserQuizAttempts(userId: string, quizId: number): Promise<QuizAttempt[]>;
  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  updateQuizAttempt(id: number, attempt: Partial<InsertQuizAttempt>): Promise<QuizAttempt | undefined>;

  // Assignment submissions
  getUserAssignmentSubmissions(userId: string, assignmentId: number): Promise<AssignmentSubmission[]>;
  getAssignmentSubmissions(assignmentId: number): Promise<(AssignmentSubmission & { user: User })[]>;
  createAssignmentSubmission(submission: InsertAssignmentSubmission): Promise<AssignmentSubmission>;
  updateAssignmentSubmission(id: number, submission: Partial<InsertAssignmentSubmission>): Promise<AssignmentSubmission | undefined>;

  // Certificates
  getUserCertificates(userId: string): Promise<Certificate[]>;
  getCertificateByNumber(certificateNumber: string): Promise<Certificate | undefined>;
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;

  // Forum operations
  getForumTopics(moduleId?: number, stageId?: number): Promise<(ForumTopic & { user: User, replyCount: number })[]>;
  getForumTopic(id: number): Promise<(ForumTopic & { user: User }) | undefined>;
  getForumReplies(topicId: number): Promise<(ForumReply & { user: User })[]>;
  createForumTopic(topic: InsertForumTopic): Promise<ForumTopic>;
  createForumReply(reply: InsertForumReply): Promise<ForumReply>;

  // Role and Permission operations
  getAllUsers(): Promise<User[]>;
  updateUserRole(userId: string, role: UserRole): Promise<User | undefined>;
  getRolePermissions(role: UserRole): Promise<RolePermission[]>;
  getUserPermissions(userId: string): Promise<UserPermission[]>;
  grantUserPermission(permission: InsertUserPermission): Promise<UserPermission>;
  revokeUserPermission(userId: string, permission: PermissionType): Promise<boolean>;
  checkUserPermission(userId: string, permission: PermissionType): Promise<boolean>;
  bulkUpdateRolePermissions(role: UserRole, permissions: PermissionType[]): Promise<void>;

  // Daily quotes operations
  getDailyQuotes(): Promise<DailyQuote[]>;
  getDailyQuote(id: number): Promise<DailyQuote | undefined>;
  createDailyQuote(quote: InsertDailyQuote): Promise<DailyQuote>;
  updateDailyQuote(id: number, quote: Partial<InsertDailyQuote>): Promise<DailyQuote | undefined>;
  deleteDailyQuote(id: number): Promise<boolean>;
  getRandomActiveQuote(): Promise<DailyQuote | undefined>;

  // Website settings operations
  getWebsiteSettings(): Promise<WebsiteSetting[]>;
  getWebsiteSetting(key: string): Promise<WebsiteSetting | undefined>;
  getWebsiteSettingsByCategory(category: string): Promise<WebsiteSetting[]>;
  updateWebsiteSetting(key: string, setting: Partial<InsertWebsiteSetting>): Promise<WebsiteSetting | undefined>;
  createWebsiteSetting(setting: InsertWebsiteSetting): Promise<WebsiteSetting>;

  // System settings
  getSystemSettings(): Promise<Record<string, any>>;
  updateSystemSettings(settings: Record<string, any>, userId: string): Promise<void>;

  // Module assignments
  assignModuleToUser(assignment: InsertModuleAssignment): Promise<ModuleAssignment>;
  getUserModuleAssignments(userId: string): Promise<ModuleAssignment[]>;
  getModuleAssignments(moduleId: number): Promise<ModuleAssignment[]>;
  getTeacherInstructorModules(userId: string): Promise<Module[]>;
  removeModuleAssignment(userId: string, moduleId: number): Promise<boolean>;
  getAllModuleAssignments(): Promise<(ModuleAssignment & { user: User; module: Module })[]>;
}

export class DatabaseStorage implements IStorage {
  
  // Gamification methods
  async getUserPoints(userId: string): Promise<UserPoints | undefined> {
    const [points] = await db
      .select()
      .from(userPoints)
      .where(eq(userPoints.userId, userId));
    return points;
  }

  async updateUserPoints(userId: string, pointsToAdd: number, type: string, sourceId?: number, sourceType?: string, description?: string): Promise<UserPoints> {
    // Get or create user points record
    let userPointsRecord = await this.getUserPoints(userId);
    
    if (!userPointsRecord) {
      // Create new points record
      const [newRecord] = await db
        .insert(userPoints)
        .values({
          userId,
          points: pointsToAdd,
          totalPoints: pointsToAdd,
          level: 1,
        })
        .returning();
      userPointsRecord = newRecord;
    } else {
      // Update existing record
      const newPoints = (userPointsRecord.points || 0) + pointsToAdd;
      const newTotalPoints = (userPointsRecord.totalPoints || 0) + pointsToAdd;
      const newLevel = Math.floor(newTotalPoints / 100) + 1; // Level up every 100 points
      
      const [updated] = await db
        .update(userPoints)
        .set({
          points: newPoints,
          totalPoints: newTotalPoints,
          level: newLevel,
          lastUpdated: new Date(),
        })
        .where(eq(userPoints.userId, userId))
        .returning();
      userPointsRecord = updated;
    }

    // Record the transaction
    await db.insert(pointsTransactions).values({
      userId,
      points: pointsToAdd,
      type,
      sourceId,
      sourceType,
      description,
    });

    return userPointsRecord;
  }

  async getUserLearningStreak(userId: string): Promise<LearningStreak | undefined> {
    const [streak] = await db
      .select()
      .from(learningStreaks)
      .where(eq(learningStreaks.userId, userId));
    return streak;
  }

  async updateLearningStreak(userId: string): Promise<LearningStreak> {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    let streakRecord = await this.getUserLearningStreak(userId);
    
    if (!streakRecord) {
      // Create new streak record
      const [newRecord] = await db
        .insert(learningStreaks)
        .values({
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: today,
        })
        .returning();
      return newRecord;
    }

    const lastActiveString = streakRecord.lastActiveDate?.toISOString().split('T')[0];
    
    if (lastActiveString === todayString) {
      // Already updated today, no change
      return streakRecord;
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    let newCurrentStreak: number;
    
    if (lastActiveString === yesterdayString) {
      // Continue streak
      newCurrentStreak = (streakRecord.currentStreak || 0) + 1;
    } else {
      // Reset streak
      newCurrentStreak = 1;
    }

    const newLongestStreak = Math.max(streakRecord.longestStreak || 0, newCurrentStreak);

    const [updated] = await db
      .update(learningStreaks)
      .set({
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastActiveDate: today,
        updatedAt: new Date(),
      })
      .where(eq(learningStreaks.userId, userId))
      .returning();

    return updated;
  }

  async getLeaderboard(limit: number = 10) {
    return await db
      .select({
        id: userPoints.id,
        userId: userPoints.userId,
        points: userPoints.points,
        totalPoints: userPoints.totalPoints,
        level: userPoints.level,
        lastUpdated: userPoints.lastUpdated,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(userPoints)
      .leftJoin(users, eq(userPoints.userId, users.id))
      .orderBy(sql`${userPoints.totalPoints} DESC`)
      .limit(limit);
  }
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    const allUsers = await db.select().from(users).orderBy(users.createdAt);
    return allUsers;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByEmailFromAuth(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  // Module operations
  async getModules(): Promise<Module[]> {
    return await db.select().from(modules).where(eq(modules.isActive, true)).orderBy(desc(modules.createdAt));
  }

  async getModule(id: number): Promise<Module | undefined> {
    const [module] = await db.select().from(modules).where(eq(modules.id, id));
    return module;
  }

  async createModule(module: InsertModule): Promise<Module> {
    const [newModule] = await db.insert(modules).values(module).returning();
    return newModule;
  }

  async updateModule(id: number, module: Partial<InsertModule>): Promise<Module | undefined> {
    const [updatedModule] = await db
      .update(modules)
      .set({ ...module, updatedAt: new Date() })
      .where(eq(modules.id, id))
      .returning();
    return updatedModule;
  }

  async deleteModule(id: number): Promise<boolean> {
    const result = await db.update(modules).set({ isActive: false }).where(eq(modules.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Module stage operations
  async getModuleStages(moduleId: number): Promise<ModuleStage[]> {
    const stages = await db
      .select()
      .from(moduleStages)
      .where(and(eq(moduleStages.moduleId, moduleId), eq(moduleStages.isActive, true)))
      .orderBy(moduleStages.orderIndex);
    return stages as ModuleStage[];
  }

  async getAllStages(): Promise<ModuleStage[]> {
    const stages = await db
      .select()
      .from(moduleStages)
      .orderBy(moduleStages.moduleId, moduleStages.orderIndex);
    return stages as ModuleStage[];
  }

  // Analytics and statistics operations
  async getAnalyticsOverview(): Promise<any> {
    try {
      // Get user statistics
      const totalUsers = await db
        .select({ count: sql<number>`count(*)`.as('count') })
        .from(users);

      const usersByRole = await db
        .select({
          role: users.role,
          count: sql<number>`count(*)`.as('count')
        })
        .from(users)
        .groupBy(users.role);

      // Get module statistics
      const totalModules = await db
        .select({ count: sql<number>`count(*)`.as('count') })
        .from(modules)
        .where(eq(modules.isActive, true));

      // Get enrollment statistics
      const totalEnrollments = await db
        .select({ count: sql<number>`count(*)`.as('count') })
        .from(enrollments);

      const completedEnrollments = await db
        .select({ count: sql<number>`count(*)`.as('count') })
        .from(enrollments)
        .where(isNotNull(enrollments.completedAt));

      // Get certificate statistics
      const totalCertificates = await db
        .select({ count: sql<number>`count(*)`.as('count') })
        .from(certificates);

      // Get top performing modules by enrollment
      const topModulesByEnrollment = await db
        .select({
          moduleId: enrollments.moduleId,
          title: modules.title,
          count: sql<number>`count(*)`.as('count')
        })
        .from(enrollments)
        .leftJoin(modules, eq(enrollments.moduleId, modules.id))
        .where(eq(modules.isActive, true))
        .groupBy(enrollments.moduleId, modules.title)
        .orderBy(sql`count(*) DESC`)
        .limit(5);

      // Get monthly enrollment trends (last 6 months)
      const monthlyEnrollments = await db
        .select({
          month: sql<string>`TO_CHAR(${enrollments.enrolledAt}, 'Mon')`.as('month'),
          count: sql<number>`count(*)`.as('count')
        })
        .from(enrollments)
        .where(sql`${enrollments.enrolledAt} >= NOW() - INTERVAL '6 months'`)
        .groupBy(sql`TO_CHAR(${enrollments.enrolledAt}, 'Mon')`, sql`EXTRACT(month FROM ${enrollments.enrolledAt})`)
        .orderBy(sql`EXTRACT(month FROM ${enrollments.enrolledAt})`);

      // Calculate completion rate
      const completionRate = totalEnrollments[0].count > 0 
        ? Math.round((completedEnrollments[0].count / totalEnrollments[0].count) * 100)
        : 0;

      // Estimate active users (users with enrollments in last 30 days)
      const activeUsers = await db
        .select({ count: sql<number>`count(DISTINCT ${enrollments.userId})`.as('count') })
        .from(enrollments)
        .where(sql`${enrollments.enrolledAt} >= NOW() - INTERVAL '30 days'`);

      return {
        totalUsers: totalUsers[0].count,
        activeUsers: activeUsers[0].count,
        totalModules: totalModules[0].count,
        totalEnrollments: totalEnrollments[0].count,
        completedCertificates: totalCertificates[0].count,
        averageCompletion: completionRate,
        usersByRole: usersByRole.map(u => ({
          role: u.role === 'super_admin' ? 'Super Admin' : 
               u.role === 'teacher' ? 'Guru' :
               u.role === 'student' ? 'Siswa' : u.role,
          count: u.count
        })),
        topModules: topModulesByEnrollment.map(m => ({
          name: m.title,
          enrollments: m.count,
          completion: Math.round(Math.random() * 30 + 70) // TODO: Calculate real completion rate
        })),
        monthlyEnrollments: monthlyEnrollments.map(m => ({
          month: m.month,
          count: m.count
        }))
      };
    } catch (error) {
      console.error('Error getting analytics overview:', error);
      throw error;
    }
  }

  async getStageStatistics(): Promise<any> {
    // Get total counts
    const totalStages = await db
      .select({ count: sql<number>`count(*)`.as('count') })
      .from(moduleStages);
    
    const activeStages = await db
      .select({ count: sql<number>`count(*)`.as('count') })
      .from(moduleStages)
      .where(eq(moduleStages.isActive, true));
    
    const inactiveStages = await db
      .select({ count: sql<number>`count(*)`.as('count') })
      .from(moduleStages)
      .where(eq(moduleStages.isActive, false));

    // Get content type distribution
    const contentTypes = await db
      .select({
        content: moduleStages.content,
      })
      .from(moduleStages);

    return {
      total: totalStages[0]?.count || 0,
      active: activeStages[0]?.count || 0,
      inactive: inactiveStages[0]?.count || 0,
      contentTypes: contentTypes,
    };
  }

  async getModuleStage(id: number): Promise<ModuleStage | undefined> {
    const [stage] = await db.select().from(moduleStages).where(eq(moduleStages.id, id));
    return stage as ModuleStage | undefined;
  }

  async createModuleStage(stage: InsertModuleStage): Promise<ModuleStage> {
    const result = await db.insert(moduleStages).values(stage).returning();
    const stages = Array.isArray(result) ? result : [result];
    return stages[0] as ModuleStage;
  }

  async updateModuleStage(id: number, stage: Partial<InsertModuleStage>): Promise<ModuleStage | undefined> {
    const [updatedStage] = await db
      .update(moduleStages)
      .set({ ...stage, updatedAt: new Date() })
      .where(eq(moduleStages.id, id))
      .returning();
    return updatedStage as ModuleStage | undefined;
  }

  async deleteModuleStage(id: number): Promise<boolean> {
    const result = await db.update(moduleStages).set({ isActive: false }).where(eq(moduleStages.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Question operations
  async getQuestions(moduleId?: number): Promise<Question[]> {
    if (moduleId) {
      return await db.select().from(questions)
        .where(and(eq(questions.isActive, true), eq(questions.moduleId, moduleId)))
        .orderBy(desc(questions.createdAt));
    }
    
    return await db.select().from(questions)
      .where(eq(questions.isActive, true))
      .orderBy(desc(questions.createdAt));
  }

  async getQuestion(id: number): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question;
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const [newQuestion] = await db.insert(questions).values(question).returning();
    return newQuestion;
  }

  async updateQuestion(id: number, question: Partial<InsertQuestion>): Promise<Question | undefined> {
    const [updatedQuestion] = await db
      .update(questions)
      .set(question)
      .where(eq(questions.id, id))
      .returning();
    return updatedQuestion;
  }

  async deleteQuestion(id: number): Promise<boolean> {
    const result = await db.update(questions).set({ isActive: false }).where(eq(questions.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Get questions for a specific stage
  async getStageQuestions(stageId: number): Promise<Question[]> {
    return await db.select().from(questions)
      .where(and(eq(questions.stageId, stageId), eq(questions.isActive, true)))
      .orderBy(questions.createdAt);
  }

  // Delete all questions for a stage
  async deleteStageQuestions(stageId: number): Promise<boolean> {
    const result = await db.update(questions)
      .set({ isActive: false })
      .where(eq(questions.stageId, stageId));
    return result.rowCount !== null && result.rowCount >= 0;
  }

  // Quiz operations
  async getQuizzes(moduleId?: number): Promise<Quiz[]> {
    if (moduleId) {
      return await db.select().from(quizzes)
        .where(and(eq(quizzes.isActive, true), eq(quizzes.moduleId, moduleId)))
        .orderBy(desc(quizzes.createdAt));
    }
    
    return await db.select().from(quizzes)
      .where(eq(quizzes.isActive, true))
      .orderBy(desc(quizzes.createdAt));
  }

  async getQuiz(id: number): Promise<Quiz | undefined> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz;
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const [newQuiz] = await db.insert(quizzes).values(quiz).returning();
    return newQuiz;
  }

  async updateQuiz(id: number, quiz: Partial<InsertQuiz>): Promise<Quiz | undefined> {
    const [updatedQuiz] = await db
      .update(quizzes)
      .set(quiz)
      .where(eq(quizzes.id, id))
      .returning();
    return updatedQuiz;
  }

  async deleteQuiz(id: number): Promise<boolean> {
    const result = await db.update(quizzes).set({ isActive: false }).where(eq(quizzes.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Assignment operations
  async getAssignments(moduleId?: number): Promise<Assignment[]> {
    if (moduleId) {
      return await db.select().from(assignments)
        .where(and(eq(assignments.isActive, true), eq(assignments.moduleId, moduleId)))
        .orderBy(desc(assignments.createdAt));
    }
    
    return await db.select().from(assignments)
      .where(eq(assignments.isActive, true))
      .orderBy(desc(assignments.createdAt));
  }

  async getAssignment(id: number): Promise<Assignment | undefined> {
    const [assignment] = await db.select().from(assignments).where(eq(assignments.id, id));
    return assignment;
  }

  async createAssignment(assignment: InsertAssignment): Promise<Assignment> {
    const [newAssignment] = await db.insert(assignments).values(assignment).returning();
    return newAssignment;
  }

  async updateAssignment(id: number, assignment: Partial<InsertAssignment>): Promise<Assignment | undefined> {
    const [updatedAssignment] = await db
      .update(assignments)
      .set(assignment)
      .where(eq(assignments.id, id))
      .returning();
    return updatedAssignment;
  }

  async deleteAssignment(id: number): Promise<boolean> {
    const result = await db.update(assignments).set({ isActive: false }).where(eq(assignments.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Enrollment operations
  async getUserEnrollments(userId: string): Promise<(Enrollment & { module: Module })[]> {
    return await db
      .select({
        id: enrollments.id,
        userId: enrollments.userId,
        moduleId: enrollments.moduleId,
        enrolledAt: enrollments.enrolledAt,
        completedAt: enrollments.completedAt,
        finalScore: enrollments.finalScore,
        module: modules,
      })
      .from(enrollments)
      .innerJoin(modules, eq(enrollments.moduleId, modules.id))
      .where(eq(enrollments.userId, userId))
      .orderBy(desc(enrollments.enrolledAt));
  }

  async getModuleEnrollments(moduleId: number): Promise<(Enrollment & { user: User })[]> {
    return await db
      .select({
        id: enrollments.id,
        userId: enrollments.userId,
        moduleId: enrollments.moduleId,
        enrolledAt: enrollments.enrolledAt,
        completedAt: enrollments.completedAt,
        finalScore: enrollments.finalScore,
        user: users,
      })
      .from(enrollments)
      .innerJoin(users, eq(enrollments.userId, users.id))
      .where(eq(enrollments.moduleId, moduleId))
      .orderBy(desc(enrollments.enrolledAt));
  }

  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const [newEnrollment] = await db.insert(enrollments).values(enrollment).returning();
    return newEnrollment;
  }

  async updateEnrollment(id: number, enrollment: Partial<InsertEnrollment>): Promise<Enrollment | undefined> {
    const [updatedEnrollment] = await db
      .update(enrollments)
      .set(enrollment)
      .where(eq(enrollments.id, id))
      .returning();
    return updatedEnrollment;
  }

  // Progress tracking
  async getUserStageProgress(userId: string, stageId: number): Promise<StageProgress | undefined> {
    const [progress] = await db
      .select()
      .from(stageProgress)
      .where(and(eq(stageProgress.userId, userId), eq(stageProgress.stageId, stageId)));
    return progress;
  }

  async getUserModuleProgress(userId: string, moduleId: number): Promise<StageProgress[]> {
    return await db
      .select({
        id: stageProgress.id,
        userId: stageProgress.userId,
        stageId: stageProgress.stageId,
        startedAt: stageProgress.startedAt,
        completedAt: stageProgress.completedAt,
        timeSpent: stageProgress.timeSpent,
        interactionData: stageProgress.interactionData,
        validationMet: stageProgress.validationMet,
        lastActiveAt: stageProgress.lastActiveAt,
      })
      .from(stageProgress)
      .innerJoin(moduleStages, eq(stageProgress.stageId, moduleStages.id))
      .where(and(eq(stageProgress.userId, userId), eq(moduleStages.moduleId, moduleId)));
  }

  async createStageProgress(progress: InsertStageProgress): Promise<StageProgress> {
    const [newProgress] = await db.insert(stageProgress).values(progress).returning();
    return newProgress;
  }

  async updateStageProgressById(id: number, progress: Partial<InsertStageProgress>): Promise<StageProgress | undefined> {
    const [updatedProgress] = await db
      .update(stageProgress)
      .set(progress)
      .where(eq(stageProgress.id, id))
      .returning();
    return updatedProgress;
  }

  // Quiz attempts
  async getUserQuizAttempts(userId: string, quizId: number): Promise<QuizAttempt[]> {
    return await db
      .select()
      .from(quizAttempts)
      .where(and(eq(quizAttempts.userId, userId), eq(quizAttempts.quizId, quizId)))
      .orderBy(desc(quizAttempts.startedAt));
  }

  async createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const [newAttempt] = await db.insert(quizAttempts).values(attempt).returning();
    return newAttempt;
  }

  async updateQuizAttempt(id: number, attempt: Partial<InsertQuizAttempt>): Promise<QuizAttempt | undefined> {
    const [updatedAttempt] = await db
      .update(quizAttempts)
      .set(attempt)
      .where(eq(quizAttempts.id, id))
      .returning();
    return updatedAttempt;
  }

  // Assignment submissions
  async getUserAssignmentSubmissions(userId: string, assignmentId: number): Promise<AssignmentSubmission[]> {
    return await db
      .select()
      .from(assignmentSubmissions)
      .where(and(eq(assignmentSubmissions.userId, userId), eq(assignmentSubmissions.assignmentId, assignmentId)))
      .orderBy(desc(assignmentSubmissions.submittedAt));
  }

  async getAssignmentSubmissions(assignmentId: number): Promise<(AssignmentSubmission & { user: User })[]> {
    return await db
      .select({
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
        user: users,
      })
      .from(assignmentSubmissions)
      .innerJoin(users, eq(assignmentSubmissions.userId, users.id))
      .where(eq(assignmentSubmissions.assignmentId, assignmentId))
      .orderBy(desc(assignmentSubmissions.submittedAt));
  }

  async createAssignmentSubmission(submission: InsertAssignmentSubmission): Promise<AssignmentSubmission> {
    const [newSubmission] = await db.insert(assignmentSubmissions).values(submission).returning();
    return newSubmission;
  }

  async updateAssignmentSubmission(id: number, submission: Partial<InsertAssignmentSubmission>): Promise<AssignmentSubmission | undefined> {
    const [updatedSubmission] = await db
      .update(assignmentSubmissions)
      .set(submission)
      .where(eq(assignmentSubmissions.id, id))
      .returning();
    return updatedSubmission;
  }

  // Certificates
  async getUserCertificates(userId: string): Promise<Certificate[]> {
    return await db
      .select()
      .from(certificates)
      .where(eq(certificates.userId, userId))
      .orderBy(desc(certificates.issuedAt));
  }

  async getCertificateByNumber(certificateNumber: string): Promise<Certificate | undefined> {
    const [certificate] = await db
      .select()
      .from(certificates)
      .where(eq(certificates.certificateNumber, certificateNumber));
    return certificate;
  }

  async createCertificate(certificate: InsertCertificate): Promise<Certificate> {
    const [newCertificate] = await db.insert(certificates).values(certificate).returning();
    return newCertificate;
  }

  // Forum operations
  async getForumTopics(moduleId?: number, stageId?: number): Promise<(ForumTopic & { user: User, replyCount: number })[]> {
    const conditions = [eq(forumTopics.isActive, true)];
    
    if (moduleId) {
      conditions.push(eq(forumTopics.moduleId, moduleId));
    }
    
    if (stageId) {
      conditions.push(eq(forumTopics.stageId, stageId));
    }

    return await db
      .select({
        id: forumTopics.id,
        moduleId: forumTopics.moduleId,
        stageId: forumTopics.stageId,
        userId: forumTopics.userId,
        title: forumTopics.title,
        content: forumTopics.content,
        isActive: forumTopics.isActive,
        createdAt: forumTopics.createdAt,
        user: users,
        replyCount: sql<number>`COUNT(${forumReplies.id})`,
      })
      .from(forumTopics)
      .leftJoin(forumReplies, eq(forumTopics.id, forumReplies.topicId))
      .innerJoin(users, eq(forumTopics.userId, users.id))
      .where(and(...conditions))
      .groupBy(forumTopics.id, users.id)
      .orderBy(desc(forumTopics.createdAt));
  }

  async getForumTopic(id: number): Promise<(ForumTopic & { user: User }) | undefined> {
    const [topic] = await db
      .select({
        id: forumTopics.id,
        moduleId: forumTopics.moduleId,
        stageId: forumTopics.stageId,
        userId: forumTopics.userId,
        title: forumTopics.title,
        content: forumTopics.content,
        isActive: forumTopics.isActive,
        createdAt: forumTopics.createdAt,
        user: users,
      })
      .from(forumTopics)
      .innerJoin(users, eq(forumTopics.userId, users.id))
      .where(eq(forumTopics.id, id));
    return topic;
  }

  async getForumReplies(topicId: number): Promise<(ForumReply & { user: User })[]> {
    return await db
      .select({
        id: forumReplies.id,
        topicId: forumReplies.topicId,
        userId: forumReplies.userId,
        content: forumReplies.content,
        createdAt: forumReplies.createdAt,
        user: users,
      })
      .from(forumReplies)
      .innerJoin(users, eq(forumReplies.userId, users.id))
      .where(eq(forumReplies.topicId, topicId))
      .orderBy(forumReplies.createdAt);
  }

  async createForumTopic(topic: InsertForumTopic): Promise<ForumTopic> {
    const [newTopic] = await db.insert(forumTopics).values(topic).returning();
    return newTopic;
  }

  async createForumReply(reply: InsertForumReply): Promise<ForumReply> {
    const [newReply] = await db.insert(forumReplies).values(reply).returning();
    return newReply;
  }

  // Role and Permission operations
  async deleteUser(userId: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, userId));
    return (result.rowCount ?? 0) > 0;
  }

  async updateUserRole(userId: string, role: UserRole): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async updateUserProfile(userId: string, data: { firstName?: string; lastName?: string }): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async getRolePermissions(role: UserRole): Promise<RolePermission[]> {
    return await db
      .select()
      .from(rolePermissions)
      .where(eq(rolePermissions.role, role));
  }

  async updateRolePermissions(role: UserRole, permissions: string[]): Promise<void> {
    // Clear existing permissions for the role
    await db.delete(rolePermissions).where(eq(rolePermissions.role, role));
    
    // Insert new permissions
    if (permissions.length > 0) {
      const permissionData = permissions.map(permission => ({
        role,
        permission: permission as PermissionType,
        isGranted: true
      }));
      
      await db.insert(rolePermissions).values(permissionData);
    }
  }

  async getUserPermissions(userId: string): Promise<UserPermission[]> {
    return await db
      .select()
      .from(userPermissions)
      .where(eq(userPermissions.userId, userId));
  }

  async grantUserPermission(permission: InsertUserPermission): Promise<UserPermission> {
    const [newPermission] = await db
      .insert(userPermissions)
      .values(permission)
      .returning();
    return newPermission;
  }

  async revokeUserPermission(userId: string, permission: PermissionType): Promise<boolean> {
    const result = await db
      .delete(userPermissions)
      .where(and(
        eq(userPermissions.userId, userId),
        eq(userPermissions.permission, permission)
      ));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async checkUserPermission(userId: string, permission: PermissionType): Promise<boolean> {
    // First get the user to check their role
    const user = await this.getUser(userId);
    if (!user) return false;

    // Check role-based permissions
    const rolePerms = await db
      .select()
      .from(rolePermissions)
      .where(and(
        eq(rolePermissions.role, user.role),
        eq(rolePermissions.permission, permission),
        eq(rolePermissions.isGranted, true)
      ));

    // If role has permission, check for user-specific overrides
    if (rolePerms.length > 0) {
      const userOverride = await db
        .select()
        .from(userPermissions)
        .where(and(
          eq(userPermissions.userId, userId),
          eq(userPermissions.permission, permission)
        ));

      // If no override, role permission applies
      if (userOverride.length === 0) return true;

      // If there's an override, use that value
      return userOverride[0].isGranted;
    }

    // Role doesn't have permission, check if user has specific grant
    const userPerm = await db
      .select()
      .from(userPermissions)
      .where(and(
        eq(userPermissions.userId, userId),
        eq(userPermissions.permission, permission),
        eq(userPermissions.isGranted, true)
      ));

    return userPerm.length > 0;
  }

  async bulkUpdateRolePermissions(role: UserRole, permissions: PermissionType[]): Promise<void> {
    // First, remove all existing permissions for this role
    await db.delete(rolePermissions).where(eq(rolePermissions.role, role));

    // Then, insert the new permissions
    if (permissions.length > 0) {
      const permissionValues = permissions.map(permission => ({
        role,
        permission,
        isGranted: true,
      }));

      await db.insert(rolePermissions).values(permissionValues);
    }
  }
  // Enhanced stage progress operations
  async updateStageProgress(progressData: InsertStageProgress): Promise<StageProgress> {
    const existing = await this.getUserStageProgress(progressData.userId, progressData.stageId);
    
    if (existing) {
      const [updated] = await db
        .update(stageProgress)
        .set({
          ...progressData,
          lastActiveAt: new Date(),
        })
        .where(and(
          eq(stageProgress.userId, progressData.userId),
          eq(stageProgress.stageId, progressData.stageId)
        ))
        .returning();
      return updated;
    } else {
      const [newProgress] = await db.insert(stageProgress).values({
        ...progressData,
        lastActiveAt: new Date(),
      }).returning();
      return newProgress;
    }
  }

  async completeStage(userId: string, stageId: number): Promise<StageProgress> {
    const existing = await this.getUserStageProgress(userId, stageId);
    
    let progress: StageProgress;
    
    if (existing) {
      const [updated] = await db
        .update(stageProgress)
        .set({
          completedAt: new Date(),
          validationMet: true,
          lastActiveAt: new Date(),
        })
        .where(and(
          eq(stageProgress.userId, userId),
          eq(stageProgress.stageId, stageId)
        ))
        .returning();
      progress = updated;
    } else {
      const [newProgress] = await db.insert(stageProgress).values({
        userId,
        stageId,
        completedAt: new Date(),
        validationMet: true,
        timeSpent: 0,
        lastActiveAt: new Date(),
      }).returning();
      progress = newProgress;
    }

    // Award points for stage completion
    const stage = await this.getModuleStage(stageId);
    if (stage && stage.pointsReward) {
      await this.updateUserPoints(
        userId,
        stage.pointsReward,
        'stage_completion',
        stageId,
        'stage',
        `Completed stage: ${stage.title}`
      );
    }

    // Update learning streak
    await this.updateLearningStreak(userId);

    return progress;
  }

  async validateStageInteraction(userId: string, stageId: number, interactionData: any): Promise<boolean> {
    // Get stage requirements
    const stage = await this.getModuleStage(stageId);
    if (!stage || !stage.content) {
      return true; // No requirements means validation passes
    }

    // Parse content to get interaction requirements
    let requirements: any = {};
    try {
      const content = JSON.parse(stage.content);
      requirements = content.interactionRequirements || {};
    } catch {
      return true; // Invalid JSON means no requirements
    }
    
    // Check scroll completion
    if (requirements.scrollCompletion && 
        (!interactionData.scrollPercentage || interactionData.scrollPercentage < requirements.scrollCompletion)) {
      return false;
    }
    
    // Check video watch percentage
    if (requirements.videoWatchPercentage && 
        (!interactionData.videoWatchPercentage || interactionData.videoWatchPercentage < requirements.videoWatchPercentage)) {
      return false;
    }
    
    // Check form interaction
    if (requirements.formInteraction && !interactionData.formInteracted) {
      return false;
    }
    
    return true;
  }

  // Daily quotes operations
  async getDailyQuotes(): Promise<DailyQuote[]> {
    return await db.select().from(dailyQuotes).orderBy(desc(dailyQuotes.displayOrder), desc(dailyQuotes.createdAt));
  }

  async getDailyQuote(id: number): Promise<DailyQuote | undefined> {
    const [quote] = await db.select().from(dailyQuotes).where(eq(dailyQuotes.id, id));
    return quote;
  }

  async createDailyQuote(quote: InsertDailyQuote): Promise<DailyQuote> {
    const [newQuote] = await db.insert(dailyQuotes).values(quote).returning();
    return newQuote;
  }

  async updateDailyQuote(id: number, quote: Partial<InsertDailyQuote>): Promise<DailyQuote | undefined> {
    const [updatedQuote] = await db
      .update(dailyQuotes)
      .set({ ...quote, updatedAt: new Date() })
      .where(eq(dailyQuotes.id, id))
      .returning();
    return updatedQuote;
  }

  async deleteDailyQuote(id: number): Promise<boolean> {
    const result = await db.delete(dailyQuotes).where(eq(dailyQuotes.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getRandomActiveQuote(): Promise<DailyQuote | undefined> {
    const activeQuotes = await db
      .select()
      .from(dailyQuotes)
      .where(eq(dailyQuotes.isActive, true));
    
    if (activeQuotes.length === 0) return undefined;
    
    const randomIndex = Math.floor(Math.random() * activeQuotes.length);
    return activeQuotes[randomIndex];
  }

  // Website settings operations
  async getWebsiteSettings(): Promise<WebsiteSetting[]> {
    return await db.select().from(websiteSettings).orderBy(websiteSettings.category, websiteSettings.settingKey);
  }

  async getWebsiteSetting(key: string): Promise<WebsiteSetting | undefined> {
    const [setting] = await db.select().from(websiteSettings).where(eq(websiteSettings.settingKey, key));
    return setting;
  }

  async getWebsiteSettingsByCategory(category: string): Promise<WebsiteSetting[]> {
    return await db.select().from(websiteSettings).where(eq(websiteSettings.category, category));
  }

  async updateWebsiteSetting(key: string, setting: Partial<InsertWebsiteSetting>): Promise<WebsiteSetting | undefined> {
    const [updatedSetting] = await db
      .update(websiteSettings)
      .set({ ...setting, updatedAt: new Date() })
      .where(eq(websiteSettings.settingKey, key))
      .returning();
    return updatedSetting;
  }

  async createWebsiteSetting(setting: InsertWebsiteSetting): Promise<WebsiteSetting> {
    const [newSetting] = await db.insert(websiteSettings).values(setting).returning();
    return newSetting;
  }

  // System Settings methods
  async getSystemSettings(): Promise<Record<string, any>> {
    try {
      const settings = await db
        .select()
        .from(websiteSettings)
        .where(eq(websiteSettings.category, 'system'));

      // Convert array of settings to object with default values
      const defaultSettings = {
        maintenanceMode: false,
        maxFileSize: 10,
        sessionTimeout: 60,
        emailNotifications: true,
        systemName: "Sekolah Cinta Kasih Tzu Chi",
        maxUsers: 1000,
        backupEnabled: true,
        debugMode: false,
        defaultLanguage: "id",
        systemDescription: "Platform pembelajaran humanistik untuk pengembangan karakter dan nilai-nilai kebaikan",
        websiteName: "Sekolah Cinta Kasih Tzu Chi",
        websiteDescription: "Platform pembelajaran humanistik untuk mengembangkan karakter mulia",
        contactEmail: "info@cintakasihtzuchi.sch.id",
        contactPhone: "+62 21 1234567",
        contactAddress: "Jakarta, Indonesia",
        footerText: "© 2024 Sekolah Cinta Kasih Tzu Chi. All rights reserved.",
        logoUrl: "",
        faviconUrl: "",
        autoEnrollment: true,
        certificateEnabled: true,
        forumEnabled: true,
        maxQuizAttempts: 3,
        passingScore: 70,
        allowGuestAccess: false
      };

      // Override defaults with database values
      const settingsObject: Record<string, any> = { ...defaultSettings };
      settings.forEach(setting => {
        let value: any = setting.settingValue;
        
        // Parse boolean and number values
        if (setting.settingType === 'boolean') {
          value = value === 'true';
        } else if (setting.settingType === 'number') {
          value = parseInt(value || '0');
        }
        
        settingsObject[setting.settingKey] = value;
      });

      return settingsObject;
    } catch (error) {
      console.error("Error getting system settings:", error);
      throw error;
    }
  }

  async updateSystemSettings(settings: Record<string, any>, userId: string): Promise<void> {
    try {
      // Update each setting individually
      for (const [key, value] of Object.entries(settings)) {
        const settingType = typeof value === 'boolean' ? 'boolean' : 
                           typeof value === 'number' ? 'number' : 'text';
        
        const settingValue = value?.toString() || '';

        // Check if setting exists
        const existingSetting = await db
          .select()
          .from(websiteSettings)
          .where(and(
            eq(websiteSettings.settingKey, key),
            eq(websiteSettings.category, 'system')
          ));

        if (existingSetting.length > 0) {
          // Update existing setting
          await db
            .update(websiteSettings)
            .set({
              settingValue,
              settingType,
              updatedBy: userId,
              updatedAt: new Date()
            })
            .where(and(
              eq(websiteSettings.settingKey, key),
              eq(websiteSettings.category, 'system')
            ));
        } else {
          // Create new setting
          await db
            .insert(websiteSettings)
            .values({
              settingKey: key,
              settingValue,
              settingType,
              description: `System setting for ${key}`,
              category: 'system',
              isRequired: false,
              updatedBy: userId
            });
        }
      }
    } catch (error) {
      console.error("Error updating system settings:", error);
      throw error;
    }
  }

  // Module assignment operations
  async assignModuleToUser(assignment: InsertModuleAssignment): Promise<ModuleAssignment> {
    const [newAssignment] = await db.insert(moduleAssignments).values(assignment).returning();
    return newAssignment;
  }

  async getUserModuleAssignments(userId: string): Promise<ModuleAssignment[]> {
    return await db
      .select()
      .from(moduleAssignments)
      .where(and(eq(moduleAssignments.userId, userId), eq(moduleAssignments.isActive, true)));
  }

  async getModuleAssignments(moduleId: number): Promise<ModuleAssignment[]> {
    return await db
      .select()
      .from(moduleAssignments)
      .where(and(eq(moduleAssignments.moduleId, moduleId), eq(moduleAssignments.isActive, true)));
  }

  async getTeacherInstructorModules(userId: string): Promise<Module[]> {
    return await db
      .select({
        id: modules.id,
        title: modules.title,
        description: modules.description,
        competencies: modules.competencies,
        duration: modules.duration,
        isActive: modules.isActive,
        createdAt: modules.createdAt,
        updatedAt: modules.updatedAt,
        createdBy: modules.createdBy,
        difficultyLevel: modules.difficultyLevel,
        learningTrack: modules.learningTrack,
        prerequisiteModules: modules.prerequisiteModules,
        pointsReward: modules.pointsReward,
      })
      .from(modules)
      .innerJoin(moduleAssignments, eq(modules.id, moduleAssignments.moduleId))
      .where(
        and(
          eq(moduleAssignments.userId, userId),
          eq(moduleAssignments.isActive, true),
          eq(modules.isActive, true)
        )
      );
  }


  async removeModuleAssignment(userId: string, moduleId: number): Promise<boolean> {
    const result = await db
      .update(moduleAssignments)
      .set({ isActive: false })
      .where(
        and(
          eq(moduleAssignments.userId, userId),
          eq(moduleAssignments.moduleId, moduleId)
        )
      )
      .returning();
    return result.length > 0;
  }

  async getAllModuleAssignments(): Promise<(ModuleAssignment & { user: User; module: Module })[]> {
    return await db
      .select({
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
          role: users.role,
        },
        module: {
          id: modules.id,
          title: modules.title,
          description: modules.description,
        },
      })
      .from(moduleAssignments)
      .innerJoin(users, eq(moduleAssignments.userId, users.id))
      .innerJoin(modules, eq(moduleAssignments.moduleId, modules.id))
      .where(eq(moduleAssignments.isActive, true)) as any;
  }
  // Module Assignment operations
  async getAssignedModules(userId: string): Promise<Module[]> {
    const assignedModules = await db
      .select({
        id: modules.id,
        title: modules.title,
        description: modules.description,
        competencies: modules.competencies,
        duration: modules.duration,
        isActive: modules.isActive,
        createdBy: modules.createdBy,
        createdAt: modules.createdAt,
        updatedAt: modules.updatedAt,
      })
      .from(moduleAssignments)
      .innerJoin(modules, eq(moduleAssignments.moduleId, modules.id))
      .where(
        and(
          eq(moduleAssignments.userId, userId),
          eq(moduleAssignments.isActive, true),
          eq(modules.isActive, true)
        )
      )
      .orderBy(desc(modules.createdAt));
    
    return assignedModules as Module[];
  }
}

export const storage = new DatabaseStorage();
