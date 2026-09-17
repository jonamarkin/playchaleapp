import AppChrome from '@/components/AppChrome';
import Footer from '@/components/Footer';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative bg-[#FDFDFB]">
      <AppChrome />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
