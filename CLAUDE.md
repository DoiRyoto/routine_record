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

This is a **mission tracking application** built with Next.js 15.4.5, TypeScript, Tailwind CSS, Supabase, and Drizzle ORM. The app helps users track daily, weekly, and monthly missions with a Japanese-first interface and user authentication.

### Key Architecture Patterns

- **Authentication-first**: User authentication via Supabase Auth with protected routes
- **Database-driven**: PostgreSQL database with Supabase backend and Drizzle ORM
- **Context-based State**: Global state managed through `AuthContext` and `SnackbarContext`
- **API-driven**: RESTful API routes with proper error handling and validation
- **Component Structure**: Organized by feature in `/components` with shared components in `/Common`
- **Mission Types**: Support for daily, weekly, and monthly missions with individual progress tracking

### Core Data Models

- **User**: Authentication and profile data managed by Supabase Auth
- **Routine**: Main entity with id, name, description, category, target frequency (daily/weekly/monthly), target count
- **ExecutionRecord**: Tracks when missions are completed with timestamps, duration, and completion status
- **UserSettings**: Display preferences (theme, language, time format) only

### Database Schema

- **users**: User profiles with email, display name, and timezone preferences
- **routines**: User missions with categories, frequency targets (daily/weekly/monthly), and target counts
- **execution_records**: Completion records with timestamps, duration, memo, and completion status
- **user_settings**: Display preferences only (theme, language, time format) - goal fields removed

### State Management Flow

1. **AuthContext** (`src/context/AuthContext.tsx`) manages user authentication state
2. **SnackbarContext** (`src/context/SnackbarContext.tsx`) manages global notifications
3. **API Routes** (`src/app/api/`) handle data operations with validation
4. **Custom Hooks** (`src/hooks/`) provide data fetching and state management
5. **Drizzle ORM** handles database queries with type safety

### Routing System

The app uses Next.js App Router with file-based routing:

- `/` (Dashboard) - Daily, weekly, and monthly missions with individual progress
- `/routines` - Mission management (CRUD operations)
- `/calendar` - Monthly execution calendar view with clickable detailed modals
- `/statistics` - Progress analytics and reports
- `/settings` - User display preferences only (theme, language, time format)

Navigation is handled through Next.js `Link` components in the Header with `usePathname` for active state detection.

### Japanese Localization

- Interface is primarily in Japanese (`lang="ja"` in layout)
- "Routine" terminology changed to "Mission" throughout the UI
- Demo data includes Japanese mission names and categories
- Metadata and descriptions use Japanese text

### Styling Approach

- **Tailwind CSS v4** with PostCSS plugin
- **Dark mode support** via context state and system preference detection
- **Responsive design** with mobile-first approach
- **Custom UI components** with consistent design system
- **Enhanced select boxes** with custom dropdown icons and improved styling

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
- **State Management**: React Context API + Custom hooks
- **UI Components**: Modal, ConfirmDialog, Enhanced form controls

### Recent Architecture Changes

#### Removed Features
- **Overall Progress Tracking**: Removed dashboard-wide daily/weekly/monthly progress cards
- **Goal Settings**: Eliminated user goal configuration (dailyGoal, weeklyGoal, monthlyGoal)
- **ProgressCard Component**: Deleted as part of progress simplification

#### Enhanced Features
- **Mission-focused UI**: Complete terminology change from "routine" to "mission"
- **Individual Progress**: Weekly/monthly missions now show individual progress bars
- **Daily Mission Simplicity**: Simple completed/incomplete status for daily missions
- **Calendar Interactions**: Clickable dates with detailed execution record modals
- **Settings Simplification**: Reduced to essential display preferences only

#### Database Schema Changes
- **Removed Columns**: `daily_goal`, `weekly_goal`, `monthly_goal` from `user_settings` table
- **Migration**: `drizzle/0001_remove_goal_columns.sql` generated and ready
