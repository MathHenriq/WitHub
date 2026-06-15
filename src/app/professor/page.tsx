import Link from "next/link";
import { getDb } from "@/lib/db";
import { requireProfessor } from "@/lib/auth";
import { logoutAction } from "./login/actions";

export const dynamic = "force-dynamic";

const WEEKDAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default async function ProfessorPage() {
  await requireProfessor();
  const db = await getDb();
  const turmas = await db.listTurmas();

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-sm text-white/60 hover:text-white">
          ← Início
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/professor/gestao"
            className="rounded-full glass px-4 py-1.5 text-sm font-semibold hover:bg-white/10"
          >
            ⚙️ Gerenciar
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-full glass px-4 py-1.5 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white"
            >
              Sair
            </button>
          </form>
        </div>
      </header>

      <h1 className="mt-5 text-3xl font-extrabold">
        Chamada-<span className="text-gradient">relâmpago</span>
      </h1>
      <p className="mt-1 text-white/60">
        Escolha a turma. Todos vêm marcados como presentes — você só toca em quem
        faltou.
      </p>

      <div className="mt-6 grid gap-3">
        {turmas.map((turma) => (
          <Link
            key={turma.id}
            href={`/professor/${turma.id}`}
            className="flex items-center justify-between glass rounded-2xl p-5 transition hover:-translate-y-0.5 hover:bg-white/10"
          >
            <span>
              <span className="block text-lg font-bold">{turma.name}</span>
              <span className="block text-sm text-white/50">
                {turma.weekdays.map((d) => WEEKDAY_NAMES[d]).join(" · ")}
              </span>
            </span>
            <span className="text-2xl text-white/40">→</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
