# Spec — Módulo Clube do Livro (MyLibrary)

> Análise completa do backend + especificação de interface mobile

---

## PARTE 1 — ANÁLISE DO MÓDULO BACKEND

### 1.1 Visão Geral do Módulo

O módulo `bookClub` é composto por 6 sub-módulos independentes, cada um com Controller, Service, Repository, Entity, DTOs e Mappers:

| Sub-módulo | Responsabilidade |
|---|---|
| `clubs` | CRUD do clube + dashboard |
| `bookClubMembers` | Gestão de membros (add/update/remove) |
| `clubInvite` | Fluxo de convites |
| `clubBook` | Fila de livros do clube |
| `clubBookProgress` | Progresso de leitura por membro |
| `clubBookReview` | Reviews de livros encerrados |

---

### 1.2 Entidades e Schema

#### `BookClubEntity` → tabela `book_club`

| Campo | Tipo | Regra |
|---|---|---|
| `id` | UUID | PK auto |
| `name` | String (max 100) | NOT NULL |
| `description` | String | nullable |
| `maxMembers` | Integer | NOT NULL, min 3 |
| `status` | `BookClubStatus` | NOT NULL |
| `admin` | → `UserEntity` | NOT NULL |

#### `BookClubMemberEntity` → tabela `book_club_members`

| Campo | Tipo | Regra |
|---|---|---|
| `id` | UUID | PK |
| `bookClub` | → `BookClubEntity` | NOT NULL |
| `user` | → `UserEntity` | NOT NULL |
| `role` | `BookClubMemberRole` | NOT NULL |
| `status` | `BookClubMemberStatus` | NOT NULL |
| — | UNIQUE | `(book_club_id, user_id)` |

#### `ClubInviteEntity` → tabela `club_invites`

| Campo | Tipo | Regra |
|---|---|---|
| `id` | UUID | PK |
| `token` | String | NOT NULL |
| `status` | `InviteStatus` | NOT NULL |
| `expiresAt` | LocalDate | NOT NULL (now + 7 dias) |
| `acceptedAt` | LocalDateTime | nullable |
| `bookClub` | → `BookClubEntity` | nullable FK |
| `inviter` | → `UserEntity` | nullable FK |
| `invitee` | → `UserEntity` | nullable FK |
| — | UNIQUE | `(inviter_id, invitee_id, book_club_id)` |

#### `ClubBookEntity` → tabela `club_books`

| Campo | Tipo | Regra |
|---|---|---|
| `id` | UUID | PK |
| `club` | → `BookClubEntity` | NOT NULL |
| `book` | → `BookEntity` | NOT NULL |
| `orderIndex` | Integer | NOT NULL |
| `isCurrent` | Boolean | NOT NULL, partial UNIQUE quando true |
| `startedAt` | LocalDate | nullable |
| `finishedAt` | LocalDate | nullable |
| `deadline` | LocalDate | NOT NULL (via DTO) |
| `deadlineExtendedAt` | LocalDate | nullable, max deadline + 10 dias |
| — | UNIQUE | `(club_id, book_id)` |

#### `ClubBookProgressEntity` → tabela `club_book_progress`

| Campo | Tipo | Regra |
|---|---|---|
| `id` | UUID | PK |
| `member` | → `BookClubMemberEntity` | NOT NULL |
| `clubBook` | → `ClubBookEntity` | NOT NULL |
| `currentPage` | Integer | NOT NULL, default 1 |
| `status` | `MemberProgressStatus` | NOT NULL, default READING |
| `startedAt` | LocalDate | nullable |
| `finishedAt` | LocalDate | nullable |
| — | UNIQUE | `(member_id, club_book_id)` |

#### `ClubBookReviewEntity` → tabela `club_book_reviews`

| Campo | Tipo | Regra |
|---|---|---|
| `id` | UUID | PK |
| `clubBook` | → `ClubBookEntity` | NOT NULL |
| `user` | → `UserEntity` | NOT NULL |
| `rating` | Integer | NOT NULL, 1–5 |
| `reviewText` | String (max 2000) | NOT NULL |
| — | UNIQUE | `(user_id, club_book_id)` |

