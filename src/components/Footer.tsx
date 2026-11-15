import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Profile } from "../types";
import { Github, Linkedin, Mail, Heart, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    getDoc(doc(db, "profile", "main")).then(snap => {
      if (snap.exists()) {
        setProfile(snap.data() as Profile);
      }
    });
  }, []);

  return (
    <footer className="bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Segment */}
          <div className="space-y-4">
            <h3 className="font-sans font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              TRM.DEV
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Staff Systems Architect building clean, responsive, and resilient user-focused applications. Let's make digital assets delightful together.
            </p>
          </div>

          {/* Quick Navigations */}
          <div>
            <h4 className="font-sans font-semibold text-sm text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition-colors">
                  Biography & Skills
                </Link>
              </li>
              <li>
                <Link to="/projects" className="text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition-colors">
                  Portfolio Projects
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition-colors">
                  Engineering Blog
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition-colors">
                  Media Gallery
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Directives */}
          <div>
            <h4 className="font-sans font-semibold text-sm text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-4">
              Direct Contact
            </h4>
            <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-zinc-400" />
                <a href={`mailto:${profile?.email || "mahantatusharranjan2007@gmail.com"}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {profile?.email || "mahantatusharranjan2007@gmail.com"}
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-zinc-400" />
                <span>{profile?.whatsapp || "+1 (555) 0199-341"}</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-zinc-400" />
                <span>{profile?.location || "San Francisco, CA"}</span>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="font-sans font-semibold text-sm text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Social Connection
            </h4>
            <div className="flex space-x-3">
              <a
                href={profile?.github || "https://github.com/mahantapurna"}
                target="_blank"
                referrerPolicy="no-referrer"
                rel="noreferrer"
                className="p-2 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 transition-all"
                aria-label="GitHub Link"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href={profile?.linkedin || "https://linkedin.com/in/mahanta"}
                target="_blank"
                referrerPolicy="no-referrer"
                rel="noreferrer"
                className="p-2 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 transition-all"
                aria-label="LinkedIn Link"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-zinc-500 dark:text-zinc-400 space-y-4 sm:space-y-0">
          <div>
            &copy; {currentYear} Tushar Ranjan Mahanta. All rights reserved.
          </div>
          <div className="flex items-center space-x-1">
            <span>Built with React, Firestore, and Tailwind v4</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
