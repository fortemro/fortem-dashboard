
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOfflineSync } from "@/hooks/dashboard-executiv/useOfflineSync";
import { Smartphone, Wifi, WifiOff, Download, RefreshCw, Zap, Hand } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

export function MobileOptimizations() {
  const { syncStatus, forcSync } = useOfflineSync();
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [touchSupport, setTouchSupport] = useState(false);
  const [orientation, setOrientation] = useState<string>('portrait');
  const { toast } = useToast();

  useEffect(() => {
    // Detectează suportul pentru touch
    setTouchSupport('ontouchstart' in window || navigator.maxTouchPoints > 0);

    // Monitorizează orientarea
    const handleOrientationChange = () => {
      setOrientation(screen.orientation?.type || 'portrait');
    };

    screen.orientation?.addEventListener('change', handleOrientationChange);

    // PWA Install Prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      screen.orientation?.removeEventListener('change', handleOrientationChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast({
          title: "📱 App Instalată",
          description: "Fortem Dashboard a fost instalată pe dispozitiv",
        });
      }
      
      setInstallPrompt(null);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        toast({
          title: "🔔 Notificări Activate",
          description: "Veți primi alerte pentru evenimente importante",
        });
      } else {
        toast({
          title: "🔕 Notificări Dezactivate",
          description: "Activați notificările în setările browser-ului",
          variant: "destructive",
        });
      }
    }
  };

  const getMobileFeatures = () => [
    {
      name: 'Touch Support',
      status: touchSupport,
      icon: Hand,
      description: touchSupport ? 'Gesturi touch activate' : 'Nu sunt disponibile gesturi touch'
    },
    {
      name: 'PWA Install',
      status: !!installPrompt,
      icon: Download,
      description: installPrompt ? 'Aplicația poate fi instalată' : 'PWA deja instalată sau nu e disponibilă'
    },
    {
      name: 'Offline Mode',
      status: true,
      icon: syncStatus.isOnline ? Wifi : WifiOff,
      description: syncStatus.isOnline ? 'Online - sincronizare activă' : 'Offline - funcționare locală'
    },
    {
      name: 'Notifications',
      status: Notification.permission === 'granted',
      icon: Zap,
      description: Notification.permission === 'granted' ? 'Notificări activate' : 'Notificări dezactivate'
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Status Conexiune și Sync */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {syncStatus.isOnline ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-600" />
            )}
            Status Conexiune
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Conexiune Internet</span>
            <Badge variant={syncStatus.isOnline ? "secondary" : "destructive"}>
              {syncStatus.isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>

          {syncStatus.lastSync && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Ultima Sincronizare</span>
              <span className="text-sm text-gray-600">
                {syncStatus.lastSync.toLocaleTimeString('ro-RO')}
              </span>
            </div>
          )}

          {syncStatus.pendingOperations > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Operații Pending</span>
              <Badge variant="outline">
                {syncStatus.pendingOperations}
              </Badge>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button 
              onClick={forcSync} 
              disabled={syncStatus.syncInProgress || !syncStatus.isOnline}
              size="sm"
              className="flex-1"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncStatus.syncInProgress ? 'animate-spin' : ''}`} />
              {syncStatus.syncInProgress ? 'Se sincronizează...' : 'Sincronizează'}
            </Button>
          </div>

          {!syncStatus.isOnline && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-700">
                <strong>Mod Offline:</strong> Datele sunt salvate local și vor fi sincronizate când conexiunea revine.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Funcționalități Mobile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-blue-600" />
            Optimizări Mobile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {getMobileFeatures().map((feature, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <feature.icon className={`h-4 w-4 ${feature.status ? 'text-green-600' : 'text-gray-400'}`} />
                  <div>
                    <div className="font-medium text-sm">{feature.name}</div>
                    <div className="text-xs text-gray-600">{feature.description}</div>
                  </div>
                </div>
                <Badge variant={feature.status ? "secondary" : "outline"}>
                  {feature.status ? 'ON' : 'OFF'}
                </Badge>
              </div>
            ))}
          </div>

          <div className="pt-2 space-y-2">
            {installPrompt && (
              <Button onClick={handleInstallPWA} className="w-full" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Instalează App-ul
              </Button>
            )}
            
            {Notification.permission === 'default' && (
              <Button 
                onClick={requestNotificationPermission} 
                variant="outline" 
                className="w-full" 
                size="sm"
              >
                <Zap className="h-4 w-4 mr-2" />
                Activează Notificări
              </Button>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              <strong>Device Info:</strong> {orientation.includes('portrait') ? '📱' : '📺'} {orientation}, 
              {touchSupport ? ' Touch enabled' : ' Mouse/Keyboard'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
