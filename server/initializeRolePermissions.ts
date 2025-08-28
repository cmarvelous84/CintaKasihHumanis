import { db } from "./db";
import { rolePermissions, DEFAULT_ROLE_PERMISSIONS, type UserRole, type PermissionType } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export async function initializeRolePermissions() {
  console.log("Initializing role permissions...");
  
  try {
    // Clear existing role permissions to ensure clean state
    await db.delete(rolePermissions);
    console.log("Cleared existing role permissions");

    // Insert default permissions for each role
    for (const [role, permissions] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
      const rolePermissionData = permissions.map((permission: PermissionType) => ({
        role: role as UserRole,
        permission,
        isGranted: true,
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