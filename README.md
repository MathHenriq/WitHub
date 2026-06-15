# WIT Hub 💙

Automatiza a parte chata do dia a dia do **WIT de IA**: saber **quem está vindo**,
**quem está sumindo** e **provocar urgência** nos alunos com streaks no estilo
Duolingo — tudo num Hub central com os atalhos do curso (Google Sala de Aula,
WIT Dungeon, Canva...).

## O problema que ele resolve

O curso é gratuito e aberto, o que tira o senso de "preciso estar presente".
Aluno some sem avisar. Hoje, caçar quem faltou é trabalho manual e lento. O WIT Hub:

1. **Chamada-relâmpago** — todos vêm marcados como presentes; você só toca em
   quem faltou. Mais rápido que marcar um a um.
2. **Motor de streaks** — calcula presenças seguidas (a chama 🔥) e faltas
   seguidas (a urgência 😱) de cada aluno.
3. **Notificações automáticas** — "EI, você está há 3 aulas sem vir, tá perdendo
   muita coisa!" por e-mail, aviso no Google Sala de Aula e (fase 2) push do app.
4. **Hub do aluno** — uma telinha com a streak dele + botões pros principais
   acessos do WIT.

> **Sobre o SIEB:** o sistema oficial da prefeitura de Barueri não tem
> integração aberta, então o WIT Hub **não depende dele** — a presença é
> registrada aqui, na chamada-relâmpago. Se um dia rolar um export CSV do SIEB,
> dá pra importar.

## Como rodar (modo demo, sem configurar nada)

```bash
npm install
npm run dev
```

Abra http://localhost:3000. Sem Supabase configurado, o app entra em **modo
demonstração** com alunos de exemplo. Na home aparecem links pros Hubs de
exemplo (ex.: Pedro está faltando, Ana tem uma boa streak).

Rotas principais:

- `/` — porta de entrada
- `/professor` → `/professor/[turma]` — chamada-relâmpago
- `/hub/[token]` — Hub pessoal do aluno (streak + atalhos)
- `/api/cron/streaks` — dispara a varredura de streaks + notificações

## Como colocar em produção

### 1. Banco de dados (Supabase)

1. Crie um projeto em https://supabase.com.
2. No **SQL Editor**, rode `supabase/migrations/0001_init.sql`.
   (Opcional: `supabase/seed.sql` para dados de teste.)
3. Copie `.env.example` para `.env.local` e preencha:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

Assim que essas duas variáveis existirem, o app sai do modo demo e passa a usar
o Supabase de verdade.

### 2. Notificações

- **E-mail (pronto):** crie uma conta em https://resend.com, gere uma
  `RESEND_API_KEY` e defina `NOTIFICATIONS_FROM_EMAIL`. Os e-mails vão pra conta
  Google da escola dos alunos (o canal que já temos, sem precisar de número).
- **Google Sala de Aula (a fazer):** precisa de um *service account* com
  *domain-wide delegation* no Workspace da escola + Classroom API. O ponto de
  integração já está isolado em `src/lib/notifications/channels.ts` (`sendClassroom`).
- **Push do PWA (fase 2):** Web Push com chaves VAPID, depois que o aluno
  instalar o Hub e aceitar notificações. Ponto de integração: `sendPush`.

> Enquanto uma credencial não está configurada, o canal roda em **dry-run**
> (loga no console em vez de enviar), então dá pra testar todo o fluxo.

### 3. Deploy + cron

Faça deploy na **Vercel**. O `vercel.json` já agenda a varredura diária
(`/api/cron/streaks`, 22h UTC ≈ 19h de Brasília). Defina `CRON_SECRET` pra
proteger a rota.

## Como funcionam as streaks

`src/lib/streaks.ts` é o cérebro (funções puras, fáceis de testar):

- **present** alimenta a streak boa; **absent** alimenta a streak de urgência.
- **justified** (falta justificada) é neutro: não pune nem premia.
- As sequências são contadas da aula mais recente pra trás.

As regras de quando notificar estão em `src/lib/notifications/rules.ts`
(urgência a cada nova falta; comemoração em marcos de 3, 5, 7, 10... presenças;
um "que bom te ver de volta" quando o aluno retorna). A deduplicação evita
mandar o mesmo aviso duas vezes.

## Estrutura

```
src/
  app/
    page.tsx                       # porta de entrada
    professor/                     # chamada-relâmpago
    hub/[token]/                   # Hub do aluno
    api/chamada/                   # salva a presença
    api/cron/streaks/              # varredura diária
  lib/
    streaks.ts                     # motor de streaks (puro)
    db/                            # acesso a dados (demo + supabase)
    notifications/                 # regras, templates e canais de envio
    wit-links.ts                   # atalhos do Hub
supabase/                          # migrations + seed
```

## Privacidade (LGPD)

Os alunos são menores (4º ao 9º ano). O sistema **não coleta número pessoal** —
usa só a conta Google da escola que eles já têm. Os links do Hub usam um token
secreto e não adivinhável. Trate nome, e-mail e presença como dados sensíveis.

## Próximos passos sugeridos

- Tela de **gestão de turmas/alunos** para o professor (hoje via Supabase/seed).
- **Autenticação** da área do professor (ex.: Supabase Auth ou um código de acesso).
- **Ranking** da turma e **avisos coletivos** no Classroom.
- **PWA + push** (fase 2) e **importação de CSV do SIEB**, se possível.
