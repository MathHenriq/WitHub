import { getDb } from "@/lib/db";
import { computeStats } from "@/lib/streaks";
import type { NotificationChannel } from "@/lib/types";
import { sendClassroom, sendEmail, sendPush } from "./channels";
import { decideNotifications } from "./rules";
import { buildMessage } from "./templates";

export interface SweepResult {
  studentsChecked: number;
  notificationsSent: number;
  details: Array<{
    student: string;
    kind: string;
    channels: string[];
  }>;
}

const CHANNELS: NotificationChannel[] = ["email", "classroom", "push"];

/**
 * Varre todos os alunos ativos, calcula as streaks e dispara as notificações
 * pendentes (sem repetir avisos já enviados). Pensado pra rodar 1x por dia
 * via cron, logo depois do horário das aulas.
 */
export async function runNotificationSweep(): Promise<SweepResult> {
  const db = await getDb();
  const students = await db.listAllStudents();

  const result: SweepResult = {
    studentsChecked: students.length,
    notificationsSent: 0,
    details: [],
  };

  for (const student of students) {
    const history = await db.getHistoryForStudent(student.id);
    if (history.length === 0) continue;

    const stats = computeStats(history);
    const pending = decideNotifications(stats);
    if (pending.length === 0) continue;

    const alreadySent = await db.listRecentNotificationKeys(student.id);

    for (const item of pending) {
      const key = `${item.kind}:${item.streakValue}`;
      if (alreadySent.has(key)) continue;

      const msg = buildMessage(item.kind, student, stats);
      const sentChannels: string[] = [];

      for (const channel of CHANNELS) {
        const send =
          channel === "email"
            ? sendEmail
            : channel === "classroom"
              ? sendClassroom
              : sendPush;
        const res = await send(student, msg);
        if (res.ok) {
          sentChannels.push(channel);
          await db.logNotification({
            studentId: student.id,
            channel,
            kind: item.kind,
            streakValue: item.streakValue,
            sentAt: new Date().toISOString(),
          });
        }
      }

      result.notificationsSent += 1;
      result.details.push({
        student: student.name,
        kind: item.kind,
        channels: sentChannels,
      });
    }
  }

  return result;
}
