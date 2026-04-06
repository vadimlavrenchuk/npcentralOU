import mongoose, { Schema, Document } from 'mongoose';

export interface IMachine extends Document {
  machineId: string;
  name: string;
  nominalEnergyConsumption: number;
  nominalAirConsumption: number;
  consumableLifespan: number;
  setupStandardTime?: number;
}

const MachineSchema = new Schema<IMachine>(
  {
    machineId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    nominalEnergyConsumption: { type: Number, required: true, min: 0 },
    nominalAirConsumption: { type: Number, required: true, min: 0 },
    consumableLifespan: { type: Number, required: true, min: 0 },
    setupStandardTime: { type: Number, min: 0 },
  },
  { timestamps: true }
);

export const Machine = mongoose.models.Machine ?? mongoose.model<IMachine>('Machine', MachineSchema);
