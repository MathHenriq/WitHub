import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { computeStats } from "@/lib/streaks";
import { levelFromPresences } from "@/lib/gamification";
import { witLinks } from "@/lib/wit-links";
import { HubView } from "./HubView";

export const dynamic = "force-dynamic";

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
  const level = levelFromPresences(stats.totalPresent);
  const firstName = student.name.split(" ")[0];

  return (
    <HubView
      firstName={firstName}
      stats={stats}
      level={level}
      links={witLinks}
    />
  );
}
