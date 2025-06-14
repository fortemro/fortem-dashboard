
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useComandaEdit } from '@/hooks/logistica/useComandaEdit';
import type { Comanda } from '@/types/comanda';

interface ComandaEditModalProps {
  comanda: Comanda | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ComandaEditModal({ comanda, isOpen, onClose, onSuccess }: ComandaEditModalProps) {
  const { updateComanda, loading } = useComandaEdit();
  const [formData, setFormData] = useState({
    nume_transportator: '',
    numar_masina: '',
    nume_sofer: '',
    telefon_sofer: '',
    email_agent_vanzari: ''
  });

  useEffect(() => {
    if (comanda) {
      setFormData({
        nume_transportator: comanda.nume_transportator || '',
        numar_masina: comanda.numar_masina || '',
        nume_sofer: comanda.nume_sofer || '',
        telefon_sofer: comanda.telefon_sofer || '',
        email_agent_vanzari: comanda.email_agent_vanzari || ''
      });
    }
  }, [comanda]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comanda) return;

    const success = await updateComanda(comanda.id, {
      ...formData,
      status: 'in_procesare'
    });

    if (success) {
      onSuccess();
      onClose();
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editează Comanda {comanda?.numar_comanda}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nume_transportator">Nume Transportator *</Label>
            <Input
              id="nume_transportator"
              value={formData.nume_transportator}
              onChange={(e) => handleChange('nume_transportator', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="numar_masina">Număr Mașină *</Label>
            <Input
              id="numar_masina"
              value={formData.numar_masina}
              onChange={(e) => handleChange('numar_masina', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="nume_sofer">Nume Șofer</Label>
            <Input
              id="nume_sofer"
              value={formData.nume_sofer}
              onChange={(e) => handleChange('nume_sofer', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="telefon_sofer">Telefon Șofer</Label>
            <Input
              id="telefon_sofer"
              value={formData.telefon_sofer}
              onChange={(e) => handleChange('telefon_sofer', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="email_agent_vanzari">Email Agent Vânzări</Label>
            <Input
              id="email_agent_vanzari"
              type="email"
              value={formData.email_agent_vanzari}
              onChange={(e) => handleChange('email_agent_vanzari', e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Anulează
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Se salvează...' : 'Salvează și Procesează'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
