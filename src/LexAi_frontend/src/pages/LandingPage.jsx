import { motion } from 'framer-motion';
import HeroSection from '../components/HeroSection';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import UseCases from '../components/UseCases';
import DemoPreview from '../components/DemoPreview';
import Disclaimer from '../components/Disclaimer';
import Footer from '../components/Footer';

export default function LandingPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100"
    >
      <HeroSection />
      <HowItWorks />
      <Testimonials />
      <UseCases />
      <DemoPreview />
      <Disclaimer />
      <Footer />
    </motion.div>
  );
}