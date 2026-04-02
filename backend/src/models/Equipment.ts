import mongoose, { Schema, Document } from 'mongoose';

/**
 * Equipment status enumeration
 */
export enum EquipmentStatus {
  OPERATIONAL = 'operational',
  MAINTENANCE = 'maintenance',
  OUT_OF_SERVICE = 'out-of-service',
  DECOMMISSIONED = 'decommissioned',
}

/**
 * Maintenance interval unit type
 */
export type MaintenanceIntervalUnit = 'days' | 'months' | 'hours';

/**
 * Maintenance interval interface
 */
export interface MaintenanceInterval {
  value: number;
  unit: MaintenanceIntervalUnit;
}

/**
 * Last service record
 */
export interface LastService {
  date: Date;
  hours: number;
}

/**
 * Checklist task template
 */
export interface ChecklistTask {
  task: string;
  required: boolean;
}

/**
 * Next service data (virtual field)
 */
export interface NextServiceData {
  date: Date | null;
  hours: number | null;
  daysRemaining: number | null;
  hoursRemaining: number | null;
  percentRemaining: number;
  type: 'calendar' | 'hours' | 'both';
}

/**
 * Equipment interface
 */
export interface IEquipment extends Omit<Document, 'model'> {
  name: string;
  type: string;
  model: string;
  serialNumber: string;
  manufacturer?: string;
  status: EquipmentStatus;
  location: string;
  installDate?: Date;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  notes?: string;
  
  // Preventive Maintenance fields
  maintenanceInterval?: MaintenanceInterval;
  lastService?: LastService;
  currentHours?: number;
  checklistTemplate?: ChecklistTask[];
  
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual fields
  nextServiceData?: NextServiceData;
  isUrgent?: boolean;
  
  // Instance methods
  updateCurrentHours(hours: number): Promise<IEquipment>;
  recordService(serviceHours?: number): Promise<IEquipment>;
}

/**
 * Equipment Schema
 */
const EquipmentSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Equipment name is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Equipment type is required'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Equipment model is required'],
      trim: true,
    },
    serialNumber: {
      type: String,
      required: [true, 'Serial number is required'],
      trim: true,
      unique: true,
    },
    manufacturer: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(EquipmentStatus),
      default: EquipmentStatus.OPERATIONAL,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    installDate: {
      type: Date,
    },
    lastMaintenanceDate: {
      type: Date,
    },
    nextMaintenanceDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    
    // Preventive Maintenance fields
    maintenanceInterval: {
      value: {
        type: Number,
        min: [0, 'Maintenance interval value cannot be negative'],
      },
      unit: {
        type: String,
        enum: ['days', 'months', 'hours'],
      },
    },
    lastService: {
      date: {
        type: Date,
      },
      hours: {
        type: Number,
        min: [0, 'Hours cannot be negative'],
      },
    },
    currentHours: {
      type: Number,
      default: 0,
      min: [0, 'Current hours cannot be negative'],
    },
    checklistTemplate: [
      {
        task: {
          type: String,
          required: true,
          trim: true,
        },
        required: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
EquipmentSchema.index({ status: 1 });
EquipmentSchema.index({ location: 1 });
EquipmentSchema.index({ type: 1 });

/**
 * Calculate next service date based on calendar interval
 */
function calculateNextServiceDate(lastServiceDate: Date, interval: MaintenanceInterval): Date | null {
  if (!lastServiceDate || !interval) return null;
  
  const nextDate = new Date(lastServiceDate);
  
  switch (interval.unit) {
    case 'days':
      nextDate.setDate(nextDate.getDate() + interval.value);
      break;
    case 'months':
      nextDate.setMonth(nextDate.getMonth() + interval.value);
      break;
    default:
      return null;
  }
  
  return nextDate;
}

/**
 * Calculate next service hours based on hours interval
 */
function calculateNextServiceHours(lastServiceHours: number, interval: MaintenanceInterval): number | null {
  if (interval.unit !== 'hours') return null;
  return lastServiceHours + interval.value;
}

/**
 * Virtual field: nextServiceData
 * Calculates when the next service is due based on maintenance type
 */
EquipmentSchema.virtual('nextServiceData').get(function (this: IEquipment): NextServiceData {
  const result: NextServiceData = {
    date: null,
    hours: null,
    daysRemaining: null,
    hoursRemaining: null,
    percentRemaining: 100,
    type: 'both',
  };
  
  if (!this.maintenanceInterval) {
    return result;
  }
  
  const now = new Date();
  const interval = this.maintenanceInterval;
  
  // Calendar-based maintenance
  if (interval.unit === 'days' || interval.unit === 'months') {
    result.type = 'calendar';
    
    if (this.lastService?.date) {
      const nextDate = calculateNextServiceDate(this.lastService.date, interval);
      if (nextDate) {
        result.date = nextDate;
        const msRemaining = nextDate.getTime() - now.getTime();
        result.daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
        
        // Calculate percentage remaining
        const totalMs = nextDate.getTime() - new Date(this.lastService.date).getTime();
        result.percentRemaining = Math.max(0, Math.min(100, (msRemaining / totalMs) * 100));
      }
    }
  }
  
  // Hours-based maintenance
  if (interval.unit === 'hours') {
    result.type = 'hours';
    
    if (this.lastService?.hours !== undefined && this.currentHours !== undefined) {
      const nextHours = calculateNextServiceHours(this.lastService.hours, interval);
      if (nextHours !== null) {
        result.hours = nextHours;
        result.hoursRemaining = nextHours - this.currentHours;
        
        // Calculate percentage remaining
        const totalHours = interval.value;
        const hoursUsed = this.currentHours - this.lastService.hours;
        result.percentRemaining = Math.max(0, Math.min(100, ((totalHours - hoursUsed) / totalHours) * 100));
      }
    }
  }
  
  return result;
});

/**
 * Virtual field: isUrgent
 * Returns true if maintenance is urgent (< 10% resource remaining or < 7 days)
 */
EquipmentSchema.virtual('isUrgent').get(function (this: IEquipment): boolean {
  const nextService = this.nextServiceData;
  
  if (!nextService) return false;
  
  // Check percentage threshold
  if (nextService.percentRemaining < 10) {
    return true;
  }
  
  // Check calendar-based threshold (< 7 days)
  if (nextService.daysRemaining !== null && nextService.daysRemaining < 7) {
    return true;
  }
  
  // Check if overdue
  if (nextService.daysRemaining !== null && nextService.daysRemaining < 0) {
    return true;
  }
  
  if (nextService.hoursRemaining !== null && nextService.hoursRemaining < 0) {
    return true;
  }
  
  return false;
});

/**
 * Instance method to update current hours
 */
EquipmentSchema.methods.updateCurrentHours = async function (hours: number): Promise<IEquipment> {
  this.currentHours = hours;
  return await this.save();
};

/**
 * Instance method to record service completion
 */
EquipmentSchema.methods.recordService = async function (serviceHours?: number): Promise<IEquipment> {
  const now = new Date();
  
  this.lastMaintenanceDate = now;
  this.lastService = {
    date: now,
    hours: serviceHours !== undefined ? serviceHours : this.currentHours || 0,
  };
  
  // Update next maintenance date if calendar-based
  if (this.maintenanceInterval && 
      (this.maintenanceInterval.unit === 'days' || this.maintenanceInterval.unit === 'months')) {
    this.nextMaintenanceDate = calculateNextServiceDate(now, this.maintenanceInterval);
  }
  
  return await this.save();
};

/**
 * Static method to get urgent equipment
 */
EquipmentSchema.statics.getUrgentEquipment = async function (limit: number = 5): Promise<IEquipment[]> {
  const equipment = await this.find({
    status: { $ne: EquipmentStatus.DECOMMISSIONED },
    maintenanceInterval: { $exists: true },
  });
  
  interface EquipmentWithService {
    equipment: IEquipment;
    nextService: NextServiceData | undefined;
    isUrgent: boolean | undefined;
  }
  
  // Filter and sort by urgency
  const urgentEquipment = equipment
    .map((eq: IEquipment): EquipmentWithService => ({
      equipment: eq,
      nextService: eq.nextServiceData,
      isUrgent: eq.isUrgent,
    }))
    .filter((item: EquipmentWithService) => item.isUrgent)
    .sort((a: EquipmentWithService, b: EquipmentWithService) => {
      // Sort by percentage remaining (lowest first)
      return (a.nextService?.percentRemaining || 100) - (b.nextService?.percentRemaining || 100);
    })
    .slice(0, limit)
    .map((item: EquipmentWithService) => item.equipment);
  
  return urgentEquipment;
};

export default mongoose.model<IEquipment>('Equipment', EquipmentSchema);
