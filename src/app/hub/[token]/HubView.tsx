"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { LevelInfo } from "@/lib/gamification";
import type { StudentStats } from "@/lib/types";
import type { WitLink } from "@/lib/wit-links";

const LINK_STYLES: Record<string, string> = {
  classroom: "from-emerald-400 to-teal-600",
  dungeon: "from-fuchsia-500 to-purple-700",
  canva: "from-sky-400 to-indigo-600",
};

export function HubView({
  firstName,
  stats,
  level,
  links,
}: {
  firstName: string;
  stats: StudentStats;
  level: LevelInfo;
  links: WitLink[];
}) {
  const celebrate = stats.presentStreak >= 3;

  useEffect(() => {
    if (!celebrate) return;
    let cancelled = false;
    import("canvas-confetti").then(({ default: confetti }) => {
      if (cancelled) return;
      const fire = (ratio: number, opts: Record<string, unknown>) =>
        confetti({
          particleCount: Math.floor(160 * ratio),
          spread: 70,
          origin: { y: 0.35 },
          colors: ["#fb923c", "#f472b6", "#a78bfa", "#60a5fa", "#facc15"],
          ...opts,
        });
      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.35, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.9 });
    });
    return () => {
      cancelled = true;
    };
  }, [celebrate]);

  const item = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.main
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: 0.09 }}
      className="mx-auto w-full max-w-md px-5 py-9"
    >
      {/* Cabeçalho */}
      <motion.header variants={item} className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/50">
          WIT Hub
        </p>
        <h1 className="mt-2 text-4xl font-extrabold">
          Oi, <span className="text-gradient">{firstName}</span>! 👋
        </h1>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm font-semibold">
          <span className="text-lg">⭐</span>
          Nível {level.level} · {level.title}
        </div>
      </motion.header>

      {/* Orbe da streak */}
      <motion.div variants={item} className="mt-8">
        <StreakOrb stats={stats} />
      </motion.div>

      {/* Barra de progresso de nível */}
      <motion.div variants={item} className="mt-7 glass rounded-2xl p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-white/80">Nível {level.level}</span>
          <span className="text-white/50">
            {level.intoLevel}/{level.perLevel} pro próximo
          </span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${level.progressPct}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
            className="h-full rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-300"
          />
        </div>
      </motion.div>

      {/* Estatísticas */}
      <motion.div variants={item} className="mt-4 grid grid-cols-3 gap-3">
        <StatCard icon="✅" value={stats.totalPresent} label="Presenças" />
        <StatCard icon="🏆" value={stats.longestPresentStreak} label="Recorde" />
        <StatCard icon="📊" value={`${stats.attendanceRate}%`} label="Presença" />
      </motion.div>

      {/* Atalhos */}
      <motion.section variants={item} className="mt-8">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-white/45">
          Atalhos do WIT
        </h2>
        <div className="grid gap-3">
          {links.map((link) => (
            <motion.a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={`group relative flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br p-4 shadow-lg ${
                LINK_STYLES[link.id] ?? "from-slate-500 to-slate-700"
              }`}
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/20 text-2xl shadow-inner">
                {link.emoji}
              </span>
              <span className="flex-1">
                <span className="block font-bold text-white">{link.label}</span>
                <span className="block text-sm text-white/80">
                  {link.description}
                </span>
              </span>
              <span className="text-xl text-white/70 transition group-hover:translate-x-1">
                →
              </span>
            </motion.a>
          ))}
        </div>
      </motion.section>

      <motion.p variants={item} className="mt-8 text-center text-xs text-white/40">
        WIT de IA — você faz parte. 💙
      </motion.p>
    </motion.main>
  );
}

function StreakOrb({ stats }: { stats: StudentStats }) {
  const absent = stats.absentStreak >= 1;
  const present = stats.presentStreak >= 1;
  const value = absent ? stats.absentStreak : stats.presentStreak;
  const display = useCountUp(value);

  const emoji = absent ? "🥶" : present ? "🔥" : "🌱";
  const orbGradient = absent
    ? "from-sky-400 via-blue-500 to-indigo-700"
    : present
      ? "from-amber-300 via-orange-500 to-rose-600"
      : "from-emerald-300 via-teal-500 to-cyan-700";

  const headline = absent
    ? `${value} ${value === 1 ? "falta" : "faltas seguidas"}`
    : present
      ? `${value} ${value === 1 ? "presença" : "aulas seguidas"}`
      : "Comece sua jornada";

  const subtitle = absent
    ? "Sua chama está congelando! Você está perdendo muita coisa — reacenda na próxima aula. 🔥"
    : present
      ? value === 1
        ? "A chama acendeu! Volte na próxima pra não deixar apagar."
        : "Você está pegando fogo! Não deixa a chama apagar. 😎"
      : "Apareça na próxima aula e acenda sua chama!";

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative grid h-52 w-52 place-items-center">
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${orbGradient} opacity-30 blur-2xl ${
            absent ? "glow-ice" : present ? "glow-fire" : ""
          }`}
        />
        <div
          className={`absolute inset-3 rounded-full bg-gradient-to-br ${orbGradient} opacity-25`}
        />
        <div className="relative z-10 flex flex-col items-center">
          <span
            className={`text-7xl ${
              present ? "flicker glow-fire" : absent ? "glow-ice" : ""
            }`}
          >
            {emoji}
          </span>
          {(present || absent) && (
            <span className="mt-1 text-5xl font-black tabular-nums text-white drop-shadow-lg">
              {display}
            </span>
          )}
        </div>
      </div>
      <h2
        className={`mt-3 text-2xl font-extrabold ${
          absent ? "text-sky-300" : present ? "text-orange-300" : "text-emerald-300"
        }`}
      >
        {headline}
      </h2>
      <p className="mt-2 max-w-xs text-center text-sm text-white/70">{subtitle}</p>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: string;
  value: string | number;
  label: string;
}) {
  return (
    <div className="glass rounded-2xl py-3 text-center">
      <div className="text-lg">{icon}</div>
      <div className="text-2xl font-extrabold tabular-nums text-white">{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-white/45">{label}</div>
    </div>
  );
}

/** Anima um número de 0 até `target`. */
function useCountUp(target: number, ms = 900): number {
  const [n, setN] = useState(0);
  const ref = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(eased * target);
      if (current !== ref.current) {
        ref.current = current;
        setN(current);
      }
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return n;
}
