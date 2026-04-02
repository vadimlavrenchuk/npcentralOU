import mongoose, { Schema, Document } from 'mongoose';

export enum ScheduleType {
  SHIFT = 'shift',
  VACATION = 'vacation',
  SICK_LEAVE = 'sick_leave'
}

export interface ISchedule extends Document {
  userId: mongoose.Types.ObjectId;
  type: ScheduleType;
  startDate: Date;
  endDate: Date;
  shiftHours?: string; // Например: "08:00-16:00"
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: Object.values(ScheduleType),
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    shiftHours: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Индекс для быстрого поиска по пользователю и датам
ScheduleSchema.index({ userId: 1, startDate: 1, endDate: 1 });

export default mongoose.model<ISchedule>('Schedule', ScheduleSchema);
