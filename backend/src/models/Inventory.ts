import mongoose, { Schema, Document } from 'mongoose';
import { I18nString } from '../types/common';

/**
 * Inventory item interface
 */
export interface IInventory extends Document {
  sku: string;
  name: I18nString;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  unitPrice: number;
  location?: string;
  supplier?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Inventory Schema
 */
const InventorySchema: Schema = new Schema(
  {
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      trim: true,
      uppercase: true,
    },
    name: {
      en: {
        type: String,
        required: [true, 'English name is required'],
        trim: true,
      },
      et: {
        type: String,
        trim: true,
      },
      fi: {
        type: String,
        trim: true,
      },
      ru: {
        type: String,
        trim: true,
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    minQuantity: {
      type: Number,
      required: [true, 'Minimum quantity is required'],
      min: [0, 'Minimum quantity cannot be negative'],
      default: 0,
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
      enum: ['pcs', 'kg', 'l', 'm', 'box', 'set', 'L', 'm²', 'L/min'],
      default: 'pcs',
    },
    unitPrice: {
      type: Number,
      required: false,
      min: [0, 'Unit price cannot be negative'],
      default: 0,
    },
    location: {
      type: String,
      trim: true,
    },
    supplier: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
InventorySchema.index({ sku: 1 }, { unique: true });
InventorySchema.index({ category: 1 });
InventorySchema.index({ quantity: 1 });

export default mongoose.model<IInventory>('Inventory', InventorySchema);
