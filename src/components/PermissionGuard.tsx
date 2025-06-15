
import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  dashboardType: string;
  action?: 'create' | 'read' | 'update' | 'delete' | 'manage';
  fallback?: React.ReactNode;
}

export function PermissionGuard({ 
  children, 
  dashboardType, 
  action = 'read',
  fallback 
}: PermissionGuardProps) {
  const { permissions, hasFullAccess, userRole } = usePermissions();
  
  const currentPermissions = permissions(dashboardType);
  
  const hasPermission = () => {
    switch (action) {
      case 'create':
        return currentPermissions.canCreate;
      case 'read':
        return currentPermissions.canRead;
      case 'update':
        return currentPermissions.canUpdate;
      case 'delete':
        return currentPermissions.canDelete;
      case 'manage':
        return currentPermissions.canManage;
      default:
        return false;
    }
  };

  if (!hasPermission()) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          {hasFullAccess ? (
            `Această funcționalitate nu este disponibilă în dashboard-ul curent.`
          ) : (
            `Nu aveți permisiunea necesară pentru această acțiune. Rolul dumneavoastră (${userRole}) nu permite ${action} în acest context.`
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}

interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AdminOnly({ children, fallback }: AdminOnlyProps) {
  const { hasFullAccess } = usePermissions();

  if (!hasFullAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Alert className="border-red-200 bg-red-50">
        <Shield className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Această funcționalitate este disponibilă doar pentru administratori și management.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}
