import "server-only";
import { ZodError, type ZodType } from "zod";
import { z } from "zod";
import { getAuth } from "@/lib/auth";

const uuidSchema = z.string().uuid();

export async function requireUser(request: Request) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  return session?.user ?? null;
}

export function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export function isUuid(value: string) {
  return uuidSchema.safeParse(value).success;
}

export async function readJson<T>(request: Request, schema: ZodType<T>): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new Error("Request body must be valid JSON.");
  }

  return schema.parse(body);
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return Response.json(
      { error: "Request validation failed.", details: error.issues },
      { status: 400 },
    );
  }
  if (error instanceof Error && error.message === "Request body must be valid JSON.") {
    return jsonError(error.message, 400);
  }

  console.error("API request failed:", error);
  return jsonError("An unexpected server error occurred.", 500);
}
