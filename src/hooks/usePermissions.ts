import { useAuth } from '../context/AuthContext';
import type { Permissions } from '../types/permissions';
import { UserRole } from '../types/permissions';

export const usePermissions = () => {
  const { permissions, userProfile } = useAuth();
  
  return {
    permissions: permissions || null,
    userRole: userProfile?.role || null,
    isAdmin: userProfile?.role === UserRole.ADMIN,
    isChiefMechanic: userProfile?.role === UserRole.CHIEF_MECHANIC,
    isAccountant: userProfile?.role === UserRole.ACCOUNTANT,
    isMechanic: userProfile?.role === UserRole.MECHANIC,
    
    // Helper function to check specific permission
    can: (permission: keyof Permissions): boolean => {
      return permissions?.[permission] || false;
    },
    
    // Helper to check if user has any of the given roles
    hasRole: (roles: UserRole[]): boolean => {
      return userProfile ? roles.includes(userProfile.role) : false;
    }
  };
};
