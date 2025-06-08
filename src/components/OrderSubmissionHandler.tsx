import { useCallback } from 'react';
import { useComandaCreate } from '@/hooks/comenzi/useComandaCreate';
import { useToast } from '@/components/ui/use-toast';
import { Produs, ItemComanda } from '@/data-types';

interface UseOrderSubmissionProps {
  produse: Produs[];
  items: Partial<ItemComanda>[];
  onSuccess: (data: any) => void;
}

export function useOrderSubmission({
  produse,
  items,
  onSuccess,
}: UseOrderSubmissionProps) {
  const { createComanda } = useComandaCreate();
  const { toast } = useToast();

  const submitOrder = useCallback(async (formData: any) => {
    try {
      // Completează prețurile itemilor înainte de a trimite comanda
      const itemsWithPrices = items.map(item => {
        const produsDetalii = produse.find(p => p.id === item.produs_id);
        return {
          ...item,
          pret_unitar: produsDetalii?.pret_unitar || 0, // Sau alt preț dinamic
        };
      });
      
      // REZOLVARE: Apelăm funcția `createComanda` cu cele două argumente pe care le așteaptă
      const result = await createComanda(formData, itemsWithPrices);

      toast({
        title: 'Succes!',
        description: `Comanda #${result.numar_comanda} a fost creată cu succes.`,
        variant: 'success',
      });

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error: any) {
      console.error("Eroare la trimiterea comenzii:", error);
      toast({
        title: 'Eroare la trimiterea comenzii',
        description: error.message || 'A apărut o problemă. Vă rugăm să reîncercați.',
        variant: 'destructive',
      });
    }
  }, [items, produse, createComanda, toast, onSuccess]);

  return { submitOrder };
}