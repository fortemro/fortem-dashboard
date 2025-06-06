export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      comenzi: {
        Row: {
          adresa_livrare: string
          created_at: string
          data_comanda: string
          distribuitor_id: string
          id: string
          judet_livrare: string | null
          mzv_emitent: string | null
          numar_comanda: string
          numar_paleti: number
          observatii: string | null
          oras_livrare: string
          status: string | null
          telefon_livrare: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          adresa_livrare: string
          created_at?: string
          data_comanda?: string
          distribuitor_id: string
          id?: string
          judet_livrare?: string | null
          mzv_emitent?: string | null
          numar_comanda: string
          numar_paleti?: number
          observatii?: string | null
          oras_livrare: string
          status?: string | null
          telefon_livrare?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          adresa_livrare?: string
          created_at?: string
          data_comanda?: string
          distribuitor_id?: string
          id?: string
          judet_livrare?: string | null
          mzv_emitent?: string | null
          numar_comanda?: string
          numar_paleti?: number
          observatii?: string | null
          oras_livrare?: string
          status?: string | null
          telefon_livrare?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comenzi_distribuitor_id_fkey"
            columns: ["distribuitor_id"]
            isOneToOne: false
            referencedRelation: "distribuitori"
            referencedColumns: ["id"]
          },
        ]
      }
      distribuitori: {
        Row: {
          activ: boolean | null
          adresa: string
          cod_fiscal: string | null
          created_at: string
          email: string | null
          id: string
          judet: string | null
          nume_companie: string
          oras: string
          persoana_contact: string | null
          telefon: string | null
          updated_at: string
        }
        Insert: {
          activ?: boolean | null
          adresa: string
          cod_fiscal?: string | null
          created_at?: string
          email?: string | null
          id?: string
          judet?: string | null
          nume_companie: string
          oras: string
          persoana_contact?: string | null
          telefon?: string | null
          updated_at?: string
        }
        Update: {
          activ?: boolean | null
          adresa?: string
          cod_fiscal?: string | null
          created_at?: string
          email?: string | null
          id?: string
          judet?: string | null
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
          distribuitor_id: string
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
          distribuitor_id: string
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
          distribuitor_id?: string
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
          pret?: number
          stoc_disponibil?: number | null
          tip_produs?: string | null
          unitate_masura?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "produse_distribuitor_id_fkey"
            columns: ["distribuitor_id"]
            isOneToOne: false
            referencedRelation: "distribuitori"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
