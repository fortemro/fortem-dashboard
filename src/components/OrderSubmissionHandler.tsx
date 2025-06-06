
import { useComenzi } from '@/hooks/useComenzi';
import { useToast } from '@/hooks/use-toast';
import { useFormValidation } from './FormValidation';
import { supabase } from '@/integrations/supabase/client';

interface ItemComanda {
  produs_id: string;
  nume_produs: string;
  cantitate: number;
  pret_unitar: number;
}

interface UseOrderSubmissionProps {
  produse: any[];
  items: ItemComanda[];
  onSuccess: () => void;
}

export function useOrderSubmission({ produse, items, onSuccess }: UseOrderSubmissionProps) {
  const { createComanda } = useComenzi();
  const { toast } = useToast();
  const { validateForm } = useFormValidation();

  const submitOrder = async (data: any) => {
    console.log('Form submitted with data:', data);
    console.log('Items:', items);

    if (!validateForm(data, items)) {
      return;
    }

    // Folosește distribuitor_id din primul produs pentru comandă (toate produsele sunt de la Fortem)
    const distribuitorId = produse.length > 0 ? produse[0].distribuitor_id : null;
    if (!distribuitorId) {
      toast({
        title: "Eroare", 
        description: "Nu s-a putut determina distribuitor_id pentru comandă",
        variant: "destructive"
      });
      return;
    }

    try {
      const comanda = await createComanda(
        {
          distribuitor_id: distribuitorId,
          oras_livrare: data.oras_livrare,
          adresa_livrare: data.adresa_livrare,
          judet_livrare: data.judet_livrare || '',
          telefon_livrare: data.telefon_livrare || '',
          observatii: data.observatii || '',
          numar_paleti: data.numar_paleti || 0
        },
        items.map(item => ({
          produs_id: item.produs_id,
          cantitate: item.cantitate,
          pret_unitar: item.pret_unitar
        }))
      );

      // Calculează totalul comenzii
      const totalComanda = items.reduce((total, item) => total + (item.cantitate * item.pret_unitar), 0);

      // Găsește distribuitor-ul pentru numele acestuia
      const distribuitor = produse.find(p => p.distribuitor_id === distribuitorId);
      const distribuitorNume = distribuitor?.distribuitor?.nume_companie || 'Necunoscut';

      // Trimite emailul automat după crearea cu succes a comenzii
      try {
        const { error: emailError } = await supabase.functions.invoke('send-order-email', {
          body: {
            comandaId: comanda.id,
            numarul_comanda: comanda.numar_comanda,
            distribuitor: distribuitorNume,
            oras_livrare: data.oras_livrare,
            adresa_livrare: data.adresa_livrare,
            telefon_livrare: data.telefon_livrare || '',
            items: items.map(item => ({
              nume_produs: item.nume_produs,
              cantitate: item.cantitate,
              pret_unitar: item.pret_unitar,
              total_item: item.cantitate * item.pret_unitar
            })),
            total_comanda: totalComanda,
            data_comanda: comanda.data_comanda || new Date().toISOString()
          }
        });

        if (emailError) {
          console.error('Error sending email:', emailError);
          // Nu oprim procesul dacă emailul nu se trimite, doar logăm eroarea
        } else {
          console.log('Order email sent successfully');
        }
      } catch (emailError) {
        console.error('Error invoking email function:', emailError);
        // Nu oprim procesul dacă emailul nu se trimite
      }

      toast({
        title: "Succes",
        description: "Comanda a fost creată cu succes și emailul de notificare a fost trimis"
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating comanda:', error);
      toast({
        title: "Eroare",
        description: error instanceof Error ? error.message : "A apărut o eroare la crearea comenzii",
        variant: "destructive"
      });
    }
  };

  return { submitOrder };
}
