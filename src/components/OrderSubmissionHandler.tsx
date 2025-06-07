
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
  onSuccess: (orderData: any) => void;
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
      console.log('Attempting to create comanda with distribuitor_id:', distribuitorId);
      
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

      console.log('Comanda created successfully, preparing success data');

      // Calculează totalul comenzii
      const totalComanda = items.reduce((total, item) => total + (item.cantitate * item.pret_unitar), 0);

      // Găsește distribuitor-ul pentru numele acestuia
      const distribuitor = produse.find(p => p.distribuitor_id === distribuitorId);
      const distribuitorNume = distribuitor?.distribuitor?.nume_companie || 'Necunoscut';

      // Pregătește datele pentru modal-ul de succes
      const orderData = {
        id: comanda.id,
        numar_comanda: comanda.numar_comanda,
        distribuitor_nume: distribuitorNume,
        oras_livrare: data.oras_livrare,
        adresa_livrare: data.adresa_livrare,
        total_comanda: totalComanda,
        items: items.map(item => ({
          nume_produs: item.nume_produs,
          cantitate: item.cantitate,
          pret_unitar: item.pret_unitar,
          total_item: item.cantitate * item.pret_unitar
        }))
      };

      onSuccess(orderData);
    } catch (error) {
      console.error('Error creating comanda:', error);
      
      let errorMessage = "A apărut o eroare la crearea comenzii";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String(error.message);
      }
      
      toast({
        title: "Eroare",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return { submitOrder };
}
