# TEAM_SYNC

Coordination document between Engineering and UI/UX for the MyLibrary mobile app.

---

# UI/UX Updates

## Home Screen Redesign — 2026-03-29

### Problem Statement

The previous Home screen suffered from several anti-patterns common to AI-generated dashboards:

1. **Carditis** — Six individual stat cards (StatsGrid) each wrapped in bordered, shadowed boxes with colored icons. The visual weight was overwhelming and every metric competed equally for attention.
2. **Rainbow icon syndrome** — Each card used a different accent color (cyan, streak-orange, emerald, pink, violet). No visual hierarchy; the eye had nowhere to rest.
3. **Empty-state shame** — New users were greeted with a grid of "0" values (0 books, 0 pages, 0 streak, 0 days). This is demotivating, not informational.
4. **Wrong hero element** — The first thing users saw was statistics *about* reading, not reading itself. The book — the core object — was nowhere on screen.

### Design Decisions

#### 1. Currently Reading as the Hero

**What:** Replaced the StatsGrid with a `CurrentlyReading` component at the top of the scroll. It shows book cover, title, author, and a primary "Continue Reading" CTA.

**Why:** The user opens this app to *read*. The Home screen should immediately answer "what am I reading?" and give a one-tap path to resume. This follows the Apple HIG principle of "put the most important content first" and aligns with how Kindle, Audible, and Literal handle their home screens.

**Empty state:** Instead of showing nothing, we show an encouraging message ("Nothing on your nightstand") with an "Add a Book" button. The tone is warm, not clinical.

#### 2. Curing Carditis with QuickStats

**What:** Replaced 6 individual stat cards with a single horizontal row of 3 key metrics (Books, Pages, Streak) separated by 1px dividers. No background boxes, no colored icons.

**Why:** The user doesn't need 6 stats at the top of their home screen. Three numbers — separated by whitespace and thin dividers, centered with clean typography — communicate the same information with 1/10th the visual noise. This follows the Material Design 3 principle of "less is more" and mirrors how Apple Health and Strava show summary stats.

#### 3. Single Accent Color System

**What:** Removed all per-section accent colors (streak orange, cyan, emerald, pink). Everything now uses the indigo primary (`#6366F1` light / `#818CF8` dark) for active elements — buttons, progress bars, active icons. All secondary text and icons use the gray scale (`textSecondary`, `border`).

**Why:** Multiple accent colors create a "Christmas tree" effect that signals template/prototype, not polished product. A single accent creates brand identity and makes interactive elements instantly recognizable. Apple, Linear, Notion, and every premium app uses this pattern.

#### 4. Smart Empty States

**What:** Every section now has a human-friendly empty state with:
- A short, encouraging headline (not "No data found")
- Explanatory subtext
- An actionable button (not just informational text)

**Why:** Empty states are the first thing new users see. They should onboard, not depress. "Set your 2026 reading goal" with a button is infinitely better than a dashed box saying "No Reading Goal for 2026".

#### 5. Typography Hierarchy

**What:**
- Section labels: 13px, uppercase, letter-spaced, `textSecondary` — they're *labels*, not headlines
- Primary numbers: 32px, weight 700 — the eye goes here first
- Supporting text: 13-15px, weight 400-500, `textSecondary` — provides context without competing
- Removed weight 800 from everything. Only key numbers use 700.

**Why:** When everything is bold, nothing is. The old screen used `fontWeight: "800"` on labels, section titles, stat numbers, and even secondary text. The new hierarchy uses contrast in size (32 vs 13) and weight (700 vs 400) to create a clear reading path: number → label → context.

#### 6. Streak Section Simplification

**What:** Removed the large orange-bordered card with glowing shadow. Replaced with flat typography: the streak number in 32px, "days in a row" as plain text, and secondary stats (best streak, total days) below as small inline items with gray icons.

