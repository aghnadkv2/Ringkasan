import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth";

export const runtime = "nodejs";

async function handleAuthRequest(request: Request, method: "GET" | "POST") {
  let auth: ReturnType<typeof getAuth>;
  try {
    auth = getAuth();
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.startsWith("BETTER_AUTH_SECRET ") ||
        error.message.startsWith("DATABASE_URL "))
    ) {
      return Response.json({ message: error.message }, { status: 503 });
    }
    throw error;
  }

  return toNextJsHandler(auth)[method](request);
}

export async function GET(request: Request) {
  return handleAuthRequest(request, "GET");
}

export async function POST(request: Request) {
  return handleAuthRequest(request, "POST");
}
