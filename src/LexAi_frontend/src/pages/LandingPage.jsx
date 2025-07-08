import { useState, useEffect } from 'react';
import './App.css'
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import UseCases from '../components/UseCases';
import DemoPreview from '../components/DemoPreview';
import Disclaimer from '../components/Disclaimer';
import Footer from '../components/Footer'; 

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar scrollY={scrollY} />
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