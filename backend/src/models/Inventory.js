import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    partNumber: { type: String },
    quantity: { type: Number, default: 0 },
    orderedQuantity: { type: Number, default: 0 },
    orderedStatus: { type: String, default: "None" },
  },
  { timestamps: true }
);

export default mongoose.model("Inventory", inventorySchema);
