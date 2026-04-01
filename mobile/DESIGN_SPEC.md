# MyLibrary — Mobile Design Specification

> Documento de referência para prototipagem de telas. Contém descrição completa de todas as telas, componentes, paleta de cores, tipografia, padrões de animação e fluxo de navegação do aplicativo mobile.

---

## 1. Visão Geral do Produto

**MyLibrary** é um ecossistema gamificado de leitura pessoal. O usuário registra livros, cronometra sessões de leitura, acompanha metas anuais, conquista badges e monitora estatísticas aprofundadas sobre seus hábitos de leitura.

**Stack**: React Native + Expo 54, TypeScript, Expo Router (file-based routing), React Native Reanimated 4, Jotai (estado global), React Query (cache/fetching), Feather Icons.

**Estrutura de rotas**:

```
/app
├── (auth)/
│   └── login.tsx          → Tela de autenticação
└── (tabs)/
│   ├── index.tsx           → Home (Dashboard)
│   ├── search.tsx          → Busca (em desenvolvimento)
│   ├── session.tsx         → Sessão de Leitura
│   ├── achievements.tsx    → Conquistas
│   └── profile.tsx         → Perfil
└── session-history.tsx     → Histórico completo de sessões
```

---

## 2. Paleta de Cores

O app suporta **Modo Claro** e **Modo Escuro**. Toda a UI é construída sobre as variáveis abaixo. Nunca usar valores hardcoded de cor além dos listados.

### 2.1 Modo Claro

| Token                | Valor Hex   | Uso Principal                                      |
|----------------------|-------------|----------------------------------------------------|
| `background`         | `#F8F9FA`   | Fundo geral das telas                              |
| `surface`            | `#FFFFFF`   | Cards, modais, inputs                              |
| `text`               | `#1E293B`   | Texto primário                                     |
| `textSecondary`      | `#64748B`   | Subtítulos, labels, placeholders                   |
| `primary`            | `#8B5CF6`   | Botões primários, destaques, progresso              |
| `border`             | `#E2E8F0`   | Bordas de cards e inputs                           |
| `tabBar`             | `#FFFFFF`   | Fundo da barra de navegação                        |
| `tabBarInactive`     | `#94A3B8`   | Ícones de tab inativos                             |
| `error`              | `#EF4444`   | Estados de erro, botão de revogar                  |
| `success`            | `#10B981`   | Confirmações, botão de salvar sessão               |

### 2.2 Modo Escuro

| Token                | Valor Hex   | Uso Principal                                      |
|----------------------|-------------|----------------------------------------------------|
| `background`         | `#0F172A`   | Fundo geral das telas (azul-marinho profundo)       |
| `surface`            | `#1E293B`   | Cards, modais, inputs                              |
| `text`               | `#F8FAFC`   | Texto primário (quase branco)                      |
| `textSecondary`      | `#94A3B8`   | Subtítulos, labels                                 |
| `primary`            | `#A78BFA`   | Roxo mais claro para contraste no escuro            |
| `border`             | `#334155`   | Bordas de cards e inputs                           |
| `tabBar`             | `#1E293B`   | Fundo da barra de navegação                        |
| `tabBarInactive`     | `#64748B`   | Ícones de tab inativos                             |
| `error`              | `#F87171`   | Erros, ações destrutivas                           |
| `success`            | `#34D399`   | Confirmações, salvo com sucesso                    |

### 2.3 Cores de Acento (ambos os modos)

| Token              | Valor Hex   | Uso                                                |
|--------------------|-------------|----------------------------------------------------|
| Streak / Fogo      | `#F59E0B`   | Emblema de sequência diária (streak)               |
| Achievement / Pink | `#EC4899`   | Seção de conquistas                                |
| Cyan               | `#06B6D4`   | Arquétipo "Genre Explorer"                         |
| Indigo             | `#6366F1`   | Arquétipo "Night Owl"                              |

### 2.4 Cores de Arquétipos de Leitor

| Arquétipo        | Hex         | Descrição                              |
|------------------|-------------|----------------------------------------|
| Night Owl        | `#6366F1`   | Leitor noturno                         |
| Genre Explorer   | `#06B6D4`   | Variedade de gêneros                   |
| Speed Reader     | `#F59E0B`   | Alta velocidade de leitura             |
| Deep Diver       | `#EC4899`   | Sessões longas e imersivas             |
| Casual Reader    | `#10B981`   | Ritmo tranquilo e constante            |

