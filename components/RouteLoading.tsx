// Route-level loading fallback, re-exported by loading.tsx in routes that fetch server data.
// Deliberately not used for game/profile pages: a Suspense fallback streams the response early,
// which turns notFound() into a soft 404 (HTTP 200) on pages that should return real 404s.
export default function RouteLoading() {
  return (
    // Taller than the viewport so the footer stays below the fold: when the page streams in, nothing visible shifts
    <div className="min-h-[130vh] flex flex-col items-center pt-[40vh] gap-4 bg-surface-app" role="status" aria-live="polite">
      <div className="w-10 h-10 border-4 border-black/10 border-t-lime-500 rounded-full animate-spin" />
      <p className="text-black/40 font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">Loading Arena...</p>
    </div>
  );
}
