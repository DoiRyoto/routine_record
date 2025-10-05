// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';
import betterTailwindcss from 'eslint-plugin-better-tailwindcss';

import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [...compat.extends('next/core-web-vitals', 'next/typescript'), {
  files: ['**/*.{js,jsx,ts,tsx}'],
  plugins: {
    'better-tailwindcss': betterTailwindcss,
  },
  rules: {
    // Tailwind CSS基本ルール
    'better-tailwindcss/sort-classes': 'warn',
    'better-tailwindcss/no-duplicate-classes': 'error',

    // TypeScript基本ルール
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'off', // 開発時は許可
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/consistent-type-imports': 'off', // 自動整理に任せる

    // React基本ルール
    'react/react-in-jsx-scope': 'off', // Next.js 13+では不要
    'react/prop-types': 'off', // TypeScriptを使用しているため
    'react/display-name': 'warn',
    'react/no-unescaped-entities': 'warn',
    'react/jsx-key': ['warn', { checkFragmentShorthand: true }],
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-undef': 'error',
    'react/jsx-uses-vars': 'error',
    'react/no-array-index-key': 'off', // 適切な場合は許可
    'react/self-closing-comp': 'warn',
    'react/jsx-pascal-case': 'warn',
    'react/jsx-curly-brace-presence': 'off', // 開発者の判断に任せる

    // React Hooks基本ルール
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn', // 警告レベルに下げる

    // アクセシビリティ基本ルール
    'jsx-a11y/alt-text': 'warn',
    'jsx-a11y/anchor-has-content': 'warn',
    'jsx-a11y/aria-props': 'warn',
    'jsx-a11y/aria-role': 'warn',
    'jsx-a11y/click-events-have-key-events': 'warn', // 警告レベルに下げる
    'jsx-a11y/heading-has-content': 'warn',
    'jsx-a11y/img-redundant-alt': 'warn',
    'jsx-a11y/no-access-key': 'warn',
    'jsx-a11y/no-autofocus': 'off', // 開発時は許可
    'jsx-a11y/role-has-required-aria-props': 'warn',

    // Import/Export基本ルール
    'import/no-unresolved': 'off', // TypeScriptが処理するため
    'import/order': [
      'warn', // 警告レベルに下げる
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],

    // 一般的な実用ルール
    'no-console': ['error', { allow: ['error', 'warn'] }], // warn も許可
    'no-debugger': 'warn', // デバッグ時は許可
    'no-alert': 'warn',
    'no-var': 'error',
    'prefer-const': 'warn',
    'prefer-arrow-callback': 'off', // 関数式を強制しない
    'prefer-template': 'warn',
    'prefer-destructuring': 'off', // 強制しない
    'no-duplicate-imports': 'warn',
    'no-useless-return': 'warn',
    'no-useless-catch': 'warn',
    'no-useless-concat': 'warn',
    'no-useless-escape': 'warn',
    'no-useless-rename': 'warn',
    'no-param-reassign': 'off', // 場合によっては必要
    'no-shadow': 'off', // @typescript-eslintのバージョンを使用
    '@typescript-eslint/no-shadow': 'warn',
    curly: 'off', // ブレースを強制しない
    eqeqeq: ['warn', 'always', { null: 'ignore' }],
    'prefer-object-spread': 'warn',
    'object-shorthand': 'warn',
    'array-callback-return': 'warn',
    'consistent-return': 'off', // 柔軟性を保つ

    // 基本的なフォーマット
    semi: ['error', 'always'],
    quotes: ['error', 'single', { avoidEscape: true }],
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
    'better-tailwindcss': {
      callees: ['cn', 'cva', 'clsx'],
      config: 'tailwind.config.ts',
      entryPoint: 'src/app/globals.css',
    },
  },
}, {
  files: ['**/*.js', '**/*.mjs'],
  rules: {
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
  },
}, ...storybook.configs["flat/recommended"]];

export default eslintConfig;
