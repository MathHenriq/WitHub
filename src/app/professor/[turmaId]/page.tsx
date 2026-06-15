import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { todayISO } from "@/lib/date";
import type { AttendanceStatus } from "@/lib/types";
import { ChamadaClient, type RosterRow } from "./ChamadaClient";
import { requireProfessor } from "@/lib/auth";

export default async function ChamadaPage({
  params,
  searchParams,
}: {
  params: Promise<{ turmaId: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  await requireProfessor();
  const { turmaId } = await params;
  const { date } = await searchParams;
  const dateISO = date || todayISO();

  const db = await getDb();
  const turma = await db.getTurma(turmaId);
  if (!turma) notFound();

  const students = await db.listStudents(turmaId);
  const session = await db.getOrCreateSession(turmaId, dateISO);
  const existing = await db.getAttendanceForSession(session.id);
  const statusById = new Map(existing.map((a) => [a.studentId, a.status]));

  // Padrão: presente. Se já houver registro salvo, respeita.
  const roster: RosterRow[] = students.map((s) => ({
    studentId: s.id,
    name: s.name,
    status: (statusById.get(s.id) ?? "present") as AttendanceStatus,
  }));

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-8">
      <Link href="/professor" className="text-sm text-white/60 hover:text-white">
        ← Turmas
      </Link>
      <h1 className="mt-2 text-2xl font-extrabold">{turma.name}</h1>

      <ChamadaClient
        turmaId={turmaId}
        dateISO={dateISO}
        initialRoster={roster}
      />
    </main>
  );
}
