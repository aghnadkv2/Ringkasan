import { generateQuiz, AIServiceError } from "@/lib/ai";
import { handleApiError, jsonError, readJson, requireUser } from "@/lib/api";
import { aiQuizSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    if (!user) return jsonError("Authentication required.", 401);
    const input = await readJson(request, aiQuizSchema);
    const { questions, provider } = await generateQuiz(input.title, input.content, input.questionCount);
    return Response.json({
      data: {
        title: `Latihan: ${input.title}`,
        questions,
        provider,
      },
    });
  } catch (error) {
    if (error instanceof AIServiceError) return jsonError(error.message, error.status);
    return handleApiError(error);
  }
}