**Why:** The old StreakCard used a colored border, colored shadow, a 64px badge container, and an emoji. It drew more attention than the "Currently Reading" section. Streak is important but it's supporting data, not the hero.

#### 7. Achievements Row

**What:** Simplified badges to 48x48 rounded squares with a subtle primary-tinted background for earned badges. Unearned badges use `?` instead of category emojis to create mystery/anticipation. Removed colored shadows per category.

**Why:** The old badges used category-specific colors (4 different accent colors), elevation shadows, and complex styling. The new design uses the single primary color for earned badges and muted gray for unearned, maintaining the gamification feeling without the visual chaos.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/components/home/CurrentlyReading.tsx` | Created | Hero component — book cover, info, CTA |
| `src/components/home/QuickStats.tsx` | Created | Clean 3-stat row with dividers |
| `src/components/home/GoalSection.tsx` | Created | Minimal goal progress + smart empty state |
| `src/components/home/StreakSection.tsx` | Created | Flat streak display, no heavy card |
| `src/components/home/AchievementsRow.tsx` | Created | Simplified horizontal badge scroll |
| `src/types/book.ts` | Created | BookDTO type with status enum |
| `src/services/bookService.ts` | Created | API call for currently-reading books |
| `app/(tabs)/index.tsx` | Rewritten | New Home screen composing all new components |

### What Was NOT Changed

- **Profile screen components** (`src/components/profile/*`) — these are used by the Profile tab and were intentionally left untouched. The Home screen now has its own component set under `src/components/home/`.
- **Theme colors** (`src/theme/colors.ts`) — the shared gamification accents (streak, achievement, cyan) are still defined for use in Profile or other screens. The Home screen simply doesn't use them.
- **API/services** — the profileService calls remain unchanged; bookService was added.

---

## Iteration 2: Stats, Achievements Tab, Alignment Fixes — 2026-03-29

### Changes Made

#### 1. Streak Fire Pill in Header

Added a compact pill next to the greeting (top-right) showing the streak count with a fire emoji on an indigo-tinted background. This gives the streak constant visibility without a dedicated card taking up real estate.

#### 2. Stats Brought Back as List Rows

Replaced the centered 3-stat divider layout with a vertical list of key-value rows: Books read, Pages read, Reading days, Avg rating, Top genre. Each row has a left-aligned icon + label and a right-aligned value. This pattern is familiar from iOS Settings / Apple Health and doesn't read as "dashboard template".

#### 3. Achievements Tab ("Conquistas")

Created a dedicated tab (`app/(tabs)/achievements.tsx`) with:
- Overall progress bar and earned count at the top
- Achievements grouped by category (Volume, Velocity, Diversity, Goals)
- Each achievement as a horizontal row: icon, name, description, and progress bar for unearned
- All 16 badges visible, no truncation

#### 4. AchievementsRow Fix — Show All 16

Removed the `.slice(0, 5)` on unearned achievements in the home screen horizontal scroll. All badges now appear.

#### 5. Text Alignment Fix

Removed `alignItems: "center"` and `textAlign: "center"` from empty states across CurrentlyReading, GoalSection, and StreakSection. Empty states now use left-aligned horizontal layouts (icon + text side by side) which feel more native and less like a placeholder template.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `app/(tabs)/achievements.tsx` | Created | Full achievements screen grouped by category |
| `app/(tabs)/_layout.tsx` | Modified | Added "Conquistas" tab with star icon |
| `app/(tabs)/index.tsx` | Modified | Added streak pill to header |
| `src/components/home/QuickStats.tsx` | Rewritten | Vertical list rows instead of centered divider layout |
| `src/components/home/CurrentlyReading.tsx` | Modified | Left-aligned empty state |
| `src/components/home/GoalSection.tsx` | Modified | Left-aligned empty state with inline Set button |
| `src/components/home/StreakSection.tsx` | Modified | Left-aligned empty state |
| `src/components/home/AchievementsRow.tsx` | Modified | Removed .slice(0,5), shows all badges |
