import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type UserRole = "user" | "admin" | "moderator";
export type UserStatus = "active" | "warned" | "banned";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  warnings: {
    reason: string;
    issuedBy: Types.ObjectId;
    issuedAt: Date;
  }[];
  banReason?: string;
  bannedAt?: Date;
  targetLanguage: string;   // language code, e.g. "en"
  currentGoal?: {
    examType: string;       // "TOEIC" | "IELTS" | "TOEFL"
    targetScore: number;
    deadline?: Date;
  };
  streakDays: number;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    avatar:       { type: String },
    role:         { type: String, enum: ["user", "admin", "moderator"], default: "user" },
    status:       { type: String, enum: ["active", "warned", "banned"], default: "active" },
    warnings: [
      {
        reason:   { type: String, required: true },
        issuedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        issuedAt: { type: Date, default: Date.now },
      },
    ],
    banReason:      { type: String },
    bannedAt:       { type: Date },
    targetLanguage: { type: String, default: "en" },
    currentGoal: {
      examType:    { type: String },
      targetScore: { type: Number },
      deadline:    { type: Date },
    },
    streakDays:   { type: Number, default: 0 },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, status: 1 });

export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);
