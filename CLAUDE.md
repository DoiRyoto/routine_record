# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development**: `npm run dev` - Start development server on localhost:3000
- **Build**: `npm run build` - Build production version
- **Production**: `npm start` - Start production server (after build)
- **Lint**: `npm run lint` - Run ESLint with Next.js rules

## Architecture Overview

This is a **routine tracking application** built with Next.js 15.4.5, TypeScript, and Tailwind CSS. The app helps users track daily habits and routines with a Japanese-first interface.

### Key Architecture Patterns

- **Single Page Application**: All views are rendered client-side through `MainApp.tsx` with view routing via React Context
- **Context-based State**: Global state managed through `RoutineContext` using React Context API and custom hooks
- **LocalStorage Persistence**: All data (routines, execution records, settings) persists in browser localStorage via `useLocalStorage` hook
- **Component Structure**: Organized by feature in `/components` with shared components in `/Common`

### Core Data Models

- **Routine**: Main entity with id, name, description, category, target frequency (daily/weekly/monthly)
- **ExecutionRecord**: Tracks when routines are completed with duration and completion status
- **UserSettings**: Display preferences (theme, language) and goal settings

### State Management Flow

1. **RoutineContext** (`src/context/RoutineContext.tsx`) provides all state and actions
2. **useLocalStorage hook** (`src/hooks/useLocalStorage.ts`) handles persistence with Date object serialization
3. Components consume context via `useRoutine()` hook
4. Demo data is automatically loaded on first run

### Routing System

The app uses Next.js App Router with file-based routing:
- `/` (Dashboard) - Today's routines and progress summary
- `/routines` - Routine management (CRUD operations)
- `/calendar` - Monthly execution calendar view  
- `/statistics` - Progress analytics and reports
- `/settings` - User preferences and goals

Navigation is handled through Next.js `Link` components in the Header with `usePathname` for active state detection.

### Japanese Localization

- Interface is primarily in Japanese (`lang="ja"` in layout)
- Demo data includes Japanese routine names and categories
- Metadata and descriptions use Japanese text

### Styling Approach

- **Tailwind CSS v4** with PostCSS plugin
- **Dark mode support** via context state and system preference detection
- **Responsive design** with mobile-first approach
- **Custom fonts**: Geist Sans and Geist Mono from Google Fonts

### File Organization

```
src/
├── app/                 # Next.js App Router
├── components/          # Feature-based components
│   ├── Calendar/       
│   ├── Common/         # Shared UI components
│   ├── Dashboard/      
│   ├── Layout/         
│   ├── Routines/       
│   ├── Settings/       
│   └── Statistics/     
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
└── utils/              # Utility functions and demo data
```