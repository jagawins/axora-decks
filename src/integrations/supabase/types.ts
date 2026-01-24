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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      assets: {
        Row: {
          alt: string
          aspect: string | null
          block_id: string | null
          created_at: string
          credit: string | null
          id: string
          project_id: string | null
          provider: string | null
          query: string | null
          src: string
        }
        Insert: {
          alt: string
          aspect?: string | null
          block_id?: string | null
          created_at?: string
          credit?: string | null
          id?: string
          project_id?: string | null
          provider?: string | null
          query?: string | null
          src: string
        }
        Update: {
          alt?: string
          aspect?: string | null
          block_id?: string | null
          created_at?: string
          credit?: string | null
          id?: string
          project_id?: string | null
          provider?: string | null
          query?: string | null
          src?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      blocks: {
        Row: {
          content: Json
          created_at: string
          id: string
          order_index: number
          project_id: string
          type: Database["public"]["Enums"]["block_type"]
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          order_index?: number
          project_id: string
          type: Database["public"]["Enums"]["block_type"]
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          order_index?: number
          project_id?: string
          type?: Database["public"]["Enums"]["block_type"]
        }
        Relationships: [
          {
            foreignKeyName: "blocks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      exports: {
        Row: {
          created_at: string
          file_url: string | null
          format: Database["public"]["Enums"]["export_format"]
          id: string
          project_id: string
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          format: Database["public"]["Enums"]["export_format"]
          id?: string
          project_id: string
        }
        Update: {
          created_at?: string
          file_url?: string | null
          format?: Database["public"]["Enums"]["export_format"]
          id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      folders: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      image_cache: {
        Row: {
          alt: string
          aspect: string | null
          created_at: string
          credit: string | null
          id: string
          provider: string
          query: string
          src: string
        }
        Insert: {
          alt: string
          aspect?: string | null
          created_at?: string
          credit?: string | null
          id?: string
          provider: string
          query: string
          src: string
        }
        Update: {
          alt?: string
          aspect?: string | null
          created_at?: string
          credit?: string | null
          id?: string
          provider?: string
          query?: string
          src?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          brand_kit: Json | null
          created_at: string
          email: string
          id: string
          name: string | null
          tier: Database["public"]["Enums"]["user_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_kit?: Json | null
          created_at?: string
          email: string
          id?: string
          name?: string | null
          tier?: Database["public"]["Enums"]["user_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_kit?: Json | null
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          tier?: Database["public"]["Enums"]["user_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          folder_id: string | null
          id: string
          is_favorite: boolean | null
          last_viewed_at: string | null
          share_enabled: boolean
          share_token: string
          theme: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          folder_id?: string | null
          id?: string
          is_favorite?: boolean | null
          last_viewed_at?: string | null
          share_enabled?: boolean
          share_token?: string
          theme?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          folder_id?: string | null
          id?: string
          is_favorite?: boolean | null
          last_viewed_at?: string | null
          share_enabled?: boolean
          share_token?: string
          theme?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          subscribed: boolean
          subscription_end: string | null
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          subscribed?: boolean
          subscription_end?: string | null
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          subscribed?: boolean
          subscription_end?: string | null
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      template_blocks: {
        Row: {
          block_meta: Json | null
          block_payload: Json | null
          content: Json
          created_at: string
          id: string
          order_index: number
          template_id: string
          type: Database["public"]["Enums"]["block_type"]
        }
        Insert: {
          block_meta?: Json | null
          block_payload?: Json | null
          content?: Json
          created_at?: string
          id?: string
          order_index?: number
          template_id: string
          type: Database["public"]["Enums"]["block_type"]
        }
        Update: {
          block_meta?: Json | null
          block_payload?: Json | null
          content?: Json
          created_at?: string
          id?: string
          order_index?: number
          template_id?: string
          type?: Database["public"]["Enums"]["block_type"]
        }
        Relationships: [
          {
            foreignKeyName: "template_blocks_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      template_previews: {
        Row: {
          created_at: string
          id: string
          image_base64: string
          renderer_version: number
          template_id: string
          template_version: number
          theme_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_base64: string
          renderer_version?: number
          template_id: string
          template_version?: number
          theme_id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_base64?: string
          renderer_version?: number
          template_id?: string
          template_version?: number
          theme_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_previews_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          category: string
          created_at: string
          default_theme_id: string | null
          description: string | null
          id: string
          is_featured: boolean
          slug: string
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          category: string
          created_at?: string
          default_theme_id?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean
          slug: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          category?: string
          created_at?: string
          default_theme_id?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean
          slug?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      block_type:
        | "text"
        | "heading"
        | "image"
        | "two_col"
        | "table"
        | "list"
        | "callout"
      export_format: "pdf" | "slides" | "web"
      user_tier: "free" | "pro" | "executive"
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
      block_type: [
        "text",
        "heading",
        "image",
        "two_col",
        "table",
        "list",
        "callout",
      ],
      export_format: ["pdf", "slides", "web"],
      user_tier: ["free", "pro", "executive"],
    },
  },
} as const
