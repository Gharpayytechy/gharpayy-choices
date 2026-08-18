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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      listings: {
        Row: {
          area: string
          auto_decision: string | null
          available_from: string | null
          city: string
          content_hash: string | null
          created_at: string
          deposit: number | null
          description: string
          household: Json
          id: string
          kind: Database["public"]["Enums"]["listing_kind"]
          missing: Json
          money: Json
          owner_id: string
          photos: Json
          property_id: string | null
          quality_score: number
          reject_reasons: Json
          rent: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          room_id: string | null
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at: string
          vacancy_id: string | null
        }
        Insert: {
          area?: string
          auto_decision?: string | null
          available_from?: string | null
          city?: string
          content_hash?: string | null
          created_at?: string
          deposit?: number | null
          description?: string
          household?: Json
          id?: string
          kind?: Database["public"]["Enums"]["listing_kind"]
          missing?: Json
          money?: Json
          owner_id: string
          photos?: Json
          property_id?: string | null
          quality_score?: number
          reject_reasons?: Json
          rent?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          room_id?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
          updated_at?: string
          vacancy_id?: string | null
        }
        Update: {
          area?: string
          auto_decision?: string | null
          available_from?: string | null
          city?: string
          content_hash?: string | null
          created_at?: string
          deposit?: number | null
          description?: string
          household?: Json
          id?: string
          kind?: Database["public"]["Enums"]["listing_kind"]
          missing?: Json
          money?: Json
          owner_id?: string
          photos?: Json
          property_id?: string | null
          quality_score?: number
          reject_reasons?: Json
          rent?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          room_id?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
          updated_at?: string
          vacancy_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_vacancy_id_fkey"
            columns: ["vacancy_id"]
            isOneToOne: false
            referencedRelation: "vacancies"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_events: {
        Row: {
          actor: string
          actor_id: string | null
          created_at: string
          decision: string
          id: string
          listing_id: string | null
          reasons: Json
          score: number | null
          subject_person_id: string | null
        }
        Insert: {
          actor?: string
          actor_id?: string | null
          created_at?: string
          decision: string
          id?: string
          listing_id?: string | null
          reasons?: Json
          score?: number | null
          subject_person_id?: string | null
        }
        Update: {
          actor?: string
          actor_id?: string | null
          created_at?: string
          decision?: string
          id?: string
          listing_id?: string | null
          reasons?: Json
          score?: number | null
          subject_person_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_events_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_events_subject_person_id_fkey"
            columns: ["subject_person_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      person_modes: {
        Row: {
          active: boolean
          created_at: string
          id: string
          mode: Database["public"]["Enums"]["person_mode"]
          payload: Json
          person_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          mode: Database["public"]["Enums"]["person_mode"]
          payload?: Json
          person_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          mode?: Database["public"]["Enums"]["person_mode"]
          payload?: Json
          person_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "person_modes_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          about: string | null
          age: number | null
          banned: boolean
          city: string
          company_or_college: string | null
          created_at: string
          email: string | null
          email_verified: boolean
          full_name: string
          gender: string | null
          id: string
          id_verified: boolean
          occupation: string | null
          phone: string | null
          phone_verified: boolean
          photo_url: string | null
          profile_score: number
          trust_score: number
          updated_at: string
          work_verified: boolean
        }
        Insert: {
          about?: string | null
          age?: number | null
          banned?: boolean
          city?: string
          company_or_college?: string | null
          created_at?: string
          email?: string | null
          email_verified?: boolean
          full_name?: string
          gender?: string | null
          id: string
          id_verified?: boolean
          occupation?: string | null
          phone?: string | null
          phone_verified?: boolean
          photo_url?: string | null
          profile_score?: number
          trust_score?: number
          updated_at?: string
          work_verified?: boolean
        }
        Update: {
          about?: string | null
          age?: number | null
          banned?: boolean
          city?: string
          company_or_college?: string | null
          created_at?: string
          email?: string | null
          email_verified?: boolean
          full_name?: string
          gender?: string | null
          id?: string
          id_verified?: boolean
          occupation?: string | null
          phone?: string | null
          phone_verified?: boolean
          photo_url?: string | null
          profile_score?: number
          trust_score?: number
          updated_at?: string
          work_verified?: boolean
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          area: string
          authority: string
          bhk: number | null
          city: string
          created_at: string
          furnishing: string | null
          gated: boolean
          id: string
          lat: number | null
          lng: number | null
          managed: boolean
          owner_id: string
          title: string
          updated_at: string
        }
        Insert: {
          address?: string
          area?: string
          authority?: string
          bhk?: number | null
          city?: string
          created_at?: string
          furnishing?: string | null
          gated?: boolean
          id?: string
          lat?: number | null
          lng?: number | null
          managed?: boolean
          owner_id: string
          title?: string
          updated_at?: string
        }
        Update: {
          address?: string
          area?: string
          authority?: string
          bhk?: number | null
          city?: string
          created_at?: string
          furnishing?: string | null
          gated?: boolean
          id?: string
          lat?: number | null
          lng?: number | null
          managed?: boolean
          owner_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          bucket: string
          count: number
          day: string
          id: string
          person_id: string
        }
        Insert: {
          bucket: string
          count?: number
          day?: string
          id?: string
          person_id: string
        }
        Update: {
          bucket?: string
          count?: number
          day?: string
          id?: string
          person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rate_limits_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          ac: boolean
          attached_bath: boolean
          balcony: boolean
          created_at: string
          furnished: string | null
          id: string
          label: string
          owner_id: string
          photos: Json
          property_id: string
          room_type: string
          size_sqft: number | null
          updated_at: string
        }
        Insert: {
          ac?: boolean
          attached_bath?: boolean
          balcony?: boolean
          created_at?: string
          furnished?: string | null
          id?: string
          label?: string
          owner_id: string
          photos?: Json
          property_id: string
          room_type?: string
          size_sqft?: number | null
          updated_at?: string
        }
        Update: {
          ac?: boolean
          attached_bath?: boolean
          balcony?: boolean
          created_at?: string
          furnished?: string | null
          id?: string
          label?: string
          owner_id?: string
          photos?: Json
          property_id?: string
          room_type?: string
          size_sqft?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rooms_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      spam_signals: {
        Row: {
          created_at: string
          detail: Json
          id: string
          listing_id: string | null
          person_id: string | null
          severity: number
          signal: string
        }
        Insert: {
          created_at?: string
          detail?: Json
          id?: string
          listing_id?: string | null
          person_id?: string | null
          severity?: number
          signal: string
        }
        Update: {
          created_at?: string
          detail?: Json
          id?: string
          listing_id?: string | null
          person_id?: string | null
          severity?: number
          signal?: string
        }
        Relationships: [
          {
            foreignKeyName: "spam_signals_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spam_signals_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vacancies: {
        Row: {
          available_from: string | null
          created_at: string
          deposit: number | null
          id: string
          maintenance: number | null
          min_duration_months: number | null
          one_time_costs: number | null
          owner_id: string
          rent: number | null
          room_id: string
          status: string
          updated_at: string
          utilities_estimate: number | null
        }
        Insert: {
          available_from?: string | null
          created_at?: string
          deposit?: number | null
          id?: string
          maintenance?: number | null
          min_duration_months?: number | null
          one_time_costs?: number | null
          owner_id: string
          rent?: number | null
          room_id: string
          status?: string
          updated_at?: string
          utilities_estimate?: number | null
        }
        Update: {
          available_from?: string | null
          created_at?: string
          deposit?: number | null
          id?: string
          maintenance?: number | null
          min_duration_months?: number | null
          one_time_costs?: number | null
          owner_id?: string
          rent?: number | null
          room_id?: string
          status?: string
          updated_at?: string
          utilities_estimate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vacancies_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vacancies_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      listing_kind:
        | "replacement_room"
        | "owner_room"
        | "whole_flat"
        | "managed_unit"
      listing_status:
        | "draft"
        | "pending"
        | "limited"
        | "live"
        | "rejected"
        | "filled"
      person_mode:
        | "room_seeker"
        | "replacement_host"
        | "property_owner"
        | "managed_owner"
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
      listing_kind: [
        "replacement_room",
        "owner_room",
        "whole_flat",
        "managed_unit",
      ],
      listing_status: [
        "draft",
        "pending",
        "limited",
        "live",
        "rejected",
        "filled",
      ],
      person_mode: [
        "room_seeker",
        "replacement_host",
        "property_owner",
        "managed_owner",
      ],
    },
  },
} as const