---

### 1.3 Enums

```
BookClubStatus:       ACTIVE | INACTIVE | ARCHIVED
BookClubMemberRole:   ADMIN  | MEMBER
BookClubMemberStatus: ACTIVE | INACTIVE | BANNED
InviteStatus:         PENDING | ACCEPTED | REJECTED | EXPIRED
MemberProgressStatus: READING | FINISHED | UNFINISHED
```

---

### 1.4 Endpoints da API

#### `BookClubController` — `/api/book-clubs`

| Método | Path | Auth | Descrição |
|---|---|---|---|
| POST | `/` | logado | Cria clube (admin vira membro ADMIN automaticamente) |
| GET | `/` | público | Lista todos os clubes (paginado) |
| GET | `/{id}` | público | Busca clube por ID |
| PUT | `/{id}` | admin do clube | Atualiza nome/descrição/maxMembers |
| GET | `/admin/{adminId}` | público | Clubes de um admin (paginado) |
| GET | `/{id}/dashboard` | membro | Dashboard com stats do livro atual |
| DELETE | `/{id}` | admin do clube | Deleta clube |

**Request body `POST /`:**

```json
{ "name": "string (3-100)", "description": "string (10-1000)", "maxMembers": 3+ }
```

**Response `GET /{id}/dashboard`:**

```json
{
  "clubId": "uuid",
  "clubName": "string",
  "totalBooks": 3,
  "finishedBooks": 1,
  "currentBook": {
    "clubBookId": "uuid",
    "bookTitle": "string",
    "bookAuthor": "string",
    "totalPages": 412,
    "startedAt": "2026-04-01",
    "deadline": "2026-05-31",
    "totalActiveMembers": 4,
    "finishedCount": 2,
    "pendingCount": 2,
    "averageProgressPercent": 68,
    "memberProgress": [
      { "memberId": "uuid", "currentPage": 280, "progressPercent": 68, "status": "READING" }
    ]
  }
}
```

---

#### `BookClubMemberController` — `/api/members`

| Método | Path | Auth | Descrição |
|---|---|---|---|
| POST | `/` | logado | Adiciona membro manualmente |
| GET | `/` | logado | Lista todos os membros (paginado, admin only?) |
| GET | `/club/{clubId}` | membro do clube | Lista membros do clube (paginado) |
| GET | `/{id}` | logado | Busca membro por ID |
| PATCH | `/{id}` | admin do clube | Atualiza role/status do membro |
| DELETE | `/{id}` | admin ou próprio user | Remove membro |

**Response `GET /club/{clubId}`:**

```json
{ "id": "uuid", "bookClubId": "uuid", "userId": "uuid", "role": "MEMBER", "joinedAt": "datetime" }
```

---

#### `ClubInviteController` — `/api/club-invites`

| Método | Path | Auth | Descrição |
|---|---|---|---|
| POST | `/` | admin do clube | Cria convite (expira em 7 dias) |
| PATCH | `/{inviteId}/accept` | invitee | Aceita convite → vira membro ACTIVE |
| PATCH | `/{inviteId}/reject` | invitee | Rejeita convite (deleta) |
| PATCH | `/{inviteId}/revoke` | inviter ou admin | Revoga convite (deleta) |

**Request body `POST /`:**

```json
{ "bookClubId": "uuid", "inviteeId": "uuid" }
```

**Response `PATCH /{id}/accept`:**

```json
{ "inviteeName": "string", "inviterName": "string", "clubName": "string" }
```

**Validações de convite:**

- Admin não pode se auto-convidar
- Usuário já membro → conflict
- Convite pendente já existe para o par (clube, invitee) → conflict
- Expirado (expiresAt < hoje) → conflict ao aceitar
- Só o invitee pode aceitar/rejeitar
- Só inviter ou admin pode revogar
- Só convites `PENDING` podem ser aceitos/rejeitados

---

#### `ClubBookController` — `/api/book-clubs/{clubId}/books`

