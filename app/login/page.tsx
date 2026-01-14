'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ICONS } from '@/constants';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            router.push('/home');
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Failed to sign in');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialAuth = async (provider: 'google') => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (err: any) {
            console.error('Social auth error:', err);
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#C6FF00]/10 blur-[150px] rounded-full -mr-40 -mt-40"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 blur-[150px] rounded-full -ml-40 -mb-40"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="z-10 w-full max-w-md p-8 space-y-8"
            >
                <div className="text-center space-y-4">
                    <div className="flex justify-center mb-6">
                        <div className="scale-150">
                            <ICONS.Logo />
                        </div>
                    </div>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                        Enter The <br /> Arena
                    </h1>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
                        Sign in to manage your legacy
                    </p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => handleSocialAuth('google')}
                        disabled={isLoading}
                        className="w-full bg-white text-black p-4 rounded-full flex items-center justify-center gap-3 hover:bg-gray-200 transition-all font-bold text-sm uppercase tracking-wider relative overflow-hidden group"
                    >
                        {isLoading ? (
                            <span className="opacity-50">Connecting...</span>
                        ) : (
                            <>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.908 3.152-1.928 4.172-1.224 1.224-3.136 2.584-6.392 2.584-5.112 0-9.216-4.144-9.216-9.256s4.104-9.256 9.216-9.256c2.784 0 4.888 1.104 6.384 2.504l2.312-2.312c-2.128-2.024-4.88-3.192-8.696-3.192-7.392 0-13.432 6.04-13.432 13.432s6.04 13.432 13.432 13.432c4.016 0 7.04-1.32 9.424-3.792 2.448-2.448 3.216-5.888 3.216-8.544 0-.816-.064-1.584-.2-2.312h-12.42z" /></svg>
                                <span>Continue with Google</span>
                            </>
                        )}
                    </button>

                    <div className="flex items-center gap-4 py-2">
                        <div className="h-px bg-white/10 flex-1"></div>
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">OR</span>
                        <div className="h-px bg-white/10 flex-1"></div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="email"
                                placeholder="Email Address"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-white/5 border-white/10 h-12 rounded-full px-6 focus:border-[#C6FF00] placeholder:text-white/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-white/5 border-white/10 h-12 rounded-full px-6 focus:border-[#C6FF00] placeholder:text-white/20"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs text-center font-bold">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-[#C6FF00] hover:bg-[#b0ff00] text-black rounded-full font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(198,255,0,0.2)]"
                        >
                            {isLoading ? 'Signing In...' : 'Access Account'}
                        </Button>
                    </form>
                </div>

                <div className="text-center">
                    <Link href="/onboarding" className="text-white/40 hover:text-[#C6FF00] text-xs font-bold uppercase tracking-widest transition-colors">
                        New Athlete? <span className="text-white border-b border-white/20 pb-0.5">Start Draft</span>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
