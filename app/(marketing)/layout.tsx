import Footer from '@/components/Footer';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative bg-surface-app">
      <main id="main">{children}</main>
      <Footer />
    </div>
  );
}
