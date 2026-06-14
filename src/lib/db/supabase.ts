import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AttendancePoint } from "@/lib/streaks";
import type { Session, Student, Turma } from "@/lib/types";
import type { Database } from "./index";

let client: SupabaseClient | null = null;

/** Cliente com a chave service_role — use SOMENTE no servidor (rotas/route handlers). */
function sb(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

function mapTurma(row: Record<string, unknown>): Turma {
  return { id: row.id as string, name: row.name as string, weekdays: (row.weekdays as number[]) ?? [] };
}

function mapStudent(row: Record<string, unknown>): Student {
  return {
    id: row.id as string,
    turmaId: row.turma_id as string,
    name: row.name as string,
    email: row.email as string,
    grade: row.grade as number,
    hubToken: row.hub_token as string,
    active: row.active as boolean,
  };
}

function mapSession(row: Record<string, unknown>): Session {
  return { id: row.id as string, turmaId: row.turma_id as string, date: row.date as string };
}

export const supabaseDb: Database = {
  isDemo: false,

  async listTurmas() {
    const { data, error } = await sb().from("turmas").select("*").order("name");
    if (error) throw error;
    return (data ?? []).map(mapTurma);
  },
  async getTurma(id) {
    const { data } = await sb().from("turmas").select("*").eq("id", id).maybeSingle();
    return data ? mapTurma(data) : null;
  },
  async listStudents(turmaId) {
    const { data, error } = await sb()
      .from("students")
      .select("*")
      .eq("turma_id", turmaId)
      .eq("active", true)
      .order("name");
    if (error) throw error;
    return (data ?? []).map(mapStudent);
  },
  async listAllStudents() {
    const { data, error } = await sb().from("students").select("*").eq("active", true);
    if (error) throw error;
    return (data ?? []).map(mapStudent);
  },
  async getStudentByToken(token) {
    const { data } = await sb().from("students").select("*").eq("hub_token", token).maybeSingle();
    return data ? mapStudent(data) : null;
  },
  async getStudentById(id) {
    const { data } = await sb().from("students").select("*").eq("id", id).maybeSingle();
    return data ? mapStudent(data) : null;
  },
  async getOrCreateSession(turmaId, date) {
    const existing = await sb()
      .from("sessions")
      .select("*")
      .eq("turma_id", turmaId)
      .eq("date", date)
      .maybeSingle();
    if (existing.data) return mapSession(existing.data);
    const { data, error } = await sb()
      .from("sessions")
      .insert({ turma_id: turmaId, date })
      .select("*")
      .single();
    if (error) throw error;
    return mapSession(data);
  },
  async listSessionsForTurma(turmaId) {
    const { data, error } = await sb()
      .from("sessions")
      .select("*")
      .eq("turma_id", turmaId)
      .order("date");
    if (error) throw error;
    return (data ?? []).map(mapSession);
  },
  async getAttendanceForSession(sessionId) {
    const { data, error } = await sb()
      .from("attendance")
      .select("session_id, student_id, status")
      .eq("session_id", sessionId);
    if (error) throw error;
    return (data ?? []).map((r) => ({
      sessionId: r.session_id as string,
      studentId: r.student_id as string,
      status: r.status,
    }));
  },
  async getHistoryForStudent(studentId): Promise<AttendancePoint[]> {
    const { data, error } = await sb()
      .from("attendance")
      .select("status, sessions(date)")
      .eq("student_id", studentId);
    if (error) throw error;
    return (data ?? [])
      .map((r) => {
        const session = r.sessions as unknown as { date: string } | null;
        return { date: session?.date ?? "", status: r.status };
      })
      .filter((p) => p.date);
  },
  async saveAttendance(sessionId, records) {
    const rows = records.map((r) => ({
      session_id: sessionId,
      student_id: r.studentId,
      status: r.status,
    }));
    const { error } = await sb()
      .from("attendance")
      .upsert(rows, { onConflict: "session_id,student_id" });
    if (error) throw error;
  },
  async listRecentNotificationKeys(studentId) {
    const { data } = await sb()
      .from("notification_logs")
      .select("kind, streak_value")
      .eq("student_id", studentId);
    return new Set((data ?? []).map((n) => `${n.kind}:${n.streak_value}`));
  },
  async logNotification(log) {
    await sb().from("notification_logs").insert({
      student_id: log.studentId,
      channel: log.channel,
      kind: log.kind,
      streak_value: log.streakValue,
      sent_at: log.sentAt,
    });
  },
};