---

## 3. Tipografia

O app não usa uma fonte customizada — utiliza a fonte do sistema (`System font`).

| Uso                              | Size | Weight | Notas                                       |
|----------------------------------|------|--------|---------------------------------------------|
| Título de tela                   | 28px | 700    | `letterSpacing: -0.5`                       |
| Título de seção                  | 20px | 800    | —                                           |
| Subtítulo / label de card        | 17px | 800    | —                                           |
| Corpo / conteúdo                 | 15px | 600    | —                                           |
| Texto secundário / labels        | 13px | 500    | —                                           |
| Micro / uppercase label          | 12px | 700    | `textTransform: uppercase`, `letterSpacing: 0.8` |
| Caption / data                   | 11px | 600    | `letterSpacing: 0.6`                        |

---

## 4. Padrões de UI

### 4.1 Cards

- `borderRadius: 16–20px`
- `backgroundColor: colors.surface`
- `borderWidth: 1`, `borderColor: colors.border`
- `padding: 16–20px`
- Sombra leve: `shadowOpacity: 0.05`, `shadowRadius: 12`, `elevation: 2`

### 4.2 Botões Primários

- `height: 52–56px`
- `borderRadius: 14px`
- `backgroundColor: colors.primary`
- Texto: `fontSize: 15–16px`, `fontWeight: 700`, `color: #FFFFFF`
- Sombra colorida: `shadowColor: colors.primary`, `shadowOpacity: 0.3`

### 4.3 Botões Circulares (controles de timer)

- Play/Pause: `72×72px`, `borderRadius: 36`, `backgroundColor: primary` ou `text`
- Auxiliares (Discard/Save): `56×56px`, `borderRadius: 28`

### 4.4 Tags / Pills

- `paddingHorizontal: 8–10px`, `paddingVertical: 2–4px`
- `borderRadius: 6–10px`
- `backgroundColor: colors.primary + "18"` (18% de opacidade)
- Texto: `fontSize: 11–12px`, `fontWeight: 700`, `color: colors.primary`

### 4.5 Inputs de Formulário

- `height: 52px`
- `borderRadius: 14px`
- `borderWidth: 1.5`, `borderColor: colors.border`
- `backgroundColor: colors.surface`
- `paddingHorizontal: 16px`
- `fontSize: 15px`, `fontWeight: 500`

### 4.6 Modais (Bottom Sheet)

**Padrão customizado com animação via `RNAnimated` (não Modal nativo):**

- O backdrop (`rgba(0,0,0,0.5)`) faz **fade in/out** com `opacity`
- A sheet faz **slide up/down** com `transform: translateY`
- Ambas as animações rodam em **paralelo** (`RNAnimated.parallel`)
- A sheet usa `RNAnimated.spring` (damping: 22, stiffness: 200) para subir
- Para descer usa `RNAnimated.timing` (duration: 220ms)
- Handle visual: `40×5px`, `borderRadius: 2.5`, `backgroundColor: colors.border`, centralizado no topo da sheet
- Sheet: `borderTopLeftRadius: 32`, `borderTopRightRadius: 32`
- Sombra: `shadowOffset: { width: 0, height: -10 }`, `shadowOpacity: 0.3`, `shadowRadius: 20`, `elevation: 24`

### 4.7 Animações de Entrada (Reanimated)

- Maioria dos elementos entra com `FadeIn.duration(400)`
- Listas usam `FadeInDown.delay(index * 60)` para efeito cascata
- Seções secundárias: `FadeInDown.duration(400).delay(50–100)`

### 4.8 Estados de Skeleton Loading

- Retângulos com `backgroundColor: colors.surface` (ou `colors.border + "40"`), `opacity: 0.5`
- Bordas arredondadas correspondendo ao componente real
- Sem animação de shimmer (simples)

---

## 5. Barra de Navegação (Tab Bar)

- 5 tabs: **Home**, **Search**, **Session**, **Achievements**, **Profile**
- Fundo: `colors.tabBar`
- Ícone ativo: `colors.primary` (roxo)
- Ícone inativo: `colors.tabBarInactive`
- Nenhum label de texto visível — só ícones
- Tab de **Session** pode ter destaque especial (tab central)
- Interação gera haptic feedback leve

