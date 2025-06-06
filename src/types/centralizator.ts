
export interface ComandaDetaliata {
  id: string;
  numar_comanda: string;
  data_comanda: string;
  status: string;
  oras_livrare: string;
  adresa_livrare: string;
  judet_livrare: string;
  telefon_livrare: string;
  observatii: string;
  numar_paleti: number;
  mzv_emitent: string;
  distribuitor: {
    nume_companie: string;
    oras: string;
    judet: string;
    persoana_contact: string;
    telefon: string;
  };
  items: Array<{
    id: string;
    cantitate: number;
    pret_unitar: number;
    total_item: number;
    produs: {
      nume: string;
      cod_produs: string;
      dimensiuni: string;
    };
  }>;
  total_comanda: number;
}
