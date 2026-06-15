import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "node:crypto";

/**
 * Autenticação da área do professor por CÓDIGO DE ACESSO.
 *
 * - Em produção, defina `PROFESSOR_ACCESS_CODE` (e, idealmente, `AUTH_SECRET`).
 * - Sem `PROFESSOR_ACCESS_CODE`, o app fica em modo demo e aceita um código
 *   padrão (`DEMO_CODE`), exibido na própria tela de login.
 *
 * A sessão é um cookie httpOnly com um token assinado (HMAC-SHA256), então o
 * cliente não consegue forjá-lo nem reaproveitá-lo após expirar.
 */

const COOKIE = "wit_prof";
const DEMO_CODE = "wit";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 dias

/** Há um código de acesso de verdade configurado (i.e. não é modo demo)? */
export function isAuthConfigured(): boolean {
  return Boolean(process.env.PROFESSOR_ACCESS_CODE?.trim());
}

/** No modo demo, devolve o código padrão para mostrar como dica; senão null. */
export function demoCodeHint(): string | null {
  return isAuthConfigured() ? null : DEMO_CODE;
}

function accessCode(): string {
  return process.env.PROFESSOR_ACCESS_CODE?.trim() || DEMO_CODE;
}

function secret(): string {
  // Sem AUTH_SECRET, deriva do próprio código — trocar o código invalida sessões.
  return process.env.AUTH_SECRET?.trim() || `wit-hub:${accessCode()}`;
}

function sign(value: string): string {
  return crypto.createHmac("sha256", secret()).update(value).digest("base64url");
}

function makeToken(): string {
  const exp = String(Date.now() + MAX_AGE_SECONDS * 1000);
  return `${exp}.${sign(exp)}`;
}

/** Comparação em tempo constante de duas strings. */
function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

function tokenValid(token: string | undefined): boolean {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot < 0) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!safeEqual(sig, sign(exp))) return false;
  return Number(exp) > Date.now();
}

/** O código informado bate com o configurado? (comparação em tempo constante) */
export function checkCode(input: string): boolean {
  return safeEqual(input ?? "", accessCode());
}

export async function createProfessorSession(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, makeToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroyProfessorSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

/** Há uma sessão de professor válida no request atual? */
export async function isProfessor(): Promise<boolean> {
  const token = (await cookies()).get(COOKIE)?.value;
  return tokenValid(token);
}

/** Garante sessão; redireciona pro login se não houver. Use no topo das páginas. */
export async function requireProfessor(): Promise<void> {
  if (!(await isProfessor())) redirect("/professor/login");
}
