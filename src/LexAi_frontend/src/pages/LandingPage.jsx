
import HeroSection from '../components/HeroSection';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import UseCases from '../components/UseCases';
import DemoPreview from '../components/DemoPreview';
import Disclaimer from '../components/Disclaimer';
import Footer from '../components/Footer'; 

export default function LandingPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <HeroSection />
      <HowItWorks />
      <Testimonials />
      <UseCases />
      <DemoPreview />
      <Disclaimer />
      <Footer />
    </div>
  );
}