import Link from "next/link";
import { getDb } from "@/lib/db";
import { NewStudentForm, NewTurmaForm, StudentRow } from "./GestaoClient";
import { requireProfessor } from "@/lib/auth";

export const dynamic = "force-dynamic";

const WEEKDAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default async function GestaoPage() {
  await requireProfessor();
  const db = await getDb();
  const turmas = await db.listTurmas();
  const turmasComAlunos = await Promise.all(
    turmas.map(async (t) => ({ turma: t, alunos: await db.listStudents(t.id) })),
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <header className="flex items-center justify-between">
        <Link href="/professor" className="text-sm text-white/60 hover:text-white">
          ← Chamada
        </Link>
        <NewTurmaForm />
      </header>

      <h1 className="mt-5 text-3xl font-extrabold">
        Gerenciar <span className="text-gradient">turmas & alunos</span>
      </h1>
      <p className="mt-1 text-white/60">
        Cadastre turmas e alunos, e copie o link pessoal do Hub de cada um pra
        enviar pelo Google Sala de Aula.
      </p>

      {db.isDemo && (
        <p className="mt-4 rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm text-amber-100/80">
          Modo demo: o que você criar aqui some quando o servidor reinicia.
          Configure o Supabase pra salvar de verdade.
        </p>
      )}

      <div className="mt-8 grid gap-6">
        {turmasComAlunos.map(({ turma, alunos }) => (
          <section key={turma.id} className="glass rounded-3xl p-5">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-bold">{turma.name}</h2>
              <span className="text-sm text-white/40">
                {turma.weekdays.map((d) => WEEKDAY_NAMES[d]).join(" · ")} ·{" "}
                {alunos.length} {alunos.length === 1 ? "aluno" : "alunos"}
              </span>
            </div>

            <div className="mt-4 grid gap-2">
              {alunos.map((a) => (
                <StudentRow
                  key={a.id}
                  id={a.id}
                  name={a.name}
                  email={a.email}
                  grade={a.grade}
                  hubToken={a.hubToken}
                />
              ))}
              {alunos.length === 0 && (
                <p className="text-sm text-white/40">Nenhum aluno ainda.</p>
              )}
            </div>

            <NewStudentForm turmaId={turma.id} />
          </section>
        ))}

        {turmas.length === 0 && (
          <p className="text-center text-white/50">
            Nenhuma turma ainda. Crie a primeira com “+ Nova turma”.
          </p>
        )}
      </div>
    </main>
  );
}
