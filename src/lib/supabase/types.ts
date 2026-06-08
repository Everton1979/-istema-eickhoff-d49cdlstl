// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.4'
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
          project_id?: string
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
          project_id?: string
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
      'marcelaourique@yahoo.com.br': {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
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
          global_sales_target: number
          id: string
          meta_vendas_extra: number
          meta_vendas_manipulacao: number
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
          global_sales_target?: number
          id?: string
          meta_vendas_extra?: number
          meta_vendas_manipulacao?: number
          month: number
          num_formulas_capsulas?: number
          num_formulas_dermato?: number
          orders_count?: number
          project_id?: string
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
          global_sales_target?: number
          id?: string
          meta_vendas_extra?: number
          meta_vendas_manipulacao?: number
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
          project_id?: string
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
          project_id?: string
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
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: appointments
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   date: date (not null)
//   type: text (not null)
//   count: integer (not null, default: 1)
//   created_at: timestamp with time zone (not null, default: now())
//   project_id: text (not null, default: 'farmacia_eickhoff'::text)
// Table: audit_logs
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   action: text (not null)
//   entity: text (not null)
//   entity_id: text (nullable)
//   details: jsonb (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   project_id: text (not null, default: 'farmacia_eickhoff'::text)
// Table: marcelaourique@yahoo.com.br
//   id: bigint (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: monthly_metrics
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   month: integer (not null)
//   year: integer (not null)
//   orders_count: integer (not null, default: 0)
//   total_system_sales: numeric (not null, default: 0)
//   raw_material_costs: numeric (not null, default: 0)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   sales_target: numeric (not null, default: 0)
//   num_formulas_capsulas: integer (not null, default: 0)
//   vendas_capsulas: numeric (not null, default: 0)
//   custo_mp_emb_capsulas: numeric (not null, default: 0)
//   num_formulas_dermato: integer (not null, default: 0)
//   vendas_dermato: numeric (not null, default: 0)
//   custo_mp_emb_dermato: numeric (not null, default: 0)
//   global_sales_target: numeric (not null, default: 0)
//   project_id: text (not null, default: 'farmacia_eickhoff'::text)
//   colaboradores_capsulas: integer (not null, default: 0)
//   colaboradores_dermato: integer (not null, default: 0)
//   colaboradores_vendas: integer (not null, default: 0)
//   meta_vendas_manipulacao: numeric (not null, default: 0)
//   meta_vendas_extra: numeric (not null, default: 0)
//   vendas_revenda: numeric (not null, default: 0)
// Table: profiles
//   id: uuid (not null)
//   email: text (not null)
//   role: text (not null, default: 'Visitante'::text)
//   updated_at: timestamp with time zone (nullable, default: now())
//   company_name: text (nullable)
//   cnpj: text (nullable)
//   razao_social: text (nullable)
//   nome_fantasia: text (nullable)
//   endereco: text (nullable)
//   telefone: text (nullable)
//   responsavel: text (nullable)
//   status: text (nullable, default: 'Pendente'::text)
//   cep: text (nullable)
//   logradouro: text (nullable)
//   numero: text (nullable)
//   complemento: text (nullable)
//   bairro: text (nullable)
//   cidade_estado: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   app_name: text (nullable, default: 'farmacia_eickhoff'::text)
//   approved_at: timestamp with time zone (nullable)
//   plan_type: text (nullable, default: 'free'::text)
//   plan_start_date: timestamp with time zone (nullable)
//   plan_end_date: timestamp with time zone (nullable)
//   admin_notes: text (nullable)
// Table: transactions
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   description: text (not null)
//   amount: numeric (not null)
//   type: text (not null)
//   category: text (nullable)
//   account: text (nullable)
//   status: text (not null, default: 'REALIZADO'::text)
//   date: timestamp with time zone (not null)
//   created_at: timestamp with time zone (not null, default: now())
//   tags: text (nullable, default: ''::text)
//   payment_method: text (nullable)
//   subcategory: text (nullable)
//   project_id: text (not null, default: 'farmacia_eickhoff'::text)
// Table: user_settings
//   user_id: uuid (not null)
//   initial_balance_dinheiro: numeric (nullable, default: 0)
//   initial_balance_stone: numeric (nullable, default: 0)
//   initial_balance_pagbank: numeric (nullable, default: 0)
//   initial_balance_pix: numeric (nullable, default: 0)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   initial_balance_banricompras: numeric (nullable, default: 0)
//   initial_balance_sicredi: numeric (nullable, default: 0)
//   project_id: text (not null, default: 'farmacia_eickhoff'::text)
// Table: users
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   project_id: text (not null)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())

