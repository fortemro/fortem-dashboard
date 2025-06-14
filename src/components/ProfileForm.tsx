
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { User, Phone, MapPin, Calendar, UserCog } from 'lucide-react';

export function ProfileForm() {
  const { profile, createProfile, updateProfile, loading } = useProfile();
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

  const handleRolChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      rol: value
    }));
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
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2" />
          {profile ? 'Actualizează Profilul' : 'Completează Profilul'}
        </CardTitle>
        <CardDescription>
          {profile 
            ? 'Modifică informațiile din profilul tău.' 
            : 'Completează informațiile pentru a-ți crea profilul.'
          }
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
            <Label htmlFor="rol">
              <UserCog className="h-4 w-4 inline mr-1" />
              Rol
            </Label>
            <Select value={formData.rol} onValueChange={handleRolChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selectează rolul" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MZV">MZV</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="User">User</SelectItem>
                <SelectItem value="logistica">Logistică</SelectItem>
                <SelectItem value="productie">Producție</SelectItem>
                <SelectItem value="management">Management</SelectItem>
              </SelectContent>
            </Select>
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
      </CardContent>
    </Card>
  );
}
