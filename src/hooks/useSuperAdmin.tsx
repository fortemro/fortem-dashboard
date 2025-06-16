
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';
import { useToast } from './use-toast';

export function useSuperAdmin() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();

  const isSuperAdmin = (): boolean => {
    const userEmail = user?.email;
    const userRole = profile?.rol;
    
    return userEmail === 'lucian.cebuc@fortem.ro' || 
           userRole === 'admin' || 
           userRole === 'management';
  };

  const logSuperAdminAction = (action: string, details?: any) => {
    if (isSuperAdmin()) {
      console.log('🔧 Super Admin Action:', {
        action,
        user: user?.email,
        role: profile?.rol,
        timestamp: new Date().toISOString(),
        details
      });
    }
  };

  const notifySuperAdminAction = (message: string) => {
    if (isSuperAdmin()) {
      toast({
        title: "Super Admin",
        description: message,
        duration: 3000,
      });
    }
  };

  const canBypassRestrictions = (): boolean => {
    return isSuperAdmin();
  };

  return {
    isSuperAdmin,
    logSuperAdminAction,
    notifySuperAdminAction,
    canBypassRestrictions
  };
}
