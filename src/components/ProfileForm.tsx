
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProfile } from '@/hooks/useProfile';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';
import { User, Phone, MapPin, UserCog, Shield, AlertTriangle } from 'lucide-react';
import { PermissionGuard } from './PermissionGuard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function ProfileForm() {
  const { profile, createProfile, updateProfile, loading } = useProfile();
  const { hasFullAccess, isSuperUser, canChangeRole } = usePermissions();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nume: profile?.nume || '',
    prenume: profile?.prenume || '',
    nume_complet: profile?.nume_complet || '',
    telefon: profile?.telefon || '',
    adresa: profile?.adresa || '',
    oras: profile?.oras || '',
    judet: profile?.judet || '',
    rol: profile?.rol || 'MZV'
  });
  const [submitting, setSubmitting] = useState(false);
  const [pendingRoleChange, setPendingRoleChange] = useState<string | null>(null);

  // Actualizează formData când se încarcă profilul
  useEffect(() => {
    if (profile) {
      setFormData({
        nume: profile.nume || '',
        prenume: profile.prenume || '',
        nume_complet: profile.nume_complet || '',
        telefon: profile.telefon || '',
        adresa: profile.adresa || '',
        oras: profile.oras || '',
        judet: profile.judet || '',
        rol: profile.rol || 'MZV'
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: value
      };
      
      // Actualizează automat nume_complet când se schimbă numele sau prenumele
      if (name === 'nume' || name === 'prenume') {
        const nume = name === 'nume' ? value : prev.nume;
        const prenume = name === 'prenume' ? value : prev.prenume;
        updated.nume_complet = `${nume} ${prenume}`.trim();
      }
      
      return updated;
    });
  };

  const handleRoleChange = (value: string) => {
    if (canChangeRole()) {
      setPendingRoleChange(value);
    } else {
      toast({
        title: "Acces restricționat",
        description: "Nu aveți permisiunea să schimbați rolul.",
        variant: "destructive",
      });
    }
  };

  const confirmRoleChange = () => {
    if (pendingRoleChange) {
      setFormData(prev => ({
        ...prev,
        rol: pendingRoleChange
      }));
      setPendingRoleChange(null);
      
      toast({
        title: "Rol actualizat",
        description: `Rolul a fost schimbat în ${pendingRoleChange}. Salvați profilul pentru a aplica modificările.`,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (profile) {
        await updateProfile(formData);
        toast({
          title: "Profil actualizat",
          description: "Profilul tău a fost actualizat cu succes.",
        });
        
        // Dacă s-a schimbat rolul, reîncarcă pagina pentru a aplica noile permisiuni
        if (formData.rol !== profile.rol) {
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } else {
        await createProfile(formData);
        toast({
          title: "Profil creat",
          description: "Profilul tău a fost creat cu succes.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: error.message || "A apărut o eroare la salvarea profilului.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {profile ? 'Actualizează Profilul' : 'Completează Profilul'}
          {isSuperUser() && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Shield className="h-3 w-3 mr-1" />
              Super Admin
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {profile 
            ? 'Modifică informațiile din profilul tău.' 
            : 'Completează informațiile pentru a-ți crea profilul.'
          }
          {canChangeRole() && (
            <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-200">
              <div className="flex items-center text-blue-800 text-sm">
                <Shield className="h-4 w-4 mr-1" />
                Ca super-admin, poți schimba rolul pentru testare și administrare.
              </div>
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nume">Nume *</Label>
              <Input
                id="nume"
                name="nume"
                value={formData.nume}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prenume">Prenume *</Label>
              <Input
                id="prenume"
                name="prenume"
                value={formData.prenume}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nume_complet">Nume Complet</Label>
            <Input
              id="nume_complet"
              name="nume_complet"
              value={formData.nume_complet}
              onChange={handleInputChange}
              placeholder="Se completează automat"
              readOnly
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rol" className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              Rol
              {canChangeRole() && (
                <Badge variant="outline" className="text-xs">
                  Modificabil
                </Badge>
              )}
            </Label>
            {canChangeRole() ? (
              <Select value={formData.rol} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selectează rolul" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MZV">MZV</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                  <SelectItem value="logistica">Logistică</SelectItem>
                  <SelectItem value="productie">Producție</SelectItem>
                  <SelectItem value="centralizator">Centralizator</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={formData.rol}
                readOnly
                className="bg-gray-50"
                placeholder="Rolul nu poate fi modificat"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefon">
              <Phone className="h-4 w-4 inline mr-1" />
              Telefon
            </Label>
            <Input
              id="telefon"
              name="telefon"
              type="tel"
              value={formData.telefon}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adresa">
              <MapPin className="h-4 w-4 inline mr-1" />
              Adresă
            </Label>
            <Input
              id="adresa"
              name="adresa"
              value={formData.adresa}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="oras">Oraș</Label>
              <Input
                id="oras"
                name="oras"
                value={formData.oras}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="judet">Județ</Label>
              <Input
                id="judet"
                name="judet"
                value={formData.judet}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Se salvează...' : profile ? 'Actualizează Profilul' : 'Creează Profilul'}
          </Button>
        </form>

        {/* Dialog de confirmare pentru schimbarea rolului */}
        <AlertDialog open={!!pendingRoleChange} onOpenChange={() => setPendingRoleChange(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Confirmare Schimbare Rol
              </AlertDialogTitle>
              <AlertDialogDescription>
                Ești pe cale să schimbi rolul în <strong>{pendingRoleChange}</strong>. 
                Această acțiune va schimba permisiunile și dashboard-ul curent.
                <br /><br />
                Continui cu schimbarea?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPendingRoleChange(null)}>
                Anulează
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmRoleChange}>
                Confirmă Schimbarea
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
