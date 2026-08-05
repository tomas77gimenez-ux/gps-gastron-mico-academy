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
      breakeven_inputs: {
        Row: {
          avg_ticket: number
          created_at: string
          current_sales: number | null
          fixed_costs: number
          operating_days: number
          updated_at: string
          user_id: string
          variable_cost_pct: number
        }
        Insert: {
          avg_ticket?: number
          created_at?: string
          current_sales?: number | null
          fixed_costs?: number
          operating_days?: number
          updated_at?: string
          user_id: string
          variable_cost_pct?: number
        }
        Update: {
          avg_ticket?: number
          created_at?: string
          current_sales?: number | null
          fixed_costs?: number
          operating_days?: number
          updated_at?: string
          user_id?: string
          variable_cost_pct?: number
        }
        Relationships: []
      }
      cash_movements: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          occurred_at: string
          session_id: string
          type: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          occurred_at?: string
          session_id: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          occurred_at?: string
          session_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_movements_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "cash_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_sessions: {
        Row: {
          closed_at: string | null
          created_at: string
          id: string
          opening_fund: number
          physical_count: number | null
          responsible: string
          session_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          id?: string
          opening_fund?: number
          physical_count?: number | null
          responsible?: string
          session_date?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          id?: string
          opening_fund?: number
          physical_count?: number | null
          responsible?: string
          session_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cmv_settings: {
        Row: {
          created_at: string
          target_pct: number
          tolerance_pts: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          target_pct?: number
          tolerance_pts?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          target_pct?: number
          tolerance_pts?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cmv_weeks: {
        Row: {
          created_at: string
          id: string
          month: string
          purchases: number
          sales: number
          updated_at: string
          user_id: string
          week: number
        }
        Insert: {
          created_at?: string
          id?: string
          month: string
          purchases?: number
          sales?: number
          updated_at?: string
          user_id: string
          week: number
        }
        Update: {
          created_at?: string
          id?: string
          month?: string
          purchases?: number
          sales?: number
          updated_at?: string
          user_id?: string
          week?: number
        }
        Relationships: []
      }
      course_materials: {
        Row: {
          course_id: string | null
          created_at: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          lesson_id: string | null
          required_plan: Database["public"]["Enums"]["plan_tier"]
          title: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          file_size?: number | null
          file_type?: string
          file_url: string
          id?: string
          lesson_id?: string | null
          required_plan?: Database["public"]["Enums"]["plan_tier"]
          title: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          lesson_id?: string | null
          required_plan?: Database["public"]["Enums"]["plan_tier"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_materials_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_materials_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string
          created_at: string
          description: string | null
          estimated_duration: string | null
          id: string
          instructor: string
          level: string
          methodology: string
          module_number: number | null
          pillar_order: number | null
          sort_order: number
          status: string
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          estimated_duration?: string | null
          id?: string
          instructor?: string
          level?: string
          methodology?: string
          module_number?: number | null
          pillar_order?: number | null
          sort_order?: number
          status?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          estimated_duration?: string | null
          id?: string
          instructor?: string
          level?: string
          methodology?: string
          module_number?: number | null
          pillar_order?: number | null
          sort_order?: number
          status?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      dish_ingredients: {
        Row: {
          created_at: string
          dish_id: string
          id: string
          ingredient_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string
          dish_id: string
          id?: string
          ingredient_id: string
          quantity?: number
          user_id: string
        }
        Update: {
          created_at?: string
          dish_id?: string
          id?: string
          ingredient_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dish_ingredients_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dish_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      dishes: {
        Row: {
          created_at: string
          current_menu_price: number | null
          id: string
          name: string
          target_cmv_pct: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_menu_price?: number | null
          id?: string
          name: string
          target_cmv_pct?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_menu_price?: number | null
          id?: string
          name?: string
          target_cmv_pct?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dre_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string
          dre_month_id: string
          id: string
          user_id: string
        }
        Insert: {
          amount?: number
          category: string
          created_at?: string
          description?: string
          dre_month_id: string
          id?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string
          dre_month_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dre_expenses_dre_month_id_fkey"
            columns: ["dre_month_id"]
            isOneToOne: false
            referencedRelation: "dre_months"
            referencedColumns: ["id"]
          },
        ]
      }
      dre_months: {
        Row: {
          cmv_purchases: number
          created_at: string
          id: string
          month: string
          sales: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cmv_purchases?: number
          created_at?: string
          id?: string
          month: string
          sales?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cmv_purchases?: number
          created_at?: string
          id?: string
          month?: string
          sales?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dre_realtime_cycles: {
        Row: {
          closed_at: string | null
          created_at: string
          id: string
          label: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          id?: string
          label: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          id?: string
          label?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dre_realtime_entries: {
        Row: {
          created_at: string
          cycle_id: string
          data: Json
          id: string
          updated_at: string
          user_id: string
          week_number: number
        }
        Insert: {
          created_at?: string
          cycle_id: string
          data?: Json
          id?: string
          updated_at?: string
          user_id: string
          week_number: number
        }
        Update: {
          created_at?: string
          cycle_id?: string
          data?: Json
          id?: string
          updated_at?: string
          user_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "dre_realtime_entries_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "dre_realtime_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      ingredients: {
        Row: {
          created_at: string
          id: string
          name: string
          purchase_price: number
          unit: string
          updated_at: string
          user_id: string
          yield_factor_pct: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          purchase_price?: number
          unit?: string
          updated_at?: string
          user_id: string
          yield_factor_pct?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          purchase_price?: number
          unit?: string
          updated_at?: string
          user_id?: string
          yield_factor_pct?: number
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed: boolean
          course_id: string
          created_at: string
          duration_seconds: number | null
          id: string
          last_watched_at: string
          lesson_id: string
          progress_seconds: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          course_id: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          last_watched_at?: string
          lesson_id: string
          progress_seconds?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          course_id?: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          last_watched_at?: string
          lesson_id?: string
          progress_seconds?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          content_type: string
          course_id: string
          created_at: string
          description: string | null
          duration: string | null
          id: string
          is_free: boolean
          panda_library_id: string | null
          panda_video_id: string | null
          poster_url: string | null
          required_plan: Database["public"]["Enums"]["plan_tier"]
          sort_order: number
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          content_type?: string
          course_id: string
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          is_free?: boolean
          panda_library_id?: string | null
          panda_video_id?: string | null
          poster_url?: string | null
          required_plan?: Database["public"]["Enums"]["plan_tier"]
          sort_order?: number
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          content_type?: string
          course_id?: string
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          is_free?: boolean
          panda_library_id?: string | null
          panda_video_id?: string | null
          poster_url?: string | null
          required_plan?: Database["public"]["Enums"]["plan_tier"]
          sort_order?: number
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          tools_free_access: boolean
          updated_at: string
          user_id: string
          welcomed_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          tools_free_access?: boolean
          updated_at?: string
          user_id: string
          welcomed_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          tools_free_access?: boolean
          updated_at?: string
          user_id?: string
          welcomed_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          granted_by: string | null
          id: string
          notes: string | null
          plan_tier: Database["public"]["Enums"]["plan_tier"] | null
          price_id: string | null
          product_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          granted_by?: string | null
          id?: string
          notes?: string | null
          plan_tier?: Database["public"]["Enums"]["plan_tier"] | null
          price_id?: string | null
          product_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          granted_by?: string | null
          id?: string
          notes?: string | null
          plan_tier?: Database["public"]["Enums"]["plan_tier"] | null
          price_id?: string | null
          product_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_list_users: {
        Args: never
        Returns: {
          created_at: string
          current_period_end: string
          email: string
          environment: string
          is_admin: boolean
          plan_tier: Database["public"]["Enums"]["plan_tier"]
          status: string
          subscription_id: string
          tools_free_access: boolean
          user_id: string
        }[]
      }
      admin_set_tools_access: {
        Args: { _enabled: boolean; _user_id: string }
        Returns: boolean
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_lesson_video: {
        Args: { _lesson_id: string }
        Returns: {
          panda_library_id: string
          panda_video_id: string
          video_url: string
        }[]
      }
      grant_subscription: {
        Args: {
          _duration_days: number
          _notes?: string
          _plan: Database["public"]["Enums"]["plan_tier"]
          _user_id: string
        }
        Returns: string
      }
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      has_plan_access: {
        Args: {
          _required: Database["public"]["Enums"]["plan_tier"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_tools_access: { Args: { _user_id: string }; Returns: boolean }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      revoke_subscription: {
        Args: { _subscription_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      plan_tier: "basico" | "premium"
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
      app_role: ["admin", "moderator", "user"],
      plan_tier: ["basico", "premium"],
    },
  },
} as const