| Método | Path | Auth | Descrição |
|---|---|---|---|
| POST | `/` | admin | Adiciona livro à fila (obriga `deadline`) |
| GET | `/` | membro | Lista todos os livros do clube por orderIndex |
| PATCH | `/{id}` | admin | Atualiza orderIndex/datas/deadline |
| POST | `/{id}/current` | admin | Define livro como leitura ativa |
| POST | `/advance` | admin | Força avanço → READING→UNFINISHED + ativa próximo |
| DELETE | `/{id}` | admin | Remove livro da fila |

**Request body `POST /`:**

```json
{ "googleBooksId": "string", "deadline": "2026-05-31" }
```

**Response (ClubBookDTO):**

```json
{
  "id": "uuid", "clubId": "uuid",
  "book": { "id": "uuid", "title": "Duna", "author": "Frank Herbert", "pages": 412, "coverUrl": "...", ... },
  "orderIndex": 0,
  "isCurrent": true,
  "startedAt": "2026-04-01",
  "finishedAt": null,
  "deadline": "2026-05-31",
  "deadlineExtendedAt": null
}
```

**Regras de negócio:**

- Ao ativar livro (`setCurrent`): livro anterior tem `finishedAt` setado; progress inicializado para todos os membros ativos
- Ao fazer `advance`: membros ainda `READING` → `UNFINISHED`; próximo livro ativado
- Ao todos membros ficarem `FINISHED`: `checkAndAutoClose` seta `isCurrent=false`, `finishedAt=now` automático
- Próximo livro NÃO ativa automaticamente após auto-close; admin precisa chamar `advance` ou `setCurrent`
- Deadline extension: `deadlineExtendedAt` precisa estar entre `deadline` e `deadline + 10 dias`
- Livro duplicado no clube → conflict

---

#### `ClubBookProgressController` — `/api/book-clubs/{clubId}/books/{clubBookId}/progress`

| Método | Path | Auth | Descrição |
|---|---|---|---|
| GET | `/` | membro | Lista progresso de todos os membros |
| GET | `/me` | membro ativo | Meu progresso no livro |
| PATCH | `/me` | membro ativo | Atualiza minha página atual |

**Request body `PATCH /me`:**

```json
{ "currentPage": 280 }
```

**Response (ClubBookProgressDTO):**

```json
{
  "id": "uuid", "memberId": "uuid", "clubBookId": "uuid",
  "currentPage": 280,
  "progressPercent": 68,
  "status": "READING",
  "startedAt": "2026-04-01",
  "finishedAt": null
}
```

**Automações de status:**

- `currentPage >= totalPages` → `status = FINISHED`, `finishedAt = hoje`
- Regressão (estava FINISHED, página volta) → `status = READING`, `finishedAt = null`
- `deadline` passou → `status = UNFINISHED` (sem `finishedAt`)
- Todos membros FINISHED ou UNFINISHED → livro auto-fecha
- Scheduler diário (02:00) → marca todos overdue como UNFINISHED

---

#### `ClubBookReviewController` — `/api/book-clubs/{clubId}/books/{clubBookId}/reviews`

| Método | Path | Auth | Descrição |
|---|---|---|---|
| POST | `/` | membro | Cria review (apenas livros encerrados) |
| GET | `/` | membro | Lista reviews do livro |
| PATCH | `/{reviewId}` | dono do review | Edita review |
| DELETE | `/{reviewId}` | dono ou admin | Deleta review |

**Request body `POST /`:**

```json
{ "rating": 5, "reviewText": "string (max 2000)" }
```

**Regra:** Só pode reviewar livro com `isCurrent = false` E `startedAt != null` (lido pelo clube). Um review por membro por livro.

---

### 1.5 Fluxos Completos

#### Fluxo 1 — Criação do Clube

```
User → POST /api/book-clubs
  ├── BookClubEntity criada (status: ACTIVE)
  └── Admin auto-adicionado como BookClubMemberEntity (role: ADMIN, status: ACTIVE)
```

#### Fluxo 2 — Convite de Membro

