import type { NotificationChannel, Student } from "@/lib/types";
import type { MessageContent } from "./templates";

export interface SendResult {
  channel: NotificationChannel;
  ok: boolean;
  detail: string;
}

/**
 * E-MAIL — canal principal (conta Google da escola do aluno).
 * Usa a API da Resend (https://resend.com) por simples fetch, sem SDK.
 * Se as variáveis não estiverem configuradas, apenas registra no console
 * (modo "dry run"), pra você testar todo o fluxo sem mandar e-mail de verdade.
 */
export async function sendEmail(
  student: Student,
  msg: MessageContent,
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFICATIONS_FROM_EMAIL;

  if (!apiKey || !from) {
    console.log(`[email:dry-run] -> ${student.email} :: ${msg.subject}`);
    return { channel: "email", ok: true, detail: "dry-run (sem RESEND_API_KEY)" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: student.email,
        subject: msg.subject,
        html: msg.html,
      }),
    });
    if (!res.ok) {
      return { channel: "email", ok: false, detail: `HTTP ${res.status}` };
    }
    return { channel: "email", ok: true, detail: "enviado" };
  } catch (err) {
    return { channel: "email", ok: false, detail: String(err) };
  }
}

/**
 * GOOGLE SALA DE AULA — aviso no mural / mensagem privada.
 * Requer um service account com domain-wide delegation no Google Workspace
 * da escola e a Classroom API habilitada. Por enquanto fica como dry-run com
 * o ponto de integração já isolado aqui. Veja o README (seção Notificações).
 */
export async function sendClassroom(
  student: Student,
  msg: MessageContent,
): Promise<SendResult> {
  // TODO(classroom): courses.courseWork / announcements via Classroom API.
  console.log(`[classroom:dry-run] -> ${student.email} :: ${msg.short}`);
  return {
    channel: "classroom",
    ok: true,
    detail: "dry-run (integração Classroom pendente de credenciais)",
  };
}

/**
 * PUSH (PWA) — fase 2. Notificação no celular sem precisar de número.
 * Requer Web Push (VAPID) e que o aluno tenha instalado o Hub e aceitado
 * notificações. O ponto de integração já fica isolado aqui.
 */
export async function sendPush(
  student: Student,
  msg: MessageContent,
): Promise<SendResult> {
  // TODO(push): web-push com as chaves VAPID + subscription salva do aluno.
  console.log(`[push:dry-run] -> ${student.name} :: ${msg.short}`);
  return {
    channel: "push",
    ok: true,
    detail: "dry-run (push PWA é fase 2)",
  };
}
