export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      routines: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          category: string;
          target_frequency: 'daily' | 'weekly' | 'monthly';
          target_count: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description: string;
          category: string;
          target_frequency: 'daily' | 'weekly' | 'monthly';
          target_count?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string;
          category?: string;
          target_frequency?: 'daily' | 'weekly' | 'monthly';
          target_count?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      execution_records: {
        Row: {
          id: string;
          user_id: string;
          routine_id: string;
          executed_at: string;
          duration: number | null;
          memo: string | null;
          is_completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          routine_id: string;
          executed_at: string;
          duration?: number | null;
          memo?: string | null;
          is_completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          routine_id?: string;
          executed_at?: string;
          duration?: number | null;
          memo?: string | null;
          is_completed?: boolean;
          created_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          theme: 'light' | 'dark' | 'auto';
          language: 'ja' | 'en';
          time_format: '12h' | '24h';
          daily_goal: number;
          weekly_goal: number;
          monthly_goal: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          theme?: 'light' | 'dark' | 'auto';
          language?: 'ja' | 'en';
          time_format?: '12h' | '24h';
          daily_goal?: number;
          weekly_goal?: number;
          monthly_goal?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          theme?: 'light' | 'dark' | 'auto';
          language?: 'ja' | 'en';
          time_format?: '12h' | '24h';
          daily_goal?: number;
          weekly_goal?: number;
          monthly_goal?: number;
          created_at?: string;
          updated_at?: string;
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
};