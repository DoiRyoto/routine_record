# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development**: `npm run dev` - Start development server on localhost:3000
- **Build**: `npm run build` - Build production version
- **Production**: `npm start` - Start production server (after build)
- **Lint**: `npm run lint` - Run ESLint with Next.js rules
- **Database**: 
  - `npm run db:generate` - Generate migrations from schema
  - `npm run db:push` - Push schema changes to database
  - `npm run db:migrate` - Run migrations
  - `npm run db:studio` - Open Drizzle Studio

## Architecture Overview

This is a **routine tracking application** built with Next.js 15.4.5, TypeScript, Tailwind CSS, Supabase, and Drizzle ORM. The app helps users track daily habits and routines with a Japanese-first interface and user authentication.

### Key Architecture Patterns

- **Authentication-first**: User authentication via Supabase Auth with protected routes
- **Database-driven**: PostgreSQL database with Supabase backend and Drizzle ORM
- **Context-based State**: Global state managed through `AuthContext` and `SupabaseRoutineContext`
- **Shared Data Layer**: Abstract data service interface supporting both Supabase and localStorage
- **React Native Ready**: Shared business logic extracted for future mobile app development
- **Component Structure**: Organized by feature in `/components` with shared components in `/Common`

### Core Data Models

- **User**: Authentication and profile data managed by Supabase Auth
- **Routine**: Main entity with id, name, description, category, target frequency (daily/weekly/monthly)
- **ExecutionRecord**: Tracks when routines are completed with duration and completion status
- **UserSettings**: Display preferences (theme, language) and goal settings

### Database Schema

- **users**: User profiles with email and display name
- **routines**: User routines with categories and frequency targets
- **execution_records**: Completion records with timestamps and metadata
- **user_settings**: Display and goal preferences per user

### State Management Flow

1. **AuthContext** (`src/context/AuthContext.tsx`) manages user authentication state
2. **SupabaseRoutineContext** (`src/context/SupabaseRoutineContext.tsx`) provides data operations
3. **Data Service Layer** (`src/lib/shared/`) abstracts database operations
4. **Drizzle ORM** handles database queries with type safety
5. Components consume context via `useAuth()` and `useRoutine()` hooks

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
│   ├── Auth/           # Authentication components
│   ├── Calendar/       
│   ├── Common/         # Shared UI components
│   ├── Dashboard/      
│   ├── Layout/         
│   ├── Routines/       
│   ├── Settings/       
│   └── Statistics/     
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── lib/                # Core libraries and services
│   ├── auth/           # Authentication logic
│   ├── db/             # Database schema and queries
│   ├── shared/         # Shared data services
│   └── supabase/       # Supabase client configuration
├── types/              # TypeScript type definitions
└── utils/              # Utility functions and demo data
```

### Technology Stack

- **Frontend**: Next.js 15.4.5, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL (Supabase)
- **ORM**: Drizzle ORM with Drizzle Kit
- **Authentication**: Supabase Auth
- **State Management**: React Context API
- **Future Mobile**: React Native (shared business logic ready)