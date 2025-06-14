
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useComandaEdit() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateComanda = async (comandaId: string, updateData: any) => {
    setLoading(true);
    try {
      console.log('Updating comanda:', comandaId, 'with data:', updateData);
      
      const { error } = await supabase
        .from('comenzi')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', comandaId);

      if (error) {
        console.error('Error updating comanda:', error);
        throw error;
      }

      toast({
        title: "Comandă actualizată",
        description: "Detaliile comenzii au fost actualizate cu succes"
      });

      return true;
    } catch (error) {
      console.error('Error updating comanda:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut actualiza comanda",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateComanda,
    loading
  };
}
