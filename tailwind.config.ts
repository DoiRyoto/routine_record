import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // dark:クラスでダークモードを制御
  theme: {
    extend: {
      fontFamily: {
        japanese: ['var(--font-noto-sans-jp)', 'system-ui', 'sans-serif'],
        english: ['var(--font-roboto)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-noto-sans-jp)', 'var(--font-roboto)', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
    colors: {
      white: 'var(--white)',
      black: 'var(--black)',
      blue: 'var(--blue)',
      green: 'var(--green)',
      red: 'var(--red)',
      yellow: 'var(--yellow)',
      purple: 'var(--purple)',
      orange: 'var(--orange)',
      pink: 'var(--pink)',
      teal: 'var(--teal)',
      indigo: 'var(--indigo)',
      gray: 'var(--gray)',

      "deep-blue": 'var(--deep-blue)',
      "deep-green": 'var(--deep-green)',
      "deep-red": 'var(--deep-red)',
      "deep-yellow": 'var(--deep-yellow)',
      "deep-purple": 'var(--deep-purple)',
      "deep-orange": 'var(--deep-orange)',
      "deep-pink": 'var(--deep-pink)',
      "deep-teal": 'var(--deep-teal)',
      "deep-indigo": 'var(--deep-indigo)',
      "deep-gray": 'var(--deep-gray)',
    },
    text: {
      // セマンティックテキスト色（ライト:濃い色, ダーク:薄い色）
      blue: 'light-dark(var(--deep-blue), var(--blue))',
      green: 'light-dark(var(--deep-green), var(--green))',
      red: 'light-dark(var(--deep-red), var(--red))',
      yellow: 'light-dark(var(--deep-yellow), var(--yellow))',
      purple: 'light-dark(var(--deep-purple), var(--purple))',
      orange: 'light-dark(var(--deep-orange), var(--orange))',
      pink: 'light-dark(var(--deep-pink), var(--pink))',
      teal: 'light-dark(var(--deep-teal), var(--teal))',
      indigo: 'light-dark(var(--deep-indigo), var(--indigo))',
      gray: 'light-dark(var(--deep-gray), var(--gray))',
    },
    bg: {
      // セマンティック背景色（ライト:薄い色, ダーク:濃い色）
      white: 'light-dark(var(--white), var(--black))',
      black: 'light-dark(var(--black), var(--white))',
      blue: 'light-dark(var(--blue), var(--deep-blue))',
      green: 'light-dark(var(--green), var(--deep-green))',
      red: 'light-dark(var(--red), var(--deep-red))',
      yellow: 'light-dark(var(--yellow), var(--deep-yellow))',
      purple: 'light-dark(var(--purple), var(--deep-purple))',
      orange: 'light-dark(var(--orange), var(--deep-orange))',
      pink: 'light-dark(var(--pink), var(--deep-pink))',
      teal: 'light-dark(var(--teal), var(--deep-teal))',
      indigo: 'light-dark(var(--indigo), var(--deep-indigo))',
      gray: 'light-dark(var(--gray), var(--deep-gray))',
    },
  },
  plugins: [],
};
export default config;
