
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useComandaEdit() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateComandaTransport = async (comandaId: string, awb: string, numeTransportator: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('comenzi')
        .update({
          awb: awb.trim() || null,
          nume_transportator: numeTransportator.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', comandaId);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Detaliile de transport au fost actualizate"
      });

      return true;
    } catch (error) {
      console.error('Error updating comanda transport details:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut actualiza detaliile de transport",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateComandaTransport,
    loading
  };
}
