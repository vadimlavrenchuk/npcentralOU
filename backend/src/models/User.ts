import mongoose, { Schema, Document } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  CHIEF_MECHANIC = 'chief_mechanic',
  ACCOUNTANT = 'accountant',
  MECHANIC = 'mechanic'
}

export interface IUser extends Document {
  email: string;
  name: string;
  role: UserRole;
  firebaseUid?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
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
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true
    },
    photoURL: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Automatically assign admin role to specific email
UserSchema.pre('save', function(next) {
  if (this.email === 'vadimlavrenchuk@yahoo.com' && this.isNew) {
    this.role = UserRole.ADMIN;
  }
  next();
});

export default mongoose.model<IUser>('User', UserSchema);