| Tab          | Ícone Feather   |
|--------------|-----------------|
| Home         | `home`          |
| Search       | `search`        |
| Session      | `clock`         |
| Achievements | `award`         |
| Profile      | `user`          |

---

## 6. Telas

---

### 6.1 Tela de Login / Cadastro (`/login`)

**Propósito**: Porta de entrada do app. Autentica usuários existentes ou cria nova conta.

**Layout geral**:
- Fundo com 2–3 orbs decorativos circulares semitransparentes (`primary + "20"`) espalhados no fundo
- Conteúdo em `ScrollView` com `KeyboardAvoidingView`
- Cabeçalho com logo/ícone e título "MyLibrary" + subtítulo

**Toggle Tabs (Sign In / Create Account)**:
- Dois botões lado a lado em container com `borderRadius: 12`
- Tab ativa: `backgroundColor: colors.primary`, texto branco
- Tab inativa: fundo transparente, texto `colors.textSecondary`

**Formulário de Login (Sign In)**:
- Campo: E-mail (`AuthInput` com ícone `mail`)
- Campo: Senha (`AuthInput` com ícone `lock`, toggle de visibilidade)
- Botão primário "Sign In" (full width, altura 56px)
- Animação de entrada: `FadeInDown` com delay escalonado por campo

**Formulário de Cadastro (Create Account)**:
- Campo: Nome completo (`AuthInput`, ícone `user`)
- Campo: Username (`AuthInput`, ícone `at-sign`, `autoCapitalize: none`)
- Campo: E-mail (`AuthInput`, ícone `mail`)
- Campo: Senha (`AuthInput`, ícone `lock`, toggle de visibilidade)
- **Medidor de força da senha**: Barra de progresso colorida abaixo do campo de senha
  - Weak: `#EF4444` (vermelho)
  - Fair: `#F59E0B` (âmbar)
  - Good: `#3B82F6` (azul)
  - Strong: `#10B981` (verde)
  - Label de texto ao lado direito indicando o nível
- Campo: Data de Nascimento — botão estilizado como input que abre um DateTimePicker nativo
- Botão primário "Create Account" (full width, altura 56px)

**Estados de erro**:
- Texto em `colors.error` abaixo do botão de submit

---

### 6.2 Home / Dashboard (`/`)

**Propósito**: Visão geral do progresso de leitura. Combina métricas rápidas, livros em andamento, streak, meta e conquistas.

**Estrutura de layout (de cima para baixo)**:

#### Header
- Texto pequeno: "Good [morning/afternoon/evening], [nome]" — `colors.textSecondary`, `fontSize: 14`
- Título grande: "@username" — `fontSize: 28`, `fontWeight: 800`, `letterSpacing: -0.5`
- Badge de streak (direita): ícone de fogo 🔥 + número de dias — `backgroundColor: "#F59E0B18"`, texto âmbar

#### Seção "Currently Reading"
- Título de seção: "CURRENTLY READING" (uppercase label) + link "See all" (`colors.primary`)
- Se sem livros: card vazio com ícone `book-open` e texto de encorajamento
- Se com livros: cards horizontais ou verticais com:
  - Cover art (imagem ou placeholder com ícone `book` sobre `primary + "15"`)
  - Título (bold, truncated a 1 linha)
  - Autor (secondary, truncated)
  - Badge de páginas (`X pgs`) + gênero (opcional)
  - Botão "Continue Reading" — cor `primary`

#### Quick Stats
- Grid ou lista de métricas:
  - 📚 Books Read
  - 📄 Pages Read
  - 📅 Reading Days
  - ⭐ Avg Rating
  - 🏷️ Top Genre
- Cada stat: ícone circular (`primary + "14"` de fundo) + label + valor
- Separadores horizontais entre rows

#### Reading Goal (Meta Anual)
- Se sem meta: estado vazio com botão "Set Goal" (`primary`, borderRadius 10)
- Se com meta:
  - Número grande centralizado: "X / Y books" (X em `primary`, / Y em `textSecondary`)
  - Barra de progresso (`primary`, borderRadius 999, altura 8px)
  - Indicador: "On track ✓" (verde) ou "Behind pace" (âmbar)
  - Insight diário: texto em itálico, `textSecondary`

