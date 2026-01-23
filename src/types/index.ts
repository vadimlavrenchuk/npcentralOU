/**
 * Типы для приложения управления механическим участком
 * Domain Models & DTOs
 */

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface I18nString {
  en: string;
  et?: string;
  fi?: string;
  ru?: string;
}

// ============================================================================
// ENUMS
// ============================================================================

export enum WorkOrderStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum WorkOrderPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum EquipmentStatus {
  OPERATIONAL = 'operational',
  MAINTENANCE = 'maintenance',
  BROKEN = 'broken',
  RETIRED = 'retired',
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  MECHANIC = 'mechanic',
  OPERATOR = 'operator',
}

// ============================================================================
// UI TYPES
// ============================================================================

export interface SidebarItem {
  titleKey: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  path: string;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

// ============================================================================
// DOMAIN MODELS
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  model: string;
  serialNumber: string;
  manufacturer?: string;
  status: EquipmentStatus;
  location: string;
  installDate?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  notes?: string;
  // Preventive Maintenance fields
  maintenanceInterval?: MaintenanceInterval;
  lastService?: LastService;
  currentHours?: number;
  checklistTemplate?: ChecklistTask[];
  // Virtual fields
  nextServiceData?: NextServiceData;
  isUrgent?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceInterval {
  value: number;
  unit: 'days' | 'months' | 'hours';
}

export interface LastService {
  date?: string;
  hours?: number;
}

export interface ChecklistTask {
  task: string;
  required: boolean;
  completed?: boolean;
}

export interface NextServiceData {
  date: string | null;
  hours: number | null;
  daysRemaining: number | null;
  hoursRemaining: number | null;
  percentRemaining: number;
  type: 'calendar' | 'hours' | 'both';
}

export interface PartUsage {
  inventoryId: string;
  quantity: number;
  name?: string;
}

export interface WorkOrder {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  equipmentId?: string;
  equipment?: Equipment;
  assignedToId?: string;
  assignedTo?: User;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  parts: PartUsage[];
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
  completedAt?: string;
  notes?: string;
  // PM checklist
  maintenanceChecklist?: ChecklistTask[];
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  nameTranslations?: {
    ru: string;
    fi: string;
    et: string;
    en: string;
  };
  category: string;
  sku: string;
  quantity: number;
  unit: string;
  minQuantity: number;
  maxQuantity?: number;
  location: string;
  supplier?: string;
  unitPrice?: number;
  lastRestockDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceLog {
  id: string;
  equipmentId: string;
  equipment?: Equipment;
  workOrderId?: string;
  workOrder?: WorkOrder;
  performedById: string;
  performedBy?: User;
  type: 'routine' | 'repair' | 'inspection' | 'upgrade';
  description: string;
  partsUsed?: string[];
  hoursSpent?: number;
  cost?: number;
  performedAt: string;
  nextScheduledDate?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

export interface CreateWorkOrderDto {
  title: string;
  description: string;
  equipmentId?: string;
  assignedToId?: string;
  priority: WorkOrderPriority;
  status?: WorkOrderStatus;
  parts?: PartUsage[];
  estimatedHours?: number;
  dueDate?: string;
  notes?: string;
}

export interface UpdateWorkOrderDto {
  title?: string;
  description?: string;
  equipmentId?: string;
  assignedToId?: string;
  priority?: WorkOrderPriority;
  status?: WorkOrderStatus;
  parts?: PartUsage[];
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
  completedAt?: string;
  notes?: string;
}

export interface CreateEquipmentDto {
  name: string;
  type: string;
  model: string;
  serialNumber: string;
  manufacturer?: string;
  location: string;
  installDate?: string;
  notes?: string;
  // PM fields
  maintenanceInterval?: MaintenanceInterval;
  lastService?: LastService;
  currentHours?: number;
  checklistTemplate?: ChecklistTask[];
}

export interface UpdateEquipmentDto {
  name?: string;
  type?: string;
  model?: string;
  serialNumber?: string;
  manufacturer?: string;
  status?: EquipmentStatus;
  location?: string;
  installDate?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  notes?: string;
  // PM fields
  maintenanceInterval?: MaintenanceInterval;
  lastService?: LastService;
  currentHours?: number;
  checklistTemplate?: ChecklistTask[];
}

export interface CreateInventoryItemDto {
  name: I18nString;
  category: string;
  sku: string;
  quantity: number;
  unit: string;
  minQuantity: number;
  maxQuantity?: number;
  location?: string;
  supplier?: string;
  unitPrice?: number;
  notes?: string;
  description?: string;
}

export interface UpdateInventoryItemDto {
  name?: string;
  category?: string;
  quantity?: number;
  unit?: string;
  minQuantity?: number;
  maxQuantity?: number;
  location?: string;
  supplier?: string;
  unitPrice?: number;
  lastRestockDate?: string;
  notes?: string;
}

export interface CreateMaintenanceLogDto {
  equipmentId: string;
  workOrderId?: string;
  type: 'routine' | 'repair' | 'inspection' | 'upgrade';
  description: string;
  partsUsed?: string[];
  hoursSpent?: number;
  cost?: number;
  performedAt: string;
  nextScheduledDate?: string;
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

// ============================================================================
// FILTERS & QUERIES
// ============================================================================

export interface WorkOrderFilters {
  status?: WorkOrderStatus[];
  priority?: WorkOrderPriority[];
  assignedToId?: string;
  equipmentId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface EquipmentFilters {
  status?: EquipmentStatus[];
  type?: string[];
  location?: string[];
  search?: string;
}

export interface InventoryFilters {
  category?: string[];
  lowStock?: boolean;
  location?: string[];
  search?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// STATISTICS & DASHBOARD
// ============================================================================

export interface DashboardStats {
  workOrders: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    byPriority: Record<WorkOrderPriority, number>;
  };
  equipment: {
    total: number;
    operational: number;
    maintenance: number;
    broken: number;
  };
  inventory: {
    total: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
  };
  recentActivity: {
    completedWorkOrders: number;
    pendingWorkOrders: number;
    upcomingMaintenance: number;
  };
  maintenance?: {
    urgentEquipment: Equipment[];
    stats: {
      total: number;
      urgent: number;
      dueThisWeek: number;
      dueThisMonth: number;
      overdue: number;
    };
  };
}
