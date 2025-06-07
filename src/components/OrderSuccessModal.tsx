
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Copy, Eye, Mail, Plus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    id: string;
    numar_comanda: string;
    distribuitor_nume: string;
    oras_livrare: string;
    adresa_livrare: string;
    total_comanda: number;
    items: Array<{
      nume_produs: string;
      cantitate: number;
      pret_unitar: number;
      total_item: number;
    }>;
  };
}

export function OrderSuccessModal({ isOpen, onClose, orderData }: OrderSuccessModalProps) {
  const [emailRecipients, setEmailRecipients] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSendEmail = async () => {
    if (!emailRecipients.trim()) {
      toast({
        title: "Eroare",
        description: "Te rugăm să introduci cel puțin o adresă de email",
        variant: "destructive"
      });
      return;
    }

    setSendingEmail(true);
    try {
      const { error } = await supabase.functions.invoke('send-order-email', {
        body: {
          comandaId: orderData.id,
          numarul_comanda: orderData.numar_comanda,
          distribuitor: orderData.distribuitor_nume,
          oras_livrare: orderData.oras_livrare,
          adresa_livrare: orderData.adresa_livrare,
          items: orderData.items,
          total_comanda: orderData.total_comanda,
          data_comanda: new Date().toISOString(),
          recipients: emailRecipients.split(',').map(email => email.trim()),
          custom_message: emailMessage
        }
      });

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Emailul a fost trimis cu succes"
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Eroare",
        description: "A apărut o eroare la trimiterea emailului",
        variant: "destructive"
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleDuplicateOrder = () => {
    // Store order data in localStorage for duplication
    localStorage.setItem('duplicateOrderData', JSON.stringify({
      distribuitor_nume: orderData.distribuitor_nume,
      oras_livrare: orderData.oras_livrare,
      adresa_livrare: orderData.adresa_livrare,
      items: orderData.items.map(item => ({
        ...item,
        cantitate: 0 // Reset quantities for new order
      }))
    }));
    
    onClose();
    navigate('/comanda');
    
    toast({
      title: "Template creat",
      description: "Poți modifica cantitățile și plasa o comandă nouă"
    });
  };

  const handleViewOrder = () => {
    onClose();
    navigate('/comenzile-mele');
  };

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderData.numar_comanda);
    toast({
      title: "Copiat",
      description: "Numărul comenzii a fost copiat în clipboard"
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-6 w-6" />
            Comandă Creată cu Succes!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalii Comandă</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Număr Comandă:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-blue-600">{orderData.numar_comanda}</span>
                  <Button variant="ghost" size="sm" onClick={copyOrderNumber}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Distribuitor:</span>
                <span>{orderData.distribuitor_nume}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Livrare:</span>
                <span>{orderData.oras_livrare}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Comandă:</span>
                <span className="text-xl font-bold text-green-600">
                  {orderData.total_comanda.toFixed(2)} RON
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Email Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Trimite Comandă prin Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="recipients">Destinatari (separați prin virgulă)</Label>
                <Input
                  id="recipients"
                  placeholder="exemplu@email.com, alt@email.com"
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="message">Mesaj suplimentar (opțional)</Label>
                <Textarea
                  id="message"
                  placeholder="Adaugă un mesaj personalizat..."
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={3}
                />
              </div>
              <Button 
                onClick={handleSendEmail} 
                disabled={sendingEmail}
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                {sendingEmail ? 'Se trimite...' : 'Trimite Email'}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button onClick={handleViewOrder} variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Vezi Comanda
            </Button>
            <Button onClick={handleDuplicateOrder} variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              Comandă Similară
            </Button>
            <Button onClick={() => { onClose(); navigate('/produse'); }} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Comandă Nouă
            </Button>
          </div>

          {/* Main Action */}
          <Button onClick={handleViewOrder} className="w-full" size="lg">
            <ArrowRight className="h-4 w-4 mr-2" />
            Mergi la Comenzile Mele
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
