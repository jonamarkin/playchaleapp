import Footer from '@/components/Footer';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative bg-[#FDFDFB]">
      {children}
      <Footer />
    </div>
  );
}
