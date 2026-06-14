import type { NotificationKind, Student, StudentStats } from "@/lib/types";

export interface MessageContent {
  /** Assunto (usado no e-mail). */
  subject: string;
  /** Texto curto (push / aviso no Classroom). */
  short: string;
  /** Texto longo em HTML simples (corpo do e-mail). */
  html: string;
}

const firstName = (s: Student) => s.name.trim().split(/\s+/)[0];

/** Constrói a mensagem certa para cada tipo de notificação. */
export function buildMessage(
  kind: NotificationKind,
  student: Student,
  stats: StudentStats,
): MessageContent {
  const nome = firstName(student);

  if (kind === "absence_urgent") {
    const dias = stats.absentStreak;
    const plural = dias === 1 ? "aula" : "aulas seguidas";
    const subject =
      dias >= 3
        ? `😱 ${nome}, você está há ${dias} aulas sem aparecer no WIT!`
        : `👀 ${nome}, sentimos sua falta no WIT de IA`;
    const short = `EI ${nome.toUpperCase()}! Você está há ${dias} ${plural} sem vir na aula do WIT de IA. Você está perdendo MUITA coisa 😩 Bora voltar?`;
    return {
      subject,
      short,
      html: wrap(`
        <h2>${nome}, cadê você? 🥲</h2>
        <p>Você está há <strong>${dias} ${plural}</strong> sem aparecer no
        <strong>WIT de IA</strong>.</p>
        <p>A cada aula a gente avança em coisas que <em>não dá pra ver no YouTube</em>:
        projetos de inteligência artificial, jogos, desafios... e você está
        ficando pra trás. 😩</p>
        <p><strong>Quebra essa sequência de faltas hoje!</strong> Sua vaga te espera.</p>
      `),
    };
  }

  if (kind === "comeback") {
    const subject = `🎉 Que bom te ver de volta, ${nome}!`;
    const short = `Boa, ${nome}! Você voltou pro WIT de IA 💪 Agora bora construir uma sequência de presenças!`;
    return {
      subject,
      short,
      html: wrap(`
        <h2>Você voltou! 🎉</h2>
        <p>Sentimos sua falta, ${nome}. Agora que você está de volta ao
        <strong>WIT de IA</strong>, que tal começar uma sequência de presenças?</p>
        <p>Vem pra próxima aula e começa a sua streak. 🔥</p>
      `),
    };
  }

  // streak_milestone
  const dias = stats.presentStreak;
  const subject = `🔥 ${nome}, ${dias} aulas seguidas no WIT de IA!`;
  const short = `🔥 ${dias} EM SEQUÊNCIA! Mandou bem, ${nome}! Não deixa essa streak cair na próxima aula 😎`;
  return {
    subject,
    short,
    html: wrap(`
      <h2>🔥 Streak de ${dias} aulas!</h2>
      <p>Isso aí, ${nome}! Você já são <strong>${dias} aulas seguidas</strong>
      no <strong>WIT de IA</strong>. Você está no grupo dos que mais aprendem. 🚀</p>
      <p>Não deixa a chama apagar — te esperamos na próxima!</p>
    `),
  };
}

function wrap(inner: string): string {
  return `<div style="font-family: Arial, Helvetica, sans-serif; font-size:16px; line-height:1.5; color:#171717; max-width:520px;">
    ${inner}
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
    <p style="font-size:13px;color:#777;">WIT de IA — você faz parte. 💙</p>
  </div>`;
}
