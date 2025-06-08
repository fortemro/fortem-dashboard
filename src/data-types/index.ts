// src/data-types/index.ts

export interface Distribuitor {
    id: string;
    nume_companie: string;
    adresa: string;
    oras: string;
    judet?: string;
    cod_fiscal?: string;
    email?: string;
    telefon?: string;
    persoana_contact?: string;
    mzv_alocat?: string;
    activ?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Produs {
    id: string;
    nume: string;
    descriere?: string;
    imagine_url?: string;
    categorie?: string;
    greutate_per_bucata?: number;
    bucati_per_bax?: number;
    baxuri_per_palet?: number;
    greutate_bax?: number;
    greutate_palet?: number;
    // Câmpuri complete din erori
    activ?: boolean;
    buc_comanda?: number;
    bucati_per_legatura?: number;
    cod_produs?: string;
    densitate?: number;
    dimensiuni?: string;
    kg_per_buc?: number;
    tip_produs?: string;
    paleti_per_camion?: number;
    kg_per_camion?: number;
    ml_comanda?: number;
    kg_per_ml?: number;
    created_at?: string;
    updated_at?: string;
    // Câmp ce pare a fi o greșeală în codul vechi, dar îl adăugăm pentru compatibilitate
    bucati_per_palet?: number; 
}

export interface ItemComanda {
    id?: string;
    comanda_id: string;
    produs_id: string;
    cantitate: number;
    pret_unitar: number;
    total_item: number; // Numele corect al coloanei
    produse?: Produs; // Pentru join-uri
}

export interface Comanda {
    id: string;
    created_at: string;
    user_id: string;
    distribuitor_id: string;
    data_comanda: string;
    status: string;
    numar_comanda: string;
    observatii?: string;
    adresa_livrare?: string;
    oras_livrare?: string;
    judet_livrare?: string;
    telefon_livrare?: string;
    numar_paleti?: number;
    cost_transport?: number;
    total_produse?: number;
    total_comanda?: number;
    mzv_emitent?: string;
    awb?: string;
    document_url?: string;
    // Pentru join-uri
    distribuitori?: Distribuitor;
    itemi_comanda?: ItemComanda[];
}
