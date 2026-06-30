import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type QuestionType =
  | "multiple_choice"   // TOEIC Part 5/6/7, IELTS Reading MCQ
  | "fill_in_blank"     // IELTS Reading, TOEIC Part 6
  | "listening_choice"  // TOEIC Part 1-4, IELTS Listening
  | "matching"          // IELTS Reading matching headings
  | "true_false_ng"     // IELTS True/False/Not Given
  | "short_answer";     // IELTS short answer

export type SkillArea = "listening" | "reading" | "grammar" | "vocabulary" | "writing" | "speaking";

export interface IChoice {
  key: string;    // "A" | "B" | "C" | "D"
  text: string;
}

export interface IQuestion extends Document {
  languageId: Types.ObjectId;
  examType: string;
  part?: number;              // TOEIC Part 1–7, IELTS Section 1–4
  questionType: QuestionType;
  skill: SkillArea;
  difficulty: 1 | 2 | 3 | 4 | 5;
  content: {
    passage?: string;         // Reading passage or paragraph
    audioUrl?: string;        // Listening audio file URL
    imageUrl?: string;        // Image for Part 1
    question: string;
    choices?: IChoice[];      // For multiple_choice, listening_choice
    blankIndex?: number;      // Which blank in passage (fill_in_blank)
  };
  answer: {
    correct: string;          // "B" | "True" | "harbour" etc.
    explanation: string;      // Vietnamese explanation
    explanationEn?: string;   // English explanation
    grammarPoint?: string;    // e.g. "Past Perfect"
  };
  tags: string[];
  usageCount: number;         // how many times used in exams
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    languageId:   { type: Schema.Types.ObjectId, ref: "Language", required: true },
    examType:     { type: String, required: true },
    part:         { type: Number },
    questionType: {
      type: String,
      enum: ["multiple_choice", "fill_in_blank", "listening_choice", "matching", "true_false_ng", "short_answer"],
      required: true,
    },
    skill: {
      type: String,
      enum: ["listening", "reading", "grammar", "vocabulary", "writing", "speaking"],
      required: true,
    },
    difficulty: { type: Number, min: 1, max: 5, required: true },
    content: {
      passage:   { type: String },
      audioUrl:  { type: String },
      imageUrl:  { type: String },
      question:  { type: String, required: true },
      choices: [
        {
          key:  { type: String, required: true },
          text: { type: String, required: true },
        },
      ],
      blankIndex: { type: Number },
    },
    answer: {
      correct:       { type: String, required: true },
      explanation:   { type: String, required: true },
      explanationEn: { type: String },
      grammarPoint:  { type: String },
    },
    tags:        [{ type: String }],
    usageCount:  { type: Number, default: 0 },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

QuestionSchema.index({ languageId: 1, examType: 1, part: 1, skill: 1 });
QuestionSchema.index({ difficulty: 1, isActive: 1 });
QuestionSchema.index({ tags: 1 });

export const Question: Model<IQuestion> =
  mongoose.models.Question ?? mongoose.model<IQuestion>("Question", QuestionSchema);
