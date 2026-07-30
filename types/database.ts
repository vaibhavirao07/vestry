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
          photo_url: string | null
          worn_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          occasion?: string | null
          photo_url?: string | null
          worn_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          occasion?: string | null
          photo_url?: string | null
          worn_date?: string | null
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
      profiles: {
        Row: {
          user_id: string
          height: number | null
          weight: number | null
          bust: number | null
          waist: number | null
          hips: number | null
          shoe_size: number | null
          updated_at: string
        }
        Insert: {
          user_id: string
          height?: number | null
          weight?: number | null
          bust?: number | null
          waist?: number | null
          hips?: number | null
          shoe_size?: number | null
          updated_at?: string
        }
        Update: {
          user_id?: string
          height?: number | null
          weight?: number | null
          bust?: number | null
          waist?: number | null
          hips?: number | null
          shoe_size?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      brand_sizes: {
        Row: {
          id: string
          user_id: string
          brand: string
          garment: string
          size: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          brand: string
          garment?: string
          size: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          brand?: string
          garment?: string
          size?: string
          created_at?: string
        }
        Relationships: []
      }
      inspo_posts: {
        Row: {
          id: string
          user_id: string
          source_url: string | null
          image_url: string
          aesthetic: string | null
          occasion: string | null
          palette: string[]
          garments: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          source_url?: string | null
          image_url: string
          aesthetic?: string | null
          occasion?: string | null
          palette?: string[]
          garments?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          source_url?: string | null
          image_url?: string
          aesthetic?: string | null
          occasion?: string | null
          palette?: string[]
          garments?: Json
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
          photo_url: string | null
          worn_date: string | null
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
export type Profile    = Database['public']['Tables']['profiles']['Row']
export type InspoPost  = Database['public']['Tables']['inspo_posts']['Row']
export type BrandSize  = Database['public']['Tables']['brand_sizes']['Row']
export type ItemStats  = Database['public']['Views']['item_stats']['Row']
export type OutfitStats = Database['public']['Views']['outfit_stats']['Row']
export type GapAnalysis = Database['public']['Views']['gap_analysis']['Row']

export const OCCASION_TAGS = [
  'Casual', 'Work', 'Date', 'Evening', 'Travel', 'Weekend', 'Gym',
] as const
export type OccasionTag = (typeof OCCASION_TAGS)[number]
