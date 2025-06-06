
import { useComenzi } from '@/hooks/useComenzi';
import { useToast } from '@/hooks/use-toast';
import { useFormValidation } from './FormValidation';

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
      await createComanda(
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

      toast({
        title: "Succes",
        description: "Comanda a fost creată cu succes cu statusul 'In asteptare'"
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
