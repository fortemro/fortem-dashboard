export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      comenzi: {
        Row: {
          adresa_livrare: string
          anulat_de: string | null
          created_at: string
          data_anulare: string | null
          data_comanda: string
          data_expediere: string | null
          data_livrare: string | null
          distribuitor_id: string
          distribuitor_uuid: string | null
          email_agent_vanzari: string | null
          id: string
          judet_livrare: string | null
          motiv_anulare: string | null
          mzv_emitent: string | null
          numar_comanda: string
          numar_masina: string | null
          numar_paleti: number
          nume_sofer: string | null
          nume_transportator: string | null
          observatii: string | null
          oras_livrare: string
          status: string | null
          telefon_livrare: string | null
          telefon_sofer: string | null
          total_comanda: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          adresa_livrare: string
          anulat_de?: string | null
          created_at?: string
          data_anulare?: string | null
          data_comanda?: string
          data_expediere?: string | null
          data_livrare?: string | null
          distribuitor_id: string
          distribuitor_uuid?: string | null
          email_agent_vanzari?: string | null
          id?: string
          judet_livrare?: string | null
          motiv_anulare?: string | null
          mzv_emitent?: string | null
          numar_comanda: string
          numar_masina?: string | null
          numar_paleti?: number
          nume_sofer?: string | null
          nume_transportator?: string | null
          observatii?: string | null
          oras_livrare: string
          status?: string | null
          telefon_livrare?: string | null
          telefon_sofer?: string | null
          total_comanda?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          adresa_livrare?: string
          anulat_de?: string | null
          created_at?: string
          data_anulare?: string | null
          data_comanda?: string
          data_expediere?: string | null
          data_livrare?: string | null
          distribuitor_id?: string
          distribuitor_uuid?: string | null
          email_agent_vanzari?: string | null
          id?: string
          judet_livrare?: string | null
          motiv_anulare?: string | null
          mzv_emitent?: string | null
          numar_comanda?: string
          numar_masina?: string | null
          numar_paleti?: number
          nume_sofer?: string | null
          nume_transportator?: string | null
          observatii?: string | null
          oras_livrare?: string
          status?: string | null
          telefon_livrare?: string | null
          telefon_sofer?: string | null
          total_comanda?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      distribuitori: {
        Row: {
          activ: boolean | null
          adresa: string
          created_at: string
          email: string | null
          id: string
          judet: string | null
          mzv_alocat: string | null
          nume_companie: string
          oras: string
          persoana_contact: string | null
          telefon: string | null
          updated_at: string
        }
        Insert: {
          activ?: boolean | null
          adresa: string
          created_at?: string
          email?: string | null
          id?: string
          judet?: string | null
          mzv_alocat?: string | null
          nume_companie: string
          oras: string
          persoana_contact?: string | null
          telefon?: string | null
          updated_at?: string
        }
        Update: {
          activ?: boolean | null
          adresa?: string
          created_at?: string
          email?: string | null
          id?: string
          judet?: string | null
          mzv_alocat?: string | null
          nume_companie?: string
          oras?: string
          persoana_contact?: string | null
          telefon?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      itemi_comanda: {
        Row: {
          cantitate: number
          comanda_id: string
          created_at: string
          id: string
          pret_unitar: number
          produs_id: string
          total_item: number
        }
        Insert: {
          cantitate: number
          comanda_id: string
          created_at?: string
          id?: string
          pret_unitar: number
          produs_id: string
          total_item: number
        }
        Update: {
          cantitate?: number
          comanda_id?: string
          created_at?: string
          id?: string
          pret_unitar?: number
          produs_id?: string
          total_item?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_itemi_comanda_comanda"
            columns: ["comanda_id"]
            isOneToOne: false
            referencedRelation: "comenzi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_itemi_comanda_produs"
            columns: ["produs_id"]
            isOneToOne: false
            referencedRelation: "produse"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itemi_comanda_comanda_id_fkey"
            columns: ["comanda_id"]
            isOneToOne: false
            referencedRelation: "comenzi"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itemi_comanda_produs_id_fkey"
            columns: ["produs_id"]
            isOneToOne: false
            referencedRelation: "produse"
            referencedColumns: ["id"]
          },
        ]
      }
      preturi_oficiale: {
        Row: {
          created_at: string
          data_valabilitate_end: string | null
          data_valabilitate_start: string
          id: string
          pret_oficial: number
          produs_id: string
          updated_at: string
          zona: string
        }
        Insert: {
          created_at?: string
          data_valabilitate_end?: string | null
          data_valabilitate_start?: string
          id?: string
          pret_oficial: number
          produs_id: string
          updated_at?: string
          zona: string
        }
        Update: {
          created_at?: string
          data_valabilitate_end?: string | null
          data_valabilitate_start?: string
          id?: string
          pret_oficial?: number
          produs_id?: string
          updated_at?: string
          zona?: string
        }
        Relationships: [
          {
            foreignKeyName: "preturi_oficiale_produs_id_fkey"
            columns: ["produs_id"]
            isOneToOne: false
            referencedRelation: "produse"
            referencedColumns: ["id"]
          },
        ]
      }
      produse: {
        Row: {
          activ: boolean | null
          buc_comanda: number | null
          bucati_per_legatura: number | null
          bucati_per_palet: number | null
          categorie: string | null
          cod_produs: string | null
          created_at: string
          densitate: number | null
          descriere: string | null
          dimensiuni: string | null
          id: string
          imagine_url: string | null
          kg_per_buc: number | null
          kg_per_cam: number | null
          kg_per_camion: number | null
          ml_comanda: number | null
          moneda: string | null
          necesare_buc_ml: number | null
          nr_bucati: number | null
          nr_paleti: number | null
          nume: string
          paleti_comandati: number | null
          paleti_per_camion: number | null
          prag_alerta_stoc: number | null
          pret: number
          stoc_disponibil: number | null
          tip_produs: string | null
          unitate_masura: string | null
          updated_at: string
        }
        Insert: {
          activ?: boolean | null
          buc_comanda?: number | null
          bucati_per_legatura?: number | null
          bucati_per_palet?: number | null
          categorie?: string | null
          cod_produs?: string | null
          created_at?: string
          densitate?: number | null
          descriere?: string | null
          dimensiuni?: string | null
          id?: string
          imagine_url?: string | null
          kg_per_buc?: number | null
          kg_per_cam?: number | null
          kg_per_camion?: number | null
          ml_comanda?: number | null
          moneda?: string | null
          necesare_buc_ml?: number | null
          nr_bucati?: number | null
          nr_paleti?: number | null
          nume: string
          paleti_comandati?: number | null
          paleti_per_camion?: number | null
          prag_alerta_stoc?: number | null
          pret: number
          stoc_disponibil?: number | null
          tip_produs?: string | null
          unitate_masura?: string | null
          updated_at?: string
        }
        Update: {
          activ?: boolean | null
          buc_comanda?: number | null
          bucati_per_legatura?: number | null
          bucati_per_palet?: number | null
          categorie?: string | null
          cod_produs?: string | null
          created_at?: string
          densitate?: number | null
          descriere?: string | null
          dimensiuni?: string | null
          id?: string
          imagine_url?: string | null
          kg_per_buc?: number | null
          kg_per_cam?: number | null
          kg_per_camion?: number | null
          ml_comanda?: number | null
          moneda?: string | null
          necesare_buc_ml?: number | null
          nr_bucati?: number | null
          nr_paleti?: number | null
          nume?: string
          paleti_comandati?: number | null
          paleti_per_camion?: number | null
          prag_alerta_stoc?: number | null
          pret?: number
          stoc_disponibil?: number | null
          tip_produs?: string | null
          unitate_masura?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiluri_utilizatori: {
        Row: {
          adresa: string | null
          created_at: string
          id: string
          judet: string | null
          nume: string
          nume_complet: string | null
          oras: string | null
          prenume: string
          rol: string | null
          telefon: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          adresa?: string | null
          created_at?: string
          id?: string
          judet?: string | null
          nume: string
          nume_complet?: string | null
          oras?: string | null
          prenume: string
          rol?: string | null
          telefon?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          adresa?: string | null
          created_at?: string
          id?: string
          judet?: string | null
          nume?: string
          nume_complet?: string | null
          oras?: string | null
          prenume?: string
          rol?: string | null
          telefon?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_stocuri_reale_pentru_produse: {
        Args: Record<PropertyKey, never>
        Returns: {
          produs_id: string
          stoc_real: number
        }[]
      }
    }
    Enums: {
      status_enum:
        | "in asteptare"
        | "in procesare"
        | "pregatit pentru livrare"
        | "in tranzit"
        | "anulata"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      status_enum: [
        "in asteptare",
        "in procesare",
        "pregatit pentru livrare",
        "in tranzit",
        "anulata",
      ],
    },
  },
} as const
