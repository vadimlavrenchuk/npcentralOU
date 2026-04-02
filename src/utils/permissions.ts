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
        canAccessSchedule: true,
        
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
        
        // Schedule - Full access
        canViewSchedule: true,
        canEditSchedule: true, // Only admin can edit
      };

    case UserRole.CHIEF_MECHANIC:
      return {
        // Navigation - Full access like Admin
        canAccessDashboard: true,
        canAccessWorkOrders: true,
        canAccessInventory: true,
        canAccessEquipment: true,
        canAccessReports: true,
        canAccessEmployees: true,
        canAccessSettings: true,
        canAccessSchedule: true,
        
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
        
        // Employees - Full access like Admin
        canViewEmployees: true,
        canAddEmployees: true,
        canEditEmployees: true,
        canDeleteEmployees: true,
        canManageRoles: true,
        canManageUsers: true, // Same as Admin
        
        // Schedule - Full access like Admin
        canViewSchedule: true,
        canEditSchedule: true, // Same as Admin
      };

    case UserRole.ACCOUNTANT:
      return {
        // Navigation - Limited: Dashboard, Inventory (view), Reports, Schedule (view)
        canAccessDashboard: true,
        canAccessWorkOrders: false, // НЕ видит заказы на работы
        canAccessInventory: true, // Только просмотр
        canAccessEquipment: false, // НЕ видит оборудование
        canAccessReports: true, // Может запрашивать отчеты
        canAccessEmployees: false, // НЕ видит управление сотрудниками
        canAccessSettings: false,
        canAccessSchedule: true, // Может просматривать график
        
        // Work Orders - No access
        canCreateWorkOrders: false,
        canEditWorkOrders: false,
        canDeleteWorkOrders: false,
        canAssignWorkOrders: false,
        
        // Inventory - VIEW ONLY (не может редактировать!)
        canViewInventory: true,
        canAddInventory: false, // НЕ может добавлять
        canEditInventory: false, // НЕ может редактировать
        canDeleteInventory: false, // НЕ может удалять
        canAdjustStock: false, // НЕ может корректировать остатки
        
        // Equipment - No access
        canViewEquipment: false,
        canAddEquipment: false,
        canEditEquipment: false,
        canDeleteEquipment: false,
        canCreateChecklists: false,
        
        // Reports - View and export financial reports
        canViewFinancialReports: true,
        canViewEfficiencyReports: true, // Может видеть графики производительности
        canExportReports: true,
        
        // Employees - No access
        canViewEmployees: false,
        canAddEmployees: false,
        canEditEmployees: false,
        canDeleteEmployees: false,
        canManageRoles: false,
        canManageUsers: false,
        
        // Schedule - VIEW ONLY (не может редактировать!)
        canViewSchedule: true,
        canEditSchedule: false, // НЕ может редактировать график
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
        canAccessSchedule: true,
        
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
        
        // Schedule - Read only
        canViewSchedule: true,
        canEditSchedule: false,
      };

    default:
      // Default to most restricted (Mechanic)
      return getPermissions(UserRole.MECHANIC);
  }
};
