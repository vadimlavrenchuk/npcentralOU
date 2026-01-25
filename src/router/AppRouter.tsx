import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout';
import ProtectedRoute from '../components/ProtectedRoute';
import RoleBasedRoute from '../components/RoleBasedRoute';
import Login from '../pages/Login/Login';
import UserManagement from '../pages/Employees/UserManagement';
import { 
  Dashboard, 
  WorkOrders, 
  Equipment, 
  Inventory,
  Reports,
  Employees
} from '../pages';
import { UserRole } from '../types/permissions';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public Route - Login */}
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes */}
      <Route element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        {/* Dashboard - All roles */}
        <Route index element={<Dashboard />} />
        
        {/* Work Orders - Not for Accountant */}
        <Route 
          path="work-orders" 
          element={
            <RoleBasedRoute allowedRoles={[UserRole.ADMIN, UserRole.CHIEF_MECHANIC, UserRole.MECHANIC]}>
              <WorkOrders />
            </RoleBasedRoute>
          } 
        />
        
        {/* Inventory - All roles (permissions differ inside) */}
        <Route path="inventory" element={<Inventory />} />
        
        {/* Equipment - Not for Accountant */}
        <Route 
          path="equipment" 
          element={
            <RoleBasedRoute allowedRoles={[UserRole.ADMIN, UserRole.CHIEF_MECHANIC, UserRole.MECHANIC]}>
              <Equipment />
            </RoleBasedRoute>
          } 
        />
        
        {/* Reports - Not for Mechanic */}
        <Route 
          path="reports" 
          element={
            <RoleBasedRoute allowedRoles={[UserRole.ADMIN, UserRole.CHIEF_MECHANIC, UserRole.ACCOUNTANT]}>
              <Reports />
            </RoleBasedRoute>
          } 
        />
        
        {/* Employees - Admin and Chief Mechanic only */}
        <Route 
          path="employees" 
          element={
            <RoleBasedRoute allowedRoles={[UserRole.ADMIN, UserRole.CHIEF_MECHANIC]}>
              <Employees />
            </RoleBasedRoute>
          } 
        />
        
        {/* User Management - Admin only */}
        <Route 
          path="user-management" 
          element={
            <RoleBasedRoute allowedRoles={[UserRole.ADMIN]}>
              <UserManagement />
            </RoleBasedRoute>
          } 
        />
        <Route path="users" element={<Navigate to="/employees" replace />} />
        
        {/* 404 - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
