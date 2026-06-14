import type {
  AttendanceRecord,
  AttendanceStatus,
  NotificationLog,
  Session,
  Student,
  Turma,
} from "@/lib/types";
import type { AttendancePoint } from "@/lib/streaks";
import type { Database } from "./index";

// ---------------------------------------------------------------------------
// MODO DEMO: dados em memória, só pra você ver o sistema funcionando sem
// configurar o Supabase. Os dados NÃO persistem entre reinícios do servidor.
// ---------------------------------------------------------------------------

interface Store {
  turmas: Turma[];
  students: Student[];
  sessions: Session[];
  attendance: AttendanceRecord[];
  notifications: NotificationLog[];
}

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Últimas `count` datas de aula (mais antiga -> mais recente) para os dias da semana dados. */
function lastClassDates(weekdays: number[], count: number): string[] {
  const dates: string[] = [];
  const cursor = new Date();
  for (let i = 0; i < 120 && dates.length < count; i++) {
    if (weekdays.includes(cursor.getDay())) dates.push(iso(cursor));
    cursor.setDate(cursor.getDate() - 1);
  }
  return dates.reverse();
}

/** Padrões de presença para gerar histórias interessantes nas streaks. */
type Pattern = "consistente" | "faltando" | "voltou" | "irregular";

function statusFor(pattern: Pattern, idx: number, total: number): AttendanceStatus {
  const fromEnd = total - 1 - idx; // 0 = aula mais recente
  switch (pattern) {
    case "consistente":
      return "present";
    case "faltando":
      // Veio no começo, mas está faltando nas últimas 3 aulas.
      return fromEnd < 3 ? "absent" : "present";
    case "voltou":
      // Faltou várias e voltou exatamente na última aula.
      return fromEnd === 0 ? "present" : fromEnd < 4 ? "absent" : "present";
    case "irregular":
      return idx % 2 === 0 ? "present" : "absent";
  }
}

function buildStore(): Store {
  const turmas: Turma[] = [
    { id: "t-a", name: "WIT de IA — Turma A (4º ao 6º)", weekdays: [1, 3] },
    { id: "t-b", name: "WIT de IA — Turma B (7º ao 9º)", weekdays: [2, 4] },
  ];

  const seed: Array<Omit<Student, "id" | "hubToken"> & { token: string; pattern: Pattern }> = [
    { turmaId: "t-a", name: "Ana Beatriz Lima", email: "ana.lima@aluno.escola.gov.br", grade: 5, active: true, token: "demo-ana", pattern: "consistente" },
    { turmaId: "t-a", name: "Pedro Henrique Souza", email: "pedro.souza@aluno.escola.gov.br", grade: 5, active: true, token: "demo-pedro", pattern: "faltando" },
    { turmaId: "t-a", name: "Mariana Costa", email: "mariana.costa@aluno.escola.gov.br", grade: 4, active: true, token: "demo-mariana", pattern: "voltou" },
    { turmaId: "t-a", name: "Lucas Oliveira", email: "lucas.oliveira@aluno.escola.gov.br", grade: 6, active: true, token: "demo-lucas", pattern: "irregular" },
    { turmaId: "t-a", name: "Júlia Fernandes", email: "julia.fernandes@aluno.escola.gov.br", grade: 5, active: true, token: "demo-julia", pattern: "consistente" },
    { turmaId: "t-b", name: "Gabriel Martins", email: "gabriel.martins@aluno.escola.gov.br", grade: 8, active: true, token: "demo-gabriel", pattern: "faltando" },
    { turmaId: "t-b", name: "Sofia Ribeiro", email: "sofia.ribeiro@aluno.escola.gov.br", grade: 7, active: true, token: "demo-sofia", pattern: "consistente" },
    { turmaId: "t-b", name: "Rafael Almeida", email: "rafael.almeida@aluno.escola.gov.br", grade: 9, active: true, token: "demo-rafael", pattern: "voltou" },
    { turmaId: "t-b", name: "Helena Carvalho", email: "helena.carvalho@aluno.escola.gov.br", grade: 8, active: true, token: "demo-helena", pattern: "irregular" },
  ];

  const students: Student[] = seed.map((s, i) => ({
    id: `s-${i + 1}`,
    turmaId: s.turmaId,
    name: s.name,
    email: s.email,
    grade: s.grade,
    hubToken: s.token,
    active: s.active,
  }));

  const sessions: Session[] = [];
  const attendance: AttendanceRecord[] = [];

  for (const turma of turmas) {
    const dates = lastClassDates(turma.weekdays, 8);
    const turmaSessions = dates.map((date, i) => ({
      id: `${turma.id}-sess-${i}`,
      turmaId: turma.id,
      date,
    }));
    sessions.push(...turmaSessions);

    const turmaStudents = seed
      .map((s, i) => ({ ...s, id: `s-${i + 1}` }))
      .filter((s) => s.turmaId === turma.id);

    for (const student of turmaStudents) {
      turmaSessions.forEach((session, idx) => {
        attendance.push({
          sessionId: session.id,
          studentId: student.id,
          status: statusFor(student.pattern, idx, turmaSessions.length),
        });
      });
    }
  }

  return { turmas, students, sessions, attendance, notifications: [] };
}

