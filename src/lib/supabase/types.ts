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
      monthly_metrics: {
        Row: {
          created_at: string
          id: string
          month: number
          orders_count: number
          raw_material_costs: number
          sales_target: number
          total_system_sales: number
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          month: number
          orders_count?: number
          raw_material_costs?: number
          sales_target?: number
          total_system_sales?: number
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          month?: number
          orders_count?: number
          raw_material_costs?: number
          sales_target?: number
          total_system_sales?: number
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          email: string
          id: string
          role: string
          updated_at: string | null
        }
        Insert: {
          email: string
          id: string
          role?: string
          updated_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          role?: string
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
          status: string
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
          status?: string
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
          status?: string
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
          initial_balance_stone: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          initial_balance_banricompras?: number | null
          initial_balance_dinheiro?: number | null
          initial_balance_pagbank?: number | null
          initial_balance_pix?: number | null
          initial_balance_stone?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          initial_balance_banricompras?: number | null
          initial_balance_dinheiro?: number | null
          initial_balance_pagbank?: number | null
          initial_balance_pix?: number | null
          initial_balance_stone?: number | null
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
// Table: profiles
//   id: uuid (not null)
//   email: text (not null)
//   role: text (not null, default: 'Visitante'::text)
//   updated_at: timestamp with time zone (nullable, default: now())
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
// Table: user_settings
//   user_id: uuid (not null)
//   initial_balance_dinheiro: numeric (nullable, default: 0)
//   initial_balance_stone: numeric (nullable, default: 0)
//   initial_balance_pagbank: numeric (nullable, default: 0)
//   initial_balance_pix: numeric (nullable, default: 0)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   initial_balance_banricompras: numeric (nullable, default: 0)

// --- CONSTRAINTS ---
// Table: monthly_metrics
//   PRIMARY KEY monthly_metrics_pkey: PRIMARY KEY (id)
//   FOREIGN KEY monthly_metrics_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
//   UNIQUE monthly_metrics_user_id_month_year_key: UNIQUE (user_id, month, year)
// Table: profiles
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
//   CHECK profiles_role_check: CHECK ((role = ANY (ARRAY['Administrador'::text, 'Colaborador'::text, 'Visitante'::text])))
// Table: transactions
//   PRIMARY KEY transactions_pkey: PRIMARY KEY (id)
//   FOREIGN KEY transactions_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: user_settings
//   PRIMARY KEY user_settings_pkey: PRIMARY KEY (user_id)
//   FOREIGN KEY user_settings_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE

// --- ROW LEVEL SECURITY POLICIES ---
// Table: monthly_metrics
//   Policy "Admin and Colaborador can insert monthly metrics" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (get_user_role() = ANY (ARRAY['Administrador'::text, 'Colaborador'::text]))
//   Policy "Admin and Colaborador can update monthly metrics" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (get_user_role() = ANY (ARRAY['Administrador'::text, 'Colaborador'::text]))
//   Policy "Admin can delete monthly metrics" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (get_user_role() = 'Administrador'::text)
//   Policy "Authenticated users can read monthly metrics" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: profiles
//   Policy "Admins can read all profiles" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (get_user_role() = 'Administrador'::text)
//   Policy "Admins can update profiles" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (get_user_role() = 'Administrador'::text)
//   Policy "Users can read own profile" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = id)
// Table: transactions
//   Policy "Admin and Colaborador can insert transactions" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (get_user_role() = ANY (ARRAY['Administrador'::text, 'Colaborador'::text]))
//   Policy "Admin and Colaborador can update transactions" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (get_user_role() = ANY (ARRAY['Administrador'::text, 'Colaborador'::text]))
//   Policy "Admin can delete transactions" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (get_user_role() = 'Administrador'::text)
//   Policy "Authenticated users can read transactions" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: user_settings
//   Policy "Admin can delete user settings" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (get_user_role() = 'Administrador'::text)
//   Policy "Admin can insert user settings" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (get_user_role() = 'Administrador'::text)
//   Policy "Admin can update user settings" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (get_user_role() = 'Administrador'::text)
//   Policy "Authenticated users can read user settings" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true

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
//     INSERT INTO public.profiles (id, email, role)
//     VALUES (NEW.id, NEW.email, 'Visitante');
//     RETURN NEW;
//   END;
//   $function$
//

// --- INDEXES ---
// Table: monthly_metrics
//   CREATE UNIQUE INDEX monthly_metrics_user_id_month_year_key ON public.monthly_metrics USING btree (user_id, month, year)
