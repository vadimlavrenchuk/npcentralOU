export const UserRole = {
  ADMIN: 'admin',
  CHIEF_MECHANIC: 'chief_mechanic',
  ACCOUNTANT: 'accountant',
  MECHANIC: 'mechanic'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface UserProfile {
  _id?: string;
  email: string;
  name: string;
  role: UserRole;
  firebaseUid?: string;
  photoURL?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Permissions {
  // Navigation
  canAccessDashboard: boolean;
  canAccessWorkOrders: boolean;
  canAccessInventory: boolean;
  canAccessEquipment: boolean;
  canAccessReports: boolean;
  canAccessEmployees: boolean;
  canAccessSettings: boolean;
  
  // Work Orders
  canCreateWorkOrders: boolean;
  canEditWorkOrders: boolean;
  canDeleteWorkOrders: boolean;
  canAssignWorkOrders: boolean;
  
  // Inventory
  canViewInventory: boolean;
  canAddInventory: boolean;
  canEditInventory: boolean;
  canDeleteInventory: boolean;
  canAdjustStock: boolean;
  
  // Equipment
  canViewEquipment: boolean;
  canAddEquipment: boolean;
  canEditEquipment: boolean;
  canDeleteEquipment: boolean;
  canCreateChecklists: boolean;
  
  // Reports
  canViewFinancialReports: boolean;
  canViewEfficiencyReports: boolean;
  canExportReports: boolean;
  
  // Employees
  canViewEmployees: boolean;
  canAddEmployees: boolean;
  canEditEmployees: boolean;
  canDeleteEmployees: boolean;
  canManageRoles: boolean;
}
