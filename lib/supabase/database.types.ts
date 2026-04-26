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
      ab_test_assignments: {
        Row: {
          assigned_at: string | null
          id: string
          test_id: string
          user_id: string
          variant_id: string
        }
        Insert: {
          assigned_at?: string | null
          id?: string
          test_id: string
          user_id: string
          variant_id: string
        }
        Update: {
          assigned_at?: string | null
          id?: string
          test_id?: string
          user_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_assignments_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "ab_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_test_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_tests: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          ended_at: string | null
          id: string
          metric_tracked: string
          name: string
          started_at: string | null
          statistical_significance: number | null
          status: string | null
          updated_at: string | null
          variants: Json
          winner_variant: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          ended_at?: string | null
          id?: string
          metric_tracked: string
          name: string
          started_at?: string | null
          statistical_significance?: number | null
          status?: string | null
          updated_at?: string | null
          variants: Json
          winner_variant?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          ended_at?: string | null
          id?: string
          metric_tracked?: string
          name?: string
          started_at?: string | null
          statistical_significance?: number | null
          status?: string | null
          updated_at?: string | null
          variants?: Json
          winner_variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ab_tests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      achievements: {
        Row: {
          category: string | null
          created_at: string | null
          description: string
          icon: string | null
          id: string
          is_active: boolean | null
          key: string
          name: string
          points: number | null
          rarity: string | null
          trigger_condition: Json
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          key: string
          name: string
          points?: number | null
          rarity?: string | null
          trigger_condition: Json
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          key?: string
          name?: string
          points?: number | null
          rarity?: string | null
          trigger_condition?: Json
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          added_at: string | null
          added_by: string | null
          ip_allowlist: string[] | null
          last_login_at: string | null
          mfa_enabled: boolean | null
          mfa_secret: string | null
          permissions: Json | null
          role: string
          user_id: string
        }
        Insert: {
          added_at?: string | null
          added_by?: string | null
          ip_allowlist?: string[] | null
          last_login_at?: string | null
          mfa_enabled?: boolean | null
          mfa_secret?: string | null
          permissions?: Json | null
          role: string
          user_id: string
        }
        Update: {
          added_at?: string | null
          added_by?: string | null
          ip_allowlist?: string[] | null
          last_login_at?: string | null
          mfa_enabled?: boolean | null
          mfa_secret?: string | null
          permissions?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action_type: string
          actor_ip: string | null
          actor_role: string
          actor_user_id: string
          after_value: Json | null
          before_value: Json | null
          created_at: string
          id: string
          reason_note: string | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action_type: string
          actor_ip?: string | null
          actor_role: string
          actor_user_id: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          id?: string
          reason_note?: string | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action_type?: string
          actor_ip?: string | null
          actor_role?: string
          actor_user_id?: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          id?: string
          reason_note?: string | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log_2026_04: {
        Row: {
          action_type: string
          actor_ip: string | null
          actor_role: string
          actor_user_id: string
          after_value: Json | null
          before_value: Json | null
          created_at: string
          id: string
          reason_note: string | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action_type: string
          actor_ip?: string | null
          actor_role: string
          actor_user_id: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          id?: string
          reason_note?: string | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action_type?: string
          actor_ip?: string | null
          actor_role?: string
          actor_user_id?: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          id?: string
          reason_note?: string | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      audit_log_2026_05: {
        Row: {
          action_type: string
          actor_ip: string | null
          actor_role: string
          actor_user_id: string
          after_value: Json | null
          before_value: Json | null
          created_at: string
          id: string
          reason_note: string | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action_type: string
          actor_ip?: string | null
          actor_role: string
          actor_user_id: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          id?: string
          reason_note?: string | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action_type?: string
          actor_ip?: string | null
          actor_role?: string
          actor_user_id?: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          id?: string
          reason_note?: string | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      audit_log_2026_06: {
        Row: {
          action_type: string
          actor_ip: string | null
          actor_role: string
          actor_user_id: string
          after_value: Json | null
          before_value: Json | null
          created_at: string
          id: string
          reason_note: string | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action_type: string
          actor_ip?: string | null
          actor_role: string
          actor_user_id: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          id?: string
          reason_note?: string | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action_type?: string
          actor_ip?: string | null
          actor_role?: string
          actor_user_id?: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          id?: string
          reason_note?: string | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      audit_log_2026_07: {
        Row: {
          action_type: string
          actor_ip: string | null
          actor_role: string
          actor_user_id: string
          after_value: Json | null
          before_value: Json | null
          created_at: string
          id: string
          reason_note: string | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action_type: string
          actor_ip?: string | null
          actor_role: string
          actor_user_id: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          id?: string
          reason_note?: string | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action_type?: string
          actor_ip?: string | null
          actor_role?: string
          actor_user_id?: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          id?: string
          reason_note?: string | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      audit_log_2026_08: {
        Row: {
          action_type: string
          actor_ip: string | null
          actor_role: string
          actor_user_id: string
          after_value: Json | null
          before_value: Json | null
          created_at: string
          id: string
          reason_note: string | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action_type: string
          actor_ip?: string | null
          actor_role: string
          actor_user_id: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          id?: string
          reason_note?: string | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action_type?: string
          actor_ip?: string | null
          actor_role?: string
          actor_user_id?: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          id?: string
          reason_note?: string | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      audit_log_2026_09: {
        Row: {
          action_type: string
          actor_ip: string | null
          actor_role: string
          actor_user_id: string
          after_value: Json | null
          before_value: Json | null
          created_at: string
          id: string
          reason_note: string | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action_type: string
          actor_ip?: string | null
          actor_role: string
          actor_user_id: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          id?: string
          reason_note?: string | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action_type?: string
          actor_ip?: string | null
          actor_role?: string
          actor_user_id?: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          id?: string
          reason_note?: string | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      audit_log_2026_10: {
        Row: {
          action_type: string
          actor_ip: string | null
          actor_role: string
          actor_user_id: string
          after_value: Json | null
          before_value: Json | null
          created_at: string
          id: string
          reason_note: string | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action_type: string
          actor_ip?: string | null
          actor_role: string
          actor_user_id: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          id?: string
          reason_note?: string | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action_type?: string
          actor_ip?: string | null
          actor_role?: string
          actor_user_id?: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          id?: string
          reason_note?: string | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      audit_log_2026_11: {
        Row: {
          action_type: string
          actor_ip: string | null
          actor_role: string
          actor_user_id: string
          after_value: Json | null
          before_value: Json | null
          created_at: string
          id: string
          reason_note: string | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action_type: string
          actor_ip?: string | null
          actor_role: string
          actor_user_id: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          id?: string
          reason_note?: string | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action_type?: string
          actor_ip?: string | null
          actor_role?: string
          actor_user_id?: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          id?: string
          reason_note?: string | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      audit_log_2026_12: {
        Row: {
          action_type: string
          actor_ip: string | null
          actor_role: string
          actor_user_id: string
          after_value: Json | null
          before_value: Json | null
          created_at: string
          id: string
          reason_note: string | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action_type: string
          actor_ip?: string | null
          actor_role: string
          actor_user_id: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          id?: string
          reason_note?: string | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action_type?: string
          actor_ip?: string | null
          actor_role?: string
          actor_user_id?: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          id?: string
          reason_note?: string | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      audit_log_2027_01: {
        Row: {
          action_type: string
          actor_ip: string | null
          actor_role: string
          actor_user_id: string
          after_value: Json | null
          before_value: Json | null
          created_at: string
          id: string
          reason_note: string | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action_type: string
          actor_ip?: string | null
          actor_role: string
          actor_user_id: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          id?: string
          reason_note?: string | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action_type?: string
          actor_ip?: string | null
          actor_role?: string
          actor_user_id?: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          id?: string
          reason_note?: string | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      audit_log_2027_02: {
        Row: {
          action_type: string
          actor_ip: string | null
          actor_role: string
          actor_user_id: string
          after_value: Json | null
          before_value: Json | null
          created_at: string
          id: string
          reason_note: string | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action_type: string
          actor_ip?: string | null
          actor_role: string
          actor_user_id: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          id?: string
          reason_note?: string | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action_type?: string
          actor_ip?: string | null
          actor_role?: string
          actor_user_id?: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          id?: string
          reason_note?: string | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      audit_log_2027_03: {
        Row: {
          action_type: string
          actor_ip: string | null
          actor_role: string
          actor_user_id: string
          after_value: Json | null
          before_value: Json | null
          created_at: string
          id: string
          reason_note: string | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action_type: string
          actor_ip?: string | null
          actor_role: string
          actor_user_id: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          id?: string
          reason_note?: string | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action_type?: string
          actor_ip?: string | null
          actor_role?: string
          actor_user_id?: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          id?: string
          reason_note?: string | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      audit_log_2027_04: {
        Row: {
          action_type: string
          actor_ip: string | null
          actor_role: string
          actor_user_id: string
          after_value: Json | null
          before_value: Json | null
          created_at: string
          id: string
          reason_note: string | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action_type: string
          actor_ip?: string | null
          actor_role: string
          actor_user_id: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          id?: string
          reason_note?: string | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action_type?: string
          actor_ip?: string | null
          actor_role?: string
          actor_user_id?: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          id?: string
          reason_note?: string | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      balances: {
        Row: {
          demo_balance: number | null
          demo_last_reset_at: string | null
          demo_locked: number | null
          demo_total_pnl: number | null
          demo_volume_total: number | null
          real_total_pnl: number | null
          real_volume_total: number | null
          updated_at: string | null
          usdc_balance: number | null
          usdc_last_synced_at: string | null
          usdc_locked: number | null
          user_id: string
        }
        Insert: {
          demo_balance?: number | null
          demo_last_reset_at?: string | null
          demo_locked?: number | null
          demo_total_pnl?: number | null
          demo_volume_total?: number | null
          real_total_pnl?: number | null
          real_volume_total?: number | null
          updated_at?: string | null
          usdc_balance?: number | null
          usdc_last_synced_at?: string | null
          usdc_locked?: number | null
          user_id: string
        }
        Update: {
          demo_balance?: number | null
          demo_last_reset_at?: string | null
          demo_locked?: number | null
          demo_total_pnl?: number | null
          demo_volume_total?: number | null
          real_total_pnl?: number | null
          real_volume_total?: number | null
          updated_at?: string | null
          usdc_balance?: number | null
          usdc_last_synced_at?: string | null
          usdc_locked?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "balances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      copy_trading_sessions: {
        Row: {
          allowed_categories: string[] | null
          budget_max_usdc: number
          budget_spent_usdc: number | null
          created_at: string | null
          duration_type: string
          expires_at: string | null
          id: string
          max_per_trade_usdc: number
          max_trades_per_day: number | null
          revoke_reason: string | null
          revoked_at: string | null
          session_key_id: string
          session_key_pubkey: string
          status: string | null
          target_creator_id: string | null
          target_external_id: string | null
          total_pnl: number | null
          trades_executed_count: number | null
          trades_today_count: number | null
          trades_today_reset_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allowed_categories?: string[] | null
          budget_max_usdc: number
          budget_spent_usdc?: number | null
          created_at?: string | null
          duration_type: string
          expires_at?: string | null
          id?: string
          max_per_trade_usdc: number
          max_trades_per_day?: number | null
          revoke_reason?: string | null
          revoked_at?: string | null
          session_key_id: string
          session_key_pubkey: string
          status?: string | null
          target_creator_id?: string | null
          target_external_id?: string | null
          total_pnl?: number | null
          trades_executed_count?: number | null
          trades_today_count?: number | null
          trades_today_reset_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allowed_categories?: string[] | null
          budget_max_usdc?: number
          budget_spent_usdc?: number | null
          created_at?: string | null
          duration_type?: string
          expires_at?: string | null
          id?: string
          max_per_trade_usdc?: number
          max_trades_per_day?: number | null
          revoke_reason?: string | null
          revoked_at?: string | null
          session_key_id?: string
          session_key_pubkey?: string
          status?: string | null
          target_creator_id?: string | null
          target_external_id?: string | null
          total_pnl?: number | null
          trades_executed_count?: number | null
          trades_today_count?: number | null
          trades_today_reset_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "copy_trading_sessions_target_creator_id_fkey"
            columns: ["target_creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "copy_trading_sessions_target_external_id_fkey"
            columns: ["target_external_id"]
            isOneToOne: false
            referencedRelation: "external_traders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "copy_trading_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_payouts: {
        Row: {
          created_at: string | null
          creator_id: string
          id: string
          paid_at: string | null
          payment_method: string | null
          payment_tx_hash: string | null
          payout_amount: number
          period_end: string
          period_start: string
          revenue_share_pct: number | null
          status: string | null
          total_builder_fee: number
          total_volume_copied: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          payment_tx_hash?: string | null
          payout_amount: number
          period_end: string
          period_start: string
          revenue_share_pct?: number | null
          status?: string | null
          total_builder_fee: number
          total_volume_copied: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          payment_tx_hash?: string | null
          payout_amount?: number
          period_end?: string
          period_start?: string
          revenue_share_pct?: number | null
          status?: string | null
          total_builder_fee?: number
          total_volume_copied?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_payouts_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creators: {
        Row: {
          anonymize_amounts: boolean | null
          application_status: string | null
          applied_at: string | null
          bio_creator: string | null
          copiers_active: number | null
          discord_handle: string | null
          followers_count: number | null
          id: string
          is_public: boolean | null
          is_suspended: boolean | null
          is_verified: boolean | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          score: number | null
          show_history: boolean | null
          show_positions: boolean | null
          specialization: string[] | null
          suspended_at: string | null
          suspended_reason: string | null
          tier: string | null
          total_earnings: number | null
          twitter_handle: string | null
          updated_at: string | null
          user_id: string
          verified_at: string | null
          website_url: string | null
        }
        Insert: {
          anonymize_amounts?: boolean | null
          application_status?: string | null
          applied_at?: string | null
          bio_creator?: string | null
          copiers_active?: number | null
          discord_handle?: string | null
          followers_count?: number | null
          id?: string
          is_public?: boolean | null
          is_suspended?: boolean | null
          is_verified?: boolean | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          score?: number | null
          show_history?: boolean | null
          show_positions?: boolean | null
          specialization?: string[] | null
          suspended_at?: string | null
          suspended_reason?: string | null
          tier?: string | null
          total_earnings?: number | null
          twitter_handle?: string | null
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
          website_url?: string | null
        }
        Update: {
          anonymize_amounts?: boolean | null
          application_status?: string | null
          applied_at?: string | null
          bio_creator?: string | null
          copiers_active?: number | null
          discord_handle?: string | null
          followers_count?: number | null
          id?: string
          is_public?: boolean | null
          is_suspended?: boolean | null
          is_verified?: boolean | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          score?: number | null
          show_history?: boolean | null
          show_positions?: boolean | null
          specialization?: string[] | null
          suspended_at?: string | null
          suspended_reason?: string | null
          tier?: string | null
          total_earnings?: number | null
          twitter_handle?: string | null
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creators_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      equity_curve: {
        Row: {
          is_demo: boolean
          realized_pnl_total: number | null
          recorded_at: string
          total_value_usdc: number
          unrealized_pnl_total: number | null
          user_id: string
        }
        Insert: {
          is_demo?: boolean
          realized_pnl_total?: number | null
          recorded_at: string
          total_value_usdc: number
          unrealized_pnl_total?: number | null
          user_id: string
        }
        Update: {
          is_demo?: boolean
          realized_pnl_total?: number | null
          recorded_at?: string
          total_value_usdc?: number
          unrealized_pnl_total?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "equity_curve_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      external_traders: {
        Row: {
          first_seen_at: string | null
          id: string
          is_active: boolean | null
          is_blocked: boolean | null
          last_synced_at: string | null
          last_trade_at: string | null
          polymarket_nickname: string | null
          polymarket_pnl_total: number | null
          polymarket_volume_total: number | null
          rank_30d: number | null
          rank_7d: number | null
          rank_all_time: number | null
          rank_today: number | null
          specialization: string[] | null
          trades_count: number | null
          wallet_address: string
          win_rate: number | null
        }
        Insert: {
          first_seen_at?: string | null
          id?: string
          is_active?: boolean | null
          is_blocked?: boolean | null
          last_synced_at?: string | null
          last_trade_at?: string | null
          polymarket_nickname?: string | null
          polymarket_pnl_total?: number | null
          polymarket_volume_total?: number | null
          rank_30d?: number | null
          rank_7d?: number | null
          rank_all_time?: number | null
          rank_today?: number | null
          specialization?: string[] | null
          trades_count?: number | null
          wallet_address: string
          win_rate?: number | null
        }
        Update: {
          first_seen_at?: string | null
          id?: string
          is_active?: boolean | null
          is_blocked?: boolean | null
          last_synced_at?: string | null
          last_trade_at?: string | null
          polymarket_nickname?: string | null
          polymarket_pnl_total?: number | null
          polymarket_volume_total?: number | null
          rank_30d?: number | null
          rank_7d?: number | null
          rank_all_time?: number | null
          rank_today?: number | null
          specialization?: string[] | null
          trades_count?: number | null
          wallet_address?: string
          win_rate?: number | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          enabled: boolean | null
          key: string
          rollout_percentage: number | null
          target_audience: Json | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          enabled?: boolean | null
          key: string
          rollout_percentage?: number | null
          target_audience?: Json | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          enabled?: boolean | null
          key?: string
          rollout_percentage?: number | null
          target_audience?: Json | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_flags_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feature_flags_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string | null
          followed_creator_id: string | null
          followed_external_id: string | null
          follower_user_id: string
          id: string
          notify_new_position: boolean | null
          notify_position_closed: boolean | null
          notify_via_push: boolean | null
          notify_via_telegram: boolean | null
        }
        Insert: {
          created_at?: string | null
          followed_creator_id?: string | null
          followed_external_id?: string | null
          follower_user_id: string
          id?: string
          notify_new_position?: boolean | null
          notify_position_closed?: boolean | null
          notify_via_push?: boolean | null
          notify_via_telegram?: boolean | null
        }
        Update: {
          created_at?: string | null
          followed_creator_id?: string | null
          followed_external_id?: string | null
          follower_user_id?: string
          id?: string
          notify_new_position?: boolean | null
          notify_position_closed?: boolean | null
          notify_via_push?: boolean | null
          notify_via_telegram?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "follows_followed_creator_id_fkey"
            columns: ["followed_creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_followed_external_id_fkey"
            columns: ["followed_external_id"]
            isOneToOne: false
            referencedRelation: "external_traders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_follower_user_id_fkey"
            columns: ["follower_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      geo_blocks: {
        Row: {
          block_type: string
          country_code: string
          country_name: string
          created_at: string | null
          created_by: string | null
          effective_from: string | null
          effective_until: string | null
          reason: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          block_type: string
          country_code: string
          country_name: string
          created_at?: string | null
          created_by?: string | null
          effective_from?: string | null
          effective_until?: string | null
          reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          block_type?: string
          country_code?: string
          country_name?: string
          created_at?: string | null
          created_by?: string | null
          effective_from?: string | null
          effective_until?: string | null
          reason?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "geo_blocks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "geo_blocks_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_submissions: {
        Row: {
          address_proof_url: string | null
          ai_check_confidence: number | null
          ai_check_metadata: Json | null
          ai_check_passed: boolean | null
          id: string
          id_back_url: string | null
          id_front_url: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          selfie_url: string
          status: string | null
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          address_proof_url?: string | null
          ai_check_confidence?: number | null
          ai_check_metadata?: Json | null
          ai_check_passed?: boolean | null
          id?: string
          id_back_url?: string | null
          id_front_url: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          selfie_url: string
          status?: string | null
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          address_proof_url?: string | null
          ai_check_confidence?: number | null
          ai_check_metadata?: Json | null
          ai_check_passed?: boolean | null
          id?: string
          id_back_url?: string | null
          id_front_url?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          selfie_url?: string
          status?: string | null
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kyc_submissions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kyc_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      market_comments_internal: {
        Row: {
          body: string
          created_at: string | null
          deleted_at: string | null
          hidden_by: string | null
          hidden_reason: string | null
          id: string
          is_hidden: boolean | null
          likes_count: number | null
          market_id: string
          parent_comment_id: string | null
          replies_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          deleted_at?: string | null
          hidden_by?: string | null
          hidden_reason?: string | null
          id?: string
          is_hidden?: boolean | null
          likes_count?: number | null
          market_id: string
          parent_comment_id?: string | null
          replies_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          deleted_at?: string | null
          hidden_by?: string | null
          hidden_reason?: string | null
          id?: string
          is_hidden?: boolean | null
          likes_count?: number | null
          market_id?: string
          parent_comment_id?: string | null
          replies_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_comments_internal_hidden_by_fkey"
            columns: ["hidden_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_comments_internal_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_comments_internal_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "market_comments_internal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_comments_internal_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      markets: {
        Row: {
          card_kind: string
          category: string
          created_at: string | null
          current_no_price: number | null
          current_yes_price: number | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          is_hidden: boolean | null
          is_hot: boolean | null
          last_synced_at: string | null
          liquidity: number | null
          polymarket_event_id: string
          polymarket_market_id: string
          resolution_source: string | null
          resolved_at: string | null
          resolved_outcome: string | null
          resolves_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string | null
          volume_24h: number | null
          volume_total: number | null
        }
        Insert: {
          card_kind: string
          category: string
          created_at?: string | null
          current_no_price?: number | null
          current_yes_price?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_hidden?: boolean | null
          is_hot?: boolean | null
          last_synced_at?: string | null
          liquidity?: number | null
          polymarket_event_id: string
          polymarket_market_id: string
          resolution_source?: string | null
          resolved_at?: string | null
          resolved_outcome?: string | null
          resolves_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          volume_24h?: number | null
          volume_total?: number | null
        }
        Update: {
          card_kind?: string
          category?: string
          created_at?: string | null
          current_no_price?: number | null
          current_yes_price?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_hidden?: boolean | null
          is_hot?: boolean | null
          last_synced_at?: string | null
          liquidity?: number | null
          polymarket_event_id?: string
          polymarket_market_id?: string
          resolution_source?: string | null
          resolved_at?: string | null
          resolved_outcome?: string | null
          resolves_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          volume_24h?: number | null
          volume_total?: number | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          cta_label: string | null
          cta_url: string | null
          delivered_email: boolean | null
          delivered_in_app: boolean | null
          delivered_push: boolean | null
          delivered_telegram: boolean | null
          id: string
          is_read: boolean | null
          priority: string | null
          read_at: string | null
          related_creator_id: string | null
          related_market_id: string | null
          related_signal_id: string | null
          related_trade_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          cta_label?: string | null
          cta_url?: string | null
          delivered_email?: boolean | null
          delivered_in_app?: boolean | null
          delivered_push?: boolean | null
          delivered_telegram?: boolean | null
          id?: string
          is_read?: boolean | null
          priority?: string | null
          read_at?: string | null
          related_creator_id?: string | null
          related_market_id?: string | null
          related_signal_id?: string | null
          related_trade_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          cta_label?: string | null
          cta_url?: string | null
          delivered_email?: boolean | null
          delivered_in_app?: boolean | null
          delivered_push?: boolean | null
          delivered_telegram?: boolean | null
          id?: string
          is_read?: boolean | null
          priority?: string | null
          read_at?: string | null
          related_creator_id?: string | null
          related_market_id?: string | null
          related_signal_id?: string | null
          related_trade_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_creator_id_fkey"
            columns: ["related_creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_related_market_id_fkey"
            columns: ["related_market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_related_signal_id_fkey"
            columns: ["related_signal_id"]
            isOneToOne: false
            referencedRelation: "signals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_related_trade_id_fkey"
            columns: ["related_trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      positions: {
        Row: {
          avg_price: number
          closed_at: string | null
          current_price: number | null
          current_value: number | null
          id: string
          is_demo: boolean
          is_open: boolean | null
          market_id: string
          opened_at: string | null
          shares: number
          side: string
          total_cost: number
          unrealized_pnl: number | null
          unrealized_pnl_pct: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avg_price: number
          closed_at?: string | null
          current_price?: number | null
          current_value?: number | null
          id?: string
          is_demo?: boolean
          is_open?: boolean | null
          market_id: string
          opened_at?: string | null
          shares: number
          side: string
          total_cost: number
          unrealized_pnl?: number | null
          unrealized_pnl_pct?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avg_price?: number
          closed_at?: string | null
          current_price?: number | null
          current_value?: number | null
          id?: string
          is_demo?: boolean
          is_open?: boolean | null
          market_id?: string
          opened_at?: string | null
          shares?: number
          side?: string
          total_cost?: number
          unrealized_pnl?: number | null
          unrealized_pnl_pct?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "positions_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "positions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      price_history: {
        Row: {
          market_id: string
          no_price: number | null
          recorded_at: string
          volume_period: number | null
          yes_price: number | null
        }
        Insert: {
          market_id: string
          no_price?: number | null
          recorded_at: string
          volume_period?: number | null
          yes_price?: number | null
        }
        Update: {
          market_id?: string
          no_price?: number | null
          recorded_at?: string
          volume_period?: number | null
          yes_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "price_history_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          first_trade_at: string | null
          id: string
          is_active: boolean | null
          payout_until: string | null
          referral_code: string
          referred_user_id: string
          referrer_user_id: string
          signed_up_at: string | null
          total_fees_generated: number | null
          total_payout_to_referrer: number | null
          total_volume_generated: number | null
        }
        Insert: {
          first_trade_at?: string | null
          id?: string
          is_active?: boolean | null
          payout_until?: string | null
          referral_code: string
          referred_user_id: string
          referrer_user_id: string
          signed_up_at?: string | null
          total_fees_generated?: number | null
          total_payout_to_referrer?: number | null
          total_volume_generated?: number | null
        }
        Update: {
          first_trade_at?: string | null
          id?: string
          is_active?: boolean | null
          payout_until?: string | null
          referral_code?: string
          referred_user_id?: string
          referrer_user_id?: string
          signed_up_at?: string | null
          total_fees_generated?: number | null
          total_payout_to_referrer?: number | null
          total_volume_generated?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_user_id_fkey"
            columns: ["referrer_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      signals: {
        Row: {
          algorithm_name: string
          confidence_pct: number
          created_at: string | null
          current_market_price: number | null
          direction: string
          edge_pct: number
          id: string
          market_id: string
          metadata: Json | null
          predicted_probability: number | null
          realized_edge_pct: number | null
          resolved_at: string | null
          status: string | null
          valid_from: string | null
          valid_until: string | null
          was_correct: boolean | null
        }
        Insert: {
          algorithm_name: string
          confidence_pct: number
          created_at?: string | null
          current_market_price?: number | null
          direction: string
          edge_pct: number
          id?: string
          market_id: string
          metadata?: Json | null
          predicted_probability?: number | null
          realized_edge_pct?: number | null
          resolved_at?: string | null
          status?: string | null
          valid_from?: string | null
          valid_until?: string | null
          was_correct?: boolean | null
        }
        Update: {
          algorithm_name?: string
          confidence_pct?: number
          created_at?: string | null
          current_market_price?: number | null
          direction?: string
          edge_pct?: number
          id?: string
          market_id?: string
          metadata?: Json | null
          predicted_probability?: number | null
          realized_edge_pct?: number | null
          resolved_at?: string | null
          status?: string | null
          valid_from?: string | null
          valid_until?: string | null
          was_correct?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "signals_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          builder_fee: number | null
          copied_from_creator_id: string | null
          copied_from_external_id: string | null
          executed_at: string | null
          id: string
          is_demo: boolean
          is_win: boolean | null
          market_id: string
          pnl: number | null
          pnl_pct: number | null
          polymarket_order_id: string | null
          polymarket_tx_hash: string | null
          position_id: string | null
          price: number
          service_fee: number | null
          shares: number
          side: string
          source: string
          total_amount: number
          trade_type: string
          user_id: string
        }
        Insert: {
          builder_fee?: number | null
          copied_from_creator_id?: string | null
          copied_from_external_id?: string | null
          executed_at?: string | null
          id?: string
          is_demo?: boolean
          is_win?: boolean | null
          market_id: string
          pnl?: number | null
          pnl_pct?: number | null
          polymarket_order_id?: string | null
          polymarket_tx_hash?: string | null
          position_id?: string | null
          price: number
          service_fee?: number | null
          shares: number
          side: string
          source?: string
          total_amount: number
          trade_type: string
          user_id: string
        }
        Update: {
          builder_fee?: number | null
          copied_from_creator_id?: string | null
          copied_from_external_id?: string | null
          executed_at?: string | null
          id?: string
          is_demo?: boolean
          is_win?: boolean | null
          market_id?: string
          pnl?: number | null
          pnl_pct?: number | null
          polymarket_order_id?: string | null
          polymarket_tx_hash?: string | null
          position_id?: string | null
          price?: number
          service_fee?: number | null
          shares?: number
          side?: string
          source?: string
          total_amount?: number
          trade_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_copied_from_creator_id_fkey"
            columns: ["copied_from_creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_copied_from_external_id_fkey"
            columns: ["copied_from_external_id"]
            isOneToOne: false
            referencedRelation: "external_traders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          default_chart_timeframe: string | null
          default_period_filter: string | null
          default_sort_leaderboard: string | null
          interests: string[] | null
          notify_email: boolean | null
          notify_push: boolean | null
          notify_telegram: boolean | null
          onboarding_skipped: boolean | null
          onboarding_step_completed: number | null
          profile_visible: boolean | null
          settings: Json | null
          show_demo_banner: boolean | null
          show_welcome_banner: boolean | null
          telegram_chat_id: string | null
          telegram_premium: boolean | null
          telegram_premium_until: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          default_chart_timeframe?: string | null
          default_period_filter?: string | null
          default_sort_leaderboard?: string | null
          interests?: string[] | null
          notify_email?: boolean | null
          notify_push?: boolean | null
          notify_telegram?: boolean | null
          onboarding_skipped?: boolean | null
          onboarding_step_completed?: number | null
          profile_visible?: boolean | null
          settings?: Json | null
          show_demo_banner?: boolean | null
          show_welcome_banner?: boolean | null
          telegram_chat_id?: string | null
          telegram_premium?: boolean | null
          telegram_premium_until?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          default_chart_timeframe?: string | null
          default_period_filter?: string | null
          default_sort_leaderboard?: string | null
          interests?: string[] | null
          notify_email?: boolean | null
          notify_push?: boolean | null
          notify_telegram?: boolean | null
          onboarding_skipped?: boolean | null
          onboarding_step_completed?: number | null
          profile_visible?: boolean | null
          settings?: Json | null
          show_demo_banner?: boolean | null
          show_welcome_banner?: boolean | null
          telegram_chat_id?: string | null
          telegram_premium?: boolean | null
          telegram_premium_until?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_id: string | null
          avatar_url: string | null
          bio: string | null
          country_code: string | null
          created_at: string | null
          deleted_at: string | null
          display_name: string | null
          email: string | null
          email_verified: boolean | null
          geo_block_status: string | null
          id: string
          is_suspended: boolean | null
          language: string | null
          last_login_at: string | null
          onboarding_completed: boolean | null
          phone: string | null
          phone_verified: boolean | null
          privy_did: string | null
          suspended_at: string | null
          suspended_reason: string | null
          theme: string | null
          updated_at: string | null
          username: string | null
          wallet_address: string | null
        }
        Insert: {
          auth_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          country_code?: string | null
          created_at?: string | null
          deleted_at?: string | null
          display_name?: string | null
          email?: string | null
          email_verified?: boolean | null
          geo_block_status?: string | null
          id?: string
          is_suspended?: boolean | null
          language?: string | null
          last_login_at?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          phone_verified?: boolean | null
          privy_did?: string | null
          suspended_at?: string | null
          suspended_reason?: string | null
          theme?: string | null
          updated_at?: string | null
          username?: string | null
          wallet_address?: string | null
        }
        Update: {
          auth_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          country_code?: string | null
          created_at?: string | null
          deleted_at?: string | null
          display_name?: string | null
          email?: string | null
          email_verified?: boolean | null
          geo_block_status?: string | null
          id?: string
          is_suspended?: boolean | null
          language?: string | null
          last_login_at?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          phone_verified?: boolean | null
          privy_did?: string | null
          suspended_at?: string | null
          suspended_reason?: string | null
          theme?: string | null
          updated_at?: string | null
          username?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      watchlist: {
        Row: {
          added_at: string | null
          id: string
          market_id: string
          notify_price_change_pct: number | null
          notify_resolution: boolean | null
          notify_signal: boolean | null
          user_id: string
        }
        Insert: {
          added_at?: string | null
          id?: string
          market_id: string
          notify_price_change_pct?: number | null
          notify_resolution?: boolean | null
          notify_signal?: boolean | null
          user_id: string
        }
        Update: {
          added_at?: string | null
          id?: string
          market_id?: string
          notify_price_change_pct?: number | null
          notify_resolution?: boolean | null
          notify_signal?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watchlist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_admin_role: { Args: { uid: string }; Returns: string }
      user_positions: {
        Args: { p_is_demo?: boolean; p_user_id: string }
        Returns: {
          avg_price: number
          closed_at: string | null
          current_price: number | null
          current_value: number | null
          id: string
          is_demo: boolean
          is_open: boolean | null
          market_id: string
          opened_at: string | null
          shares: number
          side: string
          total_cost: number
          unrealized_pnl: number | null
          unrealized_pnl_pct: number | null
          updated_at: string | null
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "positions"
          isOneToOne: false
          isSetofReturn: true
        }
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
