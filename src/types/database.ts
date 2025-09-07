// Database types for Supabase integration
// Auto-generated types should be used in production via `supabase gen types typescript`

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string;
          avatar_url: string | null;
          quote: string | null;
          favorite_genres: string[];
          favorite_titles: string[];
          is_public: boolean;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name: string;
          avatar_url?: string | null;
          quote?: string | null;
          favorite_genres?: string[];
          favorite_titles?: string[];
          is_public?: boolean;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string;
          avatar_url?: string | null;
          quote?: string | null;
          favorite_genres?: string[];
          favorite_titles?: string[];
          is_public?: boolean;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      habitats: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          tags: string[];
          is_public: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
          banner_url: string | null;
          member_count: number;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          tags?: string[];
          is_public?: boolean;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          banner_url?: string | null;
          member_count?: number;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          tags?: string[];
          is_public?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          banner_url?: string | null;
          member_count?: number;
        };
      };
      habitat_members: {
        Row: {
          habitat_id: string;
          user_id: string;
          joined_at: string;
          last_active: string;
        };
        Insert: {
          habitat_id: string;
          user_id: string;
          joined_at?: string;
          last_active?: string;
        };
        Update: {
          habitat_id?: string;
          user_id?: string;
          joined_at?: string;
          last_active?: string;
        };
      };
      habitat_messages: {
        Row: {
          id: string;
          habitat_id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          habitat_id: string;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          habitat_id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper types for easier usage
export type Profile = Database["public"]["Tables"]["user_profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["user_profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["user_profiles"]["Update"];

// Habitat database types
export type HabitatRow = Database["public"]["Tables"]["habitats"]["Row"];
export type HabitatInsert = Database["public"]["Tables"]["habitats"]["Insert"];
export type HabitatUpdate = Database["public"]["Tables"]["habitats"]["Update"];

export type HabitatMemberRow =
  Database["public"]["Tables"]["habitat_members"]["Row"];
export type HabitatMemberInsert =
  Database["public"]["Tables"]["habitat_members"]["Insert"];
export type HabitatMemberUpdate =
  Database["public"]["Tables"]["habitat_members"]["Update"];

export type HabitatMessageRow =
  Database["public"]["Tables"]["habitat_messages"]["Row"];
export type HabitatMessageInsert =
  Database["public"]["Tables"]["habitat_messages"]["Insert"];
export type HabitatMessageUpdate =
  Database["public"]["Tables"]["habitat_messages"]["Update"];
