-- WIT Hub — esquema inicial.
-- Rode no SQL Editor do Supabase (ou via CLI) para criar as tabelas.

create extension if not exists "pgcrypto";

-- Turmas (grupos de alunos por horário/dia).
create table if not exists turmas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  weekdays int[] not null default '{}', -- 0=domingo ... 6=sábado
  created_at timestamptz not null default now()
);

-- Alunos.
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  turma_id uuid not null references turmas(id) on delete cascade,
  name text not null,
  email text not null,
  grade int not null check (grade between 1 and 9),
  hub_token text not null unique default encode(gen_random_bytes(12), 'hex'),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists students_turma_idx on students(turma_id);

-- Sessões (uma aula = uma data de uma turma).
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  turma_id uuid not null references turmas(id) on delete cascade,
  date date not null,
  created_at timestamptz not null default now(),
  unique (turma_id, date)
);

-- Presença (um registro por aluno por sessão).
create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  status text not null check (status in ('present', 'absent', 'justified')),
  marked_at timestamptz not null default now(),
  unique (session_id, student_id)
);

create index if not exists attendance_student_idx on attendance(student_id);

-- Histórico de notificações enviadas (deduplicação dos avisos).
create table if not exists notification_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  channel text not null,
  kind text not null,
  streak_value int not null,
  sent_at timestamptz not null default now()
);

create index if not exists notification_student_idx on notification_logs(student_id);

-- Observação sobre segurança (RLS):
-- O app acessa o banco SOMENTE pelo servidor usando a chave service_role,
-- então o RLS não é necessário para o MVP. Se um dia o front acessar direto
-- com a chave anon, habilite RLS e crie policies por turma/aluno.
