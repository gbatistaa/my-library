# TEAM_SYNC.md — MyLibrary

> Última atualização: 2026-03-29
> Sprint atual: Sprint 3 — Auth Multi-Device + Profile Dashboard

---

## Daily Standup — 2026-03-29

### O que foi feito

**Backend (Engenharia)**
- Gamification engine completa: streaks, achievements (16 badges), leaderboard (5 métricas × 3 períodos), reading goals, stats (DNA, heatmap, velocity)
- Módulo de Reading Sessions com triggers automáticos de gamificação
- Auth JWT com refresh tokens multi-device implementado
- `UserProfileProjection` criada para otimizar endpoint `/auth/me` (sem lazy loading desnecessário)
- `RefreshTokenService` e `RefreshTokenRepository` estendidos para suporte a logout por device
- Spring Boot atualizado para 4.0.5, refactoring de date handling em leaderboard/book specs

**Mobile (UI)**
- Setup completo: Expo 54, NativeWind, React Query, Expo Router 6, Reanimated 4
- Fluxo de autenticação implementado (login, token storage, refresh)
- Profile Dashboard com 7 componentes:
  - `ProfileHeader`, `StatsGrid`, `StreakCard`, `AchievementsSection` (commitados)
  - `ReadingDnaSection`, `GoalProgressCard`, `LogoutButton` (novos, não commitados)
- Home tab (`index.tsx`) com +198 linhas de conteúdo novo
- Profile tab (`profile.tsx`) com +721 linhas — dashboard completo
- Device service atualizado para identificação multi-device
- Profile service estendido com chamadas à API de perfil

**QA / Qualidade**
- Nenhum teste automatizado adicionado nesta sprint
- Testes manuais via `api.http` e Postman para endpoints de auth e profile

### Impedimentos

1. **Sem testes de integração** — Testcontainers não configurado; cobertura depende de testes manuais
2. **DDL via Hibernate auto-update** — Sem Flyway; risco em migrações de schema em produção
3. **Sem CI/CD pipeline** — Build e deploy são manuais
4. **Sem documentação de API** — Swagger/OpenAPI ainda não configurado

### Work In Progress (não commitado)

| Área | Arquivo | Status |
|------|---------|--------|
| Backend | `AuthController.java` — endpoint `/auth/me` com projection | Em revisão |
| Backend | `RefreshTokenController/Service/Repository` — logout por device | Em revisão |
| Backend | `UserRepository` + `UserDTO` — query methods + campos novos | Em revisão |
| Backend | `UserProfileProjection` — nova interface de projeção JPA | Novo |
| Mobile | `GoalProgressCard.tsx` — card de progresso de meta anual | Novo |
| Mobile | `LogoutButton.tsx` — botão de logout com invalidação de token | Novo |
| Mobile | `ReadingDnaSection.tsx` — visualização do DNA de leitura | Novo |
| Mobile | `index.tsx`, `profile.tsx` — expansão das tabs principais | Em revisão |
| Mobile | `device.ts`, `profileService.ts`, `auth.ts` — services e tipos | Em revisão |

---

## QA & Blocks

> Revisado por: QA Engineer (Staff) — 2026-03-29
> **Daily NAO pode ser fechada enquanto CRIT-01, CRIT-02 e CRIT-03 estiverem abertos.**

### CRITICAL — Bloqueiam merge

#### [CRIT-01] IDOR: qualquer usuario autenticado pode revogar sessao de outro usuario
- **Arquivo:** `RefreshTokenController.java` — `DELETE /auth/sessions/{id}` (linhas 61-65)
- **Detalhe:** O endpoint so verifica `existsById`, mas **nunca valida que a sessao pertence ao usuario autenticado**. Qualquer usuario pode revogar sessoes alheias.
- **Impacto:** Atacante autenticado revoga sessoes de todos os usuarios. Combinado com CRIT-02, pode enumerar sessoes antes de revogar.
- **Fix:** Injetar `@AuthenticationPrincipal`, buscar o token, comparar `token.userId == user.getId()`. Retornar 403 se nao corresponder.
- **Status:** ABERTO

#### [CRIT-02] GET /auth/sessions lista TODAS as sessoes sem role check
- **Arquivo:** `RefreshTokenController.java` (linhas 39-42) + `SecurityConfig.java`
- **Detalhe:** Endpoint marcado como "admin" e acessivel por qualquer usuario autenticado. Nao ha `@PreAuthorize("hasRole('ADMIN')")`.
- **Impacto:** Qualquer usuario lista refresh tokens de todos os outros usuarios (incluindo o token real — ver CRIT-03).
- **Fix:** Adicionar `@PreAuthorize("hasRole('ADMIN')")` ou remover o endpoint ate existir sistema de roles.
- **Status:** ABERTO

#### [CRIT-03] RefreshTokenDTO expoe valor real do refresh token
- **Arquivo:** `RefreshTokenDTO.java` — campo `private String token` (linha 15)
- **Detalhe:** O DTO retornado por `/auth/sessions/me` e `/auth/sessions` inclui o valor bruto do refresh token. Se logado, cacheado, ou interceptado, permite impersonacao.
- **Impacto:** Com o refresh token de outro usuario, gera-se access tokens infinitamente. Escalacao de privilegio total.
- **Fix:** Remover o campo `token` do DTO de listagem. Criar DTO separado sem o campo sensivel.
- **Status:** ABERTO

