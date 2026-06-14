<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# WIT Hub

App do **WIT de IA**: presença, streaks (estilo Duolingo) e atalhos do curso.
Veja o `README.md` para a visão geral. Pontos-chave de arquitetura:

- **Acesso a dados** passa por `src/lib/db` (interface `Database`). Há duas
  implementações: `demo` (em memória, padrão) e `supabase` (produção). A escolha
  é automática via `getDb()` — usa Supabase só se as variáveis estiverem setadas.
  Toda nova leitura/escrita deve entrar nas DUAS implementações.
- **Streaks** vivem em `src/lib/streaks.ts` como funções puras. Mantenha-as puras
  e testáveis; `justified` é sempre neutro.
- **Notificações**: regras em `notifications/rules.ts`, textos em `templates.ts`,
  envio em `channels.ts`. Canais sem credencial rodam em dry-run (console).
- Datas de aula são strings `YYYY-MM-DD`; use os helpers de `src/lib/date.ts`.
- Páginas que leem o banco usam `export const dynamic = "force-dynamic"`.

Sempre rode `npm run build` antes de concluir uma mudança.