// --- CONSTRAINTS ---
// Table: appointments
//   PRIMARY KEY appointments_pkey: PRIMARY KEY (id)
//   FOREIGN KEY appointments_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: audit_logs
//   PRIMARY KEY audit_logs_pkey: PRIMARY KEY (id)
//   FOREIGN KEY audit_logs_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: marcelaourique@yahoo.com.br
//   PRIMARY KEY marcelaourique@yahoo.com.br_pkey: PRIMARY KEY (id)
// Table: monthly_metrics
//   PRIMARY KEY monthly_metrics_pkey: PRIMARY KEY (id)
//   FOREIGN KEY monthly_metrics_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: profiles
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
// Table: transactions
//   PRIMARY KEY transactions_pkey: PRIMARY KEY (id)
//   FOREIGN KEY transactions_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: user_settings
//   PRIMARY KEY user_settings_pkey: PRIMARY KEY (user_id, project_id)
//   FOREIGN KEY user_settings_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: users
//   PRIMARY KEY users_pkey: PRIMARY KEY (id)
//   UNIQUE users_user_id_key: UNIQUE (user_id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: appointments
//   Policy "Users can manage appointments" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//     WITH CHECK: (user_id = auth.uid())
// Table: audit_logs
//   Policy "Users can manage audit logs" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (project_id = get_user_app_name())
//     WITH CHECK: (project_id = get_user_app_name())
// Table: marcelaourique@yahoo.com.br
//   Policy "authenticated_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: monthly_metrics
//   Policy "Users can manage monthly metrics" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (project_id = get_user_app_name())
//     WITH CHECK: (project_id = get_user_app_name())
// Table: profiles
//   Policy "Users can delete profiles" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: ((get_user_role() = ANY (ARRAY['Administrador'::text, 'Master'::text])) AND (app_name = get_user_app_name()))
//   Policy "Users can insert profiles" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: ((id = auth.uid()) OR ((get_user_role() = ANY (ARRAY['Administrador'::text, 'Master'::text])) AND (app_name = get_user_app_name())))
//   Policy "Users can read profiles" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((id = auth.uid()) OR ((get_user_role() = ANY (ARRAY['Administrador'::text, 'Master'::text])) AND (app_name = get_user_app_name())))
//   Policy "Users can update profiles" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((id = auth.uid()) OR ((get_user_role() = ANY (ARRAY['Administrador'::text, 'Master'::text])) AND (app_name = get_user_app_name())))
//     WITH CHECK: ((id = auth.uid()) OR ((get_user_role() = ANY (ARRAY['Administrador'::text, 'Master'::text])) AND (app_name = get_user_app_name())))
// Table: transactions
//   Policy "Users can manage transactions" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (project_id = get_user_app_name())
//     WITH CHECK: (project_id = get_user_app_name())
// Table: user_settings
//   Policy "Users can manage user settings" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (project_id = get_user_app_name())
//     WITH CHECK: (project_id = get_user_app_name())

// --- WARNING: TABLES WITH RLS ENABLED BUT NO POLICIES ---
// These tables have Row Level Security enabled but NO policies defined.
// This means ALL queries (SELECT, INSERT, UPDATE, DELETE) will return ZERO rows
// for non-superuser roles (including the anon and authenticated roles used by the app).
// You MUST create RLS policies for these tables to allow data access.
//   - users