```
Admin → POST /api/club-invites { bookClubId, inviteeId }
  ├── ClubInviteEntity criada (status: PENDING, expiresAt: +7 dias)
  │
Invitee → PATCH /api/club-invites/{id}/accept
  ├── status: ACCEPTED
  ├── BookClubMemberEntity criada (role: MEMBER, status: ACTIVE)
  └── Se clube tem livro ativo → ClubBookProgressEntity inicializada para o novo membro
  │
Invitee → PATCH /api/club-invites/{id}/reject
  └── ClubInviteEntity deletada
  │
Admin → PATCH /api/club-invites/{id}/revoke
  └── ClubInviteEntity deletada
```

#### Fluxo 3 — Leitura de um Livro

```
Admin → POST /books { googleBooksId, deadline }
  └── ClubBookEntity criada (isCurrent: false, orderIndex: max+1)

Admin → POST /books/{id}/current
  ├── Livro anterior: finishedAt = hoje (se aberto)
  ├── Livro alvo: isCurrent = true, startedAt = hoje
  └── ClubBookProgressEntity criada para cada membro ativo (page: 1, status: READING)

Membro → PATCH /books/{id}/progress/me { currentPage: 280 }
  ├── Se page >= totalPages → status: FINISHED, finishedAt: hoje
  ├── Se deadline passou → status: UNFINISHED
  └── Se todos membros FINISHED/UNFINISHED → isCurrent: false, finishedAt: hoje (auto-close)

Admin → POST /books/advance  [força avanço]
  ├── Membros READING → status: UNFINISHED
  ├── Livro atual: isCurrent: false, finishedAt: hoje
  └── Próximo livro: isCurrent: true, startedAt: hoje + progress inicializado
```

#### Fluxo 4 — Review

```
Admin → POST /books/advance [ou auto-close]
  └── Livro fica isCurrent: false, startedAt: não-null → revisável

Membro → POST /books/{id}/reviews { rating, reviewText }
  └── ClubBookReviewEntity criada (1 por membro por livro)

Membro → PATCH /books/{id}/reviews/{reviewId}
  └── Edita próprio review

Admin → DELETE /books/{id}/reviews/{reviewId}
  └── Remove qualquer review
```

---

## PARTE 2 — SPEC DE INTERFACE MOBILE

### 2.1 Navegação Principal

```
Bottom Tab Bar:
  [🏠 Início]  [📚 Meus Clubes]  [🔔 Convites]  [👤 Perfil]
```

---

### 2.2 Tela — Lista de Clubes (`/meus-clubes`)

**Propósito:** Exibir os clubes dos quais o usuário é membro.

**Header:**

- Título "Meus Clubes"
- Botão `+` no canto superior direito → abre modal de criação

**Lista (cards verticais):**
Cada card mostra:

```
┌─────────────────────────────────────────┐
│  📖  Nome do Clube                [ATIVO]│
│  "Descrição curta do clube..."           │
│  👥 4/8 membros   •   📚 3 livros        │
│  Lendo agora: Duna ──────────── 68%     │
└─────────────────────────────────────────┘
```

- Badge de status: `ATIVO` (verde) / `INATIVO` (cinza) / `ARQUIVADO` (vermelho)
- Se sem livro ativo: "Nenhum livro em leitura"
- Toque no card → navega para **Club Dashboard**

**Estado vazio:**

- Ilustração + "Você não faz parte de nenhum clube"
- Botão "Criar meu primeiro clube"

**API:** `GET /api/book-clubs` (filtrado por membership) + `GET /{id}/dashboard`

---

### 2.3 Tela — Dashboard do Clube (`/clube/:id`)

**Propósito:** Visão geral do clube para membros.

**Header:**

- Nome do clube (grande)
- Descrição
- `👑 Admin: NomeDoAdmin`  •  `👥 X/Y membros`
- Botão "···" (mais opções) para admin: Editar / Convidar / Deletar

**Seção "Leitura Atual"** (se houver livro ativo):

