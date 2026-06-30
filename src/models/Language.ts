import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILanguage extends Document {
  code: string;        // "en", "de", "ja"
  name: string;        // "English", "German"
  nativeName: string;  // "Tiếng Anh", "Deutsch"
  flag: string;        // "🇬🇧"
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LanguageSchema = new Schema<ILanguage>(
  {
    code:       { type: String, required: true, unique: true, lowercase: true, trim: true },
    name:       { type: String, required: true },
    nativeName: { type: String, required: true },
    flag:       { type: String, default: "" },
    isActive:   { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Language: Model<ILanguage> =
  mongoose.models.Language ?? mongoose.model<ILanguage>("Language", LanguageSchema);