// --- DATABASE FUNCTIONS ---
// FUNCTION get_user_app_name()
//   CREATE OR REPLACE FUNCTION public.get_user_app_name()
//    RETURNS text
//    LANGUAGE sql
//    STABLE SECURITY DEFINER
//    SET search_path TO 'public'
//   AS $function$
//     SELECT COALESCE((SELECT app_name FROM profiles WHERE id = auth.uid()), 'farmacia_eickhoff');
//   $function$
//
// FUNCTION get_user_role()
//   CREATE OR REPLACE FUNCTION public.get_user_role()
//    RETURNS text
//    LANGUAGE sql
//    STABLE SECURITY DEFINER
//    SET search_path TO 'public'
//   AS $function$
//     SELECT role FROM profiles WHERE id = auth.uid();
//   $function$
//
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_app_name text;
//     v_role text;
//     v_status text;
//     v_count int;
//   BEGIN
//     v_app_name := COALESCE(NEW.raw_user_meta_data->>'app_name', 'farmacia_eickhoff');
//
//     -- Check if any profile already exists for this app_name
//     SELECT count(*) INTO v_count FROM public.profiles WHERE app_name = v_app_name;
//
//     IF v_count = 0 THEN
//       -- First user of the company gets administrative privileges automatically
//       v_role := 'Administrador';
//       v_status := 'Ativo';
//     ELSE
//       -- Subsequent users
//       IF NEW.email = 'farmaciaeickhoff@terra.com.br' THEN
//         v_role := 'Administrador';
//         v_status := 'Ativo';
//       ELSE
//         v_role := 'Master';
//         v_status := 'Pendente';
//       END IF;
//     END IF;
//
//     INSERT INTO public.profiles (
//       id, email, role, status, cnpj, razao_social, nome_fantasia,
//       endereco, telefone, responsavel, cep, logradouro, numero, complemento, bairro, cidade_estado, app_name
//     )
//     VALUES (
//       NEW.id,
//       NEW.email,
//       v_role,
//       v_status,
//       NEW.raw_user_meta_data->>'cnpj',
//       NEW.raw_user_meta_data->>'razao_social',
//       NEW.raw_user_meta_data->>'nome_fantasia',
//       NEW.raw_user_meta_data->>'endereco',
//       NEW.raw_user_meta_data->>'telefone',
//       NEW.raw_user_meta_data->>'responsavel',
//       NEW.raw_user_meta_data->>'cep',
//       NEW.raw_user_meta_data->>'logradouro',
//       NEW.raw_user_meta_data->>'numero',
//       NEW.raw_user_meta_data->>'complemento',
//       NEW.raw_user_meta_data->>'bairro',
//       NEW.raw_user_meta_data->>'cidade_estado',
//       v_app_name
//     );
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION notify_admin_new_user()
//   CREATE OR REPLACE FUNCTION public.notify_admin_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     request_id bigint;
//     payload jsonb;
//   BEGIN
//     -- Build the JSON payload with new user details
//     payload := jsonb_build_object(
//       'user_id', NEW.id,
//       'email', NEW.email,
//       'razao_social', NEW.razao_social,
//       'responsavel', NEW.responsavel,
//       'telefone', NEW.telefone,
//       'app_name', NEW.app_name
//     );
//
//     -- Invoke the Edge Function using pg_net
//     -- Errors here will be silently ignored so they don't block user registration
//     SELECT
//       net.http_post(
//         url := 'https://sxdqmcrildogtprkglnr.supabase.co/functions/v1/notify-new-user',
//         headers := '{"Content-Type": "application/json"}'::jsonb,
//         body := payload
//       )
//     INTO request_id;
//
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION set_project_id()
//   CREATE OR REPLACE FUNCTION public.set_project_id()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     NEW.project_id := COALESCE(public.get_user_app_name(), 'farmacia_eickhoff');
//     RETURN NEW;
//   END;
//   $function$
//

// --- TRIGGERS ---
// Table: appointments
//   set_appointments_project_id: CREATE TRIGGER set_appointments_project_id BEFORE INSERT ON public.appointments FOR EACH ROW EXECUTE FUNCTION set_project_id()
// Table: audit_logs
//   set_audit_logs_project_id: CREATE TRIGGER set_audit_logs_project_id BEFORE INSERT ON public.audit_logs FOR EACH ROW EXECUTE FUNCTION set_project_id()
// Table: monthly_metrics
//   set_monthly_metrics_project_id: CREATE TRIGGER set_monthly_metrics_project_id BEFORE INSERT ON public.monthly_metrics FOR EACH ROW EXECUTE FUNCTION set_project_id()
// Table: profiles
//   on_profile_created_notify_admin: CREATE TRIGGER on_profile_created_notify_admin AFTER INSERT ON public.profiles FOR EACH ROW WHEN ((new.email <> 'farmaciaeickhoff@terra.com.br'::text)) EXECUTE FUNCTION notify_admin_new_user()
// Table: transactions
//   set_transactions_project_id: CREATE TRIGGER set_transactions_project_id BEFORE INSERT ON public.transactions FOR EACH ROW EXECUTE FUNCTION set_project_id()
// Table: user_settings
//   set_user_settings_project_id: CREATE TRIGGER set_user_settings_project_id BEFORE INSERT ON public.user_settings FOR EACH ROW EXECUTE FUNCTION set_project_id()

// --- INDEXES ---
// Table: appointments
//   CREATE INDEX idx_appointments_project_date ON public.appointments USING btree (project_id, date)
// Table: monthly_metrics
//   CREATE INDEX idx_monthly_metrics_project_year ON public.monthly_metrics USING btree (project_id, year)
//   CREATE INDEX idx_monthly_metrics_user_project_year ON public.monthly_metrics USING btree (user_id, project_id, year)
//   CREATE INDEX idx_monthly_metrics_year_month ON public.monthly_metrics USING btree (year, month)
//   CREATE UNIQUE INDEX monthly_metrics_user_project_year_month_idx ON public.monthly_metrics USING btree (user_id, project_id, year, month)
// Table: transactions
//   CREATE INDEX idx_transactions_date_status ON public.transactions USING btree (date, status)
//   CREATE INDEX idx_transactions_project_date ON public.transactions USING btree (project_id, date)
//   CREATE INDEX idx_transactions_type ON public.transactions USING btree (type)
//   CREATE INDEX idx_transactions_user_project_date ON public.transactions USING btree (user_id, project_id, date)
// Table: users
//   CREATE UNIQUE INDEX users_user_id_key ON public.users USING btree (user_id)
