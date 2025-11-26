import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: String,
    location: String,
    status: { type: String, default: "in_operation" },
    manufacturer: String,
    model: String,
    serial_number: String,
    commissioning_date: Date,
    notes: String
  },
  { timestamps: true }
);

// ВАЖНО!!! — default export
export default mongoose.model("Equipment", equipmentSchema);