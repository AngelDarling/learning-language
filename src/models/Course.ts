import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type ExamType = "TOEIC" | "IELTS" | "TOEFL" | "VOCABULARY" | "GRAMMAR";
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export interface ICourse extends Document {
  languageId: Types.ObjectId;
  examType: ExamType;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  level: DifficultyLevel;
  targetScore?: { min: number; max: number };
  estimatedWeeks: number;
  totalLessons: number;
  isPremium: boolean;
  isPublished: boolean;
  order: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    languageId:   { type: Schema.Types.ObjectId, ref: "Language", required: true, index: true },
    examType:     { type: String, enum: ["TOEIC", "IELTS", "TOEFL", "VOCABULARY", "GRAMMAR"], required: true },
    title:        { type: String, required: true },
    slug:         { type: String, required: true, unique: true, lowercase: true },
    description:  { type: String, required: true },
    thumbnail:    { type: String },
    level:        { type: String, enum: ["beginner", "intermediate", "advanced"], required: true },
    targetScore: {
      min: { type: Number },
      max: { type: Number },
    },
    estimatedWeeks: { type: Number, required: true },
    totalLessons:   { type: Number, default: 0 },
    isPremium:      { type: Boolean, default: false },
    isPublished:    { type: Boolean, default: false },
    order:          { type: Number, default: 0 },
    tags:           [{ type: String }],
  },
  { timestamps: true }
);

CourseSchema.index({ languageId: 1, examType: 1 });
CourseSchema.index({ slug: 1 });

export const Course: Model<ICourse> =
  mongoose.models.Course ?? mongoose.model<ICourse>("Course", CourseSchema);
