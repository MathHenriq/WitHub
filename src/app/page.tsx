import Link from "next/link";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const db = await getDb();
  const demoStudents = db.isDemo ? await db.listAllStudents() : [];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <header className="text-center">
        <div className="text-7xl">💙</div>
        <h1 className="mt-4 text-5xl font-extrabold tracking-tight">
          WIT <span className="text-gradient">Hub</span>
        </h1>
        <p className="mt-3 text-lg text-white/70">
          Presença, streaks e os atalhos do WIT de IA num lugar só.
        </p>
      </header>

      <section className="mt-12 grid gap-4 sm:grid-cols-2">
        <Link
          href="/professor"
          className="glass rounded-3xl p-7 transition hover:-translate-y-1 hover:bg-white/10"
        >
          <div className="text-4xl">🧑‍🏫</div>
          <h2 className="mt-3 text-xl font-bold">Sou professor</h2>
          <p className="mt-1 text-white/60">
            Fazer a chamada-relâmpago e acompanhar quem está sumindo.
          </p>
        </Link>

        <div className="glass rounded-3xl p-7">
          <div className="text-4xl">🧒</div>
          <h2 className="mt-3 text-xl font-bold">Sou aluno</h2>
          <p className="mt-1 text-white/60">
            Você acessa seu Hub por um link pessoal que o professor te envia.
          </p>
        </div>
      </section>

      {db.isDemo && (
        <section className="mt-10 rounded-3xl border border-amber-300/30 bg-amber-300/10 p-6">
          <h3 className="font-bold text-amber-200">⚙️ Modo demonstração</h3>
          <p className="mt-1 text-sm text-amber-100/80">
            O Supabase ainda não está configurado, então o sistema usa dados de
            exemplo. Abra alguns Hubs de aluno pra ver as streaks ganhando vida:
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {demoStudents.map((s) => (
              <Link
                key={s.id}
                href={`/hub/${s.hubToken}`}
                className="rounded-full bg-white/10 border border-white/15 px-3 py-1 text-sm font-medium text-white hover:bg-white/20"
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
