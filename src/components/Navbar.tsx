import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Menu, X, Sun, Moon, Briefcase, User, Code, 
  BookOpen, FolderKanban, Phone, Image, Award, LayoutDashboard 
} from "lucide-react";

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  isAdmin: boolean;
}

export default function Navbar({ darkMode, setDarkMode, isAdmin }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: "Home", path: "/", icon: User },
    { name: "About", path: "/about", icon: User },
    { name: "Projects", path: "/projects", icon: FolderKanban },
    { name: "Skills", path: "/skills", icon: Code },
    { name: "Blog", path: "/blog", icon: BookOpen },
    { name: "Gallery", path: "/gallery", icon: Image },
    { name: "Metrics", path: "/dashboard", icon: LayoutDashboard },
    { name: "Contact", path: "/contact", icon: Phone },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo / Brand Name */}
          <Link to="/" className="flex items-center space-x-3 group">
            {/* Minimalist Monogram Logo */}
            <div className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-500 to-violet-500 shadow-md shadow-blue-500/10 group-hover:scale-105 transition-all duration-300">
              <span className="font-sans font-black text-white text-xs tracking-tighter">TRM</span>
              <div className="absolute inset-0 rounded-xl border border-white/20"></div>
            </div>
            <span className="font-sans font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:to-indigo-400 transition-all duration-300">
              TRM.DEV
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.path)
                      ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {/* Admin Portal Link */}
            <Link
              to="/admin"
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive("/admin")
                  ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>{isAdmin ? "Admin Console" : "Log In"}</span>
            </Link>
          </div>

          {/* Right Controls: Theme Toggler & Mobile Menu Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  isActive(link.path)
                    ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
          
          <Link
            to="/admin"
            onClick={() => setIsOpen(false)}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
              isActive("/admin")
                ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            <Briefcase className="w-5 h-5" />
            <span>{isAdmin ? "Admin Console" : "Admin Login"}</span>
          </Link>
        </div>
      )}
    </nav>
  );
}
