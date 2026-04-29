interface AppLoaderProps {
  label?: string;
  tone?: 'dark' | 'light';
  fullScreen?: boolean;
  overlay?: boolean;
  className?: string;
}

export default function AppLoader({
  label = 'Loading PlayChale',
  tone = 'dark',
  fullScreen = true,
  overlay = false,
  className = '',
}: AppLoaderProps) {
  const isDark = tone === 'dark';

  const shellClass = overlay
    ? 'fixed inset-0 z-[220] bg-black/70 backdrop-blur-xl'
    : fullScreen
      ? isDark
        ? 'min-h-screen bg-black'
        : 'min-h-screen bg-[#FDFDFB]'
      : '';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`${shellClass} ${className} flex items-center justify-center px-6`}
    >
      <div className="pc-view-enter flex flex-col items-center gap-5 text-center">
        <div className={`relative flex h-20 w-20 items-center justify-center rounded-[28px] border ${isDark || overlay ? 'border-white/10 bg-white/5' : 'border-black/5 bg-white'} shadow-2xl`}>
          <div className="absolute inset-0 rounded-[28px] border-2 border-[#C6FF00]/30 animate-ping" />
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[#C6FF00] text-sm font-black italic text-black shadow-lg">
            PC
          </div>
        </div>
        <div className="space-y-3">
          <p className={`text-[10px] font-black uppercase tracking-[0.35em] ${isDark || overlay ? 'text-white/50' : 'text-black/45'}`}>
            {label}
          </p>
          <div className="flex justify-center gap-1.5">
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className="h-1.5 w-1.5 rounded-full bg-[#C6FF00] animate-pulse"
                style={{ animationDelay: `${dot * 140}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