```
┌─────────────────────────────────────────┐
│  [CAPA]  Duna                           │
│          Frank Herbert • 412 páginas    │
│  Início: 01 abr  •  Prazo: 31 mai       │
│                                         │
│  Progresso do grupo ────────────  68%  │
│  ✅ 2 terminaram   ⏳ 2 lendo           │
│                                         │
│  [Ver progresso detalhado]              │
└─────────────────────────────────────────┘
```

- Botão "Atualizar meu progresso" → navega para tela de Update Progress
- Badge do prazo: verde (> 7 dias) / amarelo (≤ 7 dias) / vermelho (vencido)

**Seção "Histórico":**

- Contador: "X livros lidos"
- Mini-lista dos últimos 3 livros encerrados com rating médio
- Botão "Ver fila completa" → tela de Fila de Livros

**Seção "Membros":**

- Row horizontal com avatars dos membros (máx 5 + "+N")
- Toque → abre tela de Membros

**Botões admin (bottom fixed):**

- "Avançar para próximo livro" (só aparece se há próximo na fila)
- Confirmação modal antes de avançar: "Membros ainda lendo serão marcados como não finalizaram."

**API:** `GET /api/book-clubs/{id}/dashboard`

---

### 2.4 Tela — Fila de Livros (`/clube/:id/livros`)

**Propósito:** Visualizar e gerenciar a fila de leitura do clube.

**Header:** "Fila de Leitura" + botão `+` para admin

**Lista ordenada por `orderIndex`:**

```
  ── LENDO AGORA ──────────────────────────
  [1] [CAPA] Duna                  ✅ ATIVO
             Frank Herbert
             Prazo: 31 mai 2026
             ██████████░░░░  68% do grupo
  ── PRÓXIMOS ─────────────────────────────
  [2] [CAPA] Fundação
             Isaac Asimov
             Prazo: 31 jul 2026
  [3] [CAPA] Neuromancer
             William Gibson
             Prazo: 30 set 2026
  ── CONCLUÍDOS ───────────────────────────
  [✓] [CAPA] O Senhor dos Anéis
             J.R.R. Tolkien  •  ⭐ 4.5
             Encerrado em: 15 mar 2026
```

**Ações admin em cada livro (swipe ou "···"):**

- "Ativar como leitura atual"
- "Editar prazo"
- "Remover da fila"

**Botão "Adicionar livro" (admin)** → abre modal:

- Campo de busca (Google Books)
- Seleção do livro
- Campo "Prazo de leitura" (DatePicker, obrigatório, data futura)
- Botão "Adicionar à fila"

**API:** `GET /api/book-clubs/{id}/books`, `POST /books`, `PATCH /books/{id}`, `POST /books/{id}/current`, `DELETE /books/{id}`

---

### 2.5 Tela — Progresso Detalhado (`/clube/:id/livros/:bookId/progresso`)

**Propósito:** Ver o progresso de todos os membros no livro atual.

**Header:** Nome do livro + "X/Y finalizaram"

**Meu progresso (card destacado):**

```
┌──────────────────────────────────────┐
│  Seu progresso                       │
│  Página 280 de 412                   │
│  ███████████░░░░░  68%               │
│  Status: Lendo  •  Desde: 01 abr     │
│                                      │
│  [Atualizar progresso]               │
└──────────────────────────────────────┘
```

**Progresso dos membros (lista):**

```
Avatar  NomeDoMembro          ████████░  80%   Lendo
Avatar  OutroMembro           ██████████ 100%  ✅ Terminou
Avatar  TerceiroMembro        ████░░░░░  40%   Lendo
Avatar  QuartoMembro          ——————————  —%   ❌ Não finalizou
```

- Badges de status coloridos: verde (FINISHED), azul (READING), vermelho (UNFINISHED)

**Barra de resumo do grupo:**

- Média geral: "68% concluído em média"
- Prazo com countdown: "Faltam 42 dias"

**API:** `GET /api/book-clubs/{id}/books/{bookId}/progress`

---

### 2.6 Modal/Tela — Atualizar Progresso

**Propósito:** Membro informa página atual.

**Conteúdo:**

