import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import LandingPage from './pages/LandingPage';
import Navbar from './components/Navbar';
import AskAiPage from './pages/AskAiPage';
import LegalDocumentGenerator from './pages/LegalDocumentGenerator';

const AppContent = () => {
  const location = useLocation();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Navbar scrollY={scrollY} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/ask" element={<AskAiPage />} />
        <Route path="/generate" element={<LegalDocumentGenerator/>} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
