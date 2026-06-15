import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { AttendanceRecord, AttendanceStatus } from "@/lib/types";

const VALID: AttendanceStatus[] = ["present", "absent", "justified"];

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { turmaId, date, records } = (body ?? {}) as {
    turmaId?: string;
    date?: string;
    records?: Array<{ studentId?: string; status?: string }>;
  };

  if (!turmaId || !date || !Array.isArray(records)) {
    return NextResponse.json(
      { error: "turmaId, date e records são obrigatórios" },
      { status: 400 },
    );
  }

  const clean: AttendanceRecord[] = [];
  for (const r of records) {
    if (!r.studentId || !VALID.includes(r.status as AttendanceStatus)) {
      return NextResponse.json({ error: "registro inválido" }, { status: 400 });
    }
    clean.push({
      sessionId: "", // preenchido após criar a sessão
      studentId: r.studentId,
      status: r.status as AttendanceStatus,
    });
  }

  const db = await getDb();
  const session = await db.getOrCreateSession(turmaId, date);
  await db.saveAttendance(
    session.id,
    clean.map((r) => ({ ...r, sessionId: session.id })),
  );

  return NextResponse.json({ ok: true, sessionId: session.id, saved: clean.length });
}
