'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, CalendarCheck, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Primary navigation on phones and tablets. The app is installed to a home screen,
 * so reaching the main destinations should not require opening a drawer first.
 * Above lg the header's nav pill takes over and this hides.
 */
const ITEMS = [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/discover', label: 'Discover', icon: Compass },
    { href: '/mygames', label: 'My games', icon: CalendarCheck },
    { href: '/stats', label: 'Profile', icon: User },
] as const;

export default function BottomNav() {
    const pathname = usePathname();

    const [left, right] = [ITEMS.slice(0, 2), ITEMS.slice(2)];

    return (
        <nav
            aria-label="Primary"
            data-polarity="dark"
            className="fixed bottom-0 left-0 right-0 z-header lg:hidden border-t border-line bg-surface-inverse/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
        >
            <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2">
                {left.map((item) => <NavItem key={item.href} {...item} active={pathname === item.href} />)}

                <li className="flex items-center">
                    <Link
                        href="/games/new"
                        className="-mt-6 flex h-14 w-14 items-center justify-center rounded-pill bg-lime-500 text-ink-900 shadow-lime transition-transform duration-fast active:scale-95 touch-target"
                    >
                        <Plus aria-hidden="true" className="h-6 w-6" strokeWidth={3} />
                        <span className="sr-only">Host a game</span>
                    </Link>
                </li>

                {right.map((item) => <NavItem key={item.href} {...item} active={pathname.startsWith(item.href)} />)}
            </ul>
        </nav>
    );
}

function NavItem({ href, label, icon: Icon, active }: { href: string; label: string; icon: typeof Home; active: boolean }) {
    return (
        <li className="flex-1">
            <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                    'flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 py-2 transition-colors duration-fast touch-target',
                    active ? 'text-lime-500' : 'text-fg-muted hover:text-fg'
                )}
            >
                <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={active ? 2.75 : 2} />
                <span className="text-eyebrow font-black uppercase tracking-wide leading-none">{label}</span>
            </Link>
        </li>
    );
}
