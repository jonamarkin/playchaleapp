import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Button, IconButton } from '@/components/ui/button';
import { Surface } from '@/components/ui/surface';
import { Display, Eyebrow, Heading, Text } from '@/components/ui/typography';
import SportIcon from '@/components/SportIcon';

export const metadata: Metadata = { title: 'Styleguide | PlayChale', robots: { index: false, follow: false } };

/**
 * The design system, rendered in the real app with the real Tailwind build and fonts —
 * so it cannot drift from what ships. Deliberately not Storybook: no second build system
 * and no provider mocks to maintain.
 *
 * Also the target for visual-regression and accessibility sweeps: every primitive in both
 * polarities on one page.
 */
export default function StyleguidePage() {
    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_STYLEGUIDE !== 'true') notFound();

    return (
        <Surface tone="app" polarity="light" as="main" className="min-h-screen px-4 py-16 md:px-12">
            <div className="mx-auto max-w-5xl space-y-20">
                <header className="space-y-4">
                    <Eyebrow tone="accent">Design system</Eyebrow>
                    <Display as="h1" size="lg">Styleguide</Display>
                    <Text tone="muted" className="max-w-xl">
                        Every token and primitive, in both polarities. If something here looks wrong, the app is wrong.
                    </Text>
                </header>

                <Section title="Colour" note="Lime is a background and accent. It is never text on a light surface (≈1.5:1).">
                    <Ramp name="lime" />
                    <Ramp name="ink" />
                    <div className="flex flex-wrap gap-3 pt-2">
                        {(['app', 'panel', 'sunken', 'inverse'] as const).map((tone) => (
                            <div key={tone} className="space-y-2">
                                <div className={`h-16 w-32 rounded-card border border-line bg-surface-${tone}`} />
                                <Eyebrow>{tone}</Eyebrow>
                            </div>
                        ))}
                    </div>
                </Section>

                <Section title="Type" note="Display is the brand voice. Nothing renders below 12px.">
                    <div className="space-y-4">
                        <Display size="xl">Step out</Display>
                        <Display size="lg">Step out</Display>
                        <Display size="md">Step out</Display>
                        <Display size="sm">Step out</Display>
                        <Heading>Section heading</Heading>
                        <Eyebrow>Eyebrow label</Eyebrow>
                        <Text size="lg">Body large — the intro paragraph size.</Text>
                        <Text>Body — default reading size for descriptions and content.</Text>
                        <Text size="sm" tone="muted">Body small, muted — metadata and secondary detail.</Text>
                        <Text size="label" tone="subtle">Label, subtle — form hints and captions.</Text>
                    </div>
                </Section>

                <Section title="Buttons" note="Both polarities, all states. Icon buttons require a label.">
                    {(['light', 'dark'] as const).map((polarity) => (
                        <Surface
                            key={polarity}
                            polarity={polarity}
                            tone={polarity === 'dark' ? 'inverse' : 'panel'}
                            className="space-y-6 rounded-card-lg border border-line p-8"
                        >
                            <Eyebrow>{polarity} surface</Eyebrow>
                            <div className="flex flex-wrap items-center gap-4">
                                <Button variant="primary">Join match</Button>
                                <Button variant="inverse">Host a game</Button>
                                <Button variant="outline">Filter</Button>
                                <Button variant="ghost">Cancel</Button>
                                <Button variant="danger">Leave game</Button>
                            </div>
                            <div className="flex flex-wrap items-center gap-4">
                                <Button size="sm">Small</Button>
                                <Button size="md">Medium</Button>
                                <Button size="lg">Large</Button>
                                <Button loading>Saving</Button>
                                <Button disabled>Disabled</Button>
                                <IconButton label="Share profile"><SportIcon sport="Football" size={18} /></IconButton>
                            </div>
                        </Surface>
                    ))}
                </Section>

                <Section title="Radius & elevation" note="Five radii by role, four elevations plus the brand glow.">
                    <div className="flex flex-wrap gap-4">
                        {(['chip', 'field', 'card', 'card-lg', 'card-xl'] as const).map((r) => (
                            <div key={r} className="space-y-2">
                                <div className={`h-24 w-32 border border-line bg-surface-panel rounded-${r}`} />
                                <Eyebrow>{r}</Eyebrow>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-6 pt-4">
                        {(['e1', 'e2', 'e3', 'lime'] as const).map((s) => (
                            <div key={s} className="space-y-2">
                                <div className={`h-24 w-32 rounded-card bg-surface-panel shadow-${s}`} />
                                <Eyebrow>{s}</Eyebrow>
                            </div>
                        ))}
                    </div>
                </Section>

                <Section title="Foreground scale" note="Muted ≈6:1, subtle ≈4.7:1 against their own surface — checked, not guessed.">
                    <div className="grid gap-4 md:grid-cols-2">
                        {(['light', 'dark'] as const).map((polarity) => (
                            <Surface
                                key={polarity}
                                polarity={polarity}
                                tone={polarity === 'dark' ? 'inverse' : 'panel'}
                                className="space-y-2 rounded-card border border-line p-6"
                            >
                                <Text>Default foreground</Text>
                                <Text tone="muted">Muted foreground</Text>
                                <Text tone="subtle">Subtle foreground</Text>
                            </Surface>
                        ))}
                    </div>
                </Section>
            </div>
        </Surface>
    );
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
    return (
        <section className="space-y-6 border-t border-line pt-10">
            <div className="space-y-2">
                <Heading as="h2">{title}</Heading>
                {note && <Text size="sm" tone="muted" className="max-w-xl">{note}</Text>}
            </div>
            {children}
        </section>
    );
}

// Tailwind needs literal class names, so the ramp is written out rather than interpolated.
const RAMPS = {
    lime: ['bg-lime-50', 'bg-lime-100', 'bg-lime-200', 'bg-lime-300', 'bg-lime-400', 'bg-lime-500', 'bg-lime-600', 'bg-lime-700', 'bg-lime-800', 'bg-lime-900', 'bg-lime-950'],
    ink: ['bg-ink-50', 'bg-ink-100', 'bg-ink-200', 'bg-ink-300', 'bg-ink-400', 'bg-ink-500', 'bg-ink-600', 'bg-ink-700', 'bg-ink-800', 'bg-ink-900', 'bg-ink-950'],
} as const;

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

function Ramp({ name }: { name: keyof typeof RAMPS }) {
    return (
        <div className="space-y-2">
            <Eyebrow>{name}</Eyebrow>
            <div className="flex overflow-hidden rounded-field border border-line">
                {RAMPS[name].map((cls, i) => (
                    <div key={cls} className={`h-16 flex-1 ${cls}`} title={`${name}-${STEPS[i]}`} />
                ))}
            </div>
        </div>
    );
}