// Singleton em memória (sobrevive entre requisições no mesmo processo dev).
const store: Store = buildStore();

function historyFor(studentId: string): AttendancePoint[] {
  const dateBySession = new Map(store.sessions.map((s) => [s.id, s.date]));
  return store.attendance
    .filter((a) => a.studentId === studentId)
    .map((a) => ({ date: dateBySession.get(a.sessionId)!, status: a.status }))
    .filter((p) => p.date);
}

export const demoDb: Database = {
  isDemo: true,

  async listTurmas() {
    return store.turmas;
  },
  async getTurma(id) {
    return store.turmas.find((t) => t.id === id) ?? null;
  },
  async listStudents(turmaId) {
    return store.students.filter((s) => s.turmaId === turmaId && s.active);
  },
  async listAllStudents() {
    return store.students.filter((s) => s.active);
  },
  async getStudentByToken(token) {
    return store.students.find((s) => s.hubToken === token) ?? null;
  },
  async getStudentById(id) {
    return store.students.find((s) => s.id === id) ?? null;
  },
  async createTurma(name, weekdays) {
    const turma: Turma = { id: `t-${store.turmas.length + 1}-${Date.now()}`, name, weekdays };
    store.turmas.push(turma);
    return turma;
  },
  async createStudent(input) {
    const student: Student = {
      id: `s-${store.students.length + 1}-${Date.now()}`,
      turmaId: input.turmaId,
      name: input.name,
      email: input.email,
      grade: input.grade,
      hubToken: `tok-${Math.random().toString(36).slice(2, 14)}`,
      active: true,
    };
    store.students.push(student);
    return student;
  },
  async updateStudent(id, patch) {
    const student = store.students.find((s) => s.id === id);
    if (student) Object.assign(student, patch);
  },
  async getOrCreateSession(turmaId, date) {
    let session = store.sessions.find((s) => s.turmaId === turmaId && s.date === date);
    if (!session) {
      session = { id: `${turmaId}-sess-${store.sessions.length}`, turmaId, date };
      store.sessions.push(session);
    }
    return session;
  },
  async listSessionsForTurma(turmaId) {
    return store.sessions
      .filter((s) => s.turmaId === turmaId)
      .sort((a, b) => a.date.localeCompare(b.date));
  },
  async getAttendanceForSession(sessionId) {
    return store.attendance.filter((a) => a.sessionId === sessionId);
  },
  async getHistoryForStudent(studentId) {
    return historyFor(studentId);
  },
  async saveAttendance(sessionId, records) {
    store.attendance = store.attendance.filter((a) => a.sessionId !== sessionId);
    store.attendance.push(...records);
  },
  async listRecentNotificationKeys(studentId) {
    return new Set(
      store.notifications
        .filter((n) => n.studentId === studentId)
        .map((n) => `${n.kind}:${n.streakValue}`),
    );
  },
  async logNotification(log) {
    store.notifications.push(log);
  },
};
