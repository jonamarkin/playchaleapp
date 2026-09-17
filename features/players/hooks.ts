'use client';

import { useCallback } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/browser';
import { useUIStore } from '@/hooks/useUIStore';
import type { PlayerProfile } from '@/types';
import { myProfileQuery, playerKeys, playerQuery, playersListQuery } from './queries';

/** Paginated player directory; `data` is the flattened list */
export function usePlayers() {
    return useInfiniteQuery({
        ...playersListQuery(api),
        select: (data) => data.pages.flatMap((page) => page.items),
    });
}

export function usePlayer(idOrSlug: string) {
    return useQuery(playerQuery(api, idOrSlug));
}

export function useMyProfile(enabled = true) {
    return useQuery({ ...myProfileQuery(api), enabled });
}

function readAsDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

export function useUploadAvatar() {
    const queryClient = useQueryClient();
    return useMutation({
        // TODO(backend): upload to object storage (presigned URL) and send the resulting URL
        mutationFn: async (file: File) => api.me.updateAvatar(await readAsDataUrl(file)),
        onSuccess: (profile: PlayerProfile) => {
            queryClient.setQueryData(playerKeys.me(), profile);
            queryClient.invalidateQueries({ queryKey: playerKeys.all });
        },
    });
}

/** Upload helper matching the old provider API: resolves to the new avatar URL, or null on failure */
export function useAvatarUploader() {
    const { mutateAsync } = useUploadAvatar();
    const triggerToast = useUIStore((state) => state.triggerToast);

    return useCallback(
        async (file: File): Promise<string | null> => {
            try {
                const profile = await mutateAsync(file);
                triggerToast('Avatar updated!');
                return profile.avatar;
            } catch (error) {
                console.error('Error uploading avatar:', error);
                triggerToast('Failed to upload avatar');
                return null;
            }
        },
        [mutateAsync, triggerToast]
    );
}
