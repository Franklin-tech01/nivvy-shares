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
    // Accounts are identified by phone number (see `@/lib/phone`). Self-service
    // reset needs an SMS provider; until then resets go through support.
  },
  plugins: [nextCookies()], // must stay last
});
