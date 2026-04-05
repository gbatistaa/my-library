// ─── GET /streak ──────────────────────────────────────────────────────────────

export interface StreakDTO {
  currentStreak: number;
  bestStreak: number;
  totalReadingDays: number;
  lastReadingDate: string | null; // LocalDate YYYY-MM-DD
  insight: string;
}

// ─── GET /achievements, /achievements/recent ─────────────────────────────────

export interface AchievementDTO {
  code: string;
  name: string;
  description: string;
  category: string; // VOLUME | VELOCITY | DIVERSITY | GOALS
  earned: boolean;
  earnedAt: string | null; // LocalDate
  progress: number | null; // 0.0–1.0
  progressLabel: string;
}

// ─── GET /stats/dna ──────────────────────────────────────────────────────────

export interface GenreShareDTO {
  genre: string;
  share: number; // 0.0–1.0
  count: number;
}

export interface ReadingDnaDTO {
  totalBooksLifetime: number;
  totalPagesLifetime: number;
  avgRating: number;
  completionRate: number;
  avgVelocityPagesPerHour: number;
  peakReadingHour: number;
  avgSessionDurationMin: number;
  avgPagesPerSession: number;
  genreBreakdown: GenreShareDTO[];
  topAuthor: string;
  uniqueAuthorsRead: number;
  dropRate: number;
  readerArchetype: string;
}

// ─── GET /reading-goals/{year}/progress ──────────────────────────────────────

export interface ReadingGoalDTO {
  id: string;
  year: number;
  targetBooks: number;
  targetPages: number | null;
  targetMinutes: number | null;
  targetAuthors: number | null;
  targetGenres: number | null;
  visibility: 'PUBLIC' | 'PRIVATE';
}

export interface ReadingGoalProgressDTO {
  goal: ReadingGoalDTO;
  booksRead: number;
  pagesRead: number;
  dailyPaceRequired: number;
  currentPace: number;
  projectedFinishDate: string;
  onTrack: boolean;
  currentStreak: number;
  bestStreak: number;
  streakInsight: string;
  uniqueAuthors: number;
  uniqueGenres: number;
  topGenre: string;
  // Authors/genres goal tracking
  targetAuthors: number | null;
  targetGenres: number | null;
  authorsGoalMet: boolean;
  genresGoalMet: boolean;
  // Minutes goal tracking
  minutesRead: number;
  targetMinutes: number | null;
  minutesGoalMet: boolean;
  dailyMinutesGoal: number;
  // Micro-victories
  dailyPagesGoal: number;
  dailyInsight: string;
}

export interface BookAuthorDTO {
  name: string;
  bookCount: number;
}
