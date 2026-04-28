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
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          role: 'student' | 'tutor' | null
          streak_count: number | null
          university: string | null
          degree: string | null
          year: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          role?: 'student' | 'tutor' | null
          streak_count?: number | null
          university?: string | null
          degree?: string | null
          year?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          first_name?: string | null
          last_name?: string | null
          role?: 'student' | 'tutor' | null
          streak_count?: number | null
          university?: string | null
          degree?: string | null
          year?: number | null
          updated_at?: string
        }
      }
      classrooms: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number | null
          tutor_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price?: number | null
          tutor_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          price?: number | null
          tutor_id?: string
          updated_at?: string
        }
      }
      sections: {
        Row: {
          id: string
          classroom_id: string
          title: string
          order: number | null
          created_at: string
        }
        Insert: {
          id?: string
          classroom_id: string
          title: string
          order?: number | null
          created_at?: string
        }
        Update: {
          title?: string
          order?: number | null
        }
      }
      cards: {
        Row: {
          id: string
          section_id: string
          type: 'text' | 'pdf' | 'image' | 'flashcard'
          content: Json | null
          order: number | null
          created_at: string
        }
        Insert: {
          id?: string
          section_id: string
          type: 'text' | 'pdf' | 'image' | 'flashcard'
          content?: Json | null
          order?: number | null
          created_at?: string
        }
        Update: {
          type?: 'text' | 'pdf' | 'image' | 'flashcard'
          content?: Json | null
          order?: number | null
        }
      }
      subscriptions: {
        Row: {
          id: string
          student_id: string
          classroom_id: string
          subscribed_at: string
        }
        Insert: {
          id?: string
          student_id: string
          classroom_id: string
          subscribed_at?: string
        }
        Update: {
          student_id?: string
          classroom_id?: string
          subscribed_at?: string
        }
      }
      tutors: {
        Row: {
          id: string
          user_id: string
          bio: string | null
          subjects: string[] | null
          photo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bio?: string | null
          subjects?: string[] | null
          photo_url?: string | null
          created_at?: string
        }
        Update: {
          bio?: string | null
          subjects?: string[] | null
          photo_url?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          classroom_id: string
          content: string
          created_at: string
          read_at: string | null
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          classroom_id: string
          content: string
          created_at?: string
          read_at?: string | null
        }
        Update: {
          read_at?: string | null
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
  }
}