---

### HIGH — Devem ser resolvidos antes de release

#### [HIGH-01] CircleProgress e fake — mostra apenas 4 estados discretos
- **Arquivo:** `GoalProgressCard.tsx` (linhas 47-61)
- **Detalhe:** O "anel de progresso" usa `borderTopColor/borderRightColor/etc` com condicionais em 0/25/50/75%. Um usuario com 90% ve o mesmo visual que um com 76%. As variaveis `circumference` e `strokeDashoffset` (linhas 21-22) sao calculadas mas **nunca usadas** — codigo morto.
- **Impacto:** Feedback visual enganoso. Feature de gamificacao perde credibilidade.
- **Fix:** Usar `react-native-svg` com `<Circle>` e `strokeDasharray`/`strokeDashoffset` reais.
- **Status:** ABERTO

#### [HIGH-02] Pull-to-refresh sequencial — UX lenta
- **Arquivo:** `index.tsx` (linhas 258-264), `profile.tsx` (linhas 805-809)
- **Detalhe:** `onRefresh` faz `await` sequencial em cada `invalidateQueries`. Sao queries independentes.
- **Impacto:** Refresh demora N vezes mais do que necessario (4 queries sequenciais no Home).
- **Fix:** `await Promise.all([...])`.
- **Status:** ABERTO

#### [HIGH-03] `getGoalProgress` engole qualquer erro como "sem goal"
- **Arquivo:** `profileService.ts` (linhas 35-43)
- **Detalhe:** O `catch` generico retorna `null` para QUALQUER erro (500, timeout, rede). UI interpreta `null` como "nenhum goal definido".
- **Impacto:** Se o backend retornar 500, usuario ve "Sem objetivo" ao inves de erro. Silencia falhas reais.
- **Fix:** Checar `error.response?.status === 404` antes de retornar null. Propagar outros erros.
- **Status:** ABERTO

#### [HIGH-04] Acessibilidade praticamente inexistente
- **Arquivos:** Todos os componentes novos
- **Detalhe:** Nenhum `accessibilityLabel`, `accessibilityRole`, ou `accessibilityHint` nos elementos interativos. Screen readers inutilizaveis.
- **Impacto:** App inacessivel (VoiceOver/TalkBack). Violacao de WCAG.
- **Fix:** Adicionar labels em todos os botoes, cards interativos, e indicadores de progresso.
- **Status:** ABERTO

---

### MEDIUM — Backlog

| ID | Issue | Arquivo | Fix |
|----|-------|---------|-----|
| MED-01 | `generateUUID` usa `Math.random()` — nao criptograficamente seguro | `device.ts:8-13` | Usar `expo-crypto.randomUUID()` |
| MED-02 | EditProfileModal nao resincroniza state quando props mudam | `profile.tsx:425-426` | Adicionar `useEffect` ou usar `key` no componente |
| MED-03 | `handleProfileSaved` nao invalida query cache `["currentUser"]` | `profile.tsx:833-836` | Chamar `queryClient.invalidateQueries` apos save |
| MED-04 | TextInput sem `maxLength` — usuario pode colar megabytes | `profile.tsx:514-543` | Adicionar `maxLength` compativel com backend |
| MED-05 | Cores hardcoded fora do tema em multiplos componentes | Varios | Centralizar no theme system |
| MED-06 | AuthController faz query direta ao Repository — viola layering | `AuthController.java:35-39` | Mover logica para Service |

---

## Prioridades — Próxima Sprint (Sprint 4)

### P0 — Crítico
1. **Commitar WIP atual** — 13 arquivos modificados + 4 novos; consolidar em commits atômicos
2. **Testes unitários para auth flow** — `RefreshTokenService`, `AuthController` (service layer)
3. **Flyway migration baseline** — Gerar DDL atual como V1, trocar `ddl-auto=update` → `validate`

### P1 — Alta
4. **Swagger/OpenAPI** — Adicionar `springdoc-openapi` para documentação automática dos endpoints
5. **Tela de Home funcional** — Conectar home tab com dados reais (livros recentes, streak, progresso)
6. **Error handling mobile** — Toast/snackbar para erros de rede e token expirado

### P2 — Média
7. **CI pipeline básico** — GitHub Actions: build + test no PR
8. **Tela de catálogo de livros** — CRUD de livros no mobile
9. **Push notifications setup** — Expo Notifications para lembretes de leitura

### P3 — Backlog
10. Redis caching para leaderboard e stats
11. Testcontainers para testes de integração
12. Rate limiting nos endpoints de auth
13. Dark mode no mobile

---

## Métricas do Projeto

| Métrica | Valor |
|---------|-------|
| Total de commits | ~15 (desde início) |
| Módulos backend completos | 10 (books, categories, saga, readingSession, readingGoal, streak, achievement, stats, leaderboard, auth) |
| Componentes mobile | 7 (profile) + 2 tabs |
| Cobertura de testes | 0% (sem testes automatizados) |
| Endpoints documentados | 0% (sem Swagger) |
| Migrations versionadas | 0 (Hibernate auto-update) |

---

## Definições de Pronto (DoD)

- Código commitado com mensagem descritiva
- Sem secrets hardcoded
- DTOs mapeados via MapStruct (backend)
- Queries filtradas por `userId` (multi-tenant)
- Componentes tipados com TypeScript (mobile)
