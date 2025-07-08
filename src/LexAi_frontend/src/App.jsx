import React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from './pages/LandingPage';
import Navbar from './components/Navbar';
import AskAiPage from './pages/AskAiPage';


const App = () => {
  
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Router>
      <Navbar scrollY={scrollY} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/ask" element={<AskAiPage />} />
      </Routes>
    </Router>
  );
    
};

export default App;