#### Streak Section
- Número enorme centralizado: streak atual em `#F59E0B`
- Label "day streak" abaixo
- Mini stats row: Best Streak | Total Days
- Barra de progresso em direção ao best streak
- Insight: "Keep it up!" ou similar

#### Achievements Row
- Título: "🏆 Achievements" + "X/Y earned" (pill em `primary + "18"`)
- Scroll horizontal de badges:
  - Badge ganho: círculo colorido com emoji, opacidade total
  - Badge em progresso: círculo acinzentado com emoji, opacidade reduzida
  - Nome abaixo do ícone, `fontSize: 11`

---

### 6.3 Sessão de Leitura (`/session`)

**Propósito**: Cronometrar e registrar sessões de leitura com timer ou stopwatch.

**Layout (de cima para baixo)**:

#### Header
- Título: "Reading Session" — `fontSize: 28`, `fontWeight: 700`

#### Mode Toggle
- Container: `borderRadius: 12`, `backgroundColor: colors.surface`, `borderWidth: 1`
- Dois botões: "Stopwatch" | "Timer"
- Tab ativa: `backgroundColor: colors.primary`, texto branco
- Ao trocar de modo enquanto pausado: reseta `elapsed` para 0

#### Book Selector (botão)
- Altura: `56px`, `borderRadius: 14`
- **Sem livro selecionado**: fundo `colors.primary`, texto branco, ícone `plus-circle`
- **Livro selecionado**: fundo `primary + "10"`, borda `primary`, texto e ícone na cor `primary`
- Texto: "Select your book reading" ou título do livro
- Ícone `chevron-right` à direita
- Ao pressionar: abre **Book Selection Modal**

#### Timer Ring (Componente central)
- Círculo SVG com gradiente (linear gradient em roxo/primary)
- Raio grande (~130px)
- Background ring: `primary + "20"`, strokeWidth ~14
- Progress ring: gradiente de `primary` vibrante, animado com `strokeDashoffset`
- **Centro**:
  - Tempo formatado: `MM:SS` ou `H:MM:SS` — `fontSize: 54`, `fontWeight: 800`
  - Subtítulo opcional: "Tap play to start" ou "30 min session" — `fontSize: 14`, `textSecondary`
  - Indicador de ativo: ponto colorido pulsando (quando rodando)

#### Timer Presets (apenas no modo Timer, quando parado em 0)

- Pills: `15m`, `30m`, `45m`, `60m`, `Custom`
- Selecionado: `backgroundColor: primary`, texto branco, borda `primary`
- Não selecionado: `surface`, borda `border`
- "Custom": abre alert/prompt para digitar minutos

#### Controles
- **Play/Pause** (botão central, maior): `72×72px`, circular
  - Parado: `backgroundColor: primary`, ícone `play` branco
  - Rodando: `backgroundColor: colors.text`, ícone `pause` na cor `background`
- **Discard** (aparece quando `elapsed > 0` e pausado): `56×56px`, circular, `surface`, ícone `x`
- **Save** (aparece quando `elapsed ≥ 30s` e pausado): `56×56px`, circular, `success`, ícone `check`

#### Recent Sessions
- Label uppercase: "RECENT SESSIONS" + link "See all" (`primary`)
- Sem sessões: texto de encorajamento
- Lista (até 3): cards com divisor
  - Ícone `book-open` em container `40×40px`, `borderRadius: 12`, `primary + "10"`
  - Título do livro (bold, truncated)
  - Duração em min + páginas lidas
  - Data relativa (Today, Yesterday, 3d ago, etc.) — alinhada à direita

#### Book Selection Modal (Bottom Sheet)

- Fundo com overlay semitransparente (fade)
- Sheet sobe com animação spring
- Handle pill no topo
- Título "Choose a Book" + botão `x` para fechar
- Sem livros: estado vazio com ícone `book` grande e instrução
- Com livros: `FlatList` de cards de livro:
  - Container: `borderRadius: 20`, selecionado borda `primary`, não selecionado borda `border + "40"`
  - Placeholder de capa: `50×70px`, `borderRadius: 10`, `primary + "15"`, ícone `book`
  - Título (`fontSize: 17`, `fontWeight: 800`), autor, badge de páginas + gênero
  - Checkmark circular `primary` quando selecionado