```
┌──────────────────────────────────────┐
│  Duna — Frank Herbert                │
│  Total: 412 páginas                  │
│                                      │
│  Página atual                        │
│  ┌────────────────────────────────┐  │
│  │         280                   │  │
│  └────────────────────────────────┘  │
│  Stepper:  [−]  280  [+]            │
│                                      │
│  ░░░░░░░░░░░░░░░░░░░░  68%          │
│                                      │
│  [Salvar progresso]                  │
└──────────────────────────────────────┘
```

- Se page == totalPages: mostra celebração "🎉 Você terminou o livro!"
- Validação inline: não pode exceder total de páginas

**API:** `PATCH /api/book-clubs/{id}/books/{bookId}/progress/me`

---

### 2.7 Tela — Reviews de um Livro (`/clube/:id/livros/:bookId/reviews`)

**Propósito:** Ver e escrever reviews de um livro encerrado.

**Header:** Nome do livro + estrelas médias `⭐ 4.5 (4 reviews)`

**Meu review (card no topo, se já escreveu):**

```
┌──────────────────────────────────────┐
│  Seu review               ✏️ Editar  │
│  ⭐⭐⭐⭐⭐                           │
│  "Duna é uma obra-prima..."          │
└──────────────────────────────────────┘
```

**Se não escreveu ainda:** botão "Escrever review"

**Lista de reviews:**

```
Avatar  Gabriel  ⭐⭐⭐⭐⭐   há 2 dias
"Duna é uma obra-prima da ficção científica..."

Avatar  João     ⭐⭐⭐⭐    há 1 dia
"Excelente livro, mas exige paciência..."

Avatar  Maria    ⭐⭐⭐⭐⭐   há 3 h
"Simplesmente perfeito..."
```

- Admin vê ícone 🗑️ em todos os reviews
- Dono vê ✏️ no seu próprio

**Modal "Escrever/Editar Review":**

```
┌──────────────────────────────────────┐
│  Sua avaliação                       │
│  ★ ★ ★ ★ ★  (clicável)             │
│                                      │
│  Sua opinião                         │
│  ┌────────────────────────────────┐  │
│  │ Escreva aqui... (max 2000)    │  │
│  │                               │  │
│  └────────────────────────────────┘  │
│                                      │
│  [Cancelar]         [Publicar]       │
└──────────────────────────────────────┘
```

- Rating obrigatório (1–5 estrelas)
- Texto obrigatório

**API:** `GET /reviews`, `POST /reviews`, `PATCH /reviews/{id}`, `DELETE /reviews/{id}`

---

### 2.8 Tela — Convites (`/convites`)

**Propósito:** Ver convites pendentes recebidos.

**Header:** "Convites" + badge com contagem de pendentes

**Lista de convites recebidos:**

```
┌──────────────────────────────────────┐
│  📖 Clube dos Leitores Clássicos     │
│  Convidado por: Gabriel Batista      │
│  Expira em: 5 dias                   │
│                                      │
│  [Recusar]          [Aceitar]        │
└──────────────────────────────────────┘
```

- Aceitar → animação de sucesso + navega para o clube
- Badge vermelho no tab se há convites pendentes
- Convite expirado (expiresAt < hoje): mostrado como "Expirado" sem botões

**API:** os endpoints de convite não têm `GET` — o ideal é implementar `GET /api/club-invites/me/pending` no futuro. Por enquanto, o app pode ser notificado via push ou polling.

---

### 2.9 Tela — Membros do Clube (`/clube/:id/membros`)

**Propósito:** Listar todos os membros com roles e status.

**Header:** "Membros (X/Y)"

**Lista de membros:**

```
Avatar  Gabriel Batista    👑 Admin   • Ativo
Avatar  João Silva         Membro     • Ativo
Avatar  Maria Souza        Membro     • Ativo
Avatar  Ana Costa          Membro     • Ativo
```

**Ações admin (swipe ou "···" em cada membro):**

- "Promover a Admin" (se MEMBER)
- "Rebaixar a Membro" (se ADMIN)
- "Suspender" / "Banir"
- "Remover do clube"

