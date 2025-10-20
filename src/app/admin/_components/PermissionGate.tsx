'use client';
import { useSession } from 'next-auth/react';

type Permission = 'admin' | 'manager' | 'customer';

interface PermissionGateProps {
  children: React.ReactNode;
  requiredRole: Permission;
  fallback?: React.ReactNode;
}

export default function PermissionGate({ 
  children, 
  requiredRole, 
  fallback = <div className="text-red-600">Недостаточно прав доступа</div>
}: PermissionGateProps) {
  const { data: session } = useSession();
  const userRole = (session as { role?: string } | null)?.role;

  const hasPermission = () => {
    if (!userRole) return false;
    
    const roleHierarchy = {
      customer: 1,
      manager: 2,
      admin: 3
    };
    
    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[requiredRole];
    
    return userLevel >= requiredLevel;
  };

  if (!hasPermission()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export function usePermissions() {
  const { data: session } = useSession();
  const userRole = (session as { role?: string } | null)?.role;

  const hasRole = (role: Permission) => {
    if (!userRole) return false;
    
    const roleHierarchy = {
      customer: 1,
      manager: 2,
      admin: 3
    };
    
    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[role];
    
    return userLevel >= requiredLevel;
  };

  const canManageUsers = () => hasRole('admin');
  const canManageProducts = () => hasRole('manager');
  const canManageCategories = () => hasRole('manager');
  const canViewStats = () => hasRole('manager');

  return {
    userRole,
    hasRole,
    canManageUsers,
    canManageProducts,
    canManageCategories,
    canViewStats
  };
}
