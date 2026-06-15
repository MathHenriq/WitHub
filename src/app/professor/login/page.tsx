import Link from "next/link";
import { redirect } from "next/navigation";
import { demoCodeHint, isProfessor } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isProfessor()) redirect("/professor");

  return (
    <main className="mx-auto w-full max-w-md px-6 py-16">
      <Link href="/" className="text-sm text-white/60 hover:text-white">
        ← Início
      </Link>

      <div className="mt-8 glass rounded-3xl p-8">
        <div className="text-5xl">🧑‍🏫</div>
        <h1 className="mt-4 text-2xl font-extrabold">Área do professor</h1>
        <p className="mt-1 text-white/60">
          Informe o código de acesso para fazer a chamada e gerenciar turmas.
        </p>

        <LoginForm hint={demoCodeHint()} />
      </div>
    </main>
  );
}
