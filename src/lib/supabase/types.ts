export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      routines: {
        Row: {
          id: string;
          name: string;
          description: string;
          category: string;
          target_frequency: 'daily' | 'weekly' | 'monthly';
          target_count: number | null;
          created_at: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          category: string;
          target_frequency: 'daily' | 'weekly' | 'monthly';
          target_count?: number | null;
          created_at?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          category?: string;
          target_frequency?: 'daily' | 'weekly' | 'monthly';
          target_count?: number | null;
          created_at?: string;
          is_active?: boolean;
        };
      };
      execution_records: {
        Row: {
          id: string;
          routine_id: string;
          executed_at: string;
          duration: number | null;
          memo: string | null;
          is_completed: boolean;
        };
        Insert: {
          id?: string;
          routine_id: string;
          executed_at?: string;
          duration?: number | null;
          memo?: string | null;
          is_completed?: boolean;
        };
        Update: {
          id?: string;
          routine_id?: string;
          executed_at?: string;
          duration?: number | null;
          memo?: string | null;
          is_completed?: boolean;
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
          updated_at?: string;
        };
      };
    };
  };
}
