
// src/data-types/index.ts
import type { Tables } from '@/integrations/supabase/types';

// Folosim tipurile Supabase pentru consistență
export type Distribuitor = Tables<'distribuitori'>;
export type Produs = Tables<'produse'>;

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
    // Noile coloane adăugate
    awb?: string;
    nume_transportator?: string;
    data_expediere?: string;
    // Pentru datele join-uite
    distribuitori?: { nume_companie: string };
    profiluri_utilizatori?: { full_name: string };
}
