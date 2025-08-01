
import { useProfile } from './useProfile';
import { useAuth } from './useAuth';

export type UserRole = 'MZV' | 'admin' | 'management' | 'logistica' | 'productie' | 'centralizator';

export interface Permission {
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canManage: boolean;
}

export function usePermissions() {
  const { profile } = useProfile();
  const { user } = useAuth();
  
  const hasFullAccess = (role?: string): boolean => {
    return role === 'admin' || role === 'management';
  };

  // Verifică dacă utilizatorul este super-admin (prin email sau rol)
  const isSuperUser = (): boolean => {
    const userRole = profile?.rol;
    const userEmail = user?.email;
    
    // Email-ul specific pentru super-admin sau rolurile cu acces complet
    return userEmail === 'lucian.cebuc@fortem.ro' || 
           userRole === 'admin' || 
           userRole === 'management';
  };

  // Verifică dacă utilizatorul poate schimba rolul
  const canChangeRole = (): boolean => {
    return isSuperUser();
  };

  // Rutele de bază accesibile tuturor rolurilor autentificate
  const basicRoutes = ['/', '/produse', '/comanda', '/comenzile-mele', '/profile'];

  // Rutele specializate pe rol
  const specializedDashboards = {
    'admin': ['/admin-dashboard', '/admin/validare-preturi'],
    'management': ['/dashboard-executiv', '/panou-vanzari', '/portal-logistica', '/productie'],
    'logistica': ['/portal-logistica'],
    'productie': ['/productie'],
    'centralizator': ['/centralizator-comenzi']
  };

  const canAccessRoute = (routePath: string): boolean => {
    const userRole = profile?.rol;
    
    // Toți utilizatorii autentificați pot accesa rutele de bază
    if (basicRoutes.includes(routePath)) {
      return true;
    }

    // Super-userii pot accesa orice rută pentru testare
    if (isSuperUser()) {
      return true;
    }

    // Admin și management pot accesa orice rută
    if (hasFullAccess(userRole)) {
      return true;
    }

    // Verifică accesul la dashboard-urile specializate
    if (userRole && specializedDashboards[userRole]) {
      return specializedDashboards[userRole].includes(routePath);
    }

    return false;
  };

  const getPermissionsForDashboard = (dashboardType: string): Permission => {
    const userRole = profile?.rol;
    
    // Super-userii și Admin/management au drepturi complete peste tot
    if (isSuperUser() || hasFullAccess(userRole)) {
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
      case 'admin':
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
      default:
        return '/';
    }
  };

  const canAccessDashboard = (dashboardPath: string): boolean => {
    const userRole = profile?.rol;
    
    // Super-userii pot accesa orice dashboard
    if (isSuperUser()) {
      return true;
    }

    // Admin și management pot accesa orice dashboard
    if (hasFullAccess(userRole)) {
      return true;
    }

    // Pentru dashboard-urile specializate, verifică permisiunile specifice
    const allowedDashboard = getDashboardForRole(userRole);
    return dashboardPath === allowedDashboard || dashboardPath === '/';
  };

  return {
    permissions: getPermissionsForDashboard,
    hasFullAccess: hasFullAccess(profile?.rol),
    isSuperUser,
    canChangeRole,
    getDashboardForRole,
    canAccessDashboard,
    canAccessRoute,
    userRole: profile?.rol as UserRole
  };
}
