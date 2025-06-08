// src/data-types/index.ts

export interface Distribuitor {
    id: string;
    nume_companie: string;
    adresa: string;
    oras: string;
    // ...alte câmpuri opționale
}

export interface Produs {
    id: string;
    nume: string;
    descriere?: string;
    imagine_url?: string;
    categorie?: string;
    // --- Câmpuri adăugate pentru compatibilitate maximă cu UI ---
    // Le marcăm pe toate ca opționale pentru a nu bloca logica nouă.
    activ?: boolean;
    buc_comanda?: number;
    bucati_per_legatura?: number;
    bucati_per_bax?: number;
    bucati_per_palet?: number;
    cod_produs?: string;
    created_at?: string;
    densitate?: number;
    dimensiuni?: string;
    greutate_bax?: number;
    greutate_palet?: number;
    greutate_per_bucata?: number;
    kg_per_buc?: number;
    kg_per_cam?: number;
    kg_per_camion?: number;
    ml_comanda?: number;
    moneda?: string;
    necesare_buc_ml?: number;
    nr_bucati?: number;
    paleti_per_camion?: number;
    pret_unitar?: number;
    tip_produs?: string;
    updated_at?: string;
}

export interface ItemComanda {
    id?: string;
    comanda_id: string;
    produs_id: string;
    cantitate: number;
    pret_unitar: number;
    total_item: number;
    produse?: Produs;
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
    numar_paleti: number;
    pret_per_palet?: number; // Câmp specific pentru noul model
    total_comanda: number;
    mzv_emitent: string;
    awb?: string;
    document_url?: string;
    distribuitori?: any; // Tip any pentru a evita erorile de join
    itemi_comanda?: ItemComanda[];
}