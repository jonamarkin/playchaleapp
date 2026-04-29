'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLoader from '@/components/AppLoader';
import ProfileDashboard from '@/components/ProfileDashboard';
import { usePlayChale } from '@/providers/PlayChaleProvider';
import { useProfile } from '@/hooks/useData';

export default function ProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { user, openModal, triggerToast } = usePlayChale();
    const profileSlug = params.slug as string;
    const profileId = profileSlug === 'me' ? user?.id : profileSlug;
    const { data: playerData, isLoading } = useProfile(profileId);

    const isOwner = user?.id === playerData?.id;

    React.useEffect(() => {
        if (profileSlug === 'me' && !user) {
            router.replace('/login');
        }
    }, [profileSlug, router, user]);

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        triggerToast('PROFILE LINK COPIED TO CLIPBOARD');
    };

    if (isLoading || !playerData) {
        return <AppLoader label="Loading player" tone="dark" />;
    }

    return (
        <div className="pc-view-enter bg-black min-h-screen">
            <ProfileDashboard
                player={playerData}
                isOwner={isOwner}
                onEditStats={() => isOwner && openModal('stats', playerData)}
                onEditProfile={() => isOwner && openModal('edit-profile', playerData)}
                onShareProfile={handleShare}
                onViewMatch={(match) => router.push(`/game/${match.slug || match.id}`)}
            />
        </div>
    );
}
