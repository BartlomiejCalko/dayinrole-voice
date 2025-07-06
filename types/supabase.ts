export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          email: string
          display_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          email: string
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          email?: string
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      dayinroles: {
        Row: {
          id: string
          user_id: string
          company_name: string
          company_logo: string | null
          position: string
          description: string
          challenges: any[]
          requirements: string[]
          techstack: string[]
          cover_image: string
          language: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          company_logo?: string | null
          position: string
          description: string
          challenges?: any[]
          requirements?: string[]
          techstack?: string[]
          cover_image: string
          language?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          company_logo?: string | null
          position?: string
          description?: string
          challenges?: any[]
          requirements?: string[]
          techstack?: string[]
          cover_image?: string
          language?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      interviews: {
        Row: {
          id: string
          user_id: string
          dayinrole_id: string | null
          role: string
          level: string
          type: string
          questions: string[]
          techstack: string[]
          finalized: boolean | null
          completed_attempts: number | null
          last_attempt_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          dayinrole_id?: string | null
          role: string
          level: string
          type: string
          questions?: string[]
          techstack?: string[]
          finalized?: boolean | null
          completed_attempts?: number | null
          last_attempt_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          dayinrole_id?: string | null
          role?: string
          level?: string
          type?: string
          questions?: string[]
          techstack?: string[]
          finalized?: boolean | null
          completed_attempts?: number | null
          last_attempt_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      interview_questions: {
        Row: {
          id: string
          dayinrole_id: string
          user_id: string
          questions: any[]
          number_of_questions: number
          language: string
          dayinrole_title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          dayinrole_id: string
          user_id: string
          questions?: any[]
          number_of_questions: number
          language?: string
          dayinrole_title: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          dayinrole_id?: string
          user_id?: string
          questions?: any[]
          number_of_questions?: number
          language?: string
          dayinrole_title?: string
          created_at?: string
          updated_at?: string
        }
      }
      interview_attempts: {
        Row: {
          id: string
          interview_id: string
          user_id: string
          transcript: any[]
          feedback: any
          total_score: number | null
          category_scores: any[] | null
          strengths: string[] | null
          areas_for_improvement: string[] | null
          final_assessment: string | null
          completed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          interview_id: string
          user_id: string
          transcript?: any[]
          feedback?: any
          total_score?: number | null
          category_scores?: any[] | null
          strengths?: string[] | null
          areas_for_improvement?: string[] | null
          final_assessment?: string | null
          completed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          interview_id?: string
          user_id?: string
          transcript?: any[]
          feedback?: any
          total_score?: number | null
          category_scores?: any[] | null
          strengths?: string[] | null
          areas_for_improvement?: string[] | null
          final_assessment?: string | null
          completed_at?: string
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          status: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: string
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      usage_tracking: {
        Row: {
          id: string
          user_id: string
          subscription_id: string | null
          period_start: string
          period_end: string
          dayinrole_used: number | null
          interviews_used: number | null
          reset_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id?: string | null
          period_start: string
          period_end: string
          dayinrole_used?: number | null
          interviews_used?: number | null
          reset_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string | null
          period_start?: string
          period_end?: string
          dayinrole_used?: number | null
          interviews_used?: number | null
          reset_at?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 