import type {
  AttendanceRecord,
  NotificationLog,
  Session,
  Student,
  Turma,
} from "@/lib/types";
import type { AttendancePoint } from "@/lib/streaks";

/**
 * Contrato de acesso a dados. Existem duas implementações:
 *  - `demoDb`     : em memória, pra rodar sem configurar nada.
 *  - `supabaseDb` : Supabase de verdade (produção).
 * A escolha é automática: se as variáveis do Supabase existirem, usa o Supabase.
 */
export interface Database {
  isDemo: boolean;
  listTurmas(): Promise<Turma[]>;
  getTurma(id: string): Promise<Turma | null>;
  listStudents(turmaId: string): Promise<Student[]>;
  listAllStudents(): Promise<Student[]>;
  getStudentByToken(token: string): Promise<Student | null>;
  getStudentById(id: string): Promise<Student | null>;
  getOrCreateSession(turmaId: string, date: string): Promise<Session>;
  listSessionsForTurma(turmaId: string): Promise<Session[]>;
  getAttendanceForSession(sessionId: string): Promise<AttendanceRecord[]>;
  getHistoryForStudent(studentId: string): Promise<AttendancePoint[]>;
  saveAttendance(sessionId: string, records: AttendanceRecord[]): Promise<void>;
  /** Chaves "kind:streakValue" das notificações já enviadas (deduplicação). */
  listRecentNotificationKeys(studentId: string): Promise<Set<string>>;
  logNotification(log: NotificationLog): Promise<void>;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

let cached: Database | null = null;

export async function getDb(): Promise<Database> {
  if (cached) return cached;
  if (isSupabaseConfigured()) {
    cached = (await import("./supabase")).supabaseDb;
  } else {
    cached = (await import("./demo")).demoDb;
  }
  return cached;
}
