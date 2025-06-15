
import { useProfile } from './useProfile';

export type UserRole = 'MZV' | 'Admin' | 'Manager' | 'User' | 'logistica' | 'productie' | 'management' | 'centralizator';

export interface Permission {
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canManage: boolean;
}

export function usePermissions() {
  const { profile } = useProfile();
  
  const hasFullAccess = (role?: string): boolean => {
    return role === 'Admin' || role === 'management';
  };

  const getPermissionsForDashboard = (dashboardType: string): Permission => {
    const userRole = profile?.rol;
    
    // Admin și management au drepturi complete peste tot
    if (hasFullAccess(userRole)) {
      return {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true,
        canManage: true
      };
    }

    // Permisiuni specifice pe rol pentru dashboard-ul propriu
    const isOwnDashboard = getDashboardForRole(userRole) === dashboardType;
    
    if (isOwnDashboard) {
      return {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: userRole !== 'MZV', // MZV nu poate șterge
        canManage: false
      };
    }

    // Readonly pentru alte dashboard-uri
    return {
      canCreate: false,
      canRead: true,
      canUpdate: false,
      canDelete: false,
      canManage: false
    };
  };

  const getDashboardForRole = (role?: string): string => {
    switch (role) {
      case 'Admin':
        return '/admin-dashboard';
      case 'management':
        return '/dashboard-executiv';
      case 'logistica':
        return '/portal-logistica';
      case 'productie':
        return '/productie';
      case 'centralizator':
        return '/centralizator-comenzi';
      case 'MZV':
      case 'Manager':
      case 'User':
      default:
        return '/';
    }
  };

  const canAccessDashboard = (dashboardPath: string): boolean => {
    const userRole = profile?.rol;
    
    // Admin și management pot accesa orice dashboard
    if (hasFullAccess(userRole)) {
      return true;
    }

    // Verifică dacă utilizatorul poate accesa dashboard-ul specific
    const allowedDashboard = getDashboardForRole(userRole);
    return dashboardPath === allowedDashboard || dashboardPath === '/';
  };

  return {
    permissions: getPermissionsForDashboard,
    hasFullAccess: hasFullAccess(profile?.rol),
    getDashboardForRole,
    canAccessDashboard,
    userRole: profile?.rol as UserRole
  };
}
