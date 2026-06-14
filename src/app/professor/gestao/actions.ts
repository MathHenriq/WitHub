"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export async function createTurmaAction(
  name: string,
  weekdays: number[],
): Promise<ActionResult> {
  if (!name.trim()) return { ok: false, error: "Dê um nome à turma." };
  const db = await getDb();
  await db.createTurma(name.trim(), weekdays);
  revalidatePath("/professor/gestao");
  revalidatePath("/professor");
  return { ok: true };
}

export async function createStudentAction(input: {
  turmaId: string;
  name: string;
  email: string;
  grade: number;
}): Promise<ActionResult> {
  if (!input.name.trim()) return { ok: false, error: "Nome é obrigatório." };
  if (!input.email.includes("@")) return { ok: false, error: "E-mail inválido." };
  if (input.grade < 1 || input.grade > 9)
    return { ok: false, error: "Ano deve ser entre 1 e 9." };
  const db = await getDb();
  await db.createStudent({
    turmaId: input.turmaId,
    name: input.name.trim(),
    email: input.email.trim(),
    grade: input.grade,
  });
  revalidatePath("/professor/gestao");
  return { ok: true };
}

export async function deactivateStudentAction(id: string): Promise<ActionResult> {
  const db = await getDb();
  await db.updateStudent(id, { active: false });
  revalidatePath("/professor/gestao");
  return { ok: true };
}
