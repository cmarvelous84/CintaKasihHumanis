import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import admin from "firebase-admin";
import express from "express";
import "../types/session";

const router = Router();

// Initialize Firebase Admin (in production you'd set this up in a separate file)
if (!admin.apps.length) {
  // For development, we'll just initialize without service account
  // In production, you should use a service account key
  admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  });
}

// Google login endpoint
const googleLoginSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().nullable(),
  photoURL: z.string().nullable(),
  idToken: z.string(),
});

router.post("/google-login", async (req: express.Request, res: express.Response) => {
  try {
    const validatedData = googleLoginSchema.parse(req.body);
    
    // Verify the ID token with Firebase Admin (skip in development)
    if (process.env.NODE_ENV === 'production') {
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
      // Development mode: trust the frontend Firebase Auth
      console.log("Development mode: Skipping Firebase token verification");
    }

    // Check if user exists
    let user = await storage.getUserByEmailFromAuth(validatedData.email);
    let isNewUser = false;

    if (!user) {
      // Create new user with role based on email
      const names = validatedData.displayName?.split(' ') || ['', ''];
      let userRole: 'super_admin' | 'admin' | 'teacher' | 'student' = 'student'; // default role
      
      // Special case: assign super_admin role to specific email
      if (validatedData.email === 'it-system@cintakasihtzuchi.sch.id') {
        userRole = 'super_admin';
      }
      
      user = await storage.upsertUser({
        id: validatedData.uid,
        email: validatedData.email,
        firstName: names[0] || '',
        lastName: names.slice(1).join(' ') || '',
        profileImageUrl: validatedData.photoURL || '',
        role: userRole,
        isActive: true,
      });
      isNewUser = true;
    } else {
      // Update existing user's profile image and ensure correct role for special emails
      let needsUpdate = false;
      let updateData: any = { ...user };
      
      // Update profile image if needed
      if (validatedData.photoURL && user.profileImageUrl !== validatedData.photoURL) {
        updateData.profileImageUrl = validatedData.photoURL;
        needsUpdate = true;
      }
      
      // Ensure special email has super_admin role
      if (validatedData.email === 'it-system@cintakasihtzuchi.sch.id' && user.role !== 'super_admin') {
        updateData.role = 'super_admin' as const;
        needsUpdate = true;
      }
      
      // Update last login
      updateData.lastLogin = new Date();
      needsUpdate = true;
      
      if (needsUpdate) {
        user = await storage.upsertUser(updateData);
      }
    }

    // Create session
    req.session.user = {
      uid: validatedData.uid,
      id: user.id,
      email: user.email || '',
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      role: user.role,
      profileImageUrl: user.profileImageUrl || undefined,
    };

    res.json({
      user,
      isNewUser,
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(400).json({ 
      message: error instanceof z.ZodError ? "Invalid data" : "Login failed" 
    });
  }
});

// Get current user endpoint
router.get("/user", async (req: express.Request, res: express.Response) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get fresh user data from database
    const user = await storage.getUser(req.session.user.id);
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

// Logout endpoint
router.post("/logout", (req: express.Request, res: express.Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie('connect.sid');
    res.json({ message: "Logged out successfully" });
  });
});

export default router;