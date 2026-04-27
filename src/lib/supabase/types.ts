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
      monthly_metrics: {
        Row: {
          created_at: string
          custo_mp_emb_capsulas: number
          custo_mp_emb_dermato: number
          global_sales_target: number
          id: string
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
          year: number
        }
        Insert: {
          created_at?: string
          custo_mp_emb_capsulas?: number
          custo_mp_emb_dermato?: number
          global_sales_target?: number
          id?: string
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
          year: number
        }
        Update: {
          created_at?: string
          custo_mp_emb_capsulas?: number
          custo_mp_emb_dermato?: number
          global_sales_target?: number
          id?: string
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
          year?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
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
          razao_social: string | null
          responsavel: string | null
          role: string
          status: string | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
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
          razao_social?: string | null
          responsavel?: string | null
          role?: string
          status?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
//   project_id: text (not null, default: 'planilha'::text)
// Table: audit_logs
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   action: text (not null)
//   entity: text (not null)
//   entity_id: text (nullable)
//   details: jsonb (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   project_id: text (not null, default: 'planilha'::text)
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
//   project_id: text (not null, default: 'planilha'::text)
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
//   app_name: text (nullable, default: 'farmacia'::text)
//   approved_at: timestamp with time zone (nullable)
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
//   project_id: text (not null, default: 'planilha'::text)
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
//   project_id: text (not null, default: 'planilha'::text)

// --- CONSTRAINTS ---
// Table: appointments
//   PRIMARY KEY appointments_pkey: PRIMARY KEY (id)
//   FOREIGN KEY appointments_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: audit_logs
//   PRIMARY KEY audit_logs_pkey: PRIMARY KEY (id)
//   FOREIGN KEY audit_logs_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: monthly_metrics
//   PRIMARY KEY monthly_metrics_pkey: PRIMARY KEY (id)
//   FOREIGN KEY monthly_metrics_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
//   UNIQUE monthly_metrics_user_id_month_year_project_key: UNIQUE (user_id, month, year, project_id)
// Table: profiles
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
// Table: transactions
//   PRIMARY KEY transactions_pkey: PRIMARY KEY (id)
//   FOREIGN KEY transactions_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: user_settings
//   PRIMARY KEY user_settings_pkey: PRIMARY KEY (user_id, project_id)
//   FOREIGN KEY user_settings_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE

// --- ROW LEVEL SECURITY POLICIES ---
// Table: appointments
//   Policy "Users can manage own appointments" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//     WITH CHECK: (user_id = auth.uid())
// Table: audit_logs
//   Policy "Users can manage own audit logs" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//     WITH CHECK: (user_id = auth.uid())
// Table: monthly_metrics
//   Policy "Users can manage own monthly metrics" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//     WITH CHECK: (user_id = auth.uid())
// Table: profiles
//   Policy "Users can insert profiles" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: ((id = auth.uid()) OR (get_user_role() = 'Administrador'::text))
//   Policy "Users can read profiles" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((id = auth.uid()) OR (get_user_role() = 'Administrador'::text))
//   Policy "Users can update profiles" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((id = auth.uid()) OR (get_user_role() = 'Administrador'::text))
//     WITH CHECK: ((id = auth.uid()) OR (get_user_role() = 'Administrador'::text))
// Table: transactions
//   Policy "Users can manage own transactions" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//     WITH CHECK: (user_id = auth.uid())
// Table: user_settings
//   Policy "Users can manage own user settings" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//     WITH CHECK: (user_id = auth.uid())

// --- DATABASE FUNCTIONS ---
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
//   BEGIN
//     INSERT INTO public.profiles (
//       id, email, role, status, cnpj, razao_social, nome_fantasia,
//       endereco, telefone, responsavel, cep, logradouro, numero, complemento, bairro, cidade_estado, app_name
//     )
//     VALUES (
//       NEW.id,
//       NEW.email,
//       CASE WHEN NEW.email = 'farmaciaeickhoff@terra.com.br' THEN 'Administrador' ELSE 'Usuário' END,
//       CASE WHEN NEW.email = 'farmaciaeickhoff@terra.com.br' THEN 'Ativo' ELSE 'Pendente' END,
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
//       COALESCE(NEW.raw_user_meta_data->>'app_name', 'salao')
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
//       'telefone', NEW.telefone
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

// --- TRIGGERS ---
// Table: profiles
//   on_profile_created_notify_admin: CREATE TRIGGER on_profile_created_notify_admin AFTER INSERT ON public.profiles FOR EACH ROW WHEN ((new.email <> 'farmaciaeickhoff@terra.com.br'::text)) EXECUTE FUNCTION notify_admin_new_user()

// --- INDEXES ---
// Table: monthly_metrics
//   CREATE UNIQUE INDEX monthly_metrics_user_id_month_year_project_key ON public.monthly_metrics USING btree (user_id, month, year, project_id)
