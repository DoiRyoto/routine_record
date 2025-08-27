import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/stories/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // dark:クラスでダークモードを制御
  theme: {
    colors: {
      // Base colors
      white: '#ffffff',
      black: '#000000',
      transparent: 'transparent',
      current: 'currentColor',
      
      // Primary - 信頼感と継続性（ブルー）
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6', // メインカラー - 信頼感と継続性
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
        950: '#172554',
      },
      
      // Secondary - 成長と前進（グリーン）
      secondary: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#10b981', // セカンダリカラー - 成長と前進
        600: '#059669',
        700: '#047857',
        800: '#065f46',
        900: '#064e3b',
        950: '#022c22',
      },
      
      // Accent - 温かさと親しみやすさ（オレンジ）
      accent: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fed7aa',
        300: '#fdba74',
        400: '#fb923c',
        500: '#f59e0b', // アクセントカラー - 温かさと親しみやすさ
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
        950: '#451a03',
      },
      
      // Warning - 注意喚起
      warning: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fed7aa',
        300: '#fdba74',
        400: '#fb923c',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
        950: '#451a03',
      },
      
      // Error - エラー状態
      error: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
        950: '#450a0a',
      },
      
      // Success - 成功・達成
      success: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#10b981',
        600: '#059669',
        700: '#047857',
        800: '#065f46',
        900: '#064e3b',
        950: '#022c22',
      },
      
      // Background colors
      background: {
        light: '#f8fafc', // ソフトホワイト
        dark: '#0f172a',
      },
      
      // Text colors
      text: {
        primary: '#1f2937', // ダークグレー
        secondary: '#6b7280',
        light: '#9ca3af',
        inverse: '#ffffff',
      },
      
      // Border colors
      border: {
        light: '#e5e7eb', // ライトグレー
        medium: '#d1d5db',
        dark: '#374151',
      },
      
      // Neutral grays for UI elements
      gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
        950: '#030712',
      },
      
      // Slate for alternative neutral tones
      slate: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
        950: '#020617',
      },
    },
  },
  plugins: [],
};
export default config;
