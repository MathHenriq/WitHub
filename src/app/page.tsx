import Link from "next/link";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const db = await getDb();
  const demoStudents = db.isDemo ? await db.listAllStudents() : [];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <header className="text-center">
        <div className="text-6xl">💙</div>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight">WIT Hub</h1>
        <p className="mt-2 text-lg text-slate-600">
          Presença, streaks e os atalhos do WIT de IA num lugar só.
        </p>
      </header>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          href="/professor"
          className="rounded-2xl border border-slate-200 p-6 transition hover:border-blue-400 hover:shadow-sm"
        >
          <div className="text-3xl">🧑‍🏫</div>
          <h2 className="mt-2 text-xl font-bold">Sou professor</h2>
          <p className="mt-1 text-slate-600">
            Fazer a chamada-relâmpago e acompanhar quem está sumindo.
          </p>
        </Link>

        <div className="rounded-2xl border border-slate-200 p-6">
          <div className="text-3xl">🧒</div>
          <h2 className="mt-2 text-xl font-bold">Sou aluno</h2>
          <p className="mt-1 text-slate-600">
            Você acessa seu Hub por um link pessoal que o professor te envia.
          </p>
        </div>
      </section>

      {db.isDemo && (
        <section className="mt-10 rounded-2xl bg-amber-50 border border-amber-200 p-6">
          <h3 className="font-bold text-amber-800">⚙️ Modo demonstração</h3>
          <p className="mt-1 text-sm text-amber-800">
            O Supabase ainda não está configurado, então o sistema está usando
            dados de exemplo em memória. Abra alguns Hubs de aluno pra ver as
            streaks funcionando:
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {demoStudents.map((s) => (
              <Link
                key={s.id}
                href={`/hub/${s.hubToken}`}
                className="rounded-full bg-white border border-amber-300 px-3 py-1 text-sm font-medium text-amber-900 hover:bg-amber-100"
              >
                {s.name.split(" ")[0]}
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
