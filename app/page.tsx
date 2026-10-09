"use client";

import {
  AlarmClock,
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  BookOpenCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  CloudUpload,
  FilePlus2,
  FileText,
  Filter,
  Flag,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  Lightbulb,
  Layers,
  Link2,
  ListChecks,
  LogOut,
  Menu,
  NotebookPen,
  Play,
  Plus,
  Search,
  Settings,
  Sparkles,
  Target,
  Timer,
  Trash2,
  TrendingUp,
  Upload,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiRequest, jsonBody, type MaterialRecord, type NoteRecord, type Preferences, type QuizAttempt, type QuizRecord, type StudySessionRecord } from "@/lib/client-api";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type PageId = "dashboard" | "materials" | "notes" | "quiz" | "schedule" | "settings";
type Material = MaterialRecord & { type: string; size: string; added: string };
type StudySession = StudySessionRecord & { time: string; duration: string; done: boolean };
type QuizViewQuestion = { id: string; question: string; options: string[] };

const navigation: { id: PageId; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Dashboard / Ringkasan", icon: LayoutDashboard },
  { id: "materials", label: "Materi Belajar", icon: FolderOpen },
  { id: "notes", label: "Rangkuman & Catatan", icon: Sparkles },
  { id: "quiz", label: "Soal Latihan", icon: BookOpenCheck },
  { id: "schedule", label: "Jadwal Belajar", icon: CalendarDays },
];

const quizQuestions = [
  {
    question: "Pada proses respirasi seluler aerobik, tahapan yang menghasilkan molekul ATP paling banyak melalui mekanisme kemiosmosis dan fosforilasi oksidatif berlangsung pada bagian…",
    options: [
      "Sitoplasma, saat glikolisis berlangsung",
      "Matriks mitokondria pada tahap siklus Krebs",
      "Membran dalam mitokondria melalui rantai transpor elektron",
      "Membran luar mitokondria saat fermentasi",
    ],
    correct: 2,
  },
  {
    question: "Molekul yang bertindak sebagai akseptor elektron terakhir dalam respirasi aerob adalah…",
    options: ["Karbon dioksida", "Oksigen", "NADH", "Glukosa"],
    correct: 1,
  },
  {
    question: "Hasil bersih dari satu molekul glukosa pada tahap glikolisis adalah…",
    options: ["2 ATP dan 2 NADH", "4 ATP dan 4 NADH", "2 ATP dan 6 NADH", "36 ATP dan 2 NADH"],
    correct: 0,
  },
];

function SectionHeading({
  icon: Icon,
  title,
  detail,
  action,
}: {
  icon: LucideIcon;
  title: string;
  detail?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-deep-teal" />
        <h2 className="text-sm font-bold text-slate-800">{title}</h2>
        {detail && <span className="text-[11px] text-slate-400">{detail}</span>}
      </div>
      {action}
    </div>
  );
}

