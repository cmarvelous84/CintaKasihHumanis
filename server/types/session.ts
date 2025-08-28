import 'express-session';

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string;
      uid: string;
      email: string;
      firstName?: string;
      lastName?: string;
      role: string;
      profileImageUrl?: string;
    };
  }
}