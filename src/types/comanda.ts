
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

// Define a simplified product type for what we actually fetch
export type SimplifiedProduct = {
  id: string;
  nume: string;
  dimensiuni: string;
  bucati_per_palet: number;
};

export type Comanda = Tables<'comenzi'> & {
  items?: ItemComanda[];
  calculated_paleti?: number;
  distribuitor?: Tables<'distribuitori'>;
};

export type ComandaInsert = Omit<TablesInsert<'comenzi'>, 'user_id' | 'numar_comanda' | 'id' | 'created_at' | 'updated_at' | 'data_comanda'>;

export type ItemComanda = Tables<'itemi_comanda'> & {
  produs?: SimplifiedProduct;
};

export type ItemComandaInsert = Omit<TablesInsert<'itemi_comanda'>, 'comanda_id' | 'id' | 'created_at' | 'total_item'>;
