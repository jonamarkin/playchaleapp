/**
 * Application configuration constants
 */

export const APP_CONFIG = {
    name: 'PlayChale',
    tagline: 'Pro-Grade Amateur Sports',
    description: 'The professional-grade social engine for the amateur elite. Organize, compete, and record your legacy.',
} as const;

export const STORAGE_KEYS = {
    profile: 'playchale_profile',
    theme: 'playchale_theme',
    preferences: 'playchale_preferences',
} as const;

export const ROUTES = {
    // Marketing
    landing: '/',

    // App
    home: '/home',
    discover: '/discover',
    community: '/community',
    stats: '/stats',
    messages: '/messages',

    // Auth
    onboarding: '/onboarding',
} as const;

export const PROTECTED_ROUTES = [
    ROUTES.home,
    ROUTES.stats,
    ROUTES.messages,
] as const;

export const SPORTS = [
    'Football',
    'Basketball',
    'Tennis',
    'Padel',
    'Badminton',
] as const;

export const SKILL_LEVELS = [
    'Beginner',
    'Intermediate',
    'Competitive',
    'All Levels',
] as const;

export const BREAKPOINTS = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
} as const;

export type Sport = typeof SPORTS[number];
export type SkillLevel = typeof SKILL_LEVELS[number];
