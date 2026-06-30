import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IVocabWord extends Document {
  languageId: Types.ObjectId;
  word: string;
  pronunciation?: string;   // IPA e.g. "/ˈɔːdɪt/"
  audioUrl?: string;
  definitions: {
    partOfSpeech: string;   // "noun", "verb", "adjective"
    meaning: string;        // Vietnamese meaning
    exampleEn: string;
    exampleVi: string;
  }[];
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  examTypes: string[];      // ["TOEIC", "IELTS"]
  topics: string[];         // ["business", "travel", "health"]
  frequency: number;        // higher = more common in exams
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VocabWordSchema = new Schema<IVocabWord>(
  {
    languageId:    { type: Schema.Types.ObjectId, ref: "Language", required: true },
    word:          { type: String, required: true, trim: true },
    pronunciation: { type: String },
    audioUrl:      { type: String },
    definitions: [
      {
        partOfSpeech: { type: String, required: true },
        meaning:      { type: String, required: true },
        exampleEn:    { type: String, required: true },
        exampleVi:    { type: String, required: true },
      },
    ],
    level:     { type: String, enum: ["A1", "A2", "B1", "B2", "C1", "C2"], required: true },
    examTypes: [{ type: String }],
    topics:    [{ type: String }],
    frequency: { type: Number, default: 0 },
    isActive:  { type: Boolean, default: true },
  },
  { timestamps: true }
);

VocabWordSchema.index({ languageId: 1, level: 1, examTypes: 1 });
VocabWordSchema.index({ topics: 1 });
VocabWordSchema.index({ word: "text" });

export const VocabWord: Model<IVocabWord> =
  mongoose.models.VocabWord ?? mongoose.model<IVocabWord>("VocabWord", VocabWordSchema);
