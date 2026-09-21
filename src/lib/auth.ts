import "server-only";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { pool } from "@/lib/db";

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL?.replace(/\/+$/, ""),
  // Allow local development even when BETTER_AUTH_URL points at production.
  trustedOrigins:
    process.env.NODE_ENV === "production"
      ? []
      : ["http://localhost:3000", "http://127.0.0.1:3000"],
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // Accounts are identified by phone number (see `@/lib/phone`). Self-service
    // reset needs an SMS provider; until then resets go through support.
  },
  plugins: [nextCookies()], // must stay last
});
