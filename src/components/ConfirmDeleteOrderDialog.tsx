
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDeleteOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
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
  if (!comanda) return null;

  const handleClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Confirmare ștergere comandă
          </DialogTitle>
          <DialogDescription>
            Această acțiune va șterge definitiv comanda și nu poate fi anulată.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold">Detalii comandă:</h4>
            <p><strong>Număr:</strong> {comanda.numar_comanda}</p>
            <p><strong>Paleti:</strong> {comanda.numar_paleti}</p>
            <p><strong>Status:</strong> {comanda.status}</p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Atenție:</p>
                <p>Ștergerea acestei comenzi va elibera instant cantitățile de produse alocate, 
                   iar stocul disponibil se va actualiza în toate portalurile aplicației.</p>
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
            Anulează
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm} 
            disabled={isDeleting}
          >
            {isDeleting ? 'Se șterge...' : 'Șterge comanda'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
