import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // dark:クラスでダークモードを制御
  theme: {
    extend: {
      // 必要に応じてカスタムテーマを追加
    },
  },
  plugins: [],
}
export default config