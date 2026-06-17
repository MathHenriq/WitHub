import type { Database } from "@/lib/db";
import { computeStats } from "@/lib/streaks";
import type {
  AttendanceStatus,
  Session,
  Student,
  StudentStats,
} from "@/lib/types";

/**
 * Agrega os dados de presença de uma turma para o painel do professor:
 * ranking por aluno + panorama da última aula + resumo da turma.
 * Usa só leituras já existentes no `Database` (não precisa de tabela nova).
 */

/** Faltas seguidas a partir das quais o aluno é considerado "sumindo". */
export const AT_RISK_STREAK = 3;

export interface StudentRow {
  student: Student;
  stats: StudentStats;
  atRisk: boolean;
}

export interface LastSessionView {
  session: Session;
  present: Student[];
  absent: Student[];
  justified: Student[];
}

export interface TurmaOverview {
  studentCount: number;
  avgRate: number;
  totalSessions: number;
  atRiskCount: number;
  /** Alunos ordenados: maior taxa de presença primeiro (desempates por streak/nome). */
  rows: StudentRow[];
  lastSession: LastSessionView | null;
}

export async function buildTurmaOverview(
  db: Database,
  turmaId: string,
): Promise<TurmaOverview> {
  const students = await db.listStudents(turmaId);

  const rows: StudentRow[] = await Promise.all(
    students.map(async (student) => {
      const stats = computeStats(await db.getHistoryForStudent(student.id));
      return { student, stats, atRisk: stats.absentStreak >= AT_RISK_STREAK };
    }),
  );

  rows.sort(
    (a, b) =>
      b.stats.attendanceRate - a.stats.attendanceRate ||
      b.stats.presentStreak - a.stats.presentStreak ||
      a.student.name.localeCompare(b.student.name, "pt-BR"),
  );

  const sessions = await db.listSessionsForTurma(turmaId);
  const last = sessions[sessions.length - 1] ?? null;

  let lastSession: LastSessionView | null = null;
  if (last) {
    const records = await db.getAttendanceForSession(last.id);
    const byId = new Map(students.map((s) => [s.id, s]));
    const pick = (status: AttendanceStatus): Student[] =>
      records
        .filter((r) => r.status === status)
        .map((r) => byId.get(r.studentId))
        .filter((s): s is Student => Boolean(s));
    lastSession = {
      session: last,
      present: pick("present"),
      absent: pick("absent"),
      justified: pick("justified"),
    };
  }

  const rated = rows.filter((r) => r.stats.totalSessions > 0);
  const avgRate = rated.length
    ? Math.round(
        rated.reduce((sum, r) => sum + r.stats.attendanceRate, 0) / rated.length,
      )
    : 0;

  return {
    studentCount: students.length,
    avgRate,
    totalSessions: sessions.length,
    atRiskCount: rows.filter((r) => r.atRisk).length,
    rows,
    lastSession,
  };
}
