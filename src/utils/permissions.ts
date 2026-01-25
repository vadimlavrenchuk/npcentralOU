import { UserRole } from '../types/permissions';
import type { Permissions } from '../types/permissions';

export const getPermissions = (role: UserRole): Permissions => {
  switch (role) {
    case UserRole.ADMIN:
      return {
        // Navigation - Full access
        canAccessDashboard: true,
        canAccessWorkOrders: true,
        canAccessInventory: true,
        canAccessEquipment: true,
        canAccessReports: true,
        canAccessEmployees: true,
        canAccessSettings: true,
        
        // Work Orders - Full access
        canCreateWorkOrders: true,
        canEditWorkOrders: true,
        canDeleteWorkOrders: true,
        canAssignWorkOrders: true,
        
        // Inventory - Full access
        canViewInventory: true,
        canAddInventory: true,
        canEditInventory: true,
        canDeleteInventory: true,
        canAdjustStock: true,
        
        // Equipment - Full access
        canViewEquipment: true,
        canAddEquipment: true,
        canEditEquipment: true,
        canDeleteEquipment: true,
        canCreateChecklists: true,
        
        // Reports - Full access
        canViewFinancialReports: true,
        canViewEfficiencyReports: true,
        canExportReports: true,
        
        // Employees - Full access
        canViewEmployees: true,
        canAddEmployees: true,
        canEditEmployees: true,
        canDeleteEmployees: true,
        canManageRoles: true,
        canManageUsers: true, // Only admin can fully manage users
      };

    case UserRole.CHIEF_MECHANIC:
      return {
        // Navigation - All except settings
        canAccessDashboard: true,
        canAccessWorkOrders: true,
        canAccessInventory: true,
        canAccessEquipment: true,
        canAccessReports: true,
        canAccessEmployees: true,
        canAccessSettings: false,
        
        // Work Orders - Full access
        canCreateWorkOrders: true,
        canEditWorkOrders: true,
        canDeleteWorkOrders: true,
        canAssignWorkOrders: true,
        
        // Inventory - Full access
        canViewInventory: true,
        canAddInventory: true,
        canEditInventory: true,
        canDeleteInventory: true,
        canAdjustStock: true,
        
        // Equipment - Full access
        canViewEquipment: true,
        canAddEquipment: true,
        canEditEquipment: true,
        canDeleteEquipment: true,
        canCreateChecklists: true,
        
        // Reports - Financial + Efficiency
        canViewFinancialReports: true,
        canViewEfficiencyReports: true,
        canExportReports: true,
        
        // Employees - Full access
        canViewEmployees: true,
        canAddEmployees: true,
        canEditEmployees: true,
        canDeleteEmployees: true,
        canManageRoles: false, // Cannot change roles
        canManageUsers: false, // Cannot fully manage users
      };

    case UserRole.ACCOUNTANT:
      return {
        // Navigation - Limited
        canAccessDashboard: true,
        canAccessWorkOrders: false,
        canAccessInventory: true,
        canAccessEquipment: false,
        canAccessReports: true,
        canAccessEmployees: false,
        canAccessSettings: false,
        
        // Work Orders - No access
        canCreateWorkOrders: false,
        canEditWorkOrders: false,
        canDeleteWorkOrders: false,
        canAssignWorkOrders: false,
        
        // Inventory - Full access for accounting
        canViewInventory: true,
        canAddInventory: true,
        canEditInventory: true,
        canDeleteInventory: true,
        canAdjustStock: true,
        
        // Equipment - No access
        canViewEquipment: false,
        canAddEquipment: false,
        canEditEquipment: false,
        canDeleteEquipment: false,
        canCreateChecklists: false,
        
        // Reports - View and export
        canViewFinancialReports: true,
        canViewEfficiencyReports: false,
        canExportReports: true,
        
        // Employees - No access
        canViewEmployees: false,
        canAddEmployees: false,
        canEditEmployees: false,
        canDeleteEmployees: false,
        canManageRoles: false,
        canManageUsers: false,
      };

    case UserRole.MECHANIC:
      return {
        // Navigation - Limited
        canAccessDashboard: true,
        canAccessWorkOrders: true,
        canAccessInventory: true, // View only
        canAccessEquipment: true, // View only
        canAccessReports: false,
        canAccessEmployees: false,
        canAccessSettings: false,
        
        // Work Orders - Create and view own
        canCreateWorkOrders: true,
        canEditWorkOrders: true, // Own orders only
        canDeleteWorkOrders: false,
        canAssignWorkOrders: false,
        
        // Inventory - View only
        canViewInventory: true,
        canAddInventory: false,
        canEditInventory: false,
        canDeleteInventory: false,
        canAdjustStock: false, // Only through work orders
        
        // Equipment - View only
        canViewEquipment: true,
        canAddEquipment: false,
        canEditEquipment: false,
        canDeleteEquipment: false,
        canCreateChecklists: false, // Cannot edit checklists
        
        // Reports - No access
        canViewFinancialReports: false,
        canViewEfficiencyReports: false,
        canExportReports: false,
        
        // Employees - No access
        canViewEmployees: false,
        canAddEmployees: false,
        canEditEmployees: false,
        canDeleteEmployees: false,
        canManageRoles: false,
        canManageUsers: false,
      };

    default:
      // Default to most restricted (Mechanic)
      return getPermissions(UserRole.MECHANIC);
  }
};
