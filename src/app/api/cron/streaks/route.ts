import { NextResponse } from "next/server";
import { runNotificationSweep } from "@/lib/notifications";

/**
 * Roda a varredura de streaks e dispara as notificações pendentes.
 * Chame 1x por dia (ex.: cron do Vercel logo após o horário das aulas).
 *
 * Proteção: se CRON_SECRET estiver definido, exige
 *   Authorization: Bearer <CRON_SECRET>
 * (o cron do Vercel envia esse header automaticamente).
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "não autorizado" }, { status: 401 });
    }
  }

  const result = await runNotificationSweep();
  return NextResponse.json({ ok: true, ...result });
}
