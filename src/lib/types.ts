// Tipos centrais do WIT Hub.
// "Turma" = grupo de alunos de um horário/dia. "Sessão" = uma aula (uma data).

export type AttendanceStatus = "present" | "absent" | "justified";

export interface Turma {
  id: string;
  name: string;
  /** Dias da semana em que a turma tem aula (0 = domingo ... 6 = sábado). */
  weekdays: number[];
}

export interface Student {
  id: string;
  turmaId: string;
  name: string;
  /** E-mail da conta Google da escola (canal de notificação). */
  email: string;
  /** Ano escolar (4 a 9). */
  grade: number;
  /** Token secreto e não adivinhável usado no link pessoal do Hub. */
  hubToken: string;
  active: boolean;
}

export interface Session {
  id: string;
  turmaId: string;
  /** Data da aula no formato YYYY-MM-DD. */
  date: string;
}

export interface AttendanceRecord {
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
}

/** Estatísticas derivadas do histórico de presença de um aluno. */
export interface StudentStats {
  /** Presenças seguidas até a última aula (a "streak boa"). */
  presentStreak: number;
  /** Faltas seguidas até a última aula (a "streak de urgência"). */
  absentStreak: number;
  /** Maior sequência de presenças já alcançada. */
  longestPresentStreak: number;
  /** Total de presenças no histórico. */
  totalPresent: number;
  /** Total de aulas consideradas (presença + falta + justificada). */
  totalSessions: number;
  /** Data (YYYY-MM-DD) da última presença, ou null se nunca veio. */
  lastPresentDate: string | null;
  /** Percentual de presença (0-100). */
  attendanceRate: number;
}

export type NotificationChannel = "email" | "classroom" | "push";

export type NotificationKind =
  | "absence_urgent" // faltas seguidas: senso de urgência
  | "streak_milestone" // presenças seguidas: comemoração
  | "comeback"; // voltou depois de faltar

export interface NotificationLog {
  studentId: string;
  channel: NotificationChannel;
  kind: NotificationKind;
  /** Valor da streak no momento do envio, usado para não repetir o mesmo aviso. */
  streakValue: number;
  sentAt: string;
}
