import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import type { Permissions } from '../../types/permissions';

interface CanProps {
  perform: keyof Permissions;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component to conditionally render based on permissions
 * 
 * Usage:
 * <Can perform="canAddInventory">
 *   <Button>Add Item</Button>
 * </Can>
 */
export const Can: React.FC<CanProps> = ({ perform, children, fallback = null }) => {
  const { can } = usePermissions();
  
  return can(perform) ? <>{children}</> : <>{fallback}</>;
};
