import NavBar from "./_components/nav-bar";
import HeroSection from "./_components/hero-section";
import FeatureSection from "./_components/feature-section";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <NavBar />
      <HeroSection />
      <FeatureSection />
      <footer className="text-center py-6 text-sm text-gray-400">
        © 2026 Chat Resume. All rights reserved.
      </footer>
    </main>
  );
}
