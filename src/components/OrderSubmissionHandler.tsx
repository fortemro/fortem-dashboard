import { useCallback } from 'react';
import { useComandaCreate } from '@/hooks/comenzi/useComandaCreate';
import { useToast } from '@/components/ui/use-toast';
import { ItemComanda } from '@/data-types';

interface UseOrderSubmissionProps {
  items: Partial<ItemComanda>[];
  onSuccess: (data: any) => void;
}

export function useOrderSubmission({
  items,
  onSuccess,
}: UseOrderSubmissionProps) {
  const { createComanda } = useComandaCreate();
  const { toast } = useToast();

  const submitOrder = useCallback(async (formData: any) => {
    try {
      // Apelăm funcția de creare cu datele formularului și itemii
      const result = await createComanda(formData, items);

      toast({
        title: 'Succes!',
        description: `Comanda #${result.numar_comanda} a fost creată cu succes.`,
        variant: 'default',
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
  }, [items, createComanda, toast, onSuccess]);

  return { submitOrder };
}