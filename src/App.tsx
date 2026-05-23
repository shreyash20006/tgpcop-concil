import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Lenis from 'lenis';

// Import components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ScrollProgressBar } from './components/ScrollProgressBar';

// Import pages
import { Home } from './pages/Home';
import { Council } from './pages/Council';
import { Ask } from './pages/Ask';
import { Notices } from './pages/Notices';
import { Events } from './pages/Events';
import { Gallery } from './pages/Gallery';

// ⚙️ SETUP INSTRUCTIONS:
// - npm install framer-motion lenis three @types/three react-router-dom lucide-react
// - Tailwind already configured via `@tailwindcss/vite` in vite.config.ts
// - Replace /assets/logo.png with actual TGPCOP logo file in public/assets/
// - Replace "#google-form-link" with real Google Form URLs inside src/data/events.ts
// - For Ask form: connect to Google Forms or EmailJS for real submission

// A helper component to scroll to top automatically on route changes
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export const App: React.FC = () => {
  // Global Lenis smooth scroll engine initialization
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth exponential ease-out
      infinite: false,
    });

    // Request Animation Frame loop
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Clean up scroll instance on unmount
    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <Router>
      {/* Reset window viewport coordinate on routing */}
      <ScrollToTop />
      
      {/* Fixed Scroll progress indicator */}
      <ScrollProgressBar />

      {/* Primary Layout structure */}
      <div className="flex flex-col min-h-screen bg-gray-light font-sans text-navy-dark antialiased">
        <Navbar />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/council" element={<Council />} />
            <Route path="/ask" element={<Ask />} />
            <Route path="/notices" element={<Notices />} />
            <Route path="/events" element={<Events />} />
            <Route path="/media" element={<Gallery />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

export default App;
