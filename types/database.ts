export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          is_default?: boolean
          created_at?: string
        }
        Relationships: []
      }
      items: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          name: string
          brand: string | null
          colour: string | null
          price: number | null
          image_url: string | null
          source_url: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          name: string
          brand?: string | null
          colour?: string | null
          price?: number | null
          image_url?: string | null
          source_url?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          name?: string
          brand?: string | null
          colour?: string | null
          price?: number | null
          image_url?: string | null
          source_url?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      outfits: {
        Row: {
          id: string
          user_id: string
          name: string
          occasion: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          occasion?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          occasion?: string | null
          created_at?: string
        }
        Relationships: []
      }
      outfit_items: {
        Row: {
          id: string
          outfit_id: string
          item_id: string
        }
        Insert: {
          id?: string
          outfit_id: string
          item_id: string
        }
        Update: {
          id?: string
          outfit_id?: string
          item_id?: string
        }
        Relationships: []
      }
      wear_logs: {
        Row: {
          id: string
          outfit_id: string
          user_id: string
          worn_at: string
          created_at: string
        }
        Insert: {
          id?: string
          outfit_id: string
          user_id: string
          worn_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          outfit_id?: string
          user_id?: string
          worn_at?: string
          created_at?: string
        }
        Relationships: []
      }
      trends: {
        Row: {
          id: string
          category: string
          name: string
          brand: string | null
          image_url: string | null
          source_url: string | null
          season: string | null
          created_at: string
        }
        Insert: {
          id?: string
          category: string
          name: string
          brand?: string | null
          image_url?: string | null
          source_url?: string | null
          season?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          category?: string
          name?: string
          brand?: string | null
          image_url?: string | null
          source_url?: string | null
          season?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      item_stats: {
        Row: {
          item_id: string
          user_id: string
          name: string
          brand: string | null
          colour: string | null
          price: number | null
          category_id: string | null
          image_url: string | null
          versatility_score: number
          times_worn: number
          cost_per_wear: number | null
        }
        Relationships: []
      }
      outfit_stats: {
        Row: {
          outfit_id: string
          user_id: string
          name: string
          occasion: string | null
          created_at: string
          times_worn: number
        }
        Relationships: []
      }
      gap_analysis: {
        Row: {
          category_id: string
          user_id: string
          category_name: string
          item_count: number
          outfit_appearances: number
          gap_score: number | null
        }
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Row type aliases
export type Category   = Database['public']['Tables']['categories']['Row']
export type Item       = Database['public']['Tables']['items']['Row']
export type Outfit     = Database['public']['Tables']['outfits']['Row']
export type OutfitItem = Database['public']['Tables']['outfit_items']['Row']
export type WearLog    = Database['public']['Tables']['wear_logs']['Row']
export type Trend      = Database['public']['Tables']['trends']['Row']
export type ItemStats  = Database['public']['Views']['item_stats']['Row']
export type OutfitStats = Database['public']['Views']['outfit_stats']['Row']
export type GapAnalysis = Database['public']['Views']['gap_analysis']['Row']

export const OCCASION_TAGS = [
  'Casual', 'Work', 'Date', 'Evening', 'Travel', 'Weekend', 'Gym',
] as const
export type OccasionTag = (typeof OCCASION_TAGS)[number]
