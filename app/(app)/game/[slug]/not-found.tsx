import Link from 'next/link';

export default function GameNotFound() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
            <div className="flex flex-col items-center gap-4 text-center px-6">
                <p className="font-black italic uppercase tracking-tighter text-3xl">Game Not Found</p>
                <p className="font-black uppercase tracking-widest text-xs opacity-50">This game does not exist or has been removed.</p>
                <Link
                    href="/discover"
                    className="mt-4 bg-lime-500 text-black px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all"
                >
                    Discover Games
                </Link>
            </div>
        </div>
    );
}
