"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const initial: LoginState = {};

export function LoginForm({ hint }: { hint: string | null }) {
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <form action={action} className="mt-8 grid gap-3">
      <label className="text-sm font-medium text-white/70" htmlFor="code">
        Código de acesso
      </label>
      <input
        id="code"
        name="code"
        type="password"
        autoComplete="off"
        autoFocus
        placeholder="••••••"
        className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:border-violet-400 focus:outline-none"
      />

      {state.error && (
        <p className="text-sm text-rose-300">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-xl bg-violet-500 px-4 py-3 font-semibold text-white transition hover:bg-violet-400 disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>

      {hint && (
        <p className="mt-2 text-center text-sm text-amber-200/80">
          Modo demonstração — o código é{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono">
            {hint}
          </code>
        </p>
      )}
    </form>
  );
}
