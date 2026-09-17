'use client';

import { LazyMotion, MotionConfig } from 'framer-motion';

// Animation features load after first paint instead of shipping in every route's bundle.
// Components must use `m.*` (not `motion.*`); `strict` turns a stray `motion.*` into an error.
const loadFeatures = () => import('./motion-features').then((mod) => mod.default);

export function MotionProvider({ children }: { children: React.ReactNode }) {
    return (
        <LazyMotion features={loadFeatures} strict>
            {/* Honour the OS "reduce motion" setting */}
            <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </LazyMotion>
    );
}
