'use client';

import ProfileDashboard from '@/components/ProfileDashboard';
import { useMyProfile } from '@/features/players/hooks';
import { useLogout } from '@/features/auth/hooks';
import { useUIStore } from '@/hooks/useUIStore';

export default function StatsView() {
  const triggerToast = useUIStore((state) => state.triggerToast);
  const { data: profile } = useMyProfile();
  const logout = useLogout();

  if (!profile) return null;

  const shareUrl = `${typeof window === 'undefined' ? '' : window.location.origin}/profile/${profile.handle}`;

  async function share() {
    const data = { title: `${profile!.name} on PlayChale`, url: shareUrl };
    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {
        // cancelled: fall through to copying
      }
    }
    await navigator.clipboard.writeText(shareUrl);
    triggerToast('PROFILE LINK COPIED');
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 duration-300">
      <ProfileDashboard
        player={profile}
        isOwner
        onShareProfile={share}
        onSignOut={() => logout.mutate()}
      />
    </div>
  );
}
