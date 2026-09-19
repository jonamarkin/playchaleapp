'use client';

import ProfileDashboard from '@/components/ProfileDashboard';
import { useSession } from '@/features/auth/session';
import { usePlayer } from '@/features/players/hooks';
import { useUIStore } from '@/hooks/useUIStore';

export default function ProfileView({ slug }: { slug: string }) {
    const { playerId } = useSession();
    const { data: player } = usePlayer(slug);
    const triggerToast = useUIStore((state) => state.triggerToast);

    if (!player) return null;

    const isOwner = playerId === player.id;

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        triggerToast('PROFILE LINK COPIED TO CLIPBOARD');
    };

    return (
        <div className="bg-black min-h-screen animate-in fade-in duration-300">
            <ProfileDashboard
                player={player}
                isOwner={isOwner}
                onShareProfile={handleShare}
            />
        </div>
    );
}
