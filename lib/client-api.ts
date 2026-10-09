"use client";

export type MaterialRecord = {
  id: string;
  title: string;
  subject: string;
  category: "Kuliah / Sekolah" | "Ujian Masuk / UTBK" | "Belajar Mandiri";
  sourceType: "file" | "url";
  sourceUrl: string | null;
  fileName: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  status: string;
  createdAt: string;
};

export type NoteRecord = {
  id: string;
  title: string;
  content: string;
  subject: string;
  sourceMaterialIds: string[];
  updatedAt: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  choices: string[];
  position: number;
};

export type QuizRecord = {
  id: string;
  title: string;
  questions: QuizQuestion[];
};

export type QuizAttempt = {
  id: string;
  quizId: string;
  answers: Record<string, number>;
  questionCount: number;
  correctCount: number;
  score: number;
  completedAt: string;
  review?: {
    questionId: string;
    correctAnswer: number;
    selectedAnswer: number | null;
    isCorrect: boolean;
    explanation: string | null;
  }[];
};

export type StudySessionRecord = {
  id: string;
  subject: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  reminderMinutes: number;
  status: "scheduled" | "completed" | "cancelled";
};

export type Preferences = {
  userId: string;
  theme: "light" | "dark";
  notificationsEnabled: boolean;
};

type ApiEnvelope<T> = { data: T };

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: "same-origin",
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  let payload: ApiEnvelope<T> | { error?: string; details?: { message: string }[] };
  try {
    payload = await response.json();
  } catch {
    throw new Error(`Server returned an invalid response (${response.status}).`);
  }

  if (!response.ok) {
    const message = "error" in payload ? payload.error : undefined;
    const details = "details" in payload ? payload.details?.map((issue) => issue.message).join(" ") : undefined;
    throw new Error([message ?? `Request failed (${response.status}).`, details].filter(Boolean).join(" "));
  }
  if (!("data" in payload)) {
    throw new Error("Server response is missing data.");
  }

  return payload.data;
}

export function jsonBody(value: unknown): string {
  return JSON.stringify(value);
}
