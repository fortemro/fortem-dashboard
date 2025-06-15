
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ResendEmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  comanda: any;
}

export function ResendEmailDialog({ isOpen, onClose, comanda }: ResendEmailDialogProps) {
  const [recipients, setRecipients] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const recipientsList = recipients
        ? recipients.split(',').map(email => email.trim()).filter(email => email)
        : undefined;

      const { data, error } = await supabase.functions.invoke('resend-order-email', {
        body: { 
          comandaId: comanda.id,
          recipients: recipientsList,
          custom_message: customMessage || undefined
        }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        toast({
          title: "Email retrimis cu succes",
          description: `Email-ul pentru comanda ${comanda.numar_comanda} a fost retrimis către: ${data.sentTo.join(', ')}`
        });
        onClose();
        setRecipients('');
        setCustomMessage('');
      } else {
        throw new Error(data.error || 'Eroare necunoscută');
      }
    } catch (error: any) {
      console.error('Error resending email:', error);
      toast({
        title: "Eroare la retrimitererea email-ului",
        description: error.message || "Nu s-a putut retrimite email-ul",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleClose = () => {
    if (!isResending) {
      onClose();
      setRecipients('');
      setCustomMessage('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Retrimite Email Comandă</DialogTitle>
          <DialogDescription>
            Retrimite email-ul pentru comanda #{comanda?.numar_comanda}. 
            Lasă câmpul destinatari gol pentru a trimite la adresa implicită (lucian.cebuc@fortem.ro).
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="recipients">
              Destinatari (opțional)
            </Label>
            <Input
              id="recipients"
              placeholder="email1@exemplu.ro, email2@exemplu.ro"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              disabled={isResending}
            />
            <p className="text-xs text-gray-500">
              Separă multiple adrese cu virgulă. Lasă gol pentru adresa implicită.
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="custom-message">
              Mesaj personalizat (opțional)
            </Label>
            <Textarea
              id="custom-message"
              placeholder="Adaugă un mesaj personalizat pentru retrimitere..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              disabled={isResending}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isResending}>
            Anulează
          </Button>
          <Button onClick={handleResendEmail} disabled={isResending}>
            {isResending ? 'Se retrimite...' : 'Retrimite Email'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