function ProgressBar({ value, color = "bg-emerald-700" }: { value: number; color?: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${value}%` }} />
    </div>
  );
}

function toMaterial(record: MaterialRecord): Material {
  return {
    ...record,
    type: record.sourceType === "url"
      ? "LINK"
      : record.fileName?.split(".").pop()?.toUpperCase() ?? "FILE",
    size: record.sourceType === "url"
      ? "Tautan web"
      : record.sizeBytes
        ? `${(record.sizeBytes / 1024 / 1024).toFixed(1)} MB`
        : "File",
    added: new Date(record.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" }),
  };
}

function toStudySession(record: StudySessionRecord): StudySession {
  const scheduledAt = new Date(record.scheduledAt);
  return {
    ...record,
    time: scheduledAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    duration: `${record.durationMinutes} menit`,
    done: record.status === "completed",
  };
}

function AuthScreen({ authError }: { authError?: string }) {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const result = mode === "sign-up"
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
        : await authClient.signIn.email({ email: email.trim(), password });
      if (result.error) throw new Error(result.error.message || "Autentikasi gagal.");
    } catch (cause) {
      setError(
        cause instanceof TypeError && cause.message === "Failed to fetch"
          ? "Tidak dapat terhubung ke server. Pastikan aplikasi berjalan, lalu coba lagi."
          : cause instanceof Error
            ? cause.message
            : "Autentikasi gagal. Coba lagi.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f9f8] p-4">
      <Card className="w-full max-w-md p-7">
        <div className="mb-6 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-deep-teal text-white"><GraduationCap className="h-6 w-6" /></div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Catatan Ujian Pintar</h1>
          <p className="mt-1 text-sm text-slate-500">{mode === "sign-in" ? "Masuk untuk membuka ruang belajarmu." : "Buat akun untuk menyimpan progres belajarmu."}</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {mode === "sign-up" && <label className="block text-sm font-medium text-slate-700">Nama<input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-emerald-600" /></label>}
          <label className="block text-sm font-medium text-slate-700">Email<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-emerald-600" /></label>
          <label className="block text-sm font-medium text-slate-700">Kata sandi<input required minLength={8} type="password" autoComplete={mode === "sign-in" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-emerald-600" /></label>
          {(error || authError) && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error || authError}</p>}
          <Button className="w-full" disabled={pending}>{pending ? "Memproses..." : mode === "sign-in" ? "Masuk" : "Buat Akun"}</Button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-500">
          {mode === "sign-in" ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
          <button className="font-semibold text-deep-teal hover:underline" onClick={() => { setMode(mode === "sign-in" ? "sign-up" : "sign-in"); setError(""); }}>
            {mode === "sign-in" ? "Daftar" : "Masuk"}
          </button>
        </p>
      </Card>
    </main>
  );
}

export default function Home() {
  const auth = authClient.useSession();
  const user = auth.data?.user;
  const userId = user?.id;
  const [activePage, setActivePage] = useState<PageId>("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [materialTab, setMaterialTab] = useState("Semua Materi");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialUrl, setMaterialUrl] = useState("");
  const [materialCategory, setMaterialCategory] = useState<MaterialRecord["category"]>("Belajar Mandiri");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [noteId, setNoteId] = useState<string | null>(null);
  const [noteSourceIds, setNoteSourceIds] = useState<string[]>([]);
  const [quizzes, setQuizzes] = useState<QuizRecord[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizRecord | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | null>(null);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteText, setNoteText] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [summaryBusy, setSummaryBusy] = useState(false);
  const [summaryFeedback, setSummaryFeedback] = useState("");
  const [quizFeedback, setQuizFeedback] = useState<{ kind: "status" | "error"; message: string } | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!userId) {
      setMaterials([]);
      setSessions([]);
      setNotes([]);
      setQuizzes([]);
      setAttempts([]);
      setPreferences(null);
      return;
    }

    let active = true;
    setDataLoading(true);
    Promise.all([
      apiRequest<MaterialRecord[]>("/api/materials"),
      apiRequest<NoteRecord[]>("/api/notes"),
      apiRequest<StudySessionRecord[]>("/api/study-sessions"),
      apiRequest<QuizRecord[]>("/api/quizzes"),
      apiRequest<Preferences>("/api/preferences"),
    ])
      .then(async ([loadedMaterials, loadedNotes, loadedSessions, loadedQuizzes, loadedPreferences]) => {
        const loadedAttempts = await Promise.all(
          loadedQuizzes.map((quiz) => apiRequest<QuizAttempt[]>(`/api/quizzes/${quiz.id}/attempts`)),
        );
        if (!active) return;
        setMaterials(loadedMaterials.map(toMaterial));
        setNotes(loadedNotes);
        setNoteId(loadedNotes[0]?.id ?? null);
        setNoteSourceIds(loadedNotes[0]?.sourceMaterialIds ?? []);
        setNoteTitle(loadedNotes[0]?.title ?? "");
        setNoteText(loadedNotes[0]?.content ?? "");
        setNoteSaved(Boolean(loadedNotes[0]));
        setSessions(loadedSessions.map(toStudySession));
        setQuizzes(loadedQuizzes);
        setAttempts(loadedAttempts.flat());
        setPreferences(loadedPreferences);
        setDarkMode(loadedPreferences.theme === "dark");
        setSelectedQuiz(loadedQuizzes[0] ?? null);
        setNotice("");
      })
      .catch((error: unknown) => {
        if (active) setNotice(error instanceof Error ? error.message : "Data belajar gagal dimuat.");
      })
      .finally(() => {
        if (active) setDataLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const filteredMaterials = useMemo(() => {
    const query = search.toLowerCase();
    return materials.filter((material) => {
      const matchesSearch = `${material.title} ${material.subject}`.toLowerCase().includes(query);
      const matchesTab =
        materialTab === "Semua Materi" ||
        material.category === materialTab ||
        (materialTab === "Diproses AI" && material.status === "processing");
      return matchesSearch && matchesTab;
    });
  }, [materials, materialTab, search]);

  function navigate(page: PageId) {
    setActivePage(page);
    setMobileNavOpen(false);
  }

  async function addMaterial() {
    const title = selectedFile?.name ?? materialUrl.trim();
    if (!title) {
      setNotice("Pilih file atau masukkan tautan sumber terlebih dahulu.");
      return;
    }
    if (selectedFile && selectedFile.size > 25 * 1024 * 1024) {
      setNotice("Ukuran berkas melebihi batas 25 MB.");
      return;
    }
    let cleanTitle = selectedFile?.name;
    if (!selectedFile) {
      try {
        cleanTitle = new URL(materialUrl).hostname.replace(/^www\./, "");
      } catch {
        setNotice("Masukkan URL sumber yang valid, termasuk https://.");
        return;
      }
    }
    setActionLoading(true);
    try {
      const material = await apiRequest<MaterialRecord>("/api/materials", {
        method: "POST",
        body: jsonBody({
          title: cleanTitle ?? title,
          subject: "Belajar Mandiri",
          category: materialCategory,
          sourceType: selectedFile ? "file" : "url",
          sourceUrl: selectedFile ? undefined : materialUrl.trim(),
          fileName: selectedFile?.name,
          mimeType: selectedFile?.type || undefined,
          sizeBytes: selectedFile?.size,
        }),
      });
      setMaterials((current) => [toMaterial(material), ...current]);
      setMaterialUrl("");
      setSelectedFile(null);
      setModalOpen(false);
      setActivePage("materials");
      setNotice(selectedFile
        ? "Metadata materi tersimpan. File belum diunggah karena penyimpanan file belum dikonfigurasi."
        : "Tautan materi berhasil disimpan.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Materi gagal disimpan.");
    } finally {
      setActionLoading(false);
    }
  }

  function selectUpload(event: ChangeEvent<HTMLInputElement>) {
    setSelectedFile(event.target.files?.[0] ?? null);
  }

  async function startSampleQuiz() {
    setActionLoading(true);
    try {
      const quiz = await apiRequest<QuizRecord>("/api/quizzes", {
        method: "POST",
        body: jsonBody({
          title: "Latihan Biologi Sel & Metabolisme",
          questions: quizQuestions.map((item) => ({
            prompt: item.question,
            choices: item.options,
            correctAnswer: item.correct,
            explanation: "Rantai transpor elektron pada membran dalam mitokondria menghasilkan sebagian besar ATP; oksigen merupakan akseptor elektron terakhir.",
          })),
        }),
      });
      setQuizzes((current) => [quiz, ...current]);
      setSelectedQuiz(quiz);
      setQuizFinished(false);
      setQuizAttempt(null);
      setAnswers({});
      setQuestionIndex(0);
      setActivePage("quiz");
      setNotice("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Latihan gagal dibuat.");
    } finally {
      setActionLoading(false);
    }
  }

  async function generateAISummary() {
    if (noteText.trim().length < 30) {
      const message = "Tambahkan setidaknya 30 karakter teks ke Isi Catatan sebelum membuat rangkuman.";
      setSummaryFeedback(message);
      setNotice(message);
      return;
    }
    setSummaryBusy(true);
    setSummaryFeedback("Meminta draf rangkuman dari Gemini...");
    try {
      const result = await apiRequest<{ summary: string; provider: string }>("/api/ai/summary", {
        method: "POST",
        body: jsonBody({ content: noteText }),
      });
      setNoteText(result.summary);
      setNoteSaved(false);
      const message = `Rangkuman dibuat dengan ${result.provider}. Periksa hasilnya, lalu simpan catatan.`;
      setSummaryFeedback(message);
      setNotice(message);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Rangkuman AI gagal dibuat.";
      setSummaryFeedback(message);
      setNotice(message);
    } finally {
      setSummaryBusy(false);
    }
  }

  async function generateAIQuiz() {
    if (noteText.trim().length < 50) {
      setQuizFeedback({
        kind: "error",
        message: "Soal AI membutuhkan minimal 50 karakter teks catatan. File atau tautan yang tersimpan baru berupa metadata dan belum bisa dibaca AI.",
      });
      return;
    }
    setNotice("");
    setQuizFeedback({
      kind: "status",
      message: "Membuat 5 soal dari catatan. Jika OpenAI sedang membatasi permintaan, Gemini akan dicoba otomatis.",
    });
    setActionLoading(true);
    try {
      const generated = await apiRequest<{
        title: string;
        questions: { prompt: string; choices: string[]; correctAnswer: number; explanation: string }[];
        provider: string;
      }>("/api/ai/quiz", {
        method: "POST",
        body: jsonBody({
          title: noteTitle.trim() || "Materi Belajar",
          content: noteText,
          questionCount: 5,
        }),
      });
      const quiz = await apiRequest<QuizRecord>("/api/quizzes", {
        method: "POST",
        body: jsonBody({ title: generated.title, questions: generated.questions }),
      });
      setQuizzes((current) => [quiz, ...current]);
      setSelectedQuiz(quiz);
      setQuizFinished(false);
      setQuizAttempt(null);
      setAnswers({});
      setQuestionIndex(0);
      setActivePage("quiz");
      setQuizFeedback({
        kind: "status",
        message: `Latihan berisi ${quiz.questions.length} soal berhasil dibuat dengan ${generated.provider}.`,
      });
    } catch (error) {
      setQuizFeedback({
        kind: "error",
        message: error instanceof Error ? error.message : "Soal AI gagal dibuat.",
      });
    } finally {
      setActionLoading(false);
    }
  }

  async function finishQuiz() {
    if (!selectedQuiz) return;
    setActionLoading(true);
    try {
      const payload = Object.fromEntries(
        selectedQuiz.questions.flatMap((question, index) =>
          answers[index] === undefined ? [] : [[question.id, answers[index]]],
        ),
      );
      const result = await apiRequest<QuizAttempt>(`/api/quizzes/${selectedQuiz.id}/attempts`, {
        method: "POST",
        body: jsonBody({ answers: payload }),
      });
      setQuizAttempt(result);
      setAttempts((current) => [result, ...current]);
      setQuizFinished(true);
      setNotice("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Jawaban gagal dikirim.");
    } finally {
      setActionLoading(false);
    }
  }

  async function saveNote() {
    setActionLoading(true);
    try {
      const payload = { title: noteTitle || "Catatan Belajar", content: noteText, subject: "Belajar Mandiri" };
      const saved = noteId
        ? await apiRequest<NoteRecord>(`/api/notes/${noteId}`, { method: "PATCH", body: jsonBody({ ...payload, sourceMaterialIds: noteSourceIds }) })
        : await apiRequest<NoteRecord>("/api/notes", { method: "POST", body: jsonBody({ ...payload, sourceMaterialIds: noteSourceIds }) });
      setNoteId(saved.id);
      setNoteTitle(saved.title);
      setNoteText(saved.content);
      setNoteSourceIds(saved.sourceMaterialIds);
      setNoteSaved(true);
      setNotes((current) => [saved, ...current.filter((note) => note.id !== saved.id)]);
      setNotice("Catatan berhasil disimpan.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Catatan gagal disimpan.");
    } finally {
      setActionLoading(false);
    }
  }

  async function deleteMaterial(materialId: string) {
    setActionLoading(true);
    try {
      await apiRequest<{ id: string }>(`/api/materials/${materialId}`, { method: "DELETE" });
      setMaterials((current) => current.filter((material) => material.id !== materialId));
      setNotice("Materi berhasil dihapus.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Materi gagal dihapus.");
    } finally {
      setActionLoading(false);
    }
  }

  async function deleteNote(noteToDelete: NoteRecord) {
    setActionLoading(true);
    try {
      await apiRequest<{ id: string }>(`/api/notes/${noteToDelete.id}`, { method: "DELETE" });
      const remaining = notes.filter((note) => note.id !== noteToDelete.id);
      setNotes(remaining);
      const nextNote = remaining[0];
      setNoteId(nextNote?.id ?? null);
      setNoteTitle(nextNote?.title ?? "");
      setNoteText(nextNote?.content ?? "");
      setNoteSourceIds(nextNote?.sourceMaterialIds ?? []);
      setNoteSaved(Boolean(nextNote));
      setNotice("Catatan berhasil dihapus.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Catatan gagal dihapus.");
    } finally {
      setActionLoading(false);
    }
  }

  async function addStudySession() {
    const scheduledAt = new Date();
    scheduledAt.setHours(scheduledAt.getHours() + 1, 0, 0, 0);
    setActionLoading(true);
    try {
      const created = await apiRequest<StudySessionRecord>("/api/study-sessions", {
        method: "POST",
        body: jsonBody({
          subject: "Belajar Mandiri",
          title: "Sesi belajar baru",
          scheduledAt: scheduledAt.toISOString(),
          durationMinutes: 30,
          reminderMinutes: 15,
        }),
      });
      setSessions((current) => [...current, toStudySession(created)].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)));
      setNotice("Sesi belajar berhasil ditambahkan.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Sesi belajar gagal ditambahkan.");
    } finally {
      setActionLoading(false);
    }
  }

  async function toggleStudySession(index: number) {
    const target = sessions[index];
    if (!target) return;
    setActionLoading(true);
    try {
      const updated = await apiRequest<StudySessionRecord>(`/api/study-sessions/${target.id}`, {
        method: "PATCH",
        body: jsonBody({ status: target.done ? "scheduled" : "completed" }),
      });
      setSessions((current) => current.map((session) => session.id === target.id ? toStudySession(updated) : session));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Status sesi gagal diperbarui.");
    } finally {
      setActionLoading(false);
    }
  }

  async function deleteStudySession(sessionId: string) {
    setActionLoading(true);
    try {
      await apiRequest<{ id: string }>(`/api/study-sessions/${sessionId}`, { method: "DELETE" });
      setSessions((current) => current.filter((session) => session.id !== sessionId));
      setNotice("Sesi belajar berhasil dihapus.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Sesi belajar gagal dihapus.");
    } finally {
      setActionLoading(false);
    }
  }

  async function toggleDarkMode() {
    const nextTheme = darkMode ? "light" : "dark";
    setDarkMode(nextTheme === "dark");
    try {
      const updated = await apiRequest<Preferences>("/api/preferences", {
        method: "PATCH",
        body: jsonBody({ theme: nextTheme }),
      });
      setPreferences(updated);
    } catch (error) {
      setDarkMode(nextTheme !== "dark");
      setNotice(error instanceof Error ? error.message : "Preferensi tema gagal disimpan.");
    }
  }

  const answeredCount = Object.keys(answers).length;
  const score = quizAttempt?.score ?? 0;

  if (auth.isPending) {
    return <div className="grid min-h-screen place-items-center text-sm text-slate-500">Memeriksa sesi akun...</div>;
  }
  if (!user) return <AuthScreen authError={auth.error?.message} />;

  return (
    <div className={cn("min-h-screen bg-[#f6f9f8]", darkMode && "dark-mode")}>
      {mobileNavOpen && (
        <button
          aria-label="Tutup menu"
          className="fixed inset-0 z-40 bg-slate-950/35 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col border-r border-slate-100 bg-white px-4 py-5 transition-transform lg:translate-x-0",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-7 flex items-center gap-2.5 px-1">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-deep-teal text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[14px] font-extrabold leading-tight tracking-tight text-slate-900">Catatan Ujian</div>
            <div className="text-[10px] font-medium text-emerald-700">Pintar Platform</div>
          </div>
          <button
            aria-label="Tutup menu"
            className="ml-auto rounded-lg p-1 text-slate-400 hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileNavOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <label className="mb-5 flex h-10 items-center gap-2 rounded-xl border border-slate-100 bg-[#f8fbfa] px-3 text-slate-400 focus-within:border-emerald-300">
          <Search className="h-4 w-4 shrink-0" />
          <input
            aria-label="Cari materi atau catatan"
            className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
            placeholder="Cari catatan / soal..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") navigate("materials");
            }}
          />
          <kbd className="rounded border border-slate-200 bg-white px-1 text-[9px]">⌘K</kbd>
        </label>

        <nav aria-label="Navigasi utama" className="space-y-1">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              aria-current={activePage === id ? "page" : undefined}
              onClick={() => navigate(id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[12px] font-medium transition-colors",
                activePage === id
                  ? "bg-[#eaf4f1] text-deep-teal"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-2">
          <button
            onClick={() => navigate("settings")}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium",
              activePage === "settings" ? "bg-[#eaf4f1] text-deep-teal" : "text-slate-600 hover:bg-slate-50",
            )}
          >
            <Settings className="h-4 w-4" /> Pengaturan
          </button>
          <button
            onClick={async () => {
              try {
                const result = await authClient.signOut();
                if (result.error) setNotice(result.error.message || "Gagal keluar dari akun.");
              } catch (error) {
                setNotice(error instanceof Error ? error.message : "Gagal keluar dari akun.");
              }
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50"
          >
            <LogOut className="h-4 w-4" /> Keluar
          </button>
          <div className="flex items-center justify-between rounded-xl bg-[#effbfc] px-3 py-2 text-[10px] text-slate-500">
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Mode Fokus Aktif</span>
            <span className="font-semibold text-emerald-700">v2.4</span>
          </div>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[250px]">
        <header className="sticky top-0 z-30 flex h-[66px] items-center justify-between border-b border-slate-100 bg-white/95 px-4 backdrop-blur md:px-8 xl:px-10">
          <div className="flex items-center gap-3">
            <button
              aria-label="Buka menu"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden items-center gap-2 text-[11px] text-slate-400 sm:flex">
              <span>Akademik</span>
              <span>/</span>
              <span className="font-semibold text-slate-700">{pageLabel(activePage)}</span>
              <Badge variant="default" className="ml-1">◷ UTBK / Ujian Akhir: 14 Hari Lagi</Badge>
            </div>
            <div className="text-sm font-bold text-slate-800 sm:hidden">Catatan Ujian</div>
          </div>
          <div className="flex items-center gap-2.5">
            <Button size="sm" onClick={() => setModalOpen(true)} className="hidden sm:inline-flex">
              <Plus className="h-3.5 w-3.5" /> Tambah Materi
            </Button>
            <button aria-label="Notifikasi" className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-50">
              <Bell className="h-[17px] w-[17px]" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>
            <div className="hidden h-8 w-8 place-items-center rounded-full bg-[#d4e9dd] text-xs font-bold text-deep-teal sm:grid">{user.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</div>
            <div className="hidden text-[11px] leading-tight sm:block">
              <div className="font-semibold text-slate-800">{user.name}</div>
              <div className="text-slate-400">{user.email}</div>
            </div>
            <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 sm:block" />
          </div>
        </header>

        <main className="mx-auto max-w-[1480px] px-4 py-5 md:px-8 md:py-7 xl:px-10">
          <div className="mb-5 flex items-center justify-between gap-3 sm:hidden">
            <Badge variant="default">◷ Ujian: 14 hari lagi</Badge>
            <Button size="sm" onClick={() => setModalOpen(true)}><Plus className="h-3.5 w-3.5" /> Tambah</Button>
          </div>
          {notice && (
            <div role="status" className="mb-4 flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {notice}
              <button aria-label="Tutup pemberitahuan" onClick={() => setNotice("")}><X className="h-4 w-4" /></button>
            </div>
          )}
          {dataLoading && <div role="status" className="mb-4 rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-500">Memuat data belajar...</div>}
          {actionLoading && <div role="status" className="mb-4 text-xs text-slate-500">Memproses permintaan...</div>}

          {activePage === "dashboard" && (
            <Dashboard
              materialCount={materials.length}
              sessions={sessions}
              materials={materials}
              notes={notes}
              attempts={attempts}
              quizzes={quizzes}
              userName={user.name}
              onNavigate={navigate}
              onAdd={() => setModalOpen(true)}
            />
          )}
          {activePage === "materials" && (
            <Materials
              materials={filteredMaterials}
              allMaterials={materials}
              tabs={["Semua Materi", "Kuliah / Sekolah", "Ujian Masuk / UTBK", "Belajar Mandiri", "Diproses AI"]}
              activeTab={materialTab}
              search={search}
              onSearch={setSearch}
              onTabChange={setMaterialTab}
              onAdd={() => setModalOpen(true)}
              onNavigate={navigate}
              onDelete={deleteMaterial}
            />
          )}
          {activePage === "notes" && (
            <Notes
              title={noteTitle}
              text={noteText}
              materials={materials}
              notes={notes}
              selectedNoteId={noteId}
              selectedMaterialIds={noteSourceIds}
              saved={noteSaved}
              onSelectNote={(id) => {
                const selected = notes.find((note) => note.id === id);
                setNoteId(selected?.id ?? null);
                setNoteTitle(selected?.title ?? "");
                setNoteText(selected?.content ?? "");
                setNoteSourceIds(selected?.sourceMaterialIds ?? []);
                setNoteSaved(Boolean(selected));
              }}
              onDeleteNote={() => {
                const selected = notes.find((note) => note.id === noteId);
                if (selected) void deleteNote(selected);
              }}
              onNewNote={() => {
                setNoteId(null);
                setNoteTitle("");
                setNoteText("");
                setNoteSourceIds([]);
                setNoteSaved(false);
              }}
              onToggleSource={(materialId) => setNoteSourceIds((current) =>
                current.includes(materialId) ? current.filter((id) => id !== materialId) : [...current, materialId],
              )}
              onTitleChange={(value) => { setNoteTitle(value); setNoteSaved(false); }}
              onTextChange={(value) => { setNoteText(value); setNoteSaved(false); }}
              onSave={saveNote}
              onQuiz={() => navigate("quiz")}
              onGenerate={() => {
                setSummaryFeedback("");
                void generateAISummary();
              }}
              summaryBusy={summaryBusy}
              summaryFeedback={summaryFeedback}
            />
          )}
          {activePage === "quiz" && (
            <Quiz
              questionIndex={questionIndex}
              answers={answers}
              finished={quizFinished}
              score={score}
              answeredCount={answeredCount}
              onAnswer={(option) => setAnswers((current) => ({ ...current, [questionIndex]: option }))}
              onQuestion={setQuestionIndex}
              onFinish={finishQuiz}
              questions={selectedQuiz?.questions.map((question) => ({ id: question.id, question: question.prompt, options: question.choices })) ?? []}
              quizTitle={selectedQuiz?.title ?? ""}
              availableQuizzes={quizzes}
              selectedQuizId={selectedQuiz?.id ?? ""}
              attempt={quizAttempt}
              onStartSample={startSampleQuiz}
              onGenerateAI={generateAIQuiz}
              canGenerateAI={noteText.trim().length >= 50}
              feedback={quizFeedback}
              busy={actionLoading}
              onSelectQuiz={(quizId) => {
                setSelectedQuiz(quizzes.find((quiz) => quiz.id === quizId) ?? null);
                setQuizFinished(false);
                setQuizAttempt(null);
                setAnswers({});
                setQuestionIndex(0);
              }}
              onRestart={() => { setQuizFinished(false); setQuizAttempt(null); setAnswers({}); setQuestionIndex(0); }}
              onNavigate={navigate}
            />
          )}
          {activePage === "schedule" && (
            <Schedule
              sessions={sessions}
              onToggle={toggleStudySession}
              onAdd={addStudySession}
              onDelete={deleteStudySession}
            />
          )}
          {activePage === "settings" && <SettingsPage dark={darkMode} userName={user.name} userEmail={user.email} notificationsEnabled={preferences?.notificationsEnabled ?? true} onSaveProfile={async (name) => {
            try {
              const result = await authClient.updateUser({ name });
              if (result.error) throw new Error(result.error.message || "Profil gagal diperbarui.");
              await auth.refetch();
              setNotice("Nama profil berhasil diperbarui.");
            } catch (error) {
              setNotice(error instanceof Error ? error.message : "Profil gagal diperbarui.");
            }
          }} onToggleDark={toggleDarkMode} onToggleNotifications={async () => {
            const nextValue = !(preferences?.notificationsEnabled ?? true);
            try {
              const updated = await apiRequest<Preferences>("/api/preferences", {
                method: "PATCH",
                body: jsonBody({ notificationsEnabled: nextValue }),
              });
              setPreferences(updated);
            } catch (error) {
              setNotice(error instanceof Error ? error.message : "Preferensi notifikasi gagal disimpan.");
            }
          }} />}
        </main>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/40 p-4" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setModalOpen(false);
        }}>
          <div aria-labelledby="add-material-title" aria-modal="true" role="dialog" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 id="add-material-title" className="text-lg font-bold">Tambah Materi Belajar</h2>
                <p className="mt-1 text-sm text-slate-500">Simpan sumber belajar untuk rangkuman dan latihan.</p>
              </div>
              <button aria-label="Tutup" onClick={() => setModalOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
            </div>
            <label className="group flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-emerald-200 bg-[#f7fbfa] px-5 py-7 text-center hover:border-emerald-400">
              <input className="sr-only" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" onChange={selectUpload} />
              <CloudUpload className="mb-2 h-7 w-7 text-deep-teal" />
              <span className="text-sm font-semibold text-slate-700">{selectedFile?.name ?? "Klik untuk pilih file atau seret ke sini"}</span>
              <span className="mt-1 text-xs text-slate-400">PDF, DOCX, PPTX atau TXT · Maks. 25 MB</span>
            </label>
            <div className="my-4 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400"><span className="h-px flex-1 bg-slate-100" />atau gunakan tautan<span className="h-px flex-1 bg-slate-100" /></div>
            <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 focus-within:border-emerald-500">
              <Link2 className="h-4 w-4 text-slate-400" />
              <input
                type="url"
                value={materialUrl}
                onChange={(event) => setMaterialUrl(event.target.value)}
                placeholder="https://sumber-belajar.com/materi"
                className="w-full text-sm outline-none placeholder:text-slate-400"
              />
            </label>
            <label className="mt-3 block text-xs font-medium text-slate-600">Kategori materi
              <select value={materialCategory} onChange={(event) => setMaterialCategory(event.target.value as MaterialRecord["category"])} className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm">
                <option>Kuliah / Sekolah</option>
                <option>Ujian Masuk / UTBK</option>
                <option>Belajar Mandiri</option>
              </select>
            </label>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
              <Button disabled={actionLoading} onClick={addMaterial}><Plus className="h-4 w-4" /> Simpan Materi</Button>
            </div>
          </div>
        </div>
      )}
      <button onClick={() => setModalOpen(true)} aria-label="Tambah materi" className="fixed bottom-5 right-5 z-30 grid h-12 w-12 place-items-center rounded-full bg-deep-teal text-white shadow-lg hover:bg-[#08433f] sm:hidden"><Plus className="h-5 w-5" /></button>
    </div>
  );
}

function pageLabel(page: PageId) {
  return navigation.find((item) => item.id === page)?.label ?? "Pengaturan";
}

function Dashboard({
  materialCount,
  sessions,
  materials,
  notes,
  attempts,
  quizzes,
  userName,
  onNavigate,
  onAdd,
}: {
  materialCount: number;
  sessions: StudySession[];
  materials: Material[];
  notes: NoteRecord[];
  attempts: QuizAttempt[];
  quizzes: QuizRecord[];
  userName: string;
  onNavigate: (page: PageId) => void;
  onAdd: () => void;
}) {
  const nextSession = sessions.find((session) => !session.done) ?? sessions[0];
  const today = new Date().toDateString();
  const todaysSessions = sessions.filter((session) => new Date(session.scheduledAt).toDateString() === today);
  const todayProgress = todaysSessions.length
    ? Math.round((todaysSessions.filter((session) => session.done).length / todaysSessions.length) * 100)
    : 0;
  const recentItems = [
    ...materials.map((material) => ({
      id: material.id,
      title: material.title,
      subject: material.subject,
      meta: `${material.size} • ${material.added}`,
      isNote: false,
    })),
    ...notes.map((note) => ({
      id: note.id,
      title: note.title,
      subject: note.subject,
      meta: `Catatan • ${new Date(note.updatedAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}`,
      isNote: true,
    })),
  ].slice(0, 3);
  const recentAttempts = [...attempts].sort((a, b) => b.completedAt.localeCompare(a.completedAt)).slice(0, 3);
  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl bg-[#0b4643] p-5 text-white shadow-sm md:p-7">
        <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full border border-white/10" />
        <div className="absolute -right-2 -top-8 h-40 w-40 rounded-full border border-white/10" />
        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <Badge className="mb-3 border border-white/10 bg-white/10 text-emerald-100">● Fase Intensif UTBK & Ujian Semester</Badge>
            <h1 className="text-[23px] font-bold leading-tight tracking-tight md:text-[28px]">Selamat belajar, {userName.split(" ")[0]}! Siap lanjut persiapan hari ini?</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">Konsistensi belajar meningkatkan peluang sukses. Selesaikan sesi 15 menit untuk mengunci target harian dengan sempurna.</p>
          </div>
          <div className="w-full rounded-2xl border border-white/10 bg-white/[0.09] p-4 lg:w-[260px]">
            <div className="mb-2 flex justify-between text-xs"><span>Progres Belajar Hari Ini</span><span>{todayProgress}%</span></div>
            <ProgressBar value={todayProgress} color="bg-emerald-300" />
            <div className="mt-3 flex justify-between text-[10px] text-emerald-100/80"><span>◉ {todaysSessions.filter((session) => session.done).length} sesi selesai</span><span>⚑ {todaysSessions.length} sesi terjadwal</span></div>
          </div>
        </div>
      </section>

      <Card className="flex flex-col items-start justify-between gap-4 p-4 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-emerald-700" />
          <div><div className="text-sm font-bold">Aksi Kilat Cerdas</div><div className="mt-0.5 text-xs text-slate-500">Pintasan AI & materi untuk sesi aktif</div></div>
        </div>
        <div className="flex w-full flex-wrap gap-2 md:w-auto">
          <Button variant="secondary" size="sm" onClick={onAdd}><Upload className="h-3.5 w-3.5" /> Unggah Materi Baru</Button>
          <Button variant="soft" size="sm" onClick={() => onNavigate("notes")}><Sparkles className="h-3.5 w-3.5" /> Generate Rangkuman AI</Button>
          <Button size="sm" onClick={() => onNavigate("quiz")}><BookOpenCheck className="h-3.5 w-3.5" /> Mulai Kuis Cepat</Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Metric icon={FileText} label="Materi Tersimpan" value={String(materialCount)} unit="Dokumen" footer="PDF, Catatan Web & Kuliah" tone="blue" />
        <Metric icon={Sparkles} label="Catatan Tersimpan" value={String(notes.length)} unit="Catatan" footer="Rangkuman dan catatan belajar" tone="mint" />
        <Metric icon={CheckCircle2} label="Latihan Selesai" value={String(attempts.length)} unit="Sesi" footer={attempts.length ? `Skor terakhir: ${attempts[0].score} / 100` : "Belum ada hasil latihan"} tone="mint" />
        <Metric icon={CalendarDays} label="Jadwal Hari Ini" value={String(sessions.filter((session) => !session.done).length)} unit="Sesi Tersisa" footer={nextSession ? `Sesi terdekat: ${nextSession.time}` : "Belum ada jadwal"} tone="amber" />
      </div>

      <Card className="p-5 md:flex md:items-center md:justify-between md:gap-5">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#eaf5f2] text-deep-teal"><BookOpen className="h-5 w-5" /></div>
          <div>
            <div className="flex flex-wrap items-center gap-2"><Badge variant="blue">Sesi Belajar Selanjutnya</Badge><Badge>◷ Pengingat Aktif (15 menit sebelumnya)</Badge></div>
            <h2 className="mt-2 text-base font-bold">{nextSession?.subject ?? "Biologi"}: {nextSession?.title ?? "Sel & Genetika Molekuler"}</h2>
            <p className="mt-1 text-xs text-slate-500">{nextSession ? `◷ ${nextSession.time} WIB • Durasi ${nextSession.duration}` : "Tambahkan sesi belajar untuk membuat jadwal."}</p>
            <p className="mt-1 text-xs text-slate-500">◇ Pengingat: {nextSession ? `${nextSession.reminderMinutes} menit sebelum sesi` : "dapat diatur pada sesi belajar"}</p>
          </div>
        </div>
        <div className="mt-4 flex shrink-0 gap-2 md:mt-0">
          <Button variant="soft" size="sm" onClick={() => onNavigate("schedule")}><CalendarDays className="h-3.5 w-3.5" /> Ubah Jadwal</Button>
          <Button size="sm" onClick={() => onNavigate("quiz")}><Play className="h-3.5 w-3.5" /> Mulai Belajar Sekarang</Button>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div>
          <SectionHeading icon={FolderOpen} title="Materi & Catatan Terbaru" action={<button onClick={() => onNavigate("materials")} className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900">Lihat Semua ({materialCount}) <ArrowRight className="inline h-3 w-3" /></button>} />
          <div className="space-y-2.5">
            {recentItems.length ? recentItems.map(({ id, title, subject, meta, isNote }, index) => (
              <Card key={id} className="flex items-center gap-3 p-3.5">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e1f4f5] text-deep-teal">{isNote ? <NotebookPen className="h-4.5 w-4.5" /> : <FileText className="h-4.5 w-4.5" />}</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-800">{title}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5"><Badge variant={index === 1 ? "blue" : "default"}>{isNote ? "Catatan" : "Materi"}</Badge><span className="text-[10px] text-slate-400">{subject} • {meta}</span></div>
                </div>
                <Button variant={index === 1 ? "default" : "soft"} size="sm" className="hidden shrink-0 sm:inline-flex" onClick={() => onNavigate(isNote ? "notes" : "materials")}><ArrowUpRight className="h-3 w-3" /> Buka</Button>
              </Card>
            )) : <Card className="p-6 text-center text-xs text-slate-500">Materi dan catatan yang kamu simpan akan tampil di sini.</Card>}
          </div>
          <Card className="mt-3 flex items-center justify-between gap-3 p-4">
            <div><Badge variant="default">FITUR EKSPLORASI PINTAR</Badge><div className="mt-1 text-sm font-bold">Grafik Pemahaman Konsep (Knowledge Graph)</div><p className="mt-1 max-w-xl text-xs text-slate-500">Visualisasikan korelasi antara rumus, mekanika kuantum, dan biologi molekuler secara otomatis.</p></div>
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[#eaf5f2] text-emerald-800"><Target className="h-6 w-6" /></div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <SectionHeading icon={TrendingUp} title="Skor Latihan Terakhir" detail="Riwayat akun" />
            {recentAttempts.length ? recentAttempts.map((attempt) => (
              <ScoreRow
                key={attempt.id}
                title={quizzes.find((quiz) => quiz.id === attempt.quizId)?.title ?? "Latihan"}
                score={attempt.score}
                meta={new Date(attempt.completedAt).toLocaleString("id-ID")}
              />
            )) : <p className="py-6 text-xs text-slate-500">Hasil latihan yang sudah dikumpulkan akan tampil di sini.</p>}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button variant="secondary" size="sm" onClick={() => onNavigate("quiz")}><RotateIcon /> Coba Latihan Lagi</Button>
              <Button variant="soft" size="sm" onClick={() => onNavigate("quiz")}><ListChecks className="h-3.5 w-3.5" /> Analisis Detail</Button>
            </div>
          </Card>
          <div className="rounded-2xl border border-[#d5eef0] bg-[#def4f5] p-4">
            <div className="flex items-start gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-deep-teal text-white"><Lightbulb className="h-4 w-4" /></div><div><div className="text-xs font-bold">Tips Belajar Hari Ini</div><p className="mt-1 text-xs leading-relaxed text-slate-600">Gunakan metode Feynman pada topik Biologi Sel sore ini. Jelaskan mekanisme transkripsi DNA dengan kata-katamu sendiri pada catatan rangkuman cerdas.</p></div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RotateIcon() {
  return <span aria-hidden="true" className="text-sm leading-none">↻</span>;
}

function Metric({ icon: Icon, label, value, unit, footer, tone }: { icon: LucideIcon; label: string; value: string; unit: string; footer: string; tone: string }) {
  const toneClass = tone === "amber" ? "bg-[#fff6eb] text-amber-600" : tone === "blue" ? "bg-[#effbfc] text-deep-teal" : "bg-[#eef7f3] text-emerald-700";
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div><div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</div><div className="mt-2 flex items-baseline gap-1.5"><span className="text-2xl font-bold tracking-tight text-slate-800">{value}</span><span className="text-[10px] text-slate-400">{unit}</span></div></div>
        <div className={cn("grid h-9 w-9 place-items-center rounded-xl", toneClass)}><Icon className="h-4 w-4" /></div>
      </div>
      <div className={cn("mt-3 truncate text-[10px] font-medium", tone === "amber" ? "text-amber-600" : "text-emerald-700")}>{footer}</div>
    </Card>
  );
}

function ScoreRow({ title, score, meta }: { title: string; score: number; meta: string }) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-0">
      <div className="mb-1.5 flex items-center justify-between gap-2"><div className="flex min-w-0 items-center gap-2"><span className={cn("h-2 w-2 shrink-0 rounded-full", score > 85 ? "bg-emerald-600" : score >= 80 ? "bg-emerald-500" : "bg-amber-500")} /><span className="truncate text-xs font-semibold">{title}</span></div><span className={cn("text-xs font-bold", score > 85 ? "text-emerald-700" : "text-amber-600")}>{score}%</span></div>
      <ProgressBar value={score} color={score > 85 ? "bg-emerald-600" : "bg-amber-500"} />
      <div className="mt-1.5 flex justify-between text-[9px] text-slate-400"><span>{meta}</span><span>{score >= 85 ? "Retensi tinggi" : "Perlu review"}</span></div>
    </div>
  );
}

function Materials({
  materials,
  allMaterials,
  tabs,
  activeTab,
  search,
  onSearch,
  onTabChange,
  onAdd,
  onNavigate,
  onDelete,
}: {
  materials: Material[];
  allMaterials: Material[];
  tabs: string[];
  activeTab: string;
  search: string;
  onSearch: (value: string) => void;
  onTabChange: (tab: string) => void;
  onAdd: () => void;
  onNavigate: (page: PageId) => void;
  onDelete: (id: string) => void;
}) {
  const storedBytes = allMaterials.reduce((total, material) => total + (material.sizeBytes ?? 0), 0);
  const storageLimit = 5 * 1024 * 1024 * 1024;
  const storageUsage = Math.min(100, Math.round((storedBytes / storageLimit) * 100));
  return (
    <div className="space-y-5">
      <Card className="flex flex-col justify-between gap-5 p-6 md:flex-row md:items-center">
        <div><Badge>● MODUL FR-01: INPUT REPOSITORY • {allMaterials.length} Materi Tersimpan</Badge><h1 className="mt-2 text-2xl font-bold tracking-tight">Manajemen & Input Sumber Belajar</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">Simpan sumber belajar untuk catatan dan latihan. Ekstraksi konten otomatis belum dikonfigurasi.</p></div>
        <div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={onAdd}><Link2 className="h-4 w-4" /> Tambah Tautan Web</Button><Button onClick={onAdd}><FilePlus2 className="h-4 w-4" /> Unggah File (PDF, DOCX)</Button></div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_0.9fr]">
        <Card className="p-5">
          <SectionHeading icon={CloudUpload} title="Unggah Berkas Materi Ajar" detail="Maksimal 25 MB per berkas" />
          <button onClick={onAdd} className="flex min-h-[190px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-[#f8fbfa] p-6 text-center transition hover:border-emerald-400 hover:bg-[#f2f9f6]">
            <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[#eaf5f2] text-deep-teal"><Upload className="h-5 w-5" /></div>
            <div className="text-sm font-semibold">Tarik & lepas berkas modul ke sini, atau <span className="text-emerald-700 underline">telusuri komputer</span></div>
            <div className="mt-1 text-xs text-slate-400">Mendukung format populer: PDF, DOCX, dan TXT.</div>
            <div className="mt-3 flex gap-1.5"><Badge variant="blue">PDF v1.7+</Badge><Badge variant="blue">DOCX Office</Badge><Badge variant="blue">Markdown / TXT</Badge></div>
          </button>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-[#f2faf7] px-4 py-3 text-xs"><span className="flex items-center gap-2 text-slate-600"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Pencatatan materi siap</span><span className="font-semibold text-emerald-700">Maks. 25 MB</span></div>
        </Card>
        <div className="space-y-4">
          <Card className="p-5">
            <SectionHeading icon={Link2} title="Ekstrak Tautan Web" />
            <p className="text-xs leading-relaxed text-slate-500">Simpan tautan artikel jurnal, ensiklopedia edukasi, atau catatan online sebagai sumber belajarmu.</p>
            <label className="mt-4 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">URL Sumber Dokumen</label>
            <div className="mt-1 flex h-10 items-center rounded-lg border border-slate-200 px-3 text-xs text-slate-400"><Link2 className="mr-2 h-3.5 w-3.5" /> Masukkan URL di formulir materi</div>
            <Button className="mt-3 w-full" variant="secondary" onClick={onAdd}><Link2 className="h-3.5 w-3.5" /> Simpan Tautan Materi</Button>
          </Card>
          <Card className="p-5">
            <div className="flex justify-between text-xs font-semibold"><span>Total ukuran berkas</span><span className="text-emerald-700">{(storedBytes / 1024 / 1024).toFixed(1)} MB</span></div>
            <div className="mt-3"><ProgressBar value={storageUsage} /></div>
            <div className="mt-2 text-[10px] text-slate-400">Ukuran dihitung dari metadata berkas yang disimpan.</div>
          </Card>
        </div>
      </div>

      <Card className="flex flex-col gap-3 p-3 md:flex-row md:items-center">
        <div className="scrollbar-hidden flex gap-1 overflow-x-auto">
          {tabs.map((tab, index) => <button key={tab} onClick={() => onTabChange(tab)} className={cn("shrink-0 rounded-full px-3 py-2 text-[10px] font-semibold", activeTab === tab ? "bg-deep-teal text-white" : "bg-[#effbfc] text-slate-600 hover:bg-[#e2f3f3]")}>{tab}{index === 0 ? ` (${allMaterials.length})` : ""}</button>)}
        </div>
        <label className="ml-auto flex h-9 min-w-[190px] items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 text-slate-400"><Search className="h-3.5 w-3.5" /><input aria-label="Cari judul materi atau sumber" value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Cari judul materi atau sumber..." className="w-full bg-transparent text-[11px] text-slate-700 outline-none placeholder:text-slate-400" /></label>
        <Button aria-label="Filter materi" variant="soft" size="icon"><Filter className="h-4 w-4" /></Button>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_0.7fr]">
        <div className="space-y-3">
          {materials.length ? materials.map((material) => (
            <Card key={material.id} className="flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center">
              <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", material.type === "LINK" ? "bg-[#e5f7f5] text-emerald-700" : "bg-[#eaf5f2] text-deep-teal")}>{material.type === "LINK" ? <Link2 className="h-5 w-5" /> : <FileText className="h-5 w-5" />}</div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5"><Badge variant="blue">{material.category}</Badge><Badge>{material.status === "processing" ? "Menunggu diproses" : material.type === "LINK" ? "Tautan Web" : "Tersimpan"}</Badge><span className="text-[10px] text-slate-400">• {material.size}</span></div>
                <h3 className="mt-1 truncate text-sm font-semibold">{material.title}</h3>
                <p className="mt-1 text-[10px] text-slate-400">Ditambahkan {material.added} • {material.subject}</p>
              </div>
              <div className="flex w-full gap-2 sm:w-auto">
                <Button size="sm" onClick={() => onNavigate("notes")}><Sparkles className="h-3 w-3" /> Rangkuman AI</Button>
                <Button size="sm" variant="soft" onClick={() => onNavigate("quiz")}><ListChecks className="h-3 w-3" /> Buat Soal</Button>
                <button aria-label={`Hapus ${material.title}`} onClick={() => onDelete(material.id)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            </Card>
          )) : <Card className="p-10 text-center"><FolderOpen className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-semibold">Materi tidak ditemukan</p><p className="mt-1 text-xs text-slate-400">Coba ubah pencarian atau tambahkan materi baru.</p></Card>}
        </div>
        <div className="space-y-4">
          <Card className="p-5">
            <SectionHeading icon={Sparkles} title="Status Ekstraksi AI" detail="Real-time" />
            {allMaterials.filter((item) => item.status === "processing").length
              ? allMaterials.filter((item) => item.status === "processing").map((item) => <div key={item.id} className="mb-2 flex items-center gap-3 rounded-xl bg-slate-50 p-3 last:mb-0"><span className="grid h-7 w-7 place-items-center rounded-full bg-amber-100 text-amber-700"><Timer className="h-4 w-4" /></span><div className="min-w-0 flex-1"><div className="truncate text-xs font-semibold">{item.title}</div><div className="mt-0.5 text-[10px] text-amber-700">Menunggu konfigurasi pemrosesan</div></div></div>)
              : <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">Belum ada antrean ekstraksi.</p>}
          </Card>
          <Card className="p-5"><SectionHeading icon={Lightbulb} title="Tips Bahan Ujian Efektif" /><p className="text-xs leading-relaxed text-slate-500">Unggah silabus ujian satu tahun belakangan dan soal-soal terbaru untuk hasil rangkuman prediktif dengan tingkat akurasi target hingga 90%.</p><button onClick={onAdd} className="mt-3 text-xs font-semibold text-deep-teal">Pelajari pedoman format berkas <ArrowUpRight className="inline h-3.5 w-3.5" /></button></Card>
        </div>
      </div>
    </div>
  );
}

function Notes({
  title,
  text,
  materials,
  notes,
  selectedNoteId,
  selectedMaterialIds,
  saved,
  onSelectNote,
  onToggleSource,
  onDeleteNote,
  onNewNote,
  onTitleChange,
  onTextChange,
  onSave,
  onQuiz,
  onGenerate,
  summaryBusy,
  summaryFeedback,
}: {
  title: string;
  text: string;
  materials: Material[];
  notes: NoteRecord[];
  selectedNoteId: string | null;
  selectedMaterialIds: string[];
  saved: boolean;
  onSelectNote: (id: string) => void;
  onToggleSource: (id: string) => void;
  onDeleteNote: () => void;
  onNewNote: () => void;
  onTitleChange: (value: string) => void;
  onTextChange: (value: string) => void;
  onSave: () => void;
  onQuiz: () => void;
  onGenerate: () => void;
  summaryBusy: boolean;
  summaryFeedback: string;
}) {
  const selectedNote = notes.find((note) => note.id === selectedNoteId);
  return (
    <div className="space-y-5">
      <Card className="flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center">
        <div><Badge>✦ FR-02 & FR-03 • CATATAN BELAJAR</Badge><h1 className="mt-2 text-2xl font-bold tracking-tight">Rangkuman & Catatan Belajar</h1><p className="mt-1 text-sm text-slate-500">Catatan tersimpan di akun dan dapat dihubungkan dengan sumber materi.</p></div>
        <div className="flex flex-wrap gap-2"><Button variant="soft" onClick={() => window.print()}><ArrowDownToLine className="h-4 w-4" /> Ekspor PDF</Button><Button variant="secondary" onClick={onSave}><CheckCircle2 className="h-4 w-4" /> Simpan Catatan</Button><Button onClick={onQuiz}><BookOpenCheck className="h-4 w-4" /> Buka Latihan</Button></div>
      </Card>
      <div className="grid items-start gap-5 xl:grid-cols-[0.7fr_1.3fr]">
        <div className="space-y-4">
          <Card className="p-5">
            <SectionHeading icon={Layers} title="Catatan Saya" detail={`${notes.length} tersimpan`} action={<button onClick={onNewNote} className="text-[10px] font-semibold text-emerald-700">+ Catatan Baru</button>} />
            {notes.length > 0 && <select aria-label="Pilih catatan" value={selectedNoteId ?? ""} onChange={(event) => onSelectNote(event.target.value)} className="mb-3 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs">
              {notes.map((note) => <option key={note.id} value={note.id}>{note.title}</option>)}
            </select>}
            {selectedNoteId && <Button variant="outline" size="sm" className="mb-3 w-full text-rose-700" onClick={onDeleteNote}><Trash2 className="h-3.5 w-3.5" /> Hapus Catatan Ini</Button>}
            <SectionHeading icon={Layers} title="Sumber Materi" detail={`${materials.length} tersedia`} />
            <p className="text-xs leading-relaxed text-slate-500">Pilih berkas kuliah atau tautan sumber untuk menjadi rujukan AI.</p>
            {materials.slice(0, 6).map((material) => <label key={material.id} className="mt-2 flex cursor-pointer items-center gap-2 rounded-lg bg-[#eff8f4] p-2.5 text-xs"><input type="checkbox" checked={selectedMaterialIds.includes(material.id)} onChange={() => onToggleSource(material.id)} /><FileText className="h-4 w-4 shrink-0 text-emerald-700" /><span className="flex-1 font-semibold">{material.title}</span></label>)}
            {!materials.length && <p className="mt-2 text-xs text-slate-500">Tambahkan materi agar sumber dapat ditautkan ke catatan.</p>}
            <Button variant="soft" size="sm" className="mt-2 w-full"><Plus className="h-3.5 w-3.5" /> Tambah Dokumen / Slide Tambahan</Button>
          </Card>
          <Card className="p-5">
            <SectionHeading icon={Sparkles} title="Rangkuman Otomatis" />
            <p className="text-xs leading-relaxed text-slate-500">Gemini merangkum teks di Isi Catatan (minimal 30 karakter). Materi terpilih berupa tautan atau metadata file belum bisa diekstrak otomatis.</p>
            <Button className="mt-4 w-full" variant="outline" onClick={onGenerate} disabled={summaryBusy}>
              <Sparkles className="h-4 w-4" /> {summaryBusy ? "Sedang Merangkum..." : "Buat Rangkuman dengan Gemini"}
            </Button>
            {summaryFeedback && (
              <p
                role={summaryBusy ? "status" : "alert"}
                className={cn(
                  "mt-3 rounded-lg px-3 py-2 text-xs leading-relaxed",
                  summaryBusy ? "bg-sky-50 text-sky-800" : "bg-amber-50 text-amber-900",
                )}
              >
                {summaryFeedback}
              </p>
            )}
          </Card>
        </div>
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="p-5 md:p-6">
            <div className="mb-3 flex items-center justify-between gap-2"><Badge variant="blue">{selectedNote?.subject ?? "Catatan Baru"}</Badge><span className="text-[10px] text-slate-400">{saved ? `Tersimpan • ${selectedNote ? new Date(selectedNote.updatedAt).toLocaleString("id-ID") : ""}` : "Perubahan belum disimpan"}</span></div>
            <input aria-label="Judul catatan" value={title} onChange={(event) => onTitleChange(event.target.value)} placeholder="Judul catatan" className="w-full border-0 bg-transparent text-xl font-bold tracking-tight outline-none placeholder:text-slate-400 md:text-2xl" />
            <div className="mt-4 rounded-xl bg-[#effbfc] p-4">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold"><span className="flex items-center gap-2"><NotebookPen className="h-4 w-4 text-deep-teal" />Isi Catatan</span><span className="text-[9px] font-normal text-slate-400">{saved ? "Tersimpan" : "Belum disimpan"}</span></div>
              <textarea aria-label="Isi catatan pribadi" value={text} onChange={(event) => onTextChange(event.target.value)} placeholder="Tulis catatan atau rangkuman di sini..." className="min-h-[360px] w-full resize-y rounded-lg border border-slate-100 bg-white p-4 text-sm leading-relaxed text-slate-700 outline-none focus:border-emerald-400" />
            </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Quiz({
  questionIndex,
  answers,
  finished,
  score,
  answeredCount,
  questions,
  quizTitle,
  availableQuizzes,
  selectedQuizId,
  attempt,
  onStartSample,
  onGenerateAI,
  canGenerateAI,
  feedback,
  busy,
  onSelectQuiz,
  onAnswer,
  onQuestion,
  onFinish,
  onRestart,
  onNavigate,
}: {
  questionIndex: number;
  answers: Record<number, number>;
  finished: boolean;
  score: number;
  answeredCount: number;
  questions: QuizViewQuestion[];
  quizTitle: string;
  availableQuizzes: QuizRecord[];
  selectedQuizId: string;
  attempt: QuizAttempt | null;
  onStartSample: () => void;
  onGenerateAI: () => void;
  canGenerateAI: boolean;
  feedback: { kind: "status" | "error"; message: string } | null;
  busy: boolean;
  onSelectQuiz: (id: string) => void;
  onAnswer: (option: number) => void;
  onQuestion: (index: number) => void;
  onFinish: () => void;
  onRestart: () => void;
  onNavigate: (page: PageId) => void;
}) {
  const question = questions[questionIndex];
  const [flagged, setFlagged] = useState<number[]>([]);

  if (!questions.length) {
    return (
      <Card className="p-10 text-center">
        <BookOpenCheck className="mx-auto h-9 w-9 text-deep-teal" />
        <h1 className="mt-3 text-lg font-bold">Belum ada latihan</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Buat 5 soal pilihan ganda dari teks di catatanmu, atau mulai latihan contoh. AI belum bisa membaca isi PDF atau tautan yang hanya disimpan sebagai metadata.</p>
        {feedback && (
          <p
            role={feedback.kind === "error" ? "alert" : "status"}
            className={cn(
              "mx-auto mt-4 max-w-xl rounded-lg px-3 py-2 text-sm",
              feedback.kind === "error" ? "bg-rose-50 text-rose-700" : "bg-sky-50 text-sky-800",
            )}
          >
            {feedback.message}
          </p>
        )}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button onClick={onGenerateAI} disabled={busy}><Sparkles className="h-4 w-4" /> {busy ? "Membuat Soal..." : "Buat Soal dengan AI"}</Button>
          {!canGenerateAI && <Button variant="secondary" onClick={() => onNavigate("notes")} disabled={busy}><NotebookPen className="h-4 w-4" /> Buka Catatan</Button>}
          <Button variant="secondary" onClick={onStartSample} disabled={busy}><Play className="h-4 w-4" /> Latihan Biologi Contoh</Button>
        </div>
        {!canGenerateAI && <p className="mt-3 text-xs text-slate-400">Isi catatan dengan setidaknya 50 karakter agar bisa membuat soal AI.</p>}
      </Card>
    );
  }

  if (finished) {
    const review = attempt?.review ?? [];
    return (
      <div className="space-y-5">
        <Card className="flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center"><div><Badge>◉ EVALUASI PEMAHAMAN INSTAN</Badge><h1 className="mt-2 text-2xl font-bold">Laporan Hasil & Kunci Analisis</h1><p className="mt-1 text-sm text-slate-500">Hasil latihan tersimpan di akunmu.</p></div><div className="flex gap-2"><Button variant="secondary" onClick={() => window.print()}><ArrowDownToLine className="h-4 w-4" /> Unduh PDF Report</Button><Button onClick={onRestart}><RotateIcon /> Ulangi Simulasi</Button></div></Card>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="bg-[#0b4643] p-5 text-white"><div className="text-xs text-white/70">SKOR AKHIR EVALUASI</div><div className="mt-3 text-4xl font-bold">{score}<span className="text-base font-normal text-white/60"> /100</span></div><Badge className="mt-2 bg-emerald-700 text-white">◎ Predikat {score >= 80 ? "Sangat Baik" : "Terus Berlatih"}</Badge></Card>
          <Card className="p-5"><div className="text-xs text-slate-400">Akurasi Jawaban</div><div className="mt-5 text-2xl font-bold">{attempt?.correctCount ?? 0} / {attempt?.questionCount ?? questions.length}</div><div className="mt-1 text-[10px] text-emerald-700">{score}% Ketepatan Konsep</div></Card>
          <Card className="p-5"><div className="text-xs text-slate-400">Waktu Pengerjaan</div><div className="mt-5 text-2xl font-bold">Selesai</div><div className="mt-1 text-[10px] text-slate-400">{attempt ? new Date(attempt.completedAt).toLocaleString("id-ID") : ""}</div></Card>
          <Card className="p-5"><div className="text-xs text-slate-400">Status Retensi</div><div className={cn("mt-5 text-2xl font-bold", score >= 80 ? "text-emerald-700" : "text-amber-600")}>{score >= 80 ? "Tinggi" : "Perlu Penguatan"}</div><div className="mt-1 text-[10px] text-slate-400">{score >= 80 ? "Siap untuk Ujian Final" : "Ulangi materi yang belum dikuasai"}</div></Card>
        </div>
        <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
          <Card className="p-5"><SectionHeading icon={FileText} title="Pembahasan Kilat & Diagnosa Jawaban" detail={`${questions.length} soal`} />
            <div className="space-y-3">{questions.map((item, index) => {
              const itemReview = review.find((result) => result.questionId === item.id);
              const correct = itemReview?.correctAnswer;
              const isCorrect = itemReview?.isCorrect ?? false;
              return <div key={item.id} className="rounded-xl bg-slate-50 p-4"><div className="flex items-center justify-between gap-2"><Badge variant={isCorrect ? "default" : "amber"}>Soal {index + 1}</Badge><Badge variant={isCorrect ? "default" : "amber"}>{isCorrect ? "Jawaban Tepat" : "Perlu Ditinjau"}</Badge></div><p className="mt-2 text-xs text-slate-500">{item.question}</p><div className="mt-2 text-xs font-semibold">{correct === undefined ? "Kunci tidak tersedia." : item.options[correct]}</div><p className="mt-2 rounded-lg bg-[#eaf5f2] p-3 text-xs leading-relaxed text-slate-600">{itemReview?.explanation || "Tidak ada pembahasan untuk soal ini."}</p></div>;
            })}</div>
            <Button className="mt-4 w-full" variant="secondary" onClick={() => onNavigate("notes")}><BookOpenCheck className="h-4 w-4" /> Buka Pembahasan Lengkap Semua Soal</Button>
          </Card>
          <div className="space-y-4">
            <Card className="p-5"><SectionHeading icon={Sparkles} title="Rekomendasi Remedial" /><p className="text-xs text-slate-500">Berdasarkan hasil evaluasi, fokuskan pengulangan materi pada modul di bawah ini:</p><div className="mt-4 rounded-xl bg-[#fff8ed] p-3"><div className="flex items-center justify-between text-xs font-semibold">Siklus Krebs & Enzim Dehidrogenase <Badge variant="amber">Pelajari</Badge></div><div className="mt-2 text-[10px] text-slate-500">Tingkat penguasaan: 50%</div></div><Button className="mt-4 w-full" onClick={() => onNavigate("materials")}><BookOpen className="h-4 w-4" /> Ulangi Materi yang Belum Dikuasai</Button></Card>
            <Card className="p-5"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Target className="h-5 w-5" /></div><div><div className="text-sm font-semibold">Target UTBK Kedokteran</div><p className="mt-1 text-xs text-slate-500">Tersisa 4 sub-topik Biologi untuk diselesaikan minggu ini.</p></div></div></Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {feedback && (
        <p
          role={feedback.kind === "error" ? "alert" : "status"}
          className={cn(
            "rounded-xl px-4 py-3 text-sm",
            feedback.kind === "error" ? "bg-rose-50 text-rose-700" : "bg-sky-50 text-sky-800",
          )}
        >
          {feedback.message}
        </p>
      )}
      <Card className="flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center"><div><Badge>FR-04 • LATIHAN ADAPTIF</Badge><h1 className="mt-2 text-2xl font-bold tracking-tight">{quizTitle}</h1><p className="mt-1 text-sm text-slate-500">Sesi terfokus dengan format pilihan ganda.</p>{availableQuizzes.length > 1 && <select aria-label="Pilih latihan" value={selectedQuizId} onChange={(event) => onSelectQuiz(event.target.value)} className="mt-3 h-9 max-w-full rounded-lg border border-slate-200 bg-white px-3 text-xs">{availableQuizzes.map((quiz) => <option key={quiz.id} value={quiz.id}>{quiz.title}</option>)}</select>}</div><div className="flex flex-wrap items-center gap-3 rounded-xl bg-[#fff9f0] px-4 py-3"><div><div className="text-[10px] text-slate-500">Status</div><div className="text-lg font-bold">Berlangsung</div></div><Button size="sm" variant="secondary" onClick={onGenerateAI} disabled={busy}><Sparkles className="h-4 w-4" /> {busy ? "Membuat Soal..." : "Soal AI"}</Button><Button size="sm" variant="secondary" onClick={onStartSample} disabled={busy}>Latihan Baru</Button><Button size="sm" onClick={onFinish} disabled={busy}>Kumpulkan</Button></div></Card>
      <Card className="p-4"><div className="flex flex-wrap items-center justify-between gap-3 text-xs"><div className="font-semibold">◉ Progres: Soal {questionIndex + 1} dari {questions.length}</div><div>{Math.round((answeredCount / questions.length) * 100)}% Tuntas</div></div><div className="mt-3"><ProgressBar value={(answeredCount / questions.length) * 100} /></div></Card>
      <div className="grid items-start gap-5 xl:grid-cols-[0.6fr_1.4fr]">
        <div className="space-y-4">
          <Card className="p-5"><SectionHeading icon={ListChecks} title="Navigasi Soal" detail={`${questions.length} Soal`} /><div className="grid grid-cols-5 gap-2">{questions.map((item, index) => <button key={item.id} onClick={() => onQuestion(index)} aria-label={`Buka soal ${index + 1}`} className={cn("grid aspect-square place-items-center rounded-lg text-xs font-semibold transition", index === questionIndex ? "bg-deep-teal text-white ring-2 ring-emerald-200" : answers[index] !== undefined ? "bg-emerald-700 text-white" : flagged.includes(index) ? "bg-amber-500 text-white" : "bg-[#e6f5f8] text-slate-700 hover:bg-[#d8eef0]")}>{String(index + 1).padStart(2, "0")}</button>)}</div><div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-4 text-[10px] text-slate-500"><span>🟢 Terisi</span><span>🟠 Ragu-ragu</span><span>◯ Belum diisi</span></div><Button className="mt-4 w-full" variant="secondary" onClick={() => setFlagged((current) => current.includes(questionIndex) ? current.filter((item) => item !== questionIndex) : [...current, questionIndex])}><Flag className="h-4 w-4" /> {flagged.includes(questionIndex) ? "Hapus Tanda Ragu" : `Tandai Ragu-ragu (No. ${questionIndex + 1})`}</Button><Button className="mt-2 w-full" onClick={onFinish}><CheckCircle2 className="h-4 w-4" /> Selesaikan & Kumpulkan</Button></Card>
          <div className="rounded-2xl bg-[#eaf5f2] p-5"><div className="flex items-center gap-2 text-sm font-semibold"><Lightbulb className="h-4 w-4 text-deep-teal" />Tips Manajemen Waktu</div><p className="mt-2 text-xs leading-relaxed text-slate-500">Gunakan eliminasi sistematis untuk soal metabolisme bertahap. Jawaban dapat diubah sewaktu-waktu sebelum tombol kumpulkan ditekan.</p></div>
        </div>
        <Card className="p-5 md:p-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><Badge className="bg-deep-teal text-white">SOAL NO. {String(questionIndex + 1).padStart(2, "0")}</Badge><Badge variant="blue">Pilihan Ganda</Badge></div></div>
          <h2 className="text-base font-medium leading-relaxed text-slate-700 md:text-lg">{question.question}</h2>
          <div className="mt-4 rounded-xl bg-slate-50 p-4"><div className="flex gap-3"><div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#eaf5f2] text-deep-teal"><Lightbulb className="h-4 w-4" /></div><div><div className="text-xs font-semibold">Strategi Menjawab</div><p className="mt-1 text-xs leading-relaxed text-slate-500">Tentukan konsep utama yang ditanyakan, lalu eliminasi pilihan yang tidak didukung oleh materi sumber.</p></div></div></div>
          <div className="mt-5 space-y-2.5">{question.options.map((option, index) => <button key={option} onClick={() => onAnswer(index)} className={cn("flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm transition", answers[questionIndex] === index ? "border-emerald-200 bg-[#eaf5f2]" : "border-slate-100 bg-white hover:border-emerald-200 hover:bg-slate-50")}><span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-semibold", answers[questionIndex] === index ? "bg-deep-teal text-white" : "bg-[#f1f7f6] text-slate-700")}>{String.fromCharCode(65 + index)}</span><span className="flex-1 text-xs leading-relaxed text-slate-700">{option}</span><span className={cn("h-4 w-4 shrink-0 rounded-full border", answers[questionIndex] === index ? "border-deep-teal bg-deep-teal ring-2 ring-white ring-inset" : "border-slate-300")} /></button>)}</div>
          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><Button variant="soft" size="sm" disabled={questionIndex === 0} onClick={() => onQuestion(questionIndex - 1)}><ArrowLeft className="h-4 w-4" /> Soal Sebelumnya</Button><div className="flex gap-2">{questionIndex < questions.length - 1 ? <Button size="sm" onClick={() => onQuestion(questionIndex + 1)}>Soal Selanjutnya <ArrowRight className="h-4 w-4" /></Button> : <Button size="sm" onClick={onFinish}>Kumpulkan Jawaban <Check className="h-4 w-4" /></Button>}</div></div>
        </Card>
      </div>
      <Card className="flex items-center justify-between gap-3 p-4"><div className="flex items-center gap-2"><BookOpenCheck className="h-4 w-4 text-deep-teal" /><span className="text-xs font-semibold">Rangkuman Terkait Otomatis</span></div><button onClick={() => onNavigate("notes")} className="text-xs font-semibold text-deep-teal">Buka Catatan <ArrowUpRight className="inline h-3.5 w-3.5" /></button></Card>
    </div>
  );
}

function Schedule({ sessions, onToggle, onAdd, onDelete }: { sessions: StudySession[]; onToggle: (index: number) => void; onAdd: () => void; onDelete: (id: string) => void }) {
  const completed = sessions.filter((session) => session.done).length;
  const completionRate = sessions.length ? Math.round((completed / sessions.length) * 100) : 0;
  return (
    <div className="space-y-5">
      <Card className="flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center"><div><Badge>FR-05 • BELAJAR KONSISTEN</Badge><h1 className="mt-2 text-2xl font-bold tracking-tight">Jadwal & Rencana Belajar</h1><p className="mt-1 text-sm text-slate-500">Atur sesi, pengingat, dan progres belajar agar persiapan ujian tetap terarah.</p></div><Button onClick={onAdd}><Plus className="h-4 w-4" /> Tambah Sesi</Button></Card>
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric icon={CalendarDays} label="Sesi Hari Ini" value={String(sessions.length)} unit="sesi" footer="Rencana belajar aktif" tone="blue" />
        <Metric icon={CheckCircle2} label="Selesai" value={String(completed)} unit="sesi" footer="Progres hari ini" tone="mint" />
        <Metric icon={AlarmClock} label="Belum Selesai" value={String(sessions.length - completed)} unit="sesi" footer="Sesi yang belum ditandai selesai" tone="amber" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-5 md:p-6"><SectionHeading icon={CalendarDays} title={new Date().toLocaleDateString("id-ID", { dateStyle: "full" })} detail="Agenda Belajar" /><div className="mt-5 space-y-3">{sessions.length ? sessions.map((session, index) => <div key={session.id} className={cn("flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center", session.done ? "border-emerald-100 bg-[#f3faf7]" : "border-slate-100 bg-white")}><div className="w-14 shrink-0"><div className="text-sm font-bold">{session.time}</div><div className="mt-1 text-[10px] text-slate-400">{session.duration}</div></div><div className="h-10 w-1 shrink-0 rounded-full bg-emerald-500" /><div className="min-w-0 flex-1"><Badge variant="blue">{session.subject}</Badge><h3 className="mt-1 text-sm font-semibold">{session.title}</h3><p className="mt-1 text-[10px] text-slate-500">{new Date(session.scheduledAt).toLocaleDateString("id-ID")} • Pengingat {session.reminderMinutes} menit sebelumnya</p></div><Button variant={session.done ? "secondary" : "outline"} size="sm" onClick={() => onToggle(index)}>{session.done ? <><Check className="h-3.5 w-3.5" /> Selesai</> : "Tandai Selesai"}</Button><button aria-label={`Hapus sesi ${session.title}`} onClick={() => onDelete(session.id)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button></div>) : <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">Belum ada jadwal belajar. Tambahkan sesi pertama untuk merencanakan belajarmu.</p>}</div></Card>
        <div className="space-y-4">
          <Card className="p-5"><SectionHeading icon={TrendingUp} title="Progres Semua Sesi" /><div className="mt-5 flex items-end justify-between"><span className="text-3xl font-bold">{completionRate}%</span><span className="text-xs text-emerald-700">{completed} selesai</span></div><div className="mt-3"><ProgressBar value={completionRate} /></div><div className="mt-3 flex justify-between text-[10px] text-slate-400"><span>{sessions.length} sesi tersimpan</span><span>{sessions.length - completed} belum selesai</span></div></Card>
          <div className="rounded-2xl bg-[#eaf5f2] p-5"><div className="flex items-center gap-2 text-sm font-semibold"><Bell className="h-4 w-4 text-deep-teal" />Pengingat Belajar Aktif</div><p className="mt-2 text-xs leading-relaxed text-slate-600">Kamu akan menerima pengingat 15 menit sebelum sesi dimulai. Pastikan notifikasi perangkat aktif.</p><Button variant="soft" size="sm" className="mt-3"><Settings className="h-3.5 w-3.5" /> Atur Pengingat</Button></div>
        </div>
      </div>
    </div>
  );
}

function SettingsPage({
  dark,
  userName,
  userEmail,
  notificationsEnabled,
  onSaveProfile,
  onToggleDark,
  onToggleNotifications,
}: {
  dark: boolean;
  userName: string;
  userEmail: string;
  notificationsEnabled: boolean;
  onSaveProfile: (name: string) => void;
  onToggleDark: () => void;
  onToggleNotifications: () => void;
}) {
  const [name, setName] = useState(userName);
  return (
    <div className="space-y-5">
      <Card className="p-6"><Badge>FR-07 • PREFERENSI AKUN</Badge><h1 className="mt-2 text-2xl font-bold">Pengaturan</h1><p className="mt-1 text-sm text-slate-500">Atur tampilan dan preferensi belajar sesuai kebutuhanmu.</p></Card>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5"><SectionHeading icon={GraduationCap} title="Profil Belajar" /><div className="mt-4 space-y-3"><label className="block text-xs font-medium text-slate-600">Nama<input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500" /></label><div className="text-xs font-medium text-slate-600">Email<div className="mt-1 rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-600">{userEmail}</div></div></div><Button className="mt-4" disabled={!name.trim()} onClick={() => onSaveProfile(name.trim())}>Simpan Profil</Button></Card>
        <Card className="p-5"><SectionHeading icon={Settings} title="Preferensi Aplikasi" /><div className="mt-4 flex items-center justify-between border-b border-slate-100 py-4"><div><div className="text-sm font-semibold">Mode Gelap</div><div className="mt-1 text-xs text-slate-500">Sesuaikan tampilan untuk belajar malam.</div></div><button role="switch" aria-checked={dark} onClick={onToggleDark} className={cn("relative h-6 w-11 rounded-full transition", dark ? "bg-deep-teal" : "bg-slate-200")}><span className={cn("absolute top-1 h-4 w-4 rounded-full bg-white transition", dark ? "left-6" : "left-1")} /></button></div><div className="flex items-center justify-between py-4"><div><div className="text-sm font-semibold">Pengingat Belajar</div><div className="mt-1 text-xs text-slate-500">Preferensi pengingat tersimpan ke akun.</div></div><button role="switch" aria-checked={notificationsEnabled} onClick={onToggleNotifications} className={cn("relative h-6 w-11 rounded-full transition", notificationsEnabled ? "bg-deep-teal" : "bg-slate-200")}><span className={cn("absolute top-1 h-4 w-4 rounded-full bg-white transition", notificationsEnabled ? "left-6" : "left-1")} /></button></div><Button variant="secondary"><CircleHelp className="h-4 w-4" /> Pusat Bantuan</Button></Card>
      </div>
    </div>
  );
}
