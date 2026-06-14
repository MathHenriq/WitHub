import Link from "next/link";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

const WEEKDAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default async function ProfessorPage() {
  const db = await getDb();
  const turmas = await db.listTurmas();

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <header>
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← Início
        </Link>
        <h1 className="mt-2 text-3xl font-extrabold">Chamada-relâmpago</h1>
        <p className="mt-1 text-slate-600">
          Escolha a turma. Todos vêm marcados como presentes — você só toca em
          quem faltou.
        </p>
      </header>

      <div className="mt-6 grid gap-3">
        {turmas.map((turma) => (
          <Link
            key={turma.id}
            href={`/professor/${turma.id}`}
            className="flex items-center justify-between rounded-2xl border border-slate-200 p-5 transition hover:border-blue-400 hover:shadow-sm"
          >
            <span>
              <span className="block text-lg font-bold">{turma.name}</span>
              <span className="block text-sm text-slate-500">
                {turma.weekdays.map((d) => WEEKDAY_NAMES[d]).join(" · ")}
              </span>
            </span>
            <span className="text-2xl">→</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
