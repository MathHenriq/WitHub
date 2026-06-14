"use client";

import { useState, useTransition } from "react";
import {
  createStudentAction,
  createTurmaAction,
  deactivateStudentAction,
} from "./actions";

const WEEKDAYS = [
  { d: 1, label: "Seg" },
  { d: 2, label: "Ter" },
  { d: 3, label: "Qua" },
  { d: 4, label: "Qui" },
  { d: 5, label: "Sex" },
  { d: 6, label: "Sáb" },
  { d: 0, label: "Dom" },
];

const inputCls =
  "w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:border-violet-400 focus:outline-none";

export function NewTurmaForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [days, setDays] = useState<number[]>([1, 3]);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function toggleDay(d: number) {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }

  function submit() {
    setError("");
    start(async () => {
      const res = await createTurmaAction(name, days);
      if (res.ok) {
        setName("");
        setDays([1, 3]);
        setOpen(false);
      } else setError(res.error ?? "Erro");
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-gradient-to-r from-violet-500 to-blue-600 px-5 py-2 text-sm font-bold text-white shadow-lg"
      >
        + Nova turma
      </button>
    );
  }

  return (
    <div className="glass rounded-2xl p-4">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome da turma (ex.: WIT de IA — Turma A)"
        className={inputCls}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {WEEKDAYS.map(({ d, label }) => (
          <button
            key={d}
            onClick={() => toggleDay(d)}
            className={`rounded-lg px-3 py-1 text-sm font-semibold transition ${
              days.includes(d)
                ? "bg-violet-500 text-white"
                : "bg-white/10 text-white/50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-sm text-rose-300">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button
          onClick={submit}
          disabled={pending}
          className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
        >
          {pending ? "Criando…" : "Criar turma"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded-xl px-4 py-2 text-sm text-white/60 hover:text-white"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

export function NewStudentForm({ turmaId }: { turmaId: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [grade, setGrade] = useState(5);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function submit() {
    setError("");
    start(async () => {
      const res = await createStudentAction({ turmaId, name, email, grade });
      if (res.ok) {
        setName("");
        setEmail("");
      } else setError(res.error ?? "Erro");
    });
  }

  return (
    <div className="mt-3 rounded-xl border border-dashed border-white/15 p-3">
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto]">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do aluno"
          className={inputCls}
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail da escola"
          className={inputCls}
        />
        <select
          value={grade}
          onChange={(e) => setGrade(Number(e.target.value))}
          className={`${inputCls} [color-scheme:dark]`}
        >
          {[4, 5, 6, 7, 8, 9].map((g) => (
            <option key={g} value={g}>
              {g}º ano
            </option>
          ))}
        </select>
        <button
          onClick={submit}
          disabled={pending}
          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
        >
          {pending ? "…" : "+ Add"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-rose-300">{error}</p>}
    </div>
  );
}

export function StudentRow({
  id,
  name,
  email,
  grade,
  hubToken,
}: {
  id: string;
  name: string;
  email: string;
  grade: number;
  hubToken: string;
}) {
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();

  function copyLink() {
    const url = `${window.location.origin}/hub/${hubToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-3">
      <div className="min-w-0">
        <div className="truncate font-semibold text-white">
          {name} <span className="text-xs font-normal text-white/40">· {grade}º</span>
        </div>
        <div className="truncate text-sm text-white/50">{email}</div>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={copyLink}
          className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20"
        >
          {copied ? "✅ Copiado" : "🔗 Link do Hub"}
        </button>
        <button
          onClick={() => start(() => deactivateStudentAction(id).then(() => {}))}
          disabled={pending}
          className="rounded-lg px-2 py-1.5 text-xs text-white/40 hover:text-rose-300 disabled:opacity-50"
          title="Remover da turma"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
