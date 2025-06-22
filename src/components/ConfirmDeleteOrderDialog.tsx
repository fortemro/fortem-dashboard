
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmDeleteOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (motivAnulare?: string) => void;
  isDeleting: boolean;
  comanda: {
    numar_comanda: string;
    numar_paleti: number;
    status: string;
  } | null;
}

export function ConfirmDeleteOrderDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isDeleting, 
  comanda 
}: ConfirmDeleteOrderDialogProps) {
  const [motivAnulare, setMotivAnulare] = useState('');

  if (!comanda) return null;

  const handleClose = () => {
    if (!isDeleting) {
      setMotivAnulare('');
      onClose();
    }
  };

  const handleConfirm = () => {
    console.log('User confirmed order cancellation:', {
      orderId: comanda.numar_comanda,
      reason: motivAnulare.trim()
    });
    onConfirm(motivAnulare.trim() || undefined);
    setMotivAnulare('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Confirmare anulare comandă
          </DialogTitle>
          <DialogDescription>
            Această acțiune va marca comanda ca anulată și va elibera stocul alocat.
            Comanda va rămâne vizibilă în sistem pentru evidență.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold">Detalii comandă:</h4>
            <p><strong>Număr:</strong> {comanda.numar_comanda}</p>
            <p><strong>Paleti:</strong> {comanda.numar_paleti}</p>
            <p><strong>Status:</strong> {comanda.status}</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="motiv">Motiv anulare (opțional)</Label>
            <Textarea
              id="motiv"
              value={motivAnulare}
              onChange={(e) => setMotivAnulare(e.target.value)}
              placeholder="Introduceți motivul anulării comenzii..."
              className="min-h-[80px]"
              disabled={isDeleting}
            />
          </div>
          
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Efecte anulare:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Stocul alocat va fi eliberat automat</li>
                  <li>Comanda va apărea în secțiunea "Anulate"</li>
                  <li>Datele vor fi sincronizate cu Logistica și Producția</li>
                  <li>Statisticile se vor actualiza în toate dashboard-urile</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose} 
            disabled={isDeleting}
          >
            Renunță
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm} 
            disabled={isDeleting}
            className="min-w-[140px]"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Se anulează...
              </>
            ) : (
              'Anulează comanda'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
