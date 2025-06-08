
export interface AdminStats {
  totalOrders: number;
  totalValue: number;
  mzvPerformance: Array<{
    mzv_id: string;
    mzv_name: string;
    orders_count: number;
    total_value: number;
  }>;
  distributorStats: Array<{
    distribuitor_id: string;
    distribuitor_name: string;
    orders_count: number;
    total_value: number;
  }>;
  productStats: Array<{
    produs_id: string;
    produs_name: string;
    total_quantity: number;
    total_value: number;
  }>;
}

export interface ComandaWithItems {
  id: string;
  data_comanda: string;
  mzv_emitent: string;
  distribuitor_id: string;
  status: string;
}

export interface ItemComanda {
  comanda_id: string;
  cantitate: number;
  pret_unitar: number;
  total_item: number;
  produs_id: string;
  produse?: {
    nume: string;
  };
}

export interface ProfileData {
  user_id: string;
  nume: string;
  prenume: string;
}
