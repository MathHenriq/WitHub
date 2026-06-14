import type { NotificationKind, StudentStats } from "@/lib/types";

export interface PendingNotification {
  kind: NotificationKind;
  /** Valor da streak que disparou o aviso (usado para deduplicar). */
  streakValue: number;
}

/** A partir de quantas presenças seguidas comemoramos. */
const STREAK_MILESTONES = [3, 5, 7, 10, 15, 20, 30, 50];

/**
 * Decide quais notificações um aluno deveria receber AGORA, dado o estado dele.
 * A deduplicação (não repetir o mesmo aviso) é feita por quem chama, usando
 * `kind` + `streakValue` contra o histórico de envios.
 */
export function decideNotifications(stats: StudentStats): PendingNotification[] {
  const pending: PendingNotification[] = [];

  // Urgência: qualquer falta seguida dispara um aviso. Como o streakValue muda
  // a cada nova falta, o aluno recebe um lembrete novo (e mais urgente) por dia
  // de falta, sem repetir o mesmo dia.
  if (stats.absentStreak >= 1) {
    pending.push({ kind: "absence_urgent", streakValue: stats.absentStreak });
  }

  // Voltou: primeira presença logo após um período de faltas.
  if (stats.presentStreak === 1 && stats.totalPresent > 1) {
    pending.push({ kind: "comeback", streakValue: 1 });
  }

  // Comemoração: atingiu um marco de presenças seguidas.
  if (STREAK_MILESTONES.includes(stats.presentStreak)) {
    pending.push({
      kind: "streak_milestone",
      streakValue: stats.presentStreak,
    });
  }

  return pending;
}
