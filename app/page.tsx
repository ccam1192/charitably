import { ContactForm } from "./components/landing/ContactForm";
import { LandingFooter } from "./components/landing/Footer";
import { FeaturesSection } from "./components/landing/FeaturesSection";
import { LandingHeader } from "./components/landing/Header";
import { Hero } from "./components/landing/Hero";
import { HowItWorks } from "./components/landing/HowItWorks";
import { TrustSection } from "./components/landing/TrustSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />
      <main>
        <Hero />
        <FeaturesSection />
        <HowItWorks />
        <TrustSection />
        <ContactForm />
      </main>
      <LandingFooter />
    </div>
  );
}
