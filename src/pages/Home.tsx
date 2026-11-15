import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { doc, getDoc, collection, query, where, limit, getDocs } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { Profile, Project } from "../types";
import { useSEO } from "../lib/seo";
import { ArrowRight, Github, Linkedin, Mail, FileText, Sparkles, Code, Cpu, ExternalLink } from "lucide-react";

export default function Home() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [typedText, setTypedText] = useState("");
  const [loading, setLoading] = useState(true);

  // Typing animation lists
  const roles = [
    "Lead AI Systems Architect",
    "Staff Full-Stack Developer",
    "Distributed Systems Engineer",
    "Autonomous Agents Designer"
  ];
  const [roleIndex, setRoleIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Set SEO tags
  useSEO({
    title: "Home - Tushar Ranjan Mahanta",
    description: profile?.shortIntro || "Lead AI Systems & Full-Stack Architect designing autonomous agent orchestrations and elegant react interfaces."
  });

  // Typing effect loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const currentRole = roles[roleIndex];

    if (isDeleting) {
      timer = setTimeout(() => {
        setTypedText(currentRole.substring(0, charIndex - 1));
        setCharIndex((prev) => prev - 1);
      }, 50);
    } else {
      timer = setTimeout(() => {
        setTypedText(currentRole.substring(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
      }, 100);
    }

    if (!isDeleting && charIndex === currentRole.length) {
      timer = setTimeout(() => setIsDeleting(true), 2000); // Wait before deleting
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setRoleIndex((prev) => (prev + 1) % roles.length); // Shift role
    }

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, roleIndex]);

  // Load profile and featured projects
  useEffect(() => {
    async function loadHomeData() {
      try {
        const docRef = doc(db, "profile", "main");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as Profile);
        }

        // Fetch featured projects
        const projQuery = query(
          collection(db, "projects"),
          where("isFeatured", "==", true),
          limit(3)
        );
        const projSnap = await getDocs(projQuery);
        const projectsList: Project[] = [];
        projSnap.forEach((doc) => {
          projectsList.push({ ...doc.data(), id: doc.id } as Project);
        });
        setFeaturedProjects(projectsList);
      } catch (err) {
        console.error("Error loading home details:", err);
        handleFirestoreError(err, OperationType.GET, "profile");
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse space-y-12">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-4">
            <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-12 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-6 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-16 w-full bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-10 w-44 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          </div>
          <div className="w-64 h-64 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
        </div>
      </div>
    );
  }

  // Fallback values if database seeding failed
  const name = profile?.name || "Tushar Ranjan Mahanta";
  const title = profile?.title || "Lead AI Systems & Full-Stack Architect";
  const shortIntro = profile?.shortIntro || "I design intelligent systems, orchestrate autonomous agents, and craft ultra-premium web interfaces.";
  const avatarUrl = profile?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80";
  const resumeUrl = profile?.resumeUrl || "#";

  return (
    <div className="relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Hero Section */}
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12 border-b border-zinc-100 dark:border-zinc-900 pb-16">
          <div className="flex-1 text-center lg:text-left space-y-6 max-w-2xl">
            {/* Visual Indicator Pill */}
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Available for Consultations</span>
            </div>

            <h1 className="font-sans font-extrabold text-4xl sm:text-6xl text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight">
              Hello, I'm <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
                {name}
              </span>
            </h1>

            {/* Dynamic typing animation */}
            <div className="h-8 font-mono text-lg sm:text-xl text-zinc-600 dark:text-zinc-300">
              <span className="border-r-2 border-blue-600 dark:border-blue-400 pr-1 animate-pulse">
                {typedText}
              </span>
            </div>

            <p className="text-zinc-500 dark:text-zinc-400 text-base sm:text-lg leading-relaxed">
              {shortIntro}
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/10 hover:shadow-blue-600/25 hover:bg-blue-700 transition-all active:scale-95 text-sm"
              >
                <span>Hire Me / Contact</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={resumeUrl}
                target="_blank"
                referrerPolicy="no-referrer"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-950 dark:text-zinc-100 font-semibold border border-zinc-200/50 dark:border-zinc-800/50 transition-all active:scale-95 text-sm"
              >
                <FileText className="w-4 h-4 text-zinc-400" />
                <span>Resume PDF</span>
              </a>
            </div>

            {/* Social linkages */}
            <div className="flex justify-center lg:justify-start items-center space-x-4 pt-4 border-t border-zinc-100 dark:border-zinc-900">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Connect:</span>
              <a
                href={profile?.github || "https://github.com/mahantapurna"}
                target="_blank"
                referrerPolicy="no-referrer"
                rel="noreferrer"
                className="text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                aria-label="GitHub profile"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href={profile?.linkedin || "https://linkedin.com/in/mahanta"}
                target="_blank"
                referrerPolicy="no-referrer"
                rel="noreferrer"
                className="text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                aria-label="LinkedIn profile"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href={`mailto:${profile?.email || "mahantapurna1981@gmail.com"}`}
                className="text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                aria-label="Email Address"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Profile Frame */}
          <div className="flex-shrink-0 relative">
            {/* Visual background rings */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full blur-2xl opacity-20 scale-110"></div>
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full p-2 bg-gradient-to-tr from-blue-600/30 to-indigo-500/30 border border-zinc-200 dark:border-zinc-800/50 shadow-2xl overflow-hidden flex items-center justify-center">
              <img
                src={avatarUrl}
                alt="Tushar Ranjan Mahanta"
                className="w-full h-full object-cover rounded-full filter grayscale hover:grayscale-0 transition-all duration-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80";
                }}
              />
            </div>
          </div>
        </div>

        {/* Featured Projects Highlight */}
        <div className="pt-16 space-y-8">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Handcrafted Products</span>
              <h2 className="font-sans font-bold text-2xl sm:text-3xl text-zinc-900 dark:text-zinc-100 tracking-tight">
                Featured Projects
              </h2>
            </div>
            <Link
              to="/projects"
              className="inline-flex items-center space-x-1 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <span>See all projects</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <div
                key={project.id}
                className="group bg-white/40 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm hover:shadow-xl transition-all duration-300 backdrop-blur-sm flex flex-col h-full"
              >
                <div className="h-44 overflow-hidden relative">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&h=400&q=80";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 via-transparent to-transparent"></div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-sans font-bold text-lg text-zinc-900 dark:text-zinc-100">
                      {project.title}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3">
                      {project.description}
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    {/* Technologies tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 text-xs bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 rounded-md border border-zinc-200/40 dark:border-zinc-800/40"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-zinc-100 dark:bg-zinc-900 text-zinc-500 rounded-md">
                          +{project.technologies.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400">{project.startDate}</span>
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <span>Demo</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
