/**
 * Icons - centralized icon exports using lucide-react
 * This provides a consistent icon system across the application
 */

import {
    Clock,
    Menu,
    X,
    ChevronRight,
    ChevronLeft,
    ChevronDown,
    ChevronUp,
    MapPin,
    Plus,
    ArrowUp,
    Star,
    Search,
    Filter,
    Calendar,
    Users,
    MessageCircle,
    Trophy,
    Target,
    Zap,
    Check,
    AlertCircle,
    Info,
    Settings,
    User,
    LogOut,
    Edit,
    Share2,
    Send,
    Heart,
    Bookmark,
    MoreHorizontal,
    MoreVertical,
    Grid,
    List,
    Image,
    Camera,
    Mail,
    Phone,
    Globe,
    ExternalLink,
    Home,
    Compass,
    BarChart2,
    Award,
    Shield,
    type LucideProps,
} from 'lucide-react';
import React from 'react';

// Re-export all icons for direct use
export {
    Clock,
    Menu,
    X,
    ChevronRight,
    ChevronLeft,
    ChevronDown,
    ChevronUp,
    MapPin,
    Plus,
    ArrowUp,
    Star,
    Search,
    Filter,
    Calendar,
    Users,
    MessageCircle,
    Trophy,
    Target,
    Zap,
    Check,
    AlertCircle,
    Info,
    Settings,
    User,
    LogOut,
    Edit,
    Share2,
    Send,
    Heart,
    Bookmark,
    MoreHorizontal,
    MoreVertical,
    Grid,
    List,
    Image,
    Camera,
    Mail,
    Phone,
    Globe,
    ExternalLink,
    Home,
    Compass,
    BarChart2,
    Award,
    Shield,
};

// Custom sport icons (since lucide doesn't have specific sport icons)
export const SportIcons = {
    Football: (props: LucideProps) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={props.size || 24}
            height={props.size || 24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={props.strokeWidth || 2}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            <path d="M2 12h20" />
        </svg>
    ),
    Basketball: (props: LucideProps) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={props.size || 24}
            height={props.size || 24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={props.strokeWidth || 2}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2v20" />
            <path d="M2 12h20" />
            <path d="M4.93 4.93c4 4 4 10.14 0 14.14" />
            <path d="M19.07 4.93c-4 4-4 10.14 0 14.14" />
        </svg>
    ),
    Tennis: (props: LucideProps) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={props.size || 24}
            height={props.size || 24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={props.strokeWidth || 2}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12a10 10 0 0 1 10-10" />
            <path d="M12 22a10 10 0 0 1 10-10" />
        </svg>
    ),
    Padel: (props: LucideProps) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={props.size || 24}
            height={props.size || 24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={props.strokeWidth || 2}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M4 17l6.5-6.5" />
            <circle cx="14" cy="10" r="6" />
            <path d="M10 6l8 8M12 4l8 8" />
        </svg>
    ),
    Badminton: (props: LucideProps) => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={props.size || 24}
            height={props.size || 24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={props.strokeWidth || 2}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M7 10a5 5 0 1 1 10 0v10l-5-3-5 3V10Z" />
            <path d="M12 17v4" />
        </svg>
    ),
};

// Logo component
export const Logo = ({ className = '', size = 40 }: { className?: string; size?: number }) => (
    <div
        className={`bg-[#C6FF00] rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-lime-500/30 ${className}`}
        style={{ width: size, height: size }}
    >
        <Star fill="black" stroke="none" size={size * 0.6} />
    </div>
);

// Helper to get sport icon by name
export function getSportIcon(sport: string): React.ComponentType<LucideProps> {
    const sportKey = sport as keyof typeof SportIcons;
    return SportIcons[sportKey] || SportIcons.Football;
}
