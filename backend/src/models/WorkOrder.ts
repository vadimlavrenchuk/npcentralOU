import mongoose, { Schema, Document } from 'mongoose';

/**
 * Work Order Priority enum
 */
export enum WorkOrderPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Work Order Status enum
 */
export enum WorkOrderStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * Part usage in work order
 */
export interface IPartUsage {
  inventoryId: mongoose.Types.ObjectId;
  quantity: number;
  name?: string;
}

/**
 * Work Order interface
 */
export interface IWorkOrder extends Document {
  title: string;
  description: string;
  equipmentId?: mongoose.Types.ObjectId;
  assignedToId?: mongoose.Types.ObjectId;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  parts: IPartUsage[];
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: Date;
  completedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Priority sort order for automatic sorting
 */
const prioritySortOrder: Record<WorkOrderPriority, number> = {
  [WorkOrderPriority.CRITICAL]: 1,
  [WorkOrderPriority.HIGH]: 2,
  [WorkOrderPriority.MEDIUM]: 3,
  [WorkOrderPriority.LOW]: 4,
};

/**
 * Work Order Schema
 */
const WorkOrderSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    equipmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Equipment',
      required: false,
    },
    assignedToId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    priority: {
      type: String,
      enum: Object.values(WorkOrderPriority),
      default: WorkOrderPriority.MEDIUM,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(WorkOrderStatus),
      default: WorkOrderStatus.PENDING,
      required: true,
    },
    parts: [
      {
        inventoryId: {
          type: Schema.Types.ObjectId,
          ref: 'Inventory',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1'],
        },
        name: {
          type: String,
          required: false,
        },
      },
    ],
    estimatedHours: {
      type: Number,
      min: [0, 'Estimated hours cannot be negative'],
      required: false,
    },
    actualHours: {
      type: Number,
      min: [0, 'Actual hours cannot be negative'],
      required: false,
    },
    dueDate: {
      type: Date,
      required: false,
    },
    completedAt: {
      type: Date,
      required: false,
    },
    notes: {
      type: String,
      trim: true,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
WorkOrderSchema.index({ priority: 1, createdAt: -1 });
WorkOrderSchema.index({ status: 1 });
WorkOrderSchema.index({ assignedToId: 1 });
WorkOrderSchema.index({ equipmentId: 1 });

// Virtual field for priority sort order
WorkOrderSchema.virtual('priorityOrder').get(function (this: IWorkOrder) {
  return prioritySortOrder[this.priority];
});

// Ensure virtuals are included in JSON
WorkOrderSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const WorkOrder = mongoose.model<IWorkOrder>('WorkOrder', WorkOrderSchema);
