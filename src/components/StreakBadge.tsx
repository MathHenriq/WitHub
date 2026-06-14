import type { StudentStats } from "@/lib/types";

/** Mostra a streak do aluno: fogo pra presenças, alerta pra faltas. */
export function StreakBadge({ stats }: { stats: StudentStats }) {
  if (stats.absentStreak >= 1) {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-center">
        <div className="text-5xl">😱</div>
        <div className="mt-2 text-4xl font-extrabold text-red-600">
          {stats.absentStreak} {stats.absentStreak === 1 ? "falta" : "faltas seguidas"}
        </div>
        <p className="mt-2 text-red-700 font-medium">
          Você está perdendo muita coisa! Bora quebrar essa sequência na próxima aula. 💪
        </p>
      </div>
    );
  }

  if (stats.presentStreak >= 1) {
    return (
      <div className="rounded-2xl bg-orange-50 border border-orange-200 p-6 text-center">
        <div className="text-5xl">🔥</div>
        <div className="mt-2 text-4xl font-extrabold text-orange-600">
          {stats.presentStreak} {stats.presentStreak === 1 ? "presença" : "aulas seguidas"}
        </div>
        <p className="mt-2 text-orange-700 font-medium">
          {stats.presentStreak === 1
            ? "Começou a chama! Volta na próxima pra não deixar apagar."
            : "Mandou bem! Não deixa a chama apagar. 😎"}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 text-center">
      <div className="text-5xl">🌱</div>
      <div className="mt-2 text-2xl font-bold text-slate-700">Sua jornada começa agora</div>
      <p className="mt-2 text-slate-600">Apareça na próxima aula e comece sua sequência!</p>
    </div>
  );
}
