
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { User, Phone, MapPin, Calendar } from 'lucide-react';

export function ProfileForm() {
  const { profile, createProfile, updateProfile, loading } = useProfile();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nume: profile?.nume || '',
    prenume: profile?.prenume || '',
    telefon: profile?.telefon || '',
    adresa: profile?.adresa || '',
    oras: profile?.oras || '',
    cod_postal: profile?.cod_postal || '',
    tara: profile?.tara || 'România',
    data_nasterii: profile?.data_nasterii || ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label htmlFor="cod_postal">Cod Poștal</Label>
              <Input
                id="cod_postal"
                name="cod_postal"
                value={formData.cod_postal}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tara">Țară</Label>
              <Input
                id="tara"
                name="tara"
                value={formData.tara}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_nasterii">
              <Calendar className="h-4 w-4 inline mr-1" />
              Data Nașterii
            </Label>
            <Input
              id="data_nasterii"
              name="data_nasterii"
              type="date"
              value={formData.data_nasterii}
              onChange={handleInputChange}
            />
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Se salvează...' : profile ? 'Actualizează Profilul' : 'Creează Profilul'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
