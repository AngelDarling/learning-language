import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IAnswerRecord {
  questionId: Types.ObjectId;
  userAnswer: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
}

export interface IExamAttempt extends Document {
  userId: Types.ObjectId;
  examId: Types.ObjectId;
  answers: IAnswerRecord[];
  score: number;
  sectionScores: { sectionName: string; score: number; total: number }[];
  timeTakenSeconds: number;
  completedAt: Date;
  createdAt: Date;
}

export interface IVocabProgress extends Document {
  userId: Types.ObjectId;
  wordId: Types.ObjectId;
  easeFactor: number;       // SRS ease factor (starts at 2.5)
  interval: number;         // days until next review
  repetitions: number;      // successful reviews in a row
  nextReviewAt: Date;
  lastReviewedAt: Date;
}

// --- Exam Attempt ---
const ExamAttemptSchema = new Schema<IExamAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    examId: { type: Schema.Types.ObjectId, ref: "Exam", required: true, index: true },
    answers: [
      {
        questionId:       { type: Schema.Types.ObjectId, ref: "Question", required: true },
        userAnswer:       { type: String, required: true },
        isCorrect:        { type: Boolean, required: true },
        timeSpentSeconds: { type: Number, default: 0 },
      },
    ],
    score: { type: Number, required: true },
    sectionScores: [
      {
        sectionName: { type: String },
        score:       { type: Number },
        total:       { type: Number },
      },
    ],
    timeTakenSeconds: { type: Number, required: true },
    completedAt:      { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ExamAttemptSchema.index({ userId: 1, examId: 1, completedAt: -1 });

// --- Vocab Progress (SRS) ---
const VocabProgressSchema = new Schema<IVocabProgress>(
  {
    userId:         { type: Schema.Types.ObjectId, ref: "User", required: true },
    wordId:         { type: Schema.Types.ObjectId, ref: "VocabWord", required: true },
    easeFactor:     { type: Number, default: 2.5 },
    interval:       { type: Number, default: 1 },
    repetitions:    { type: Number, default: 0 },
    nextReviewAt:   { type: Date, default: Date.now },
    lastReviewedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

VocabProgressSchema.index({ userId: 1, nextReviewAt: 1 });
VocabProgressSchema.index({ userId: 1, wordId: 1 }, { unique: true });

export const ExamAttempt: Model<IExamAttempt> =
  mongoose.models.ExamAttempt ?? mongoose.model<IExamAttempt>("ExamAttempt", ExamAttemptSchema);

export const VocabProgress: Model<IVocabProgress> =
  mongoose.models.VocabProgress ?? mongoose.model<IVocabProgress>("VocabProgress", VocabProgressSchema);
