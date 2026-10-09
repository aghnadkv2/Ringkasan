import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "@/lib/db";
import { account, session, user, verification } from "@/lib/db/schema";

function getTrustedOrigins(baseURL: string) {
  const origins = new Set([new URL(baseURL).origin]);

  for (const host of [process.env.VERCEL_PROJECT_PRODUCTION_URL, process.env.VERCEL_URL]) {
    if (host) {
      origins.add(new URL(host.includes("://") ? host : `https://${host}`).origin);
    }
  }

  return [...origins];
}

function createAuth(secret: string) {
  const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

  return betterAuth({
    secret,
    baseURL,
    database: drizzleAdapter(getDb(), {
      provider: "pg",
      schema: { user, session, account, verification },
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    trustedOrigins: getTrustedOrigins(baseURL),
  });
}

let authInstance: ReturnType<typeof createAuth> | undefined;

export function getAuth(): ReturnType<typeof createAuth> {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("BETTER_AUTH_SECRET must be configured with at least 32 characters.");
  }

  if (!authInstance) {
    const instance = createAuth(secret);
    if (!instance) {
      throw new Error("Better Auth initialization failed.");
    }
    authInstance = instance;
  }

  return authInstance;
}