---

### 6.4 Conquistas (`/achievements`)

**Propósito**: Galeria de todos os 16 badges organizados por categoria, com progresso.

**Layout (de cima para baixo)**:

#### Header
- Título: "Achievements" — `fontSize: 28`, `fontWeight: 700`
- Subtítulo: "X / 16 earned" — `primary`, `fontWeight: 600`

#### Progress Summary (opcional pill/card no topo)
- Barra de progresso geral
- Texto: "X of Y achievements unlocked"

#### Grupos por Categoria

Quatro categorias com seção própria:

| Categoria  | Emoji | Descrição                         |
|------------|-------|-----------------------------------|
| VOLUME     | 📚    | Read more books and pages         |
| VELOCITY   | ⚡    | Read faster and more consistently |
| DIVERSITY  | 🌍    | Explore different genres          |
| GOALS      | 🎯    | Hit your reading targets          |

Cada grupo:
- Header da categoria: emoji + nome em `fontWeight: 700` + descrição em `textSecondary`
- Cards de badge abaixo

#### Achievement Card

- Container: `borderRadius: 16`, `surface`, `borderWidth: 1`, `borderColor: border`
- **Earned**: opacidade total, borda com leve tom de `primary + "30"`, badge de "Earned" verde no canto
- **In Progress**: opacidade 0.65, barra de progresso na parte inferior do card
- **Locked**: opacidade ~0.4, ícone de cadeado

Conteúdo do card:
- Emoji grande centralizado (ou em container colorido)
- Nome do badge: `fontWeight: 700`, `fontSize: 15`
- Descrição: `textSecondary`, `fontSize: 13`
- Se em progresso: barra de progresso (`primary`) + label "X/Y" à direita
- Se ganho: data de conquista em `textSecondary`

---

### 6.5 Perfil (`/profile`)

**Propósito**: Informações da conta, gerenciamento de dispositivos conectados e logout.

**Layout (de cima para baixo)**:

#### Avatar / Header
- Container centralizado com padding `paddingTop: 20`
- Anel externo: padding 3px, `borderRadius: 52`, `primary + "28"` (glow ring)
- Avatar: `96×96px`, circular, `backgroundColor: primary`
- Iniciais do usuário no centro: `fontSize: 34`, `fontWeight: 800`, branco
- Sombra colorida no avatar: `shadowColor: primary`, `shadowOpacity: 0.4`
- Nome do usuário abaixo: `fontSize: 22`, `fontWeight: 800`
- @username: `fontSize: 14`, `textSecondary`
- Botão "Edit Profile": `primary + "14"` de fundo, borda `primary + "30"`, ícone `edit-2`, texto `primary`

#### Account Information Card

- Título: "Account Information" — `fontWeight: 800`
- Rows de informação (InfoRow):
  - Ícone em container `36×36px`, `borderRadius: 10`, `primary + "14"`
  - Label uppercase (`fontSize: 11`, `textSecondary`) + Valor (`fontSize: 15`, `fontWeight: 600`)
  - Separador horizontal entre rows
- Campos: Full Name, Username, Email, Birthday, Member Since

#### Connected Devices
- Título: "📱 Connected Devices" + pill com contagem (`primary + "18"`)
- Skeleton loader durante carregamento
- DeviceCard para cada dispositivo:
  - Container: `borderRadius: 16`, `surface`, borda especial se dispositivo atual
  - Ícone `smartphone` ou `monitor` em container `44×44px`
  - **Dispositivo atual**: borda `primary + "40"`, fundo ícone `primary + "18"`, badge "This device" verde
  - Nome do dispositivo (bold) + ID truncado (primeiros 8 chars + "…")
  - Botão de revogar (`36×36px`, `borderRadius: 10`, `#F43F5E15`, ícone `x` vermelho) — apenas em outros dispositivos
- Estado vazio: card estilizado com texto centralizado

#### Sign Out Button (`LogoutButton`)
- Botão full-width, `borderRadius: 14`, fundo `error + "12"`
- Texto "Sign Out" em `colors.error`, `fontWeight: 700`
- Ícone `log-out` à esquerda
- Loading state com spinner

