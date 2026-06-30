import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IExamSection {
  name: string;             // "Part 1", "Listening Section 1"
  skill: string;
  questions: Types.ObjectId[];
  timeLimit?: number;       // seconds, null = no per-section limit
}

export interface IExam extends Document {
  languageId: Types.ObjectId;
  courseId?: Types.ObjectId;
  examType: string;
  title: string;
  slug: string;
  description?: string;
  sections: IExamSection[];
  totalQuestions: number;
  timeLimitSeconds: number;
  isPremium: boolean;
  isPublished: boolean;
  maxScore: number;         // e.g. 990 for TOEIC, 9 for IELTS
  attemptCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ExamSchema = new Schema<IExam>(
  {
    languageId:   { type: Schema.Types.ObjectId, ref: "Language", required: true },
    courseId:     { type: Schema.Types.ObjectId, ref: "Course" },
    examType:     { type: String, required: true },
    title:        { type: String, required: true },
    slug:         { type: String, required: true, unique: true },
    description:  { type: String },
    sections: [
      {
        name:      { type: String, required: true },
        skill:     { type: String, required: true },
        questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
        timeLimit: { type: Number },
      },
    ],
    totalQuestions:   { type: Number, required: true },
    timeLimitSeconds: { type: Number, required: true },
    isPremium:        { type: Boolean, default: false },
    isPublished:      { type: Boolean, default: false },
    maxScore:         { type: Number, required: true },
    attemptCount:     { type: Number, default: 0 },
  },
  { timestamps: true }
);

ExamSchema.index({ languageId: 1, examType: 1, isPublished: 1 });

export const Exam: Model<IExam> =
  mongoose.models.Exam ?? mongoose.model<IExam>("Exam", ExamSchema);
