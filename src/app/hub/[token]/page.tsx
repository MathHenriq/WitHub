import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { computeStats } from "@/lib/streaks";
import { witLinks } from "@/lib/wit-links";
import { StreakBadge } from "@/components/StreakBadge";

export default async function HubPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const db = await getDb();
  const student = await db.getStudentByToken(token);
  if (!student) notFound();

  const history = await db.getHistoryForStudent(student.id);
  const stats = computeStats(history);
  const firstName = student.name.split(" ")[0];

  return (
    <main className="mx-auto w-full max-w-md px-5 py-10">
      <header className="text-center">
        <p className="text-sm font-medium text-blue-600">WIT Hub</p>
        <h1 className="mt-1 text-3xl font-extrabold">Oi, {firstName}! 👋</h1>
      </header>

      <div className="mt-6">
        <StreakBadge stats={stats} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <Stat label="Presenças" value={stats.totalPresent} />
        <Stat label="Recorde 🔥" value={stats.longestPresentStreak} />
        <Stat label="Presença" value={`${stats.attendanceRate}%`} />
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Atalhos do WIT
        </h2>
        <div className="mt-3 grid gap-3">
          {witLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-blue-400 hover:shadow-sm"
            >
              <span className="text-3xl">{link.emoji}</span>
              <span>
                <span className="block font-bold">{link.label}</span>
                <span className="block text-sm text-slate-500">
                  {link.description}
                </span>
              </span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-200 py-3">
      <div className="text-2xl font-extrabold text-slate-800">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