#### Edit Profile Modal (Bottom Sheet)
- Mesmo padrão de animação dos outros modais (fade + slide spring)
- Handle pill no topo
- Título "Edit Profile" + botão `x`
- Campo: Full Name (TextInput estilizado)
- Campo: Username (TextInput estilizado, `autoCapitalize: none`)
- Info box readonly: "Email and password can only be changed via settings" com ícone `lock`
- Botão "Save Changes" (primário, full width)
- Loading state com spinner dentro do botão

---

### 6.6 Histórico de Sessões (`/session-history`)

**Propósito**: Lista paginada e completa de todas as sessões de leitura registradas.

**Layout**:

#### Header
- Botão de voltar (ícone `arrow-left`)
- Título: "Session History" — `fontSize: 24`, `fontWeight: 800`

#### FlatList com Infinite Scroll
- Sessões carregadas em páginas de 15 itens
- `onEndReached` dispara carregamento da próxima página
- Pull-to-refresh para recarregar desde o início
- Loading indicator de próxima página (spinner centralizado)

#### Session Card

- Ícone `book-open` em container `40×40px`, `borderRadius: 12`, `primary + "10"`
- Título do livro: `fontWeight: 600`, `fontSize: 15`, 1 linha truncada
- Duração em minutos (`Math.ceil(durationSeconds / 60)`) + páginas lidas
- Data relativa à direita: Today, Yesterday, Xd ago, ou data formatada (Mar 5)

#### Estado Vazio
- Ícone `book-open` grande, cor `border`
- Texto: "No sessions yet. Start your first reading session!"
- Centralizado verticalmente

---

### 6.7 Busca (`/search`)

**Status atual**: Tela placeholder "Coming Soon".

**Layout**:
- Ícone `search` grande
- Título: "Search"
- Subtítulo: "Coming soon..."
- Todo centralizado, cores `textSecondary`

---

## 7. Componentes Reutilizáveis

### 7.1 `AuthInput`

**Arquivo**: `src/components/AuthInput.tsx`

Input de formulário customizado para telas de autenticação.

| Prop           | Tipo                          | Descrição                            |
|----------------|-------------------------------|--------------------------------------|
| `icon`         | `Feather icon name`           | Ícone à esquerda                     |
| `placeholder`  | `string`                      | Placeholder do campo                 |
| `secureText`   | `boolean`                     | Mostra toggle de visibilidade        |
| `error`        | `boolean`                     | Ativa borda vermelha animada         |
| `...TextInput` | `TextInputProps`              | Todas as props nativas               |

**Visual**:
- Altura: `52px`, `borderRadius: 14`
- Ícone Feather à esquerda em container
- Borda animada: neutra → `primary` no foco, → `error` com erro
- Toggle de olho (`eye` / `eye-off`) à direita quando `secureText`

---

### 7.2 `TimerRing`

**Arquivo**: `src/components/session/TimerRing.tsx`

Círculo de progresso SVG animado.

| Prop          | Tipo      | Descrição                                      |
|---------------|-----------|------------------------------------------------|
| `progress`    | `number`  | 0.0 a 1.0 — preenchimento do anel              |
| `timeDisplay` | `string`  | Texto central (ex: "23:45")                    |
| `subtitle`    | `string?` | Texto abaixo do tempo                          |
| `isActive`    | `boolean` | Exibe ponto indicador pulsando quando `true`   |

**Visual**:
- Dois círculos SVG: background (opaco fraco) + progresso (gradient)
- Animação suave via `useSharedValue` + `withTiming` (easing cubic)
- Tempo em `fontSize: 54`, `fontWeight: 800`, `letterSpacing: -2`
- Gradiente do anel: `#8B5CF6` → `#A78BFA` (ou equivalente `primary`)

---

### 7.3 `LogoutButton`

**Arquivo**: `src/components/profile/LogoutButton.tsx`

Botão de logout com loading state.

**Visual**:
- Full width, `height: 52px`, `borderRadius: 14`
- `backgroundColor: error + "12"` (levemente avermelhado)
- Ícone `log-out` + texto "Sign Out" em `colors.error`
- Spinner branco durante loading
- Ao pressionar: chama logout service → limpa Jotai atoms → redireciona para `/login`

---

### 7.4 Componentes de Home

Todos usam o padrão de props recebendo dados do React Query da tela pai:

