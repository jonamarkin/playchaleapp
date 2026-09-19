import AppChrome from '@/components/AppChrome';
import BottomNav from '@/components/app-shell/BottomNav';
import InstallPrompt from '@/components/app-shell/InstallPrompt';
import Footer from '@/components/Footer';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative bg-surface-app">
      <AppChrome />
      <main id="main" className="pb-24 lg:pb-0">{children}</main>
      <Footer />
      <BottomNav />
      <InstallPrompt />
    </div>
  );
}
