
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProfile } from './useProfile';
import { usePermissions } from './usePermissions';

export function useRoleBasedRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, loading } = useProfile();
  const { getDashboardForRole, canAccessRoute } = usePermissions();

  useEffect(() => {
    if (loading || !profile) return;

    const currentPath = location.pathname;
    const targetDashboard = getDashboardForRole(profile.rol);

    // Verifică dacă utilizatorul poate accesa ruta curentă
    if (!canAccessRoute(currentPath)) {
      console.log(`Redirecting from ${currentPath} to ${targetDashboard} for role ${profile.rol}`);
      navigate(targetDashboard, { replace: true });
      return;
    }

    // Pentru prima autentificare pe ruta root, redirecționează către dashboard-ul corespunzător DOAR pentru rolurile cu dashboard specializat
    if (currentPath === '/' && targetDashboard !== '/' && profile.rol !== 'MZV') {
      navigate(targetDashboard, { replace: true });
    }
  }, [profile, loading, location.pathname, navigate, getDashboardForRole, canAccessRoute]);

  return {
    isRedirecting: loading,
    targetDashboard: profile ? getDashboardForRole(profile.rol) : '/'
  };
}
