'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button, IconButton } from '@/components/ui/button';
import { Eyebrow, Text } from '@/components/ui/typography';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const VISITS_KEY = 'playchale_visits';
const DISMISSED_KEY = 'playchale_install_dismissed';

/**
 * Invites installation from the visitor's second session, never the first — asking
 * immediately is how prompts get dismissed permanently.
 *
 * Android/Chrome fires `beforeinstallprompt`; iOS Safari does not, so it gets a short
 * "Share → Add to Home Screen" hint instead.
 */
export default function InstallPrompt() {
    const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
    const [showIosHint, setShowIosHint] = useState(false);

    useEffect(() => {
        let visits = 1;
        try {
            if (localStorage.getItem(DISMISSED_KEY)) return;
            visits = Number(localStorage.getItem(VISITS_KEY) ?? '0') + 1;
            localStorage.setItem(VISITS_KEY, String(visits));
        } catch {
            return; // storage blocked: skip the prompt rather than nag every load
        }
        if (visits < 2) return;

        const standalone = window.matchMedia('(display-mode: standalone)').matches
            || (window.navigator as { standalone?: boolean }).standalone === true;
        if (standalone) return;

        const onPrompt = (event: Event) => {
            event.preventDefault();
            setDeferred(event as BeforeInstallPromptEvent);
        };
        window.addEventListener('beforeinstallprompt', onPrompt);
        window.addEventListener('appinstalled', dismiss);

        const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
        if (isIos) setShowIosHint(true);

        return () => {
            window.removeEventListener('beforeinstallprompt', onPrompt);
            window.removeEventListener('appinstalled', dismiss);
        };
    }, []);

    function dismiss() {
        try { localStorage.setItem(DISMISSED_KEY, '1'); } catch { /* ignore */ }
        setDeferred(null);
        setShowIosHint(false);
    }

    async function install() {
        if (!deferred) return;
        await deferred.prompt();
        await deferred.userChoice;
        dismiss();
    }

    if (!deferred && !showIosHint) return null;

    return (
        <div
            data-polarity="dark"
            role="complementary"
            aria-label="Install PlayChale"
            className="fixed inset-x-4 bottom-24 z-sticky mx-auto max-w-md rounded-card border border-line bg-surface-inverse p-5 shadow-e3 lg:bottom-6 animate-in fade-in slide-in-from-bottom-5 [animation-duration:400ms]"
        >
            <div className="flex items-start gap-4">
                <div className="flex-1 space-y-1">
                    <Eyebrow tone="accent">Add to home screen</Eyebrow>
                    <Text size="sm" tone="muted">
                        {showIosHint
                            ? 'Tap Share, then “Add to Home Screen” to open PlayChale like an app.'
                            : 'Open PlayChale straight from your home screen, and keep browsing when the network drops.'}
                    </Text>
                </div>
                <IconButton label="Dismiss" onClick={dismiss}><X className="h-4 w-4" /></IconButton>
            </div>
            {deferred && (
                <Button className="mt-4" full onClick={install}>Install</Button>
            )}
        </div>
    );
}
