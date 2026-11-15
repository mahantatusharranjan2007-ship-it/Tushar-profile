import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { doc, getDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { Profile, Education, Achievement } from "../types";
import { useSEO } from "../lib/seo";
import { TimelineSkeleton } from "../components/LoadingSkeleton";
import { 
  GraduationCap, Calendar, Award, ExternalLink, Globe, 
  Compass, Lightbulb, Target, ArrowRight 
} from "lucide-react";

export default function About() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [education, setEducation] = useState<Education[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: "About Me",
    description: profile?.bio || "Read Tushar Ranjan's professional biography, academic achievements, timeline of successes, and personal focus areas."
  });

  useEffect(() => {
    async function loadAboutData() {
      try {
        // Fetch profile
        const profSnap = await getDoc(doc(db, "profile", "main"));
        if (profSnap.exists()) {
          setProfile(profSnap.data() as Profile);
        }

        // Fetch education sorted by order
        const eduQuery = query(collection(db, "education"), orderBy("order", "asc"));
        const eduSnap = await getDocs(eduQuery);
        const eduList: Education[] = [];
        eduSnap.forEach((doc) => {
          eduList.push({ ...doc.data(), id: doc.id } as Education);
        });
        setEducation(eduList);

        // Fetch achievements sorted by order
        const achQuery = query(collection(db, "achievements"), orderBy("order", "asc"));
        const achSnap = await getDocs(achQuery);
        const achList: Achievement[] = [];
        achSnap.forEach((doc) => {
          achList.push({ ...doc.data(), id: doc.id } as Achievement);
        });
        setAchievements(achList);
      } catch (err) {
        console.error("Error loading about page data:", err);
        handleFirestoreError(err, OperationType.GET, "profile");
      } finally {
        setLoading(false);
      }
    }
    loadAboutData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 space-y-16">
        <div className="h-10 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="h-6 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
            <div className="h-6 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
            <div className="h-6 w-4/5 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
          </div>
          <div className="space-y-4">
            <div className="h-44 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Fallbacks if Firestore not seeded or delayed
  const bio = profile?.bio || "A highly motivated software architect with professional development experience, designing and scaling distributed full-stack systems.";
  const goals = profile?.careerGoals || "To design scalable, reliable intelligence-backed infrastructures that empower human creativity.";
  const focus = profile?.currentFocus || "Local model inferences, multi-agent orchestrations, and lightweight microservices.";
  const languages = profile?.languages || ["English", "Spanish"];
  const interests = profile?.interests || ["Espresso Art", "Analog Synths", "Sailing"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-20">
      
      {/* Intro section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Bio text */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Introduction</span>
            <h1 className="font-sans font-extrabold text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-50 tracking-tight">
              About My Journey
            </h1>
          </div>
          <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-base sm:text-lg">
            {bio}
          </p>
          
          <div className="flex flex-wrap gap-3 pt-2">
            <Link 
              to="/skills" 
              className="inline-flex items-center space-x-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>Explore My Technical Skills</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right side Metadata cards */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Goals block */}
          <div className="p-5 bg-white/40 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl space-y-3 backdrop-blur-sm shadow-sm">
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
              <Target className="w-5 h-5" />
              <h3 className="font-bold text-sm uppercase tracking-wider">Career Goals</h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {goals}
            </p>
          </div>

          {/* Current Focus block */}
          <div className="p-5 bg-white/40 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl space-y-3 backdrop-blur-sm shadow-sm">
            <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
              <Lightbulb className="w-5 h-5" />
              <h3 className="font-bold text-sm uppercase tracking-wider">Current Focus</h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {focus}
            </p>
          </div>

          {/* Languages block */}
          <div className="p-5 bg-white/40 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl space-y-3 backdrop-blur-sm shadow-sm">
            <div className="flex items-center space-x-2 text-violet-600 dark:text-violet-400">
              <Globe className="w-5 h-5" />
              <h3 className="font-bold text-sm uppercase tracking-wider">Languages</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {languages.map((lang, idx) => (
                <span key={idx} className="px-2 py-0.5 text-[10px] sm:text-xs bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-800/50 rounded-md">
                  {lang}
                </span>
              ))}
            </div>
          </div>

          {/* Personal interests block */}
          <div className="p-5 bg-white/40 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl space-y-3 backdrop-blur-sm shadow-sm">
            <div className="flex items-center space-x-2 text-fuchsia-600 dark:text-fuchsia-400">
              <Compass className="w-5 h-5" />
              <h3 className="font-bold text-sm uppercase tracking-wider">Interests</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {interests.map((interest, idx) => (
                <span key={idx} className="px-2 py-0.5 text-[10px] sm:text-xs bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-800/50 rounded-md">
                  {interest}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Academic Timeline Segment */}
      <div className="space-y-8 border-t border-zinc-100 dark:border-zinc-900 pt-16">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Academic History</span>
          <h2 className="font-sans font-bold text-2xl sm:text-3xl text-zinc-900 dark:text-zinc-100 tracking-tight">
            Education Timeline
          </h2>
        </div>

        {education.length === 0 ? (
          <TimelineSkeleton />
        ) : (
          <div className="relative pl-6 sm:pl-8 before:absolute before:left-[11px] sm:before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-blue-600 before:to-indigo-500 space-y-10">
            {education.map((edu) => (
              <div key={edu.id} className="relative group">
                {/* Visual marker */}
                <div className="absolute -left-[23px] sm:-left-[29px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-zinc-950 border-2 border-blue-600 group-hover:scale-125 group-hover:bg-blue-600 transition-all flex items-center justify-center">
                  <div className="w-1 h-1 bg-blue-600 dark:bg-white rounded-full group-hover:bg-white"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/30 dark:bg-zinc-950/20 p-5 border border-zinc-200/40 dark:border-zinc-800/40 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-sm">
                  {/* Date bracket */}
                  <div className="md:col-span-1 space-y-1 text-zinc-400 dark:text-zinc-500 font-mono text-sm flex items-center md:items-start space-x-1.5 md:space-x-0 md:flex-col">
                    <Calendar className="w-4 h-4" />
                    <span>{edu.startDate} &mdash; {edu.endDate || "Present"}</span>
                  </div>

                  {/* Title details */}
                  <div className="md:col-span-3 space-y-2">
                    <h3 className="font-sans font-bold text-lg text-zinc-900 dark:text-zinc-100">
                      {edu.degree} in {edu.fieldOfStudy}
                    </h3>
                    <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                      {edu.school}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 pt-1">
                      {edu.result && (
                        <span className="px-2 py-0.5 text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 rounded-md font-semibold">
                          Result: {edu.result}
                        </span>
                      )}
                      {edu.certificateUrl && (
                        <a
                          href={edu.certificateUrl}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <span>Verification Certificate</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Achievements Visual Grid */}
      <div className="space-y-8 border-t border-zinc-100 dark:border-zinc-900 pt-16">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Key Successes</span>
          <h2 className="font-sans font-bold text-2xl sm:text-3xl text-zinc-900 dark:text-zinc-100 tracking-tight">
            Professional Achievements
          </h2>
        </div>

        {achievements.length === 0 ? (
          <div className="text-sm text-zinc-400 italic">No achievements available yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {achievements.map((ach) => (
              <div 
                key={ach.id} 
                className="group flex flex-col sm:flex-row items-stretch bg-white/40 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
              >
                {/* Left Achievement image */}
                {ach.imageUrl && (
                  <div className="sm:w-1/3 min-h-[140px] overflow-hidden relative">
                    <img 
                      src={ach.imageUrl} 
                      alt={ach.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1496181130204-755241524eab?auto=format&fit=crop&w=400&h=300&q=80";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-50 dark:to-zinc-950/10 hidden sm:block"></div>
                  </div>
                )}
                {/* Right Text body */}
                <div className="p-5 sm:w-2/3 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-1.5 text-blue-600 dark:text-blue-400">
                      <Award className="w-4.5 h-4.5 flex-shrink-0" />
                      <span className="text-[11px] font-bold uppercase tracking-wider font-mono">{ach.date}</span>
                    </div>
                    <h3 className="font-sans font-bold text-base text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {ach.title}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3">
                      {ach.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
