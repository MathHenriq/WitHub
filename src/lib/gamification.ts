// Sistema de níveis baseado no total de presenças — dá sensação de progressão.

const PER_LEVEL = 5; // presenças por nível

const TITLES = [
  "Explorador da IA",
  "Aprendiz de Algoritmos",
  "Caçador de Dados",
  "Mago dos Modelos",
  "Arquiteto Neural",
  "Mestre do WIT",
  "Lenda da IA",
];

export interface LevelInfo {
  level: number;
  title: string;
  /** Presenças acumuladas dentro do nível atual. */
  intoLevel: number;
  /** Presenças necessárias para subir de nível. */
  perLevel: number;
  /** Progresso 0-100 até o próximo nível. */
  progressPct: number;
}

export function levelFromPresences(totalPresent: number): LevelInfo {
  const level = Math.floor(totalPresent / PER_LEVEL) + 1;
  const intoLevel = totalPresent % PER_LEVEL;
  const title = TITLES[Math.min(level - 1, TITLES.length - 1)];
  return {
    level,
    title,
    intoLevel,
    perLevel: PER_LEVEL,
    progressPct: Math.round((intoLevel / PER_LEVEL) * 100),
  };
}
