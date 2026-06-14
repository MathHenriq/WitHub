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

  // Toque na linha: alterna entre presente e falta (o caso mais comum).
  function toggle(studentId: string) {
    const row = roster.find((r) => r.studentId === studentId);
    if (!row) return;
    setStatus(studentId, row.status === "present" ? "absent" : "present");
  }

  function changeDate(newDate: string) {
    startNav(() => {
      router.push(`/professor/${turmaId}?date=${newDate}`);
    });
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
    <div className="mt-4">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm text-slate-600">
          Data da aula
          <input
            type="date"
            value={dateISO}
            onChange={(e) => changeDate(e.target.value)}
            className="ml-2 rounded-lg border border-slate-300 px-2 py-1 text-slate-800"
          />
        </label>
        <span className="text-sm text-slate-500">{formatBr(dateISO)}</span>
      </div>

      <div className="mt-3 flex gap-3 text-sm font-medium">
        <span className="text-green-700">✅ {presentes} presentes</span>
        <span className="text-red-600">❌ {faltas} faltas</span>
        {justificadas > 0 && (
          <span className="text-amber-600">📄 {justificadas} justif.</span>
        )}
      </div>

      <ul className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-200">
        {roster.map((row) => (
          <li
            key={row.studentId}
            className={`flex items-center justify-between gap-3 px-4 py-3 ${
              row.status === "absent" ? "bg-red-50" : ""
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(row.studentId)}
              className="flex flex-1 items-center gap-3 text-left"
            >
              <span className="text-2xl">
                {row.status === "present" ? "✅" : row.status === "absent" ? "❌" : "📄"}
              </span>
              <span
                className={`font-medium ${
                  row.status === "absent" ? "text-red-700" : "text-slate-800"
                }`}
              >
                {row.name}
              </span>
            </button>
            <button
              type="button"
              onClick={() =>
                setStatus(
                  row.studentId,
                  row.status === "justified" ? "absent" : "justified",
                )
              }
              className={`rounded-lg border px-2 py-1 text-xs font-semibold ${
                row.status === "justified"
                  ? "border-amber-400 bg-amber-100 text-amber-700"
                  : "border-slate-200 text-slate-400 hover:text-amber-600"
              }`}
              title="Falta justificada (não conta como falta na streak)"
            >
              Justif.
            </button>
          </li>
        ))}
      </ul>

      <div className="sticky bottom-4 mt-5">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="w-full rounded-2xl bg-blue-600 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Salvando…" : saved ? "✅ Chamada salva!" : "Salvar chamada"}
        </button>
      </div>
    </div>
  );
}
