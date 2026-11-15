import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { Skill, Experience } from "../types";
import { useSEO } from "../lib/seo";
import { TextSkeleton } from "../components/LoadingSkeleton";
import { 
  Code, Server, Database, Cloud, Sparkles, Terminal, 
  Users, Briefcase, Calendar, CheckSquare, Layers 
} from "lucide-react";

export default function Skills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: "Skills & Experience",
    description: "Review Tushar Ranjan's engineering skillset divided into frontend, database, AI orchestrations, and full-time career timeline."
  });

  useEffect(() => {
    async function loadSkillsAndExp() {
      try {
        // Fetch skills
        const skillsSnap = await getDocs(query(collection(db, "skills"), orderBy("order", "asc")));
        const skillsList: Skill[] = [];
        skillsSnap.forEach((doc) => {
          skillsList.push({ ...doc.data(), id: doc.id } as Skill);
        });
        setSkills(skillsList);

        // Fetch experience
        const expSnap = await getDocs(query(collection(db, "experience"), orderBy("order", "asc")));
        const expList: Experience[] = [];
        expSnap.forEach((doc) => {
          expList.push({ ...doc.data(), id: doc.id } as Experience);
        });
        setExperiences(expList);
      } catch (err) {
        console.error("Error loading skills/exp:", err);
        handleFirestoreError(err, OperationType.LIST, "skills");
      } finally {
        setLoading(false);
      }
    }
    loadSkillsAndExp();
  }, []);

  // Icon mapping resolver helper
  const getSkillCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Frontend": return <Code className="w-5 h-5 text-blue-500" />;
      case "Backend": return <Server className="w-5 h-5 text-indigo-500" />;
      case "Database": return <Database className="w-5 h-5 text-emerald-500" />;
      case "Cloud": return <Cloud className="w-5 h-5 text-sky-500" />;
      case "AI Tools": return <Sparkles className="w-5 h-5 text-violet-500" />;
      case "Deployment": return <Terminal className="w-5 h-5 text-zinc-500" />;
      default: return <Users className="w-5 h-5 text-fuchsia-500" />;
    }
  };

  // Group skills by category
  const categories: Skill["category"][] = [
    "Frontend", "Backend", "Database", "Cloud", "AI Tools", "Deployment", "Soft Skills"
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-20">
      
      {/* Skillset catalog section */}
      <div className="space-y-12">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Engineering Arsenal</span>
          <h1 className="font-sans font-extrabold text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-50 tracking-tight">
            Professional Skillset
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            A comprehensive split of languages, database adapters, local agent libraries, and architectural soft methodologies.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map((i) => <TextSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {categories.map((cat) => {
              const catSkills = skills.filter((s) => s.category === cat);
              if (catSkills.length === 0) return null;

              return (
                <div 
                  key={cat} 
                  className="bg-white/40 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-6 shadow-sm backdrop-blur-sm space-y-5"
                >
                  <div className="flex items-center space-x-2.5 border-b border-zinc-100 dark:border-zinc-900 pb-3">
                    {getSkillCategoryIcon(cat)}
                    <h3 className="font-sans font-bold text-lg text-zinc-900 dark:text-zinc-100">
                      {cat} Skills
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {catSkills.map((skill) => (
                      <div key={skill.id} className="space-y-2 group">
                        <div className="flex justify-between items-end text-sm">
                          <div className="space-y-0.5">
                            <span className="font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {skill.name}
                            </span>
                            {skill.description && (
                              <p className="text-[11px] text-zinc-400 leading-normal">
                                {skill.description}
                              </p>
                            )}
                          </div>
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                            {skill.level}%
                          </span>
                        </div>
                        {/* Custom visual progress track bar */}
                        <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-1000 group-hover:from-blue-500 group-hover:to-violet-500"
                            style={{ width: `${skill.level}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Experience History Section */}
      <div className="space-y-12 border-t border-zinc-100 dark:border-zinc-900 pt-16">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Employment Milestones</span>
          <h2 className="font-sans font-bold text-2xl sm:text-3xl text-zinc-900 dark:text-zinc-100 tracking-tight">
            Work Experience
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Chronological breakdown of full-time engineering posts, internships, volunteer efforts, and freelance products.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <TextSkeleton />
          </div>
        ) : experiences.length === 0 ? (
          <p className="text-sm text-zinc-400 italic">No experience records seeded yet.</p>
        ) : (
          <div className="space-y-8">
            {experiences.map((exp) => (
              <div 
                key={exp.id}
                className="group p-6 bg-white/40 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-4 mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                      <h3 className="font-sans font-bold text-lg text-zinc-900 dark:text-zinc-100">
                        {exp.role}
                      </h3>
                    </div>
                    <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 pl-7">
                      {exp.company} &bull; <span className="text-xs text-blue-500 dark:text-blue-400">{exp.type}</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-1.5 pl-7 sm:pl-0 text-zinc-400 dark:text-zinc-500 font-mono text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{exp.startDate} &mdash; {exp.endDate || "Present"}</span>
                  </div>
                </div>

                <div className="pl-0 sm:pl-7 space-y-4">
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {exp.description}
                  </p>

                  {exp.achievements && exp.achievements.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center space-x-1.5">
                        <Layers className="w-4 h-4 text-zinc-400" />
                        <span>Key Responsibilities & Deliverables</span>
                      </h4>
                      <ul className="space-y-2">
                        {exp.achievements.map((ach, idx) => (
                          <li key={idx} className="flex items-start space-x-2 text-xs text-zinc-500 dark:text-zinc-400">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                            <span>{ach}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
