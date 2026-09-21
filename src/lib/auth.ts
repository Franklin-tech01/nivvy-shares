import "server-only";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { pool } from "@/lib/db";

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // No email provider is connected yet. Until one is, reset links are logged
    // on the server so the flow can be tested. Replace with a real mailer.
    sendResetPassword: async ({ user, url }) => {
      console.log(`[auth] password reset link for ${user.email}: ${url}`);
    },
  },
  plugins: [nextCookies()], // must stay last
});
