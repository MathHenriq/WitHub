import type { AttendanceStatus, StudentStats } from "./types";

/** Uma linha do histórico: a data da aula e como o aluno foi marcado. */
export interface AttendancePoint {
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
}

/**
 * Calcula as estatísticas de presença de um aluno a partir do histórico.
 *
 * Regras:
 * - "present" alimenta a streak boa; "absent" alimenta a streak de urgência.
 * - "justified" (falta justificada) é NEUTRO: não pune nem premia, é ignorado
 *   no cálculo das sequências e da taxa de presença.
 * - As streaks são contadas a partir da aula mais recente para trás.
 */
export function computeStats(history: AttendancePoint[]): StudentStats {
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));

  let totalPresent = 0;
  let totalAbsent = 0;
  let lastPresentDate: string | null = null;
  let longestPresentStreak = 0;
  let runningPresent = 0;

  for (const point of sorted) {
    if (point.status === "present") {
      totalPresent += 1;
      lastPresentDate = point.date;
      runningPresent += 1;
      longestPresentStreak = Math.max(longestPresentStreak, runningPresent);
    } else if (point.status === "absent") {
      totalAbsent += 1;
      runningPresent = 0;
    }
    // "justified": não mexe em nada.
  }

  const presentStreak = trailingStreak(sorted, "present");
  const absentStreak = trailingStreak(sorted, "absent");

  const consideredSessions = totalPresent + totalAbsent;
  const attendanceRate =
    consideredSessions === 0
      ? 0
      : Math.round((totalPresent / consideredSessions) * 100);

  return {
    presentStreak,
    absentStreak,
    longestPresentStreak,
    totalPresent,
    totalSessions: sorted.length,
    lastPresentDate,
    attendanceRate,
  };
}

/**
 * Conta quantas marcações `target` aparecem em sequência a partir do fim,
 * pulando faltas justificadas e parando no primeiro status diferente.
 */
function trailingStreak(
  sortedAsc: AttendancePoint[],
  target: AttendanceStatus,
): number {
  let count = 0;
  for (let i = sortedAsc.length - 1; i >= 0; i--) {
    const status = sortedAsc[i].status;
    if (status === "justified") continue;
    if (status === target) {
      count += 1;
    } else {
      break;
    }
  }
  return count;
}
