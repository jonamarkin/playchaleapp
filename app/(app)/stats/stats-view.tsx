'use client';

import { useRouter } from 'next/navigation';
import ProfileDashboard from '@/components/ProfileDashboard';
import { useMyProfile } from '@/features/players/hooks';
import { useLogout } from '@/features/auth/hooks';
import { useUIStore } from '@/hooks/useUIStore';

export default function StatsView() {
  const router = useRouter();
  const openModal = useUIStore((state) => state.openModal);
  const { data: profile } = useMyProfile();
  const logout = useLogout();

  if (!profile) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 duration-300">
      <ProfileDashboard
        player={profile}
        isOwner={true}
        onEditStats={() => openModal('stats', profile)}
        onEditProfile={() => openModal('edit-profile', profile)}
        onShareProfile={() => openModal('share-profile', profile)}
        onSignOut={() => logout.mutate()}
        onViewMatch={(match) => router.push(`/game/${match.slug || match.id}`)}
      />
    </div>
  );
}
