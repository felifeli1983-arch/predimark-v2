// Auto-generated types placeholder — regenerate with: npm run types:gen
// Full types available after: npx supabase login && npm run types:gen

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          privy_did: string | null
          auth_id: string | null
          wallet_address: string | null
          email: string | null
          email_verified: boolean | null
          username: string | null
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          phone: string | null
          phone_verified: boolean | null
          country_code: string | null
          geo_block_status: string | null
          language: string | null
          theme: string | null
          created_at: string | null
          updated_at: string | null
          last_login_at: string | null
          deleted_at: string | null
          is_suspended: boolean | null
          suspended_at: string | null
          suspended_reason: string | null
          onboarding_completed: boolean | null
        }
        Insert: {
          id?: string
          privy_did?: string | null
          auth_id?: string | null
          wallet_address?: string | null
          email?: string | null
          email_verified?: boolean | null
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          country_code?: string | null
          geo_block_status?: string | null
          language?: string | null
          theme?: string | null
          created_at?: string | null
          updated_at?: string | null
          last_login_at?: string | null
          deleted_at?: string | null
          is_suspended?: boolean | null
          suspended_at?: string | null
          suspended_reason?: string | null
          onboarding_completed?: boolean | null
        }
        Update: {
          id?: string
          privy_did?: string | null
          auth_id?: string | null
          wallet_address?: string | null
          email?: string | null
          email_verified?: boolean | null
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          country_code?: string | null
          geo_block_status?: string | null
          language?: string | null
          theme?: string | null
          created_at?: string | null
          updated_at?: string | null
          last_login_at?: string | null
          deleted_at?: string | null
          is_suspended?: boolean | null
          suspended_at?: string | null
          suspended_reason?: string | null
          onboarding_completed?: boolean | null
        }
        Relationships: []
      }
      achievements: {
        Row: {
          id: string
          key: string
          name: string
          description: string
          icon: string | null
          category: string | null
          points: number | null
          rarity: string | null
          trigger_condition: Json
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          key: string
          name: string
          description: string
          icon?: string | null
          category?: string | null
          points?: number | null
          rarity?: string | null
          trigger_condition: Json
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          key?: string
          name?: string
          description?: string
          icon?: string | null
          category?: string | null
          points?: number | null
          rarity?: string | null
          trigger_condition?: Json
          is_active?: boolean | null
          created_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_admin_role: {
        Args: { uid: string }
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

export const Constants = {
  public: {
    Enums: {},
  },
} as const
