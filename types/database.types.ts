export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      players: {
        Row: {
          id: number
          name: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          created_at?: string
        }
      }
      reasons: {
        Row: {
          id: number
          description: string
          created_at: string
        }
        Insert: {
          id?: number
          description: string
          created_at?: string
        }
        Update: {
          id?: number
          description?: string
          created_at?: string
        }
      }
      fines: {
        Row: {
          id: number
          player_id: number
          reason_id: number
          amount: number
          date: string
        }
        Insert: {
          id?: number
          player_id: number
          reason_id: number
          amount: number
          date?: string
        }
        Update: {
          id?: number
          player_id?: number
          reason_id?: number
          amount?: number
          date?: string
        }
      }
    }
    Views: {
      fines_view: {
        Row: {
          id: number
          player_id: number
          player_name: string
          reason_id: number
          reason_description: string
          amount: number
          date: string
        }
      }
    }
  }
} 