import mongoose, { Schema, Document } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  CHIEF_MECHANIC = 'chief_mechanic',
  ACCOUNTANT = 'accountant',
  MECHANIC = 'mechanic'
}

export interface IUser extends Document {
  username: string;
  password: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      select: false // Don't return password by default
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.MECHANIC,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Remove the automatic admin assignment pre-save hook

export default mongoose.model<IUser>('User', UserSchema);