- **`CurrentlyReading`**: Recebe `books: BookDTO[]`. Renderiza cards de livro.
- **`QuickStats`**: Recebe `dna: ReadingDnaDTO`. Renderiza grid de métricas.
- **`GoalSection`**: Recebe `goalProgress: ReadingGoalProgressDTO | null`. Renderiza meta ou estado vazio.
- **`StreakSection`**: Recebe `streak: StreakDTO | null`. Renderiza streak ou estado vazio.
- **`AchievementsRow`**: Recebe `achievements: AchievementDTO[]`. Renderiza scroll horizontal de badges.

---

## 8. Modelos de Dados (para contexto nos protótipos)

### BookDTO

```
id, title, author, rating (0-5), pages, isbn, genre,
status (TO_READ | READING | COMPLETED | DROPPED),
coverUrl, startDate, finishDate, notes
```

### UserDTO

```
id, name, username, email, birthDate (yyyy-MM-dd), createdAt
```

### StreakDTO

```
currentStreak (days), bestStreak (days),
totalReadingDays, lastReadingDate, insight (string)
```

### AchievementDTO

```
code, name, description, category (VOLUME|VELOCITY|DIVERSITY|GOALS),
earned (bool), earnedAt, progress (0.0–1.0), progressLabel
```

### ReadingSessionDTO

```
id, pagesRead, durationSeconds, bookId, bookTitle,
bookCoverUrl, createdAt
```

### ReadingGoalProgressDTO

```
goal { targetBooks, year }, booksRead, pagesRead,
dailyPaceRequired, currentPace, projectedFinishDate,
onTrack (bool), currentStreak, bestStreak, streakInsight,
uniqueAuthors, uniqueGenres, topGenre, dailyInsight
```

### ReadingDnaDTO

```
totalBooksLifetime, totalPagesLifetime, avgRating,
completionRate, avgVelocityPagesPerHour, peakReadingHour,
avgSessionDurationMin, avgPagesPerSession,
genreBreakdown [{ genre, percentage }],
topAuthor, uniqueAuthorsRead, dropRate, readerArchetype
```

---

## 9. Fluxo de Navegação

```
App Launch
  │
  ├── [Sem token] → /login
  │     ├── Sign In → valida credenciais → redireciona para /(tabs)
  │     └── Create Account → cria conta → redireciona para /(tabs)
  │
  └── [Com token válido] → /(tabs)/index (Home)
        │
        ├── Tab: Home → Dashboard completo
        ├── Tab: Search → Placeholder
        ├── Tab: Session → Timer/Stopwatch
        │     └── [Pressiona "See all"] → /session-history (push)
        ├── Tab: Achievements → Galeria de badges
        └── Tab: Profile → Conta e dispositivos
              └── [Pressiona "Edit Profile"] → Modal de edição (bottom sheet)
```

---

## 10. Padrões de Interação

| Ação                        | Feedback                                                         |
|-----------------------------|------------------------------------------------------------------|
| Pressionar tab              | Haptic feedback leve                                             |
| Abrir modal                 | Overlay fade + sheet slide-up (spring)                           |
| Fechar modal                | Sheet slide-down + overlay fade out                              |
| Pull-to-refresh             | `RefreshControl` com `tintColor: primary`                        |
| Pressionar card             | `activeOpacity: 0.8` ou `pressed ? opacity: 0.8`                |
| Scroll de lista             | `showsVerticalScrollIndicator: false`                            |
| Fim de lista infinita       | Spinner centralizado como footer                                 |
| Ação destrutiva (revoke)    | `Alert.alert` de confirmação antes de executar                   |
| Salvar sessão               | `Alert.prompt` para coletar páginas lidas                        |
| Timer completo              | `Alert.alert` "Time's Up!" com opção de salvar                  |

---

## 11. Considerações de Acessibilidade e Responsividade

- Todos os elementos respeitam `useSafeAreaInsets()` para notch/barra de navegação
- `paddingTop: insets.top + 10` aplicado em ScrollViews
- `paddingBottom: insets.bottom + 20` aplicado em modais
- Largura não é fixa — usa `flex: 1` e `paddingHorizontal: 20` como padrão
- Cards e botões têm `minHeight` definidos para garantir áreas de toque adequadas (min 44px)

---

*Documento gerado automaticamente a partir do código-fonte do MyLibrary Mobile App.*
