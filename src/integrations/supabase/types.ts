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
          cod_postal_livrare: string | null
          created_at: string
          data_comanda: string
          data_livrare_estimata: string | null
          distribuitor_id: string
          id: string
          moneda: string | null
          numar_comanda: string
          observatii: string | null
          oras_livrare: string
          status: string | null
          telefon_livrare: string | null
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          adresa_livrare: string
          cod_postal_livrare?: string | null
          created_at?: string
          data_comanda?: string
          data_livrare_estimata?: string | null
          distribuitor_id: string
          id?: string
          moneda?: string | null
          numar_comanda: string
          observatii?: string | null
          oras_livrare: string
          status?: string | null
          telefon_livrare?: string | null
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          adresa_livrare?: string
          cod_postal_livrare?: string | null
          created_at?: string
          data_comanda?: string
          data_livrare_estimata?: string | null
          distribuitor_id?: string
          id?: string
          moneda?: string | null
          numar_comanda?: string
          observatii?: string | null
          oras_livrare?: string
          status?: string | null
          telefon_livrare?: string | null
          total?: number
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
          cod_postal: string | null
          created_at: string
          email: string | null
          id: string
          nume_companie: string
          oras: string
          persoana_contact: string | null
          tara: string | null
          telefon: string | null
          updated_at: string
        }
        Insert: {
          activ?: boolean | null
          adresa: string
          cod_fiscal?: string | null
          cod_postal?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nume_companie: string
          oras: string
          persoana_contact?: string | null
          tara?: string | null
          telefon?: string | null
          updated_at?: string
        }
        Update: {
          activ?: boolean | null
          adresa?: string
          cod_fiscal?: string | null
          cod_postal?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nume_companie?: string
          oras?: string
          persoana_contact?: string | null
          tara?: string | null
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
          categorie: string | null
          cod_produs: string | null
          created_at: string
          descriere: string | null
          distribuitor_id: string
          id: string
          imagine_url: string | null
          moneda: string | null
          nume: string
          pret: number
          stoc_disponibil: number | null
          unitate_masura: string | null
          updated_at: string
        }
        Insert: {
          activ?: boolean | null
          categorie?: string | null
          cod_produs?: string | null
          created_at?: string
          descriere?: string | null
          distribuitor_id: string
          id?: string
          imagine_url?: string | null
          moneda?: string | null
          nume: string
          pret: number
          stoc_disponibil?: number | null
          unitate_masura?: string | null
          updated_at?: string
        }
        Update: {
          activ?: boolean | null
          categorie?: string | null
          cod_produs?: string | null
          created_at?: string
          descriere?: string | null
          distribuitor_id?: string
          id?: string
          imagine_url?: string | null
          moneda?: string | null
          nume?: string
          pret?: number
          stoc_disponibil?: number | null
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
          cod_postal: string | null
          created_at: string
          data_nasterii: string | null
          id: string
          nume: string
          oras: string | null
          prenume: string
          tara: string | null
          telefon: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          adresa?: string | null
          cod_postal?: string | null
          created_at?: string
          data_nasterii?: string | null
          id?: string
          nume: string
          oras?: string | null
          prenume: string
          tara?: string | null
          telefon?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          adresa?: string | null
          cod_postal?: string | null
          created_at?: string
          data_nasterii?: string | null
          id?: string
          nume?: string
          oras?: string | null
          prenume?: string
          tara?: string | null
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
