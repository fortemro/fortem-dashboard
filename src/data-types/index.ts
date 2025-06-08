// src/data-types/index.ts

// Tip simplificat, dar cu toate câmpurile așteptate de UI ca opționale
export interface Produs {
    id: string;
    nume: string;
    descriere?: string;
    imagine_url?: string;
    categorie?: string;
    // Păstrăm toate câmpurile ca opționale pentru a satisface compilatorul
    pret_unitar?: number;
    activ?: boolean;
    cod_produs?: string;
    greutate_per_bucata?: number;
    bucati_per_bax?: number;
    // etc... adaugă orice alt câmp specific pe care l-ai putea avea în DB
}

export interface ItemComanda {
    id?: string;
    comanda_id: string;
    produs_id: string;
    cantitate: number; // Cantitatea per produs selectat
}

export interface Comanda {
    id: string;
    created_at: string;
    user_id: string;
    distribuitor_id: string;
    data_comanda: string;
    status: string;
    numar_comanda: string;
    adresa_livrare: string;
    oras_livrare: string;
    judet_livrare: string;
    telefon_livrare: string;
    observatii?: string;
    // Câmpurile cheie pentru noul model de calcul
    numar_paleti: number;
    pret_per_palet: number; // Adăugăm acest câmp
    total_comanda: number;
    // Câmpuri standard
    mzv_emitent: string;
    awb?: string;
    document_url?: string;
    // Relații
    distribuitori?: any;
    itemi_comanda?: ItemComanda[];
}