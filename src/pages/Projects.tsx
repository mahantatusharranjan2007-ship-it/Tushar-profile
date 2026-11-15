import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { Project } from "../types";
import { useSEO } from "../lib/seo";
import { CardSkeleton } from "../components/LoadingSkeleton";
import { 
  Search, SlidersHorizontal, ExternalLink, Github, 
  Calendar, Layers, CheckCircle2, Bookmark, FolderOpen 
} from "lucide-react";

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useSEO({
    title: "Projects Portfolio",
    description: "Browse Tushar Ranjan's extensive catalog of technical systems, cloud orchestrators, client applications, and full-stack utilities."
  });

  useEffect(() => {
    async function loadProjects() {
      try {
        const q = query(collection(db, "projects"), orderBy("order", "asc"));
        const snap = await getDocs(q);
        const list: Project[] = [];
        snap.forEach((doc) => {
          list.push({ ...doc.data(), id: doc.id } as Project);
        });
        setProjects(list);
      } catch (err) {
        console.error("Error loading projects list:", err);
        handleFirestoreError(err, OperationType.LIST, "projects");
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  // Filter list
  const filteredProjects = projects.filter((proj) => {
    const matchesSearch = 
      proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.technologies.some((tech) => tech.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "All" || proj.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Unique categories list
  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category)))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-100 dark:border-zinc-900 pb-8">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Digital Showroom</span>
          <h1 className="font-sans font-extrabold text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-50 tracking-tight animate-fade-in">
            Engineering Projects
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            A comprehensive list of production-ready systems, tools, and integrations designed for future readiness.
          </p>
        </div>

        {/* Search and Filters panel */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto max-w-md">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search tools, stacks, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-zinc-900 dark:text-zinc-100 shadow-sm"
            />
          </div>
          {/* Category slider dropdown */}
          <div className="relative">
            <SlidersHorizontal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-2 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-zinc-900 dark:text-zinc-100 appearance-none shadow-sm font-medium"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <FolderOpen className="w-16 h-16 text-zinc-300 dark:text-zinc-700 animate-pulse" />
          <h3 className="font-sans font-bold text-lg text-zinc-900 dark:text-zinc-100">
            No projects match your filter query.
          </h3>
          <p className="text-zinc-500 max-w-sm text-sm">
            Try resetting your search parameter or category filters to explore the whole repository.
          </p>
          <button
            onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg active:scale-95 transition-all shadow-sm"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className={`group relative bg-white/40 dark:bg-zinc-950/40 border ${
                project.isFeatured 
                  ? "border-blue-500/40 dark:border-blue-500/30 ring-1 ring-blue-500/10" 
                  : "border-zinc-200/50 dark:border-zinc-800/50"
              } rounded-2xl overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm hover:shadow-xl transition-all duration-300 backdrop-blur-sm flex flex-col h-full`}
            >
              {/* Featured marker ribbon */}
              {project.isFeatured && (
                <div className="absolute top-3 left-3 z-10 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider shadow">
                  <Bookmark className="w-3 h-3 fill-white" />
                  <span>Featured Product</span>
                </div>
              )}

              {/* Cover thumbnail */}
              <div className="h-48 overflow-hidden relative">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&h=400&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/30 via-transparent to-transparent"></div>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block">
                    {project.category}
                  </span>
                  <h3 className="font-sans font-bold text-xl text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3">
                    {project.description}
                  </p>
                </div>

                {/* Tags and Timeline details */}
                <div className="space-y-4 pt-2">
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 text-[10px] sm:text-xs bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 rounded-md border border-zinc-200/50 dark:border-zinc-800/50 font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-xs font-semibold text-zinc-400 border-t border-zinc-100 dark:border-zinc-900 pt-3">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{project.startDate} &mdash; {project.endDate || "Present"}</span>
                    </span>
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-0.5 font-bold"
                    >
                      <span>Specifications</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feature Specs Detail Dialog Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-950 rounded-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-6">
            
            {/* Header detail */}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{selectedProject.category} specifications</span>
                <h3 className="font-sans font-bold text-2xl text-zinc-900 dark:text-zinc-100">
                  {selectedProject.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-500 rounded-lg text-xs font-semibold transition-all"
              >
                Close Specs
              </button>
            </div>

            {/* Description block */}
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed border-b border-zinc-100 dark:border-zinc-900 pb-4">
              {selectedProject.description}
            </p>

            {/* Features lists */}
            {selectedProject.features && selectedProject.features.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-blue-500" />
                  <span>Key Features & Functional Outcomes</span>
                </h4>
                <ul className="space-y-2.5">
                  {selectedProject.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA action urls */}
            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-900">
              {selectedProject.githubUrl && (
                <a
                  href={selectedProject.githubUrl}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded-lg transition-colors border border-zinc-200/30 dark:border-zinc-800/30"
                >
                  <Github className="w-4 h-4" />
                  <span>Source Code</span>
                </a>
              )}
              {selectedProject.liveUrl && (
                <a
                  href={selectedProject.liveUrl}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow shadow-blue-600/10"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Launch Live Demo</span>
                </a>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
