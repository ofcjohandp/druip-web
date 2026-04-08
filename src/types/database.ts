// Manual type stubs — replace with generated types via:
// supabase gen types typescript --project-id <id> > src/types/database.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type LessonType = 'standard' | 'practice' | 'challenge';
export type DailyGoal = 'chill' | 'steady' | 'focused';
export type LessonAttemptStatus = 'in_progress' | 'completed';
// RICH-01: 'flashcard' added to match migration 00016_add_flashcard_card_type.sql
export type CardType = 'text' | 'pdf' | 'image' | 'link' | 'flashcard';
export type SubscriptionStatus = 'active' | 'cancelled';
export type HelpType = 'understanding' | 'test-prep' | 'assignments' | 'exam-prep' | 'practical-skills';

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
        Insert: {
          name: string;
          description?: string | null;
          is_published?: boolean;
        };
        Update: Partial<Database['public']['Tables']['modules']['Insert']>;
        Relationships: [];
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
        Insert: {
          module_id: string;
          name: string;
          description?: string | null;
          order?: number;
          requires_topic_id?: string | null;
          is_published?: boolean;
        };
        Update: Partial<Database['public']['Tables']['topics']['Insert']>;
        Relationships: [];
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
        Insert: {
          topic_id: string;
          name: string;
          description?: string | null;
          lesson_type?: LessonType;
          xp_reward?: number;
          order?: number;
          is_published?: boolean;
        };
        Update: Partial<Database['public']['Tables']['lessons']['Insert']>;
        Relationships: [];
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
        Insert: {
          lesson_id: string;
          name: string;
          content?: string | null;
          order?: number;
          is_published?: boolean;
        };
        Update: Partial<Database['public']['Tables']['sections']['Insert']>;
        Relationships: [];
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
        Insert: {
          section_id: string;
          question_text: string;
          options: Json;
          correct_option_index: number;
          explanation?: string | null;
          order?: number;
          is_published?: boolean;
        };
        Update: Partial<Database['public']['Tables']['questions']['Insert']>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          daily_goal: DailyGoal;
          total_xp: number;
          streak_count: number;
          streak_freezes: number;
          is_tutor: boolean;
          last_lesson_completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          email: string;
          daily_goal?: DailyGoal;
          total_xp?: number;
          streak_count?: number;
          streak_freezes?: number;
          is_tutor?: boolean;
          last_lesson_completed_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      tutors: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: { user_id: string };
        Update: Partial<{ updated_at: string }>;
        Relationships: [];
      };
      classrooms: {
        Row: {
          id: string;
          tutor_id: string;
          name: string;
          subjects: string[];
          bio: string | null;
          price_cents: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          tutor_id: string;
          name: string;
          subjects: string[];
          bio?: string | null;
          price_cents?: number;
          is_published?: boolean;
        };
        Update: Partial<{
          name: string;
          subjects: string[];
          bio: string | null;
          price_cents: number;
          is_published: boolean;
          updated_at: string;
        }>;
        Relationships: [];
      };
      classroom_sections: {
        Row: {
          id: string;
          classroom_id: string;
          name: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          classroom_id: string;
          name: string;
          sort_order?: number;
        };
        Update: Partial<{
          name: string;
          sort_order: number;
          updated_at: string;
        }>;
        Relationships: [];
      };
      classroom_cards: {
        Row: {
          id: string;
          section_id: string;
          card_type: CardType;
          content: string | null;
          title: string | null;
          storage_path: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          section_id: string;
          card_type: CardType;
          content?: string | null;
          title?: string | null;
          storage_path?: string | null;
          sort_order?: number;
        };
        Update: Partial<{
          card_type: CardType;
          content: string | null;
          title: string | null;
          storage_path: string | null;
          sort_order: number;
          updated_at: string;
        }>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          student_id: string;
          classroom_id: string;
          subscribed_at: string;
          status: SubscriptionStatus;
        };
        Insert: {
          student_id: string;
          classroom_id: string;
          status?: SubscriptionStatus;
        };
        Update: Partial<{ status: SubscriptionStatus }>;
        Relationships: [];
      };
      subject_tags: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          name: string;
          slug: string;
        };
        Update: Partial<{ name: string; slug: string }>;
        Relationships: [];
      };
      classroom_subject_tags: {
        Row: {
          classroom_id: string;
          tag_id: string;
        };
        Insert: {
          classroom_id: string;
          tag_id: string;
        };
        Update: Partial<{ classroom_id: string; tag_id: string }>;
        Relationships: [];
      };
      student_profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          photo_url: string | null;
          university: string | null;
          campus: string | null;
          degree: string | null;
          year_of_study: number | null;
          help_types: string[];
          upcoming_test_date: string | null;
          onboarding_complete: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          photo_url?: string | null;
          university?: string | null;
          campus?: string | null;
          degree?: string | null;
          year_of_study?: number | null;
          help_types?: string[];
          upcoming_test_date?: string | null;
          onboarding_complete?: boolean;
        };
        Update: Partial<Database['public']['Tables']['student_profiles']['Insert']>;
        Relationships: [];
      };
      student_subject_tags: {
        Row: {
          student_id: string;
          tag_id: string;
        };
        Insert: {
          student_id: string;
          tag_id: string;
        };
        Update: Partial<{ student_id: string; tag_id: string }>;
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          classroom_id: string;
          sender_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          classroom_id: string;
          sender_id: string;
          content: string;
        };
        Update: Partial<{ content: string }>;
        Relationships: [];
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
        Insert: {
          user_id: string;
          lesson_id: string;
          completed?: boolean;
          score?: number | null;
          completed_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['user_lesson_progress']['Insert']>;
        Relationships: [];
      };
      lesson_attempts: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          score: number;
          total_questions: number;
          status: LessonAttemptStatus;
          started_at: string;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          lesson_id: string;
          score: number;
          total_questions: number;
          status: LessonAttemptStatus;
          started_at: string;
          completed_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['lesson_attempts']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      lesson_type: LessonType;
      daily_goal: DailyGoal;
      lesson_attempt_status: LessonAttemptStatus;
      subscription_status: SubscriptionStatus;
    };
  };
}
