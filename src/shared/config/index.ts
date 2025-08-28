export { container, TYPES, getDependency, isBound, initializeContainer } from './container';

// Environment configuration
export const config = {
  // Database
  database: {
    url: process.env.DATABASE_URL || '',
  },
  
  // Supabase
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  
  // App
  app: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000'),
    logLevel: process.env.LOG_LEVEL || 'info',
  },
  
  // Features
  features: {
    useCleanArchitecture: process.env.USE_CLEAN_ARCHITECTURE === 'true',
    enableMocking: process.env.NODE_ENV === 'development' || process.env.ENABLE_MOCKING === 'true',
  },
} as const;

// Type for configuration
export type AppConfig = typeof config;