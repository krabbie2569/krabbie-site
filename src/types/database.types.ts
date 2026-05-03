export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          slug: string                  // subdomain: shop.krabbie.com
          name: string
          template_id: string
          owner_email: string
          owner_phone: string | null
          plan: 'trial' | 'active' | 'suspended' | 'cancelled'
          plan_type: 'standard' | 'pro'
          trial_ends_at: string | null
          activated_at: string | null
          expires_at: string | null
          settings: Json               // { primaryColor, logoUrl, lineId, ... }
          auth_user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['tenants']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tenants']['Insert']>
      }

      services: {
        Row: {
          id: string
          tenant_id: string
          name: string
          description: string | null
          duration_minutes: number
          price: number
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['services']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['services']['Insert']>
      }

      staff: {
        Row: {
          id: string
          tenant_id: string
          name: string
          avatar_url: string | null
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['staff']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['staff']['Insert']>
      }

      time_slots: {
        Row: {
          id: string
          tenant_id: string
          service_id: string
          staff_id: string | null
          date: string                 // YYYY-MM-DD
          start_time: string           // HH:MM
          end_time: string             // HH:MM
          is_booked: boolean
          is_blocked: boolean          // manual block by owner
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['time_slots']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['time_slots']['Insert']>
      }

      bookings: {
        Row: {
          id: string
          tenant_id: string
          service_id: string
          slot_id: string
          staff_id: string | null
          customer_name: string
          customer_phone: string
          customer_email: string | null
          customer_note: string | null
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
          cancelled_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>
      }

      templates: {
        Row: {
          id: string
          slug: string
          name: string
          name_th: string
          description_th: string
          category: 'booking' | 'shop' | 'food' | 'portfolio'
          phase: 1 | 2 | 3
          is_active: boolean
          preview_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['templates']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['templates']['Insert']>
      }

      payments: {
        Row: {
          id: string
          tenant_id: string
          amount: number
          method: 'promptpay' | 'bank_transfer'
          status: 'pending' | 'paid' | 'failed' | 'refunded'
          slip_url: string | null
          paid_at: string | null
          months: number
          plan_type: 'standard' | 'pro'
          review_status: 'pending' | 'admin_approved' | 'rejected'
          rejection_reason: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
      }
    }

    Views: {
      [_ in never]: never
    }

    Functions: {
      [_ in never]: never
    }

    Enums: {
      tenant_plan: 'trial' | 'active' | 'suspended' | 'cancelled'
      booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
      payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
      template_category: 'booking' | 'shop' | 'food' | 'portfolio'
    }
  }
}
