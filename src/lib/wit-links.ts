// Atalhos que aparecem no Hub do aluno. Centraliza os principais acessos do WIT
// num lugar só. Troque as URLs pelos links reais do seu curso (ou configure por
// variável de ambiente quando quiser sobrescrever sem mexer no código).

export interface WitLink {
  id: string;
  label: string;
  description: string;
  href: string;
  emoji: string;
}

export const witLinks: WitLink[] = [
  {
    id: "classroom",
    label: "Google Sala de Aula",
    description: "Avisos, atividades e materiais da turma",
    href: process.env.NEXT_PUBLIC_LINK_CLASSROOM || "https://classroom.google.com",
    emoji: "🎓",
  },
  {
    id: "dungeon",
    label: "WIT Dungeon",
    description: "Desafios e jogos do WIT",
    href: process.env.NEXT_PUBLIC_LINK_DUNGEON || "#",
    emoji: "🐉",
  },
  {
    id: "canva",
    label: "Canva",
    description: "Crie seus projetos e apresentações",
    href: process.env.NEXT_PUBLIC_LINK_CANVA || "https://www.canva.com",
    emoji: "🎨",
  },
];