**Botão "Convidar membro" (admin, bottom):**

- Busca por username/email
- Confirma envio do convite

**API:** `GET /api/members/club/{clubId}`, `PATCH /api/members/{id}`, `DELETE /api/members/{id}`

---

### 2.10 Tela — Criar Clube

**Propósito:** Formulário de criação de clube.

```
┌──────────────────────────────────────┐
│  Nome do clube *                     │
│  ┌────────────────────────────────┐  │
│  │ Ex: Leitores de Ficção        │  │
│  └────────────────────────────────┘  │
│  3–100 caracteres                    │
│                                      │
│  Descrição *                         │
│  ┌────────────────────────────────┐  │
│  │ Descreva o propósito...       │  │
│  │                               │  │
│  └────────────────────────────────┘  │
│  10–1000 caracteres                  │
│                                      │
│  Máximo de membros *                 │
│  ┌──────────┐  (mínimo: 3)          │
│  │    8     │                        │
│  └──────────┘                        │
│                                      │
│  [Criar Clube]                       │
└──────────────────────────────────────┘
```

---

### 2.11 Fluxos de Navegação Mobile

```
Tab: Meus Clubes
  └── Lista de Clubes
        └── [tap card] → Dashboard do Clube
              ├── [Fila de Livros]
              │     ├── [tap livro ativo] → Progresso Detalhado
              │     │     └── [Atualizar progresso] → Modal Update
              │     ├── [tap livro concluído] → Reviews
              │     └── [+ Adicionar] → Modal Adicionar Livro (admin)
              ├── [Ver progresso] → Progresso Detalhado
              ├── [Membros] → Tela Membros
              │     └── [Convidar] → Modal Convidar
              └── [Avançar livro] → Confirmar Modal (admin)

Tab: Convites
  └── Lista de convites pendentes
        ├── [Aceitar] → Dashboard do Clube
        └── [Recusar] → remove da lista

Floating [+] em Meus Clubes
  └── Tela Criar Clube
        └── [Criar] → Dashboard do novo clube
```

---

### 2.12 Estados Especiais da Interface

| Estado | Exibição |
|---|---|
| Clube sem livro ativo | Banner "Nenhum livro em leitura. Admin pode adicionar e ativar um livro." |
| Livro com prazo vencido | Badge vermelho "Prazo vencido" + ícone de alerta no progress |
| Todos FINISHED | Banner "🎉 Todos terminaram! Aguardando admin iniciar próximo livro." |
| Membro UNFINISHED | Ícone ❌ na lista de progresso + tooltip "Não finalizou a leitura" |
| Livro não revisável | Botão "Review" desabilitado com tooltip "Livro ainda em leitura" |
| Clube cheio | Botão "Convidar" desabilitado + tooltip "Clube atingiu capacidade máxima" |
| Convite expirado | Card acinzentado + label "Expirado" sem botões de ação |

---

### 2.13 Permissões por Tela

| Tela / Ação | Membro | Admin |
|---|---|---|
| Ver dashboard | ✅ | ✅ |
| Ver fila de livros | ✅ | ✅ |
| Adicionar livro à fila | ❌ | ✅ |
| Ativar livro | ❌ | ✅ |
| Avançar para próximo | ❌ | ✅ |
| Editar prazo | ❌ | ✅ |
| Atualizar meu progresso | ✅ | ✅ |
| Ver progresso de todos | ✅ | ✅ |
| Criar review | ✅ (livro encerrado) | ✅ |
| Editar/deletar review próprio | ✅ | ✅ |
| Deletar review de outro | ❌ | ✅ |
| Convidar membros | ❌ | ✅ |
| Aceitar/rejeitar convite | ✅ (próprio) | ✅ (próprio) |
| Revogar convite | ❌ | ✅ |
| Gerenciar membros (role/status) | ❌ | ✅ |
| Remover outro membro | ❌ | ✅ |
| Sair do clube (remover self) | ✅ | ✅ |
| Editar clube | ❌ | ✅ |
| Deletar clube | ❌ | ✅ |
