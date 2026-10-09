import { generateSummary, AIServiceError } from "@/lib/ai";
import { handleApiError, jsonError, readJson, requireUser } from "@/lib/api";
import { aiSummarySchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    if (!user) return jsonError("Authentication required.", 401);
    const input = await readJson(request, aiSummarySchema);
    const summary = await generateSummary(input.content);
    return Response.json({ data: { summary, provider: "Google Gemini" } });
  } catch (error) {
    if (error instanceof AIServiceError) return jsonError(error.message, error.status);
    return handleApiError(error);
  }
}
