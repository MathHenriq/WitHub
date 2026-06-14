-- Dados de exemplo para testar o WIT Hub no Supabase (opcional).
-- Rode depois de 0001_init.sql.

insert into turmas (name, weekdays)
values ('WIT de IA — Turma A', '{1,3}')
returning id;

-- Pegue o id retornado acima e use abaixo, ou rode tudo de uma vez:
with t as (
  select id from turmas where name = 'WIT de IA — Turma A' limit 1
)
insert into students (turma_id, name, email, grade)
select t.id, x.name, x.email, x.grade
from t,
  (values
    ('Ana Beatriz Lima', 'ana.lima@aluno.escola.gov.br', 5),
    ('Pedro Henrique Souza', 'pedro.souza@aluno.escola.gov.br', 5),
    ('Mariana Costa', 'mariana.costa@aluno.escola.gov.br', 4)
  ) as x(name, email, grade);

-- Os hub_token são gerados automaticamente. Para pegar os links pessoais:
--   select name, hub_token from students;
