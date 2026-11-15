import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AnimatedBackground from "./components/AnimatedBackground";
import AnnouncementPopup from "./components/AnnouncementPopup";
import { trackPageView } from "./lib/visitorTracking";
import { seedDatabase } from "./lib/seedData";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Projects from "./pages/Projects";
import Skills from "./pages/Skills";
import Gallery from "./pages/Gallery";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import VisitorDashboard from "./pages/VisitorDashboard";
import Admin from "./pages/Admin";

function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return null;
}

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // Check local preferences
    const cached = localStorage.getItem("darkMode");
    if (cached !== null) {
      return cached === "true";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const [isAdmin, setIsAdmin] = useState(false);

  // Trigger default seeding/migration check on startup
  useEffect(() => {
    seedDatabase();
  }, []);

  // Generate dynamic custom TRM monogram favicon
  useEffect(() => {
    const faviconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563eb" />
      <stop offset="50%" stop-color="#4f46e5" />
      <stop offset="100%" stop-color="#7c3aed" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="24" fill="url(#grad)" />
  <text x="50" y="65" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="42" fill="#ffffff" text-anchor="middle" letter-spacing="-2">TRM</text>
</svg>
`;
    const faviconDataUri = `data:image/svg+xml;utf8,${encodeURIComponent(faviconSvg.trim())}`;
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = faviconDataUri;
  }, []);

  // Monitor auth changes for live Admin tags in navbar
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && (user.email === "mahantapurna1981@gmail.com" || user.email === "mahantatusharranjan2007@gmail.com")) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsub();
  }, []);

  // Sync dark class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="relative min-h-screen flex flex-col justify-between bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans antialiased overflow-hidden transition-colors duration-300">
        
        {/* Particle Canvas background dynamics */}
        <AnimatedBackground />

        {/* Global telemetry tracking listener */}
        <RouteTracker />

        {/* Priority alert announcements bar */}
        <AnnouncementPopup />

        {/* Navbar */}
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} isAdmin={isAdmin} />

        {/* Page Content routes */}
        <main className="relative z-10 flex-grow pt-16 sm:pt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/dashboard" element={<VisitorDashboard />} />
            <Route path="/admin" element={<Admin />} />
            
            {/* Catchall routing to home */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />

      </div>
    </Router>
  );
}
