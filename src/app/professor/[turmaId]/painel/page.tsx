import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { requireProfessor } from "@/lib/auth";
import { buildTurmaOverview, type StudentRow } from "@/lib/overview";
import { levelFromPresences } from "@/lib/gamification";
import { formatBr } from "@/lib/date";
import type { Student } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PainelPage({
  params,
}: {
  params: Promise<{ turmaId: string }>;
}) {
  await requireProfessor();
  const { turmaId } = await params;

  const db = await getDb();
  const turma = await db.getTurma(turmaId);
  if (!turma) notFound();

  const overview = await buildTurmaOverview(db, turmaId);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <header className="flex items-center justify-between">
        <Link
          href={`/professor/${turmaId}`}
          className="text-sm text-white/60 hover:text-white"
        >
          ← Chamada
        </Link>
        <Link
          href="/professor"
          className="text-sm text-white/60 hover:text-white"
        >
          Turmas
        </Link>
      </header>

      <h1 className="mt-5 text-3xl font-extrabold">
        Painel de <span className="text-gradient">presenças</span>
      </h1>
      <p className="mt-1 text-white/60">{turma.name}</p>

      {/* Resumo da turma */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Alunos" value={overview.studentCount} />
        <Stat label="Aulas" value={overview.totalSessions} />
        <Stat label="Presença média" value={`${overview.avgRate}%`} />
        <Stat
          label="Sumindo"
          value={overview.atRiskCount}
          tone={overview.atRiskCount > 0 ? "alert" : "default"}
        />
      </section>

      {/* Última aula: quem veio x quem faltou */}
      {overview.lastSession && (
        <section className="mt-8">
          <h2 className="text-lg font-bold">
            Última aula{" "}
            <span className="text-white/50">
              · {formatBr(overview.lastSession.session.date)}
            </span>
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <NameList
              title="✅ Presentes"
              students={overview.lastSession.present}
              empty="Ninguém marcado como presente."
            />
            <NameList
              title="❌ Faltaram"
              students={overview.lastSession.absent}
              empty="Ninguém faltou. 🎉"
            />
            {overview.lastSession.justified.length > 0 && (
              <NameList
                title="📝 Falta justificada"
                students={overview.lastSession.justified}
                empty=""
              />
            )}
          </div>
        </section>
      )}

      {/* Ranking de presença */}
      <section className="mt-8">
        <h2 className="text-lg font-bold">Ranking de presença</h2>
        <p className="text-sm text-white/50">
          Da maior para a menor taxa de presença.
        </p>

        <div className="mt-3 grid gap-2">
          {overview.rows.map((row, i) => (
            <RankRow key={row.student.id} pos={i + 1} row={row} />
          ))}
          {overview.rows.length === 0 && (
            <p className="glass rounded-2xl p-5 text-white/60">
              Nenhum aluno ativo nesta turma ainda.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "alert";
}) {
  return (
    <div
      className={`glass rounded-2xl p-4 ${
        tone === "alert" ? "border border-rose-400/40 bg-rose-400/10" : ""
      }`}
    >
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="text-xs text-white/50">{label}</div>
    </div>
  );
}

function NameList({
  title,
  students,
  empty,
}: {
  title: string;
  students: Student[];
  empty: string;
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-sm font-semibold">
        {title}{" "}
        <span className="text-white/40">({students.length})</span>
      </div>
      {students.length === 0 ? (
        <p className="mt-2 text-sm text-white/40">{empty}</p>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {students.map((s) => (
            <li
              key={s.id}
              className="rounded-full bg-white/10 border border-white/10 px-2.5 py-0.5 text-sm"
            >
              {s.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RankRow({ pos, row }: { pos: number; row: StudentRow }) {
  const { student, stats, atRisk } = row;
  const level = levelFromPresences(stats.totalPresent);
  const streak =
    stats.presentStreak > 0
      ? `🔥 ${stats.presentStreak}`
      : stats.absentStreak > 0
        ? `😱 ${stats.absentStreak}`
        : "—";

  return (
    <Link
      href={`/hub/${student.hubToken}`}
      className={`flex items-center gap-3 glass rounded-2xl p-4 transition hover:-translate-y-0.5 hover:bg-white/10 ${
        atRisk ? "border border-rose-400/40" : ""
      }`}
    >
      <span className="w-6 shrink-0 text-center text-lg font-bold text-white/40">
        {pos}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-bold">{student.name}</span>
        <span className="block text-xs text-white/50">
          Nível {level.level} · {level.title}
          {atRisk && <span className="text-rose-300"> · sumindo</span>}
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block font-bold">{stats.attendanceRate}%</span>
        <span className="block text-xs text-white/50">
          {stats.totalPresent}/{stats.totalSessions} · {streak}
        </span>
      </span>
    </Link>
  );
}
