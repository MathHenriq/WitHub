"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { formatBr } from "@/lib/date";
import type { AttendanceStatus } from "@/lib/types";

export interface RosterRow {
  studentId: string;
  name: string;
  status: AttendanceStatus;
}

export function ChamadaClient({
  turmaId,
  dateISO,
  initialRoster,
}: {
  turmaId: string;
  dateISO: string;
  initialRoster: RosterRow[];
}) {
  const router = useRouter();
  const [roster, setRoster] = useState<RosterRow[]>(initialRoster);
  const [saved, setSaved] = useState(false);
  const [saving, startSaving] = useTransition();
  const [, startNav] = useTransition();

  const presentes = roster.filter((r) => r.status === "present").length;
  const faltas = roster.filter((r) => r.status === "absent").length;
  const justificadas = roster.filter((r) => r.status === "justified").length;

  function setStatus(studentId: string, status: AttendanceStatus) {
    setSaved(false);
    setRoster((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status } : r)),
    );
  }

  function toggle(studentId: string) {
    const row = roster.find((r) => r.studentId === studentId);
    if (!row) return;
    setStatus(studentId, row.status === "present" ? "absent" : "present");
  }

  function changeDate(newDate: string) {
    startNav(() => router.push(`/professor/${turmaId}?date=${newDate}`));
  }

  function save() {
    startSaving(async () => {
      const res = await fetch("/api/chamada", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          turmaId,
          date: dateISO,
          records: roster.map((r) => ({ studentId: r.studentId, status: r.status })),
        }),
      });
      setSaved(res.ok);
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between gap-3 glass rounded-2xl px-4 py-3">
        <label className="text-sm text-white/70">
          Data da aula
          <input
            type="date"
            value={dateISO}
            onChange={(e) => changeDate(e.target.value)}
            className="ml-2 rounded-lg border border-white/15 bg-white/10 px-2 py-1 text-white [color-scheme:dark]"
          />
        </label>
        <span className="text-sm font-medium text-white/60">{formatBr(dateISO)}</span>
      </div>

      <div className="mt-3 flex gap-2 text-sm font-semibold">
        <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-emerald-300">
          ✅ {presentes} presentes
        </span>
        <span className="rounded-full bg-rose-400/15 px-3 py-1 text-rose-300">
          ❌ {faltas} faltas
        </span>
        {justificadas > 0 && (
          <span className="rounded-full bg-amber-400/15 px-3 py-1 text-amber-300">
            📄 {justificadas} justif.
          </span>
        )}
      </div>

      <ul className="mt-3 grid gap-2">
        {roster.map((row) => {
          const absent = row.status === "absent";
          const justified = row.status === "justified";
          return (
            <li
              key={row.studentId}
              className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition ${
                absent
                  ? "border-rose-400/30 bg-rose-500/10"
                  : justified
                    ? "border-amber-400/30 bg-amber-500/10"
                    : "border-white/10 bg-white/5"
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(row.studentId)}
                className="flex flex-1 items-center gap-3 text-left"
              >
                <span className="text-2xl">
                  {row.status === "present" ? "✅" : absent ? "❌" : "📄"}
                </span>
                <span
                  className={`font-semibold ${
                    absent ? "text-rose-200" : justified ? "text-amber-200" : "text-white"
                  }`}
                >
                  {row.name}
                </span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setStatus(row.studentId, justified ? "absent" : "justified")
                }
                className={`rounded-lg border px-2.5 py-1 text-xs font-bold transition ${
                  justified
                    ? "border-amber-400 bg-amber-400/20 text-amber-200"
                    : "border-white/15 text-white/40 hover:text-amber-300"
                }`}
                title="Falta justificada (não conta como falta na streak)"
              >
                Justif.
              </button>
            </li>
          );
        })}
      </ul>

      <div className="sticky bottom-4 mt-6">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="w-full rounded-2xl bg-gradient-to-r from-violet-500 to-blue-600 py-4 text-lg font-bold text-white shadow-xl shadow-blue-900/40 transition hover:brightness-110 disabled:opacity-60"
        >
          {saving ? "Salvando…" : saved ? "✅ Chamada salva!" : "Salvar chamada"}
        </button>
      </div>
    </div>
  );
}
