import React from 'react';

/** Line icons per sport, sized by the `size` prop and coloured by `currentColor`. */
const PATHS: Record<string, React.ReactNode> = {
    // Centre pentagon with seams out to the edge: reads as a football at small sizes
    Football: <><circle cx="12" cy="12" r="10" /><path d="M12 8.5 15.3 10.9 14.1 14.8 9.9 14.8 8.7 10.9Z" /><path d="M12 8.5V2M15.3 10.9l6.2-2M14.1 14.8l3.8 5.3M9.9 14.8l-3.8 5.3M8.7 10.9l-6.2-2" /></>,
    Basketball: <><circle cx="12" cy="12" r="10" /><path d="M12 2v20M2 12h20" /><path d="M5.6 4.3a10 10 0 0 1 0 15.4M18.4 4.3a10 10 0 0 0 0 15.4" /></>,
    Tennis: <><circle cx="12" cy="12" r="10" /><path d="M2 12a10 10 0 0 1 10-10" /><path d="M12 22a10 10 0 0 1 10-10" /></>,
    Padel: <><circle cx="12" cy="12" r="10" /><path d="M2 12a10 10 0 0 1 10-10" /><path d="M12 22a10 10 0 0 1 10-10" /></>,
    Badminton: <><path d="M4 20 14 10" /><path d="M13 3.5 20.5 11 14 13l-3-3 2-6.5Z" /><circle cx="6" cy="18" r="2.5" /></>,
    Volleyball: <><circle cx="12" cy="12" r="10" /><path d="M2.5 10.5 8 16l4-4" /><path d="M12 12l4 4 5.5-5.5" /></>,
    Swimming: <><path d="M2 12h20" /><path d="M2 16h20" /><path d="M2 8h20" /></>,
    Athletics: <><path d="M4 16l2-1 2.5-3.5-1.5-3 2-2 3 1 2 2 3-1" /><path d="M11 11.5L14 16l-1 4" /><path d="M11 11.5L9 16l2 4" /></>,
};

const FALLBACK = <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>;

export default function SportIcon({ sport, size = 24, className = '' }: { sport: string; size?: number; className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            {PATHS[sport] || FALLBACK}
        </svg>
    );
}
