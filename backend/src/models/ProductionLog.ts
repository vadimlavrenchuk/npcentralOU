import mongoose, { Schema, Document } from 'mongoose';

export type LogEventType = 'setup' | 'work' | 'downtime' | 'failure';

export interface IProductionLog extends Document {
  machineId: string;
  type: LogEventType;
  startTime: Date;
  endTime: Date;
  energyConsumed: number;
  airConsumed: number;
  toolWear: number;
  notes?: string;
  cost: number;
  profitLeak: number;
}

const ProductionLogSchema = new Schema<IProductionLog>(
  {
    machineId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['setup', 'work', 'downtime', 'failure'],
      required: true,
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    energyConsumed: { type: Number, required: true, min: 0, default: 0 },
    airConsumed: { type: Number, required: true, min: 0, default: 0 },
    toolWear: { type: Number, required: true, min: 0, max: 100, default: 0 },
    notes: { type: String, trim: true },
    cost: { type: Number, required: true, min: 0, default: 0 },
    profitLeak: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true }
);

export const ProductionLog =
  mongoose.models.ProductionLog ?? mongoose.model<IProductionLog>('ProductionLog', ProductionLogSchema);
