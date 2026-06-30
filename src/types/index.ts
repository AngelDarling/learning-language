// Shared frontend types — mirrors backend models but safe for client

export type UserRole = "user" | "admin" | "moderator";
export type UserStatus = "active" | "warned" | "banned";
export type ExamType = "TOEIC" | "IELTS" | "TOEFL" | "VOCABULARY" | "GRAMMAR";
export type SkillArea = "listening" | "reading" | "grammar" | "vocabulary" | "writing" | "speaking";

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  targetLanguage: string;
  currentGoal?: {
    examType: ExamType;
    targetScore: number;
    deadline?: string;
  };
  streakDays: number;
}

export interface PublicCourse {
  id: string;
  examType: ExamType;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  level: "beginner" | "intermediate" | "advanced";
  targetScore?: { min: number; max: number };
  estimatedWeeks: number;
  totalLessons: number;
  isPremium: boolean;
}

export interface QuestionChoice {
  key: string;
  text: string;
}

export interface PublicQuestion {
  id: string;
  examType: string;
  part?: number;
  questionType: string;
  skill: SkillArea;
  difficulty: 1 | 2 | 3 | 4 | 5;
  content: {
    passage?: string;
    audioUrl?: string;
    imageUrl?: string;
    question: string;
    choices?: QuestionChoice[];
  };
  answer?: {
    correct: string;
    explanation: string;
    grammarPoint?: string;
  };
}

export interface ExamResult {
  examId: string;
  score: number;
  maxScore: number;
  sectionScores: { sectionName: string; score: number; total: number }[];
  answers: { questionId: string; userAnswer: string; isCorrect: boolean }[];
  timeTakenSeconds: number;
  completedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
