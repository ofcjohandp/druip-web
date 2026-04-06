// Manual type stubs — replace with generated types via:
// supabase gen types typescript --project-id <id> > src/types/database.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type LessonType = 'standard' | 'practice' | 'challenge';
export type DailyGoal = 'chill' | 'steady' | 'focused';

export interface Database {
  public: {
    Tables: {
      modules: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['modules']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['modules']['Insert']>;
      };
      topics: {
        Row: {
          id: string;
          module_id: string;
          name: string;
          description: string | null;
          order: number;
          requires_topic_id: string | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['topics']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['topics']['Insert']>;
      };
      lessons: {
        Row: {
          id: string;
          topic_id: string;
          name: string;
          description: string | null;
          lesson_type: LessonType;
          xp_reward: number;
          order: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['lessons']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['lessons']['Insert']>;
      };
      sections: {
        Row: {
          id: string;
          lesson_id: string;
          name: string;
          content: string | null;
          order: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sections']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['sections']['Insert']>;
      };
      questions: {
        Row: {
          id: string;
          section_id: string;
          question_text: string;
          options: Json;
          correct_option_index: number;
          explanation: string | null;
          order: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['questions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['questions']['Insert']>;
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          daily_goal: DailyGoal;
          total_xp: number;
          streak_count: number;
          streak_freezes: number;
          last_lesson_completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      user_lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          completed: boolean;
          score: number | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_lesson_progress']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_lesson_progress']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      lesson_type: LessonType;
      daily_goal: DailyGoal;
    };
  };
}
