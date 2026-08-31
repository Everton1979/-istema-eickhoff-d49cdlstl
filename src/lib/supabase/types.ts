// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          count: number
          created_at: string
          date: string
          id: string
          project_id: string
          type: string
          user_id: string
        }
        Insert: {
          count?: number
          created_at?: string
          date: string
          id?: string
          project_id: string
          type: string
          user_id: string
        }
        Update: {
          count?: number
          created_at?: string
          date?: string
          id?: string
          project_id?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity: string
          entity_id: string | null
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity: string
          entity_id?: string | null
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity?: string
          entity_id?: string | null
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: []
      }
      monthly_metrics: {
        Row: {
          colaboradores_capsulas: number
          colaboradores_dermato: number
          colaboradores_vendas: number
          created_at: string
          custo_mp_emb_capsulas: number
          custo_mp_emb_dermato: number
          custo_revenda: number
          global_sales_target: number
          id: string
          meta_vendas_extra: number
          meta_vendas_manipulacao: number
          meta_vendas_sistema_manipulacao: number
          meta_vendas_sistema_revenda: number
          month: number
          num_formulas_capsulas: number
          num_formulas_dermato: number
          orders_count: number
          project_id: string
          raw_material_costs: number
          sales_target: number
          total_system_sales: number
          updated_at: string
          user_id: string
          vendas_capsulas: number
          vendas_dermato: number
          vendas_revenda: number
          year: number
        }
        Insert: {
          colaboradores_capsulas?: number
          colaboradores_dermato?: number
          colaboradores_vendas?: number
          created_at?: string
          custo_mp_emb_capsulas?: number
          custo_mp_emb_dermato?: number
          custo_revenda?: number
          global_sales_target?: number
          id?: string
          meta_vendas_extra?: number
          meta_vendas_manipulacao?: number
          meta_vendas_sistema_manipulacao?: number
          meta_vendas_sistema_revenda?: number
          month: number
          num_formulas_capsulas?: number
          num_formulas_dermato?: number
          orders_count?: number
          project_id: string
          raw_material_costs?: number
          sales_target?: number
          total_system_sales?: number
          updated_at?: string
          user_id: string
          vendas_capsulas?: number
          vendas_dermato?: number
          vendas_revenda?: number
          year: number
        }
        Update: {
          colaboradores_capsulas?: number
          colaboradores_dermato?: number
          colaboradores_vendas?: number
          created_at?: string
          custo_mp_emb_capsulas?: number
          custo_mp_emb_dermato?: number
          custo_revenda?: number
          global_sales_target?: number
          id?: string
          meta_vendas_extra?: number
          meta_vendas_manipulacao?: number
          meta_vendas_sistema_manipulacao?: number
          meta_vendas_sistema_revenda?: number
          month?: number
          num_formulas_capsulas?: number
          num_formulas_dermato?: number
          orders_count?: number
          project_id?: string
          raw_material_costs?: number
          sales_target?: number
          total_system_sales?: number
          updated_at?: string
          user_id?: string
          vendas_capsulas?: number
          vendas_dermato?: number
          vendas_revenda?: number
          year?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          access_profile: string | null
          admin_notes: string | null
          app_name: string | null
          approved_at: string | null
          bairro: string | null
          cep: string | null
          cidade_estado: string | null
          cnpj: string | null
          company_name: string | null
          complemento: string | null
          created_at: string
          email: string
          endereco: string | null
          id: string
          is_super_admin: boolean | null
          lgpd_consent: boolean | null
          lgpd_consent_at: string | null
          lgpd_consent_version: string | null
          logradouro: string | null
          nome_fantasia: string | null
          numero: string | null
          plan_end_date: string | null
          plan_start_date: string | null
          plan_type: string | null
          razao_social: string | null
          responsavel: string | null
          role: string
          status: string | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          access_profile?: string | null
          admin_notes?: string | null
          app_name?: string | null
          approved_at?: string | null
          bairro?: string | null
          cep?: string | null
          cidade_estado?: string | null
          cnpj?: string | null
          company_name?: string | null
          complemento?: string | null
          created_at?: string
          email: string
          endereco?: string | null
          id: string
          is_super_admin?: boolean | null
          lgpd_consent?: boolean | null
          lgpd_consent_at?: string | null
          lgpd_consent_version?: string | null
          logradouro?: string | null
          nome_fantasia?: string | null
          numero?: string | null
          plan_end_date?: string | null
          plan_start_date?: string | null
          plan_type?: string | null
          razao_social?: string | null
          responsavel?: string | null
          role?: string
          status?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          access_profile?: string | null
          admin_notes?: string | null
          app_name?: string | null
          approved_at?: string | null
          bairro?: string | null
          cep?: string | null
          cidade_estado?: string | null
          cnpj?: string | null
          company_name?: string | null
          complemento?: string | null
          created_at?: string
          email?: string
          endereco?: string | null
          id?: string
          is_super_admin?: boolean | null
          lgpd_consent?: boolean | null
          lgpd_consent_at?: string | null
          lgpd_consent_version?: string | null
          logradouro?: string | null
          nome_fantasia?: string | null
          numero?: string | null
          plan_end_date?: string | null
          plan_start_date?: string | null
          plan_type?: string | null
          razao_social?: string | null
          responsavel?: string | null
          role?: string
          status?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account: string | null
          amount: number
          category: string | null
          created_at: string
          date: string
          description: string
          id: string
          payment_method: string | null
          project_id: string
          status: string
          subcategory: string | null
          tags: string | null
          type: string
          user_id: string
        }
        Insert: {
          account?: string | null
          amount: number
          category?: string | null
          created_at?: string
          date: string
          description: string
          id?: string
          payment_method?: string | null
          project_id: string
          status?: string
          subcategory?: string | null
          tags?: string | null
          type: string
          user_id: string
        }
        Update: {
          account?: string | null
          amount?: number
          category?: string | null
          created_at?: string
          date?: string
          description?: string
          id?: string
          payment_method?: string | null
          project_id?: string
          status?: string
          subcategory?: string | null
          tags?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          project_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          project_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          project_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_payment_methods: {
        Row: {
          created_at: string
          id: string
          name: string
          project_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          project_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          project_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          initial_balance_banricompras: number | null
          initial_balance_dinheiro: number | null
          initial_balance_pagbank: number | null
          initial_balance_pix: number | null
          initial_balance_sicredi: number | null
          initial_balance_stone: number | null
          project_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          initial_balance_banricompras?: number | null
          initial_balance_dinheiro?: number | null
          initial_balance_pagbank?: number | null
          initial_balance_pix?: number | null
          initial_balance_sicredi?: number | null
          initial_balance_stone?: number | null
          project_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          initial_balance_banricompras?: number | null
          initial_balance_dinheiro?: number | null
          initial_balance_pagbank?: number | null
          initial_balance_pix?: number | null
          initial_balance_sicredi?: number | null
          initial_balance_stone?: number | null
          project_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          id: string
          project_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_app_name: { Args: never; Returns: string }
      get_user_role: { Args: never; Returns: string }
      get_user_status: { Args: never; Returns: string }
      is_super_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

