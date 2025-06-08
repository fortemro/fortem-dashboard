// src/data-types/index.ts
export interface Distribuitor {
    id: string;
    nume_companie: string;
    adresa: string;
    oras: string;
    judet?: string;
    mzv_alocat?: string;
}

export interface Produs {
    id: string;
    nume: string;
    // Alte câmpuri de bază din DB
    descriere?: string;
    categorie?: string;
    // Câmpuri opționale pentru compatibilitate cu UI
    pret_unitar?: number;
    [key: string]: any; // Permite orice altă proprietate
}

export interface ItemComanda {
    id?: string;
    comanda_id: string;
    produs_id: string;
    cantitate: number;
    pret_unitar: number;
    total_item: number;
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
    pret_per_palet?: number;
    total_comanda: number;
    mzv_emitent: string;
    // Pentru datele join-uite
    distribuitori?: { nume_companie: string };
    profiluri_utilizatori?: { full_name: string };
}