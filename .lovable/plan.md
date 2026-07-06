## Objetivo

Deixar o bloqueio de aulas por plano funcionando **sem depender do Stripe**, para você já poder liberar acesso a alunos hoje e ter a distinção Básico vs Premium pronta para quando Stripe voltar.

## O que muda para o usuário

- Cada aula e cada material pode ser marcado como "requer Básico" ou "requer Premium" (ou grátis).
- Cursos aparecem com ícone de cadeado + badge indicando qual plano é necessário.
- Quem tem Básico vê aulas Básicas + prévias grátis; conteúdo Premium fica com "Upgrade a Premium".
- Quem tem Premium vê tudo.
- Admin ganha uma tela nova: **Usuários → Conceder acesso**, com escolha de plano (Básico/Premium) e duração (30 dias, 90 dias, 1 ano, vitalício). Isso cria a "assinatura manual" que substitui o Stripe por enquanto.

## O que muda no admin

Nova aba **"Usuários"** no `/admin` com:
- Lista de usuários (email, plano ativo, vence em, ações)
- Botão **"Conceder acesso"** → modal com plano + duração
- Botão **"Revogar acesso"** para cancelar antes do vencimento

Nas telas de edição de curso/aula/material do admin, um novo seletor **"Plano requerido"** (Grátis / Básico / Premium).

## Estrutura técnica

### Banco de dados (migração)

1. Enum `plan_tier` com valores `basico` e `premium`
2. Coluna `subscriptions.plan_tier` (deriva do `product_id` quando vem do Stripe; setada manualmente quando concedida por admin)
3. Coluna `subscriptions.granted_by` (uuid do admin que concedeu, nullable — nulo quando vem do Stripe)
4. Coluna `lessons.required_plan` (`plan_tier`, default `basico`)
5. Coluna `course_materials.required_plan` (`plan_tier`, default `basico`)
6. Função `has_plan_access(user_id, required plan_tier)` que retorna true se o usuário tem `required_plan` ou superior, ou é admin
7. Atualizar RPC `private.get_lesson_video` para checar `has_plan_access(auth.uid(), lesson.required_plan)`
8. Atualizar policy de `course_materials` para checar `has_plan_access` contra `required_plan`
9. Server function `grant_subscription` (admin-only) que insere linha em `subscriptions` com `plan_tier`, `current_period_end`, `status='active'`, `granted_by=admin`, `environment='manual'`

### Frontend

- `useSubscription`: expor `planTier: 'basico' | 'premium' | null` além de `hasActive`
- Nova helper `hasPlanAccess(userTier, requiredTier)` compartilhada
- `/cursos` e `/cursos/$id`: mostrar badge do plano requerido e mensagem de upgrade quando aplicável
- `/admin`: nova aba **Usuários** com lista + modal de concessão
- Admin de curso/aula/material: adicionar select "Plano requerido"

## Fora de escopo (fica para depois)

- Emails automáticos de "seu acesso foi concedido/expira em X dias"
- Aviso automático 7 dias antes de expirar
- Renovação automática de concessão manual
- Integração real Stripe → já está preparado, mas ligamos depois

## Etapas de entrega

1. Migração SQL (tabelas + função + policies)
2. Server function `grant_subscription` + `revoke_subscription`
3. Atualizar `useSubscription` para expor `planTier`
4. Admin: aba Usuários com listar/conceder/revogar
5. Admin: adicionar campo "Plano requerido" nos formulários de aula e material
6. UI de bloqueio nas rotas `/cursos` e `/cursos/$id` com badges Básico/Premium

Após aprovar, executo os 6 passos em sequência.