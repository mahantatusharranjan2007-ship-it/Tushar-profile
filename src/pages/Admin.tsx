import { useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  signOut, onAuthStateChanged, User as FirebaseUser,
  GoogleAuthProvider, signInWithPopup
} from "firebase/auth";
import { 
  collection, getDocs, doc, setDoc, addDoc, 
  updateDoc, deleteDoc, query, orderBy 
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { useSEO } from "../lib/seo";
import MediaManager from "../components/MediaManager";
import { 
  Lock, LogOut, User, FolderKanban, Code, Briefcase, 
  GraduationCap, Bell, Award, Image, BookOpen, 
  MessageSquare, Settings, Check, Trash2, Mail, Plus, Sparkles, Edit, Download
} from "lucide-react";

export default function Admin() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Nav Tabs State
  const [activeTab, setActiveTab] = useState<
    "profile" | "projects" | "skills" | "experience" | "education" | 
    "achievements" | "announcements" | "testimonials" | "comments" | "messages" | "media" | "blog"
  >("profile");

  // Dynamic Lists State
  const [profileForm, setProfileForm] = useState<any>({
    name: "", title: "", shortIntro: "", bio: "", avatarUrl: "", 
    resumeUrl: "", email: "", whatsapp: "", linkedin: "", github: "", 
    location: "", careerGoals: "", currentFocus: "", languages: "", interests: ""
  });

  const [projects, setProjects] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);

  // Editing Forms Generic States
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [genericForm, setGenericForm] = useState<any>({});
  const [saveStatus, setSaveStatus] = useState("");

  useSEO({
    title: "Admin Control Console",
    description: "Manage database profiles, approve student commentaries, schedule alert headers, and CRUD your digital portfolio workspace."
  });

  // Track Auth States
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      if (usr) {
        loadProfileData();
        loadAllCollections();
      }
    });
    return () => unsub();
  }, []);

  // Handle Login/Register
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    if (!email || !password) {
      setAuthError("Email and Password fields are required.");
      setAuthLoading(false);
      return;
    }

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/operation-not-allowed") {
        setAuthError("Email/Password authentication is not enabled in Firebase. Please use Google Sign In below, or enable Email/Password in your Firebase Console.");
      } else {
        setAuthError(err.message || "Authentication error. Please check your credentials.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthError("");
    setAuthLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || "Google Authentication error.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleExportBackup = async () => {
    setSaveStatus("Exporting live website data...");
    try {
      const collectionsToExport = [
        "profile", "projects", "skills", "experience", "education",
        "certificates", "achievements", "gallery", "blog",
        "announcements", "testimonials", "comments", "messages", "stats"
      ];
      const exportPayload: Record<string, any[]> = {};
      for (const collName of collectionsToExport) {
        const snap = await getDocs(collection(db, collName));
        exportPayload[collName] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
      const blob = new Blob(
        [JSON.stringify({ exportedAt: new Date().toISOString(), collections: exportPayload }, null, 2)],
        { type: "application/json" }
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `portfolio-data-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setSaveStatus("Website data backup downloaded!");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (err: any) {
      setSaveStatus(`Export failed: ${err.message}`);
    }
  };

  // Load Admin forms & listings
  const loadProfileData = async () => {
    try {
      const snap = await getDocs(collection(db, "profile"));
      if (!snap.empty) {
        const data = snap.docs[0].data();
        setProfileForm({
          ...data,
          languages: data.languages ? data.languages.join(", ") : "",
          interests: data.interests ? data.interests.join(", ") : ""
        });
      }
    } catch (e) {
      console.error("Error loading profile:", e);
    }
  };

  const loadAllCollections = async () => {
    try {
      const projSnap = await getDocs(collection(db, "projects"));
      setProjects(projSnap.docs.map(doc => ({ ...doc.data(), id: doc.id })));

      const skillsSnap = await getDocs(collection(db, "skills"));
      setSkills(skillsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id })));

      const expSnap = await getDocs(collection(db, "experience"));
      setExperiences(expSnap.docs.map(doc => ({ ...doc.data(), id: doc.id })));

      const eduSnap = await getDocs(collection(db, "education"));
      setEducation(eduSnap.docs.map(doc => ({ ...doc.data(), id: doc.id })));

      const achSnap = await getDocs(collection(db, "achievements"));
      setAchievements(achSnap.docs.map(doc => ({ ...doc.data(), id: doc.id })));

      const annSnap = await getDocs(collection(db, "announcements"));
      setAnnouncements(annSnap.docs.map(doc => ({ ...doc.data(), id: doc.id })));

      const testSnap = await getDocs(collection(db, "testimonials"));
      setTestimonials(testSnap.docs.map(doc => ({ ...doc.data(), id: doc.id })));

      const commSnap = await getDocs(collection(db, "comments"));
      setComments(commSnap.docs.map(doc => ({ ...doc.data(), id: doc.id })));

      const messSnap = await getDocs(collection(db, "messages"));
      setMessages(messSnap.docs.map(doc => ({ ...doc.data(), id: doc.id })));

      const blogSnap = await getDocs(collection(db, "blog"));
      setBlogPosts(blogSnap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    } catch (e) {
      console.error("Error loading collections:", e);
    }
  };

  // Submit Profile Changes
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("Updating profile...");
    try {
      const finalProfile = {
        ...profileForm,
        languages: profileForm.languages.split(",").map((s: string) => s.trim()).filter(Boolean),
        interests: profileForm.interests.split(",").map((s: string) => s.trim()).filter(Boolean)
      };
      await setDoc(doc(db, "profile", "main"), finalProfile);
      setSaveStatus("Profile updated successfully!");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (err: any) {
      setSaveStatus(`Error updating profile: ${err.message}`);
    }
  };

  // CRUD Generic submission loop
  const handleCRUDSubmit = async (e: React.FormEvent, collName: string) => {
    e.preventDefault();
    setSaveStatus("Saving item...");
    try {
      // Clean structures if projects
      if (collName === "projects") {
        if (typeof genericForm.technologies === "string") {
          genericForm.technologies = genericForm.technologies.split(",").map((s: any) => s.trim()).filter(Boolean);
        }
        if (typeof genericForm.features === "string") {
          genericForm.features = genericForm.features.split("\n").map((s: any) => s.trim()).filter(Boolean);
        }
        genericForm.order = Number(genericForm.order) || 0;
        genericForm.isFeatured = !!genericForm.isFeatured;
      }
      if (collName === "skills") {
        genericForm.level = Number(genericForm.level) || 50;
        genericForm.order = Number(genericForm.order) || 0;
      }
      if (collName === "experience" || collName === "education") {
        genericForm.order = Number(genericForm.order) || 0;
        if (typeof genericForm.achievements === "string") {
          genericForm.achievements = genericForm.achievements.split("\n").map((s: any) => s.trim()).filter(Boolean);
        }
      }
      if (collName === "announcements") {
        genericForm.isActive = !!genericForm.isActive;
      }
      if (collName === "blog") {
        if (typeof genericForm.tags === "string") {
          genericForm.tags = genericForm.tags.split(",").map((s: any) => s.trim()).filter(Boolean);
        }
        genericForm.isPublished = !!genericForm.isPublished;
        genericForm.readingTime = Number(genericForm.readingTime) || 5;
        genericForm.views = Number(genericForm.views) || 0;
        genericForm.likes = Number(genericForm.likes) || 0;
      }

      if (editingId) {
        // Edit
        await updateDoc(doc(db, collName, editingId), genericForm);
      } else {
        // Add
        await addDoc(collection(db, collName), genericForm);
      }

      setSaveStatus("Saved successfully!");
      setIsAdding(false);
      setEditingId(null);
      setGenericForm({});
      loadAllCollections();
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (err: any) {
      setSaveStatus(`Save failed: ${err.message}`);
    }
  };

  const handleCRUDDelete = async (collName: string, id: string) => {
    if (!confirm("Are you sure you want to permanently delete this document?")) return;
    try {
      await deleteDoc(doc(db, collName, id));
      loadAllCollections();
    } catch (e) {
      alert("Delete failed: Check client permission headers.");
    }
  };

  // Testimonial Approval Toggle
  const handleApproveTestimonial = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "testimonials", id), {
        isApproved: !currentStatus
      });
      loadAllCollections();
    } catch (e) {
      alert("Could not update approval status.");
    }
  };

  // Comment Approval Toggle
  const handleApproveComment = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "comments", id), {
        isApproved: !currentStatus
      });
      loadAllCollections();
    } catch (e) {
      alert("Could not update comment approval.");
    }
  };

  // Messages Read Toggle
  const handleMarkMessageRead = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "messages", id), {
        isRead: !currentStatus
      });
      loadAllCollections();
    } catch (e) {
      alert("Could not update read state.");
    }
  };

  // RENDER LOGIN PORTAL IF NO AUTH
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 space-y-6">
        <div className="bg-white/40 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md text-center space-y-6">
          <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full w-max mx-auto border border-blue-500/20">
            <Lock className="w-8 h-8" />
          </div>
          
          <div className="space-y-1">
            <h2 className="font-sans font-extrabold text-2xl text-zinc-900 dark:text-zinc-100">
              Admin Portal
            </h2>
            <p className="text-xs text-zinc-400">
              Secure console authorization. Enter administrator credentials.
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                placeholder="mahantatusharranjan2007@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">
                Secret Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            {authError && (
              <div className="flex items-center space-x-2 text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-100 dark:border-red-900/50">
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-900 disabled:bg-zinc-800/50 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm active:scale-95"
            >
              {authLoading ? "Authenticating..." : isRegistering ? "Create New Profile" : "Login with Email"}
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
              <span className="flex-shrink-0 mx-4 text-xs font-medium text-zinc-400">OR</span>
              <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={authLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg active:scale-95 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </form>

          <div className="border-t border-zinc-100 dark:border-zinc-900 pt-4 space-y-2">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs text-zinc-400 hover:text-blue-500 hover:underline"
            >
              {isRegistering ? "Return to Sign In" : "Need to initialize first account? Sign Up Here"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RENDER DYNAMIC DASHBOARD CONSOLE IF AUTHENTICATED
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white/40 dark:bg-zinc-950/40 p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-sm shadow-sm gap-4">
        <div className="flex items-center space-x-3 text-center sm:text-left">
          <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-lg hidden sm:block">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-lg text-zinc-900 dark:text-zinc-50">
              Admin Console
            </h1>
            <p className="text-xs text-zinc-400">
              Logged in as: <span className="font-mono text-zinc-500">{user.email}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportBackup}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-lg text-xs font-bold border border-zinc-200 dark:border-zinc-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>

          <button
            onClick={handleLogout}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold border border-red-100 dark:border-red-900/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit Console</span>
          </button>
        </div>
      </div>

      {saveStatus && (
        <div className="flex items-center space-x-2 text-xs font-semibold bg-blue-50 dark:bg-blue-950/20 p-3.5 border border-blue-100 dark:border-blue-900/50 rounded-xl text-blue-800 dark:text-blue-400">
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Main split-view dashboard framework */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation panel */}
        <div className="lg:col-span-3 bg-white/40 dark:bg-zinc-950/40 p-4 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl shadow-sm space-y-1.5 backdrop-blur-sm">
          <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 px-3 pb-2 block border-b border-zinc-100 dark:border-zinc-900">Modules</span>
          
          <button 
            onClick={() => { setActiveTab("profile"); setIsAdding(false); setEditingId(null); }}
            className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-left transition-colors ${activeTab === "profile" ? "bg-blue-500 text-white shadow shadow-blue-500/10" : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"}`}
          >
            <User className="w-4 h-4" />
            <span>Profile settings</span>
          </button>
          
          <button 
            onClick={() => { setActiveTab("projects"); setIsAdding(false); setEditingId(null); }}
            className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-left transition-colors ${activeTab === "projects" ? "bg-blue-500 text-white shadow shadow-blue-500/10" : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"}`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>Manage Projects</span>
          </button>
          
          <button 
            onClick={() => { setActiveTab("skills"); setIsAdding(false); setEditingId(null); }}
            className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-left transition-colors ${activeTab === "skills" ? "bg-blue-500 text-white shadow shadow-blue-500/10" : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"}`}
          >
            <Code className="w-4 h-4" />
            <span>Manage Skills</span>
          </button>
          
          <button 
            onClick={() => { setActiveTab("experience"); setIsAdding(false); setEditingId(null); }}
            className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-left transition-colors ${activeTab === "experience" ? "bg-blue-500 text-white shadow shadow-blue-500/10" : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"}`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Manage Experience</span>
          </button>

          <button 
            onClick={() => { setActiveTab("achievements"); setIsAdding(false); setEditingId(null); }}
            className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-left transition-colors ${activeTab === "achievements" ? "bg-blue-500 text-white shadow shadow-blue-500/10" : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"}`}
          >
            <Award className="w-4 h-4" />
            <span>Manage Achievements</span>
          </button>

          <button 
            onClick={() => { setActiveTab("education"); setIsAdding(false); setEditingId(null); }}
            className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-left transition-colors ${activeTab === "education" ? "bg-blue-500 text-white shadow shadow-blue-500/10" : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"}`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Manage Education</span>
          </button>

          <button 
            onClick={() => { setActiveTab("announcements"); setIsAdding(false); setEditingId(null); }}
            className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-left transition-colors ${activeTab === "announcements" ? "bg-blue-500 text-white shadow shadow-blue-500/10" : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"}`}
          >
            <Bell className="w-4 h-4" />
            <span>Announcements</span>
          </button>

          <button 
            onClick={() => { setActiveTab("testimonials"); setIsAdding(false); setEditingId(null); }}
            className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-left transition-colors ${activeTab === "testimonials" ? "bg-blue-500 text-white shadow shadow-blue-500/10" : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"}`}
          >
            <Award className="w-4 h-4" />
            <span>Testimonials Queue</span>
          </button>

          <button 
            onClick={() => { setActiveTab("comments"); setIsAdding(false); setEditingId(null); }}
            className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-left transition-colors ${activeTab === "comments" ? "bg-blue-500 text-white shadow shadow-blue-500/10" : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"}`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Blog Comments</span>
          </button>

          <button 
            onClick={() => { setActiveTab("messages"); setIsAdding(false); setEditingId(null); }}
            className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-left transition-colors ${activeTab === "messages" ? "bg-blue-500 text-white shadow shadow-blue-500/10" : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"}`}
          >
            <Mail className="w-4 h-4" />
            <span>Inbox Messages</span>
          </button>

          <button 
            onClick={() => { setActiveTab("media"); setIsAdding(false); setEditingId(null); }}
            className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-left transition-colors ${activeTab === "media" ? "bg-blue-500 text-white shadow shadow-blue-500/10" : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"}`}
          >
            <Image className="w-4 h-4" />
            <span>Media Library</span>
          </button>
        </div>

        {/* Dynamic Details Content Panel */}
        <div className="lg:col-span-9 bg-white/40 dark:bg-zinc-950/40 p-6 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl shadow-sm backdrop-blur-sm min-h-[500px]">
          
          {/* TAB 1: PROFILE FORM */}
          {activeTab === "profile" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="font-sans font-bold text-xl text-zinc-900 dark:text-zinc-100">
                Personal Identity Profile Settings
              </h2>
              
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={profileForm.name} 
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Technical Title</label>
                    <input 
                      type="text" 
                      value={profileForm.title} 
                      onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                      className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Short Introduction (Pill block)</label>
                  <input 
                    type="text" 
                    value={profileForm.shortIntro} 
                    onChange={(e) => setProfileForm({ ...profileForm, shortIntro: e.target.value })}
                    className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1">Detailed Biography</label>
                  <textarea 
                    rows={4}
                    value={profileForm.bio} 
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-zinc-900 dark:text-zinc-100"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Avatar Photo URL</label>
                    <input 
                      type="text" 
                      value={profileForm.avatarUrl} 
                      onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                      className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Resume File PDF URL</label>
                    <input 
                      type="text" 
                      value={profileForm.resumeUrl} 
                      onChange={(e) => setProfileForm({ ...profileForm, resumeUrl: e.target.value })}
                      className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Email</label>
                    <input 
                      type="text" 
                      value={profileForm.email} 
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">WhatsApp phone</label>
                    <input 
                      type="text" 
                      value={profileForm.whatsapp} 
                      onChange={(e) => setProfileForm({ ...profileForm, whatsapp: e.target.value })}
                      className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">LinkedIn Profile</label>
                    <input 
                      type="text" 
                      value={profileForm.linkedin} 
                      onChange={(e) => setProfileForm({ ...profileForm, linkedin: e.target.value })}
                      className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">GitHub Profile</label>
                    <input 
                      type="text" 
                      value={profileForm.github} 
                      onChange={(e) => setProfileForm({ ...profileForm, github: e.target.value })}
                      className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Location</label>
                    <input 
                      type="text" 
                      value={profileForm.location} 
                      onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                      className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Current Focus</label>
                    <input 
                      type="text" 
                      value={profileForm.currentFocus} 
                      onChange={(e) => setProfileForm({ ...profileForm, currentFocus: e.target.value })}
                      className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Career Goals</label>
                    <input 
                      type="text" 
                      value={profileForm.careerGoals} 
                      onChange={(e) => setProfileForm({ ...profileForm, careerGoals: e.target.value })}
                      className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Languages (comma-separated)</label>
                    <input 
                      type="text" 
                      placeholder="English, Spanish"
                      value={profileForm.languages} 
                      onChange={(e) => setProfileForm({ ...profileForm, languages: e.target.value })}
                      className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Interests (comma-separated)</label>
                    <input 
                      type="text" 
                      placeholder="Sailing, Coffee Crafting"
                      value={profileForm.interests} 
                      onChange={(e) => setProfileForm({ ...profileForm, interests: e.target.value })}
                      className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors shadow active:scale-95"
                  >
                    Commit Profile updates
                  </button>
                </div>
              </form>
            </div>
          )}


          {/* TAB: ACHIEVEMENTS MANAGEMENT */}
          {activeTab === "achievements" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-900">
                <h2 className="font-sans font-bold text-xl text-zinc-900 dark:text-zinc-100">
                  Professional Achievements
                </h2>
                {!isAdding && !editingId && (
                  <button 
                    onClick={() => { setIsAdding(true); setGenericForm({ title: "", description: "", date: "", imageUrl: "", order: 1 }); }}
                    className="inline-flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-all shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Achievement</span>
                  </button>
                )}
              </div>

              {(isAdding || editingId) ? (
                <form onSubmit={(e) => handleCRUDSubmit(e, "achievements")} className="bg-zinc-50 dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Title</label>
                      <input type="text" required value={genericForm.title || ""} onChange={(e) => setGenericForm({ ...genericForm, title: e.target.value })} className="w-full px-4 py-2 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none text-zinc-900 dark:text-zinc-100" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Date String</label>
                      <input type="text" value={genericForm.date || ""} onChange={(e) => setGenericForm({ ...genericForm, date: e.target.value })} className="w-full px-4 py-2 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none text-zinc-900 dark:text-zinc-100" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Description</label>
                    <textarea rows={3} value={genericForm.description || ""} onChange={(e) => setGenericForm({ ...genericForm, description: e.target.value })} className="w-full px-4 py-2 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none text-zinc-900 dark:text-zinc-100"></textarea>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Image URL</label>
                      <input type="text" value={genericForm.imageUrl || ""} onChange={(e) => setGenericForm({ ...genericForm, imageUrl: e.target.value })} className="w-full px-4 py-2 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none text-zinc-900 dark:text-zinc-100" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Display Order</label>
                      <input type="number" value={genericForm.order || 1} onChange={(e) => setGenericForm({ ...genericForm, order: Number(e.target.value) })} className="w-full px-4 py-2 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none text-zinc-900 dark:text-zinc-100" />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="px-5 py-2.5 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl text-sm font-bold transition-colors">Cancel</button>
                    <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors shadow">Save Achievement</button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  {achievements.sort((a, b) => a.order - b.order).map((ach) => (
                    <div key={ach.id} className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 flex justify-between items-center group transition-colors hover:border-zinc-300 dark:hover:border-zinc-700">
                      <div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{ach.title}</h4>
                        <span className="text-xs text-zinc-400 font-mono">{ach.date}</span>
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingId(ach.id); setGenericForm(ach); }} className="p-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg shadow-sm"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleCRUDDelete("achievements", ach.id)} className="p-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/30 dark:hover:border-red-900 text-red-500 rounded-lg shadow-sm"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                  {achievements.length === 0 && <p className="text-sm text-zinc-400 italic">No achievements found.</p>}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROJECTS MANAGEMENT */}
          {activeTab === "projects" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-900">
                <h2 className="font-sans font-bold text-xl text-zinc-900 dark:text-zinc-100">
                  Engineering Projects Registry
                </h2>
                {!isAdding && !editingId && (
                  <button 
                    onClick={() => { setIsAdding(true); setGenericForm({ title: "", description: "", imageUrl: "", liveUrl: "", githubUrl: "", category: "Full-Stack", order: 1, technologies: "", features: "", isFeatured: false, startDate: "", endDate: "" }); }}
                    className="inline-flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-all shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Project</span>
                  </button>
                )}
              </div>

              {isAdding || editingId ? (
                <form onSubmit={(e) => handleCRUDSubmit(e, "projects")} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Project Title</label>
                      <input 
                        type="text" required
                        value={genericForm.title || ""} 
                        onChange={(e) => setGenericForm({ ...genericForm, title: e.target.value })}
                        className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Category</label>
                      <input 
                        type="text" required placeholder="AI Tools, Frontend, Full-Stack"
                        value={genericForm.category || ""} 
                        onChange={(e) => setGenericForm({ ...genericForm, category: e.target.value })}
                        className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Brief Description</label>
                    <textarea 
                      rows={3} required
                      value={genericForm.description || ""} 
                      onChange={(e) => setGenericForm({ ...genericForm, description: e.target.value })}
                      className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Image cover URL</label>
                      <input 
                        type="text" required
                        value={genericForm.imageUrl || ""} 
                        onChange={(e) => setGenericForm({ ...genericForm, imageUrl: e.target.value })}
                        className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Technologies (comma separated)</label>
                      <input 
                        type="text" placeholder="React, Vite, Tailwind CSS"
                        value={genericForm.technologies || ""} 
                        onChange={(e) => setGenericForm({ ...genericForm, technologies: e.target.value })}
                        className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Detailed Features (One per line)</label>
                    <textarea 
                      rows={3} placeholder="Interactive canvas designer&#10;Offline synchronization mechanisms"
                      value={genericForm.features || ""} 
                      onChange={(e) => setGenericForm({ ...genericForm, features: e.target.value })}
                      className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Live URL</label>
                      <input 
                        type="text" 
                        value={genericForm.liveUrl || ""} 
                        onChange={(e) => setGenericForm({ ...genericForm, liveUrl: e.target.value })}
                        className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">GitHub URL</label>
                      <input 
                        type="text" 
                        value={genericForm.githubUrl || ""} 
                        onChange={(e) => setGenericForm({ ...genericForm, githubUrl: e.target.value })}
                        className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Timeline Start</label>
                      <input 
                        type="text" placeholder="2026-01"
                        value={genericForm.startDate || ""} 
                        onChange={(e) => setGenericForm({ ...genericForm, startDate: e.target.value })}
                        className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Timeline End</label>
                      <input 
                        type="text" placeholder="Present or 2026-06"
                        value={genericForm.endDate || ""} 
                        onChange={(e) => setGenericForm({ ...genericForm, endDate: e.target.value })}
                        className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      <input 
                        type="checkbox"
                        checked={!!genericForm.isFeatured}
                        onChange={(e) => setGenericForm({ ...genericForm, isFeatured: e.target.checked })}
                        className="rounded border-zinc-300 dark:border-zinc-800 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Mark as Featured project</span>
                    </label>

                    <div>
                      <label className="inline-block text-xs font-semibold text-zinc-500 mr-2">Display order</label>
                      <input 
                        type="number" 
                        value={genericForm.order || 1} 
                        onChange={(e) => setGenericForm({ ...genericForm, order: e.target.value })}
                        className="w-20 px-2 py-1 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <button 
                      type="button"
                      onClick={() => { setIsAdding(false); setEditingId(null); setGenericForm({}); }}
                      className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-sm"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow"
                    >
                      {editingId ? "Commit Changes" : "Create Item"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  {projects.map((proj) => (
                    <div key={proj.id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
                      <div className="flex items-center space-x-3">
                        <img src={proj.imageUrl} alt="" className="w-10 h-10 object-cover rounded-lg border" />
                        <div>
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{proj.title}</h4>
                          <span className="text-xs text-zinc-400">{proj.category}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => { setEditingId(proj.id); setGenericForm({ ...proj, technologies: proj.technologies.join(", "), features: proj.features ? proj.features.join("\n") : "" }); }}
                          className="px-3 py-1.5 bg-white dark:bg-zinc-950 text-xs font-semibold border rounded-lg text-zinc-600 dark:text-zinc-300"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleCRUDDelete("projects", proj.id)}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SKILLS MANAGEMENT */}
          {activeTab === "skills" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-900">
                <h2 className="font-sans font-bold text-xl text-zinc-900 dark:text-zinc-100">
                  Professional Skills Inventory
                </h2>
                {!isAdding && !editingId && (
                  <button 
                    onClick={() => { setIsAdding(true); setGenericForm({ name: "", level: 80, category: "Frontend", description: "", icon: "Code", order: 1 }); }}
                    className="inline-flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-all shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Skill</span>
                  </button>
                )}
              </div>

              {isAdding || editingId ? (
                <form onSubmit={(e) => handleCRUDSubmit(e, "skills")} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Skill Name</label>
                      <input 
                        type="text" required
                        value={genericForm.name || ""} 
                        onChange={(e) => setGenericForm({ ...genericForm, name: e.target.value })}
                        className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Category</label>
                      <select 
                        value={genericForm.category || "Frontend"} 
                        onChange={(e) => setGenericForm({ ...genericForm, category: e.target.value })}
                        className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100"
                      >
                        <option value="Frontend">Frontend</option>
                        <option value="Backend">Backend</option>
                        <option value="Database">Database</option>
                        <option value="Cloud">Cloud</option>
                        <option value="AI Tools">AI Tools</option>
                        <option value="Deployment">Deployment</option>
                        <option value="Soft Skills">Soft Skills</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Competence level (0-100)</label>
                      <input 
                        type="number" required
                        value={genericForm.level || 80} 
                        onChange={(e) => setGenericForm({ ...genericForm, level: e.target.value })}
                        className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Lucide Icon identifier</label>
                      <input 
                        type="text" required
                        value={genericForm.icon || "Code"} 
                        onChange={(e) => setGenericForm({ ...genericForm, icon: e.target.value })}
                        className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Display order</label>
                      <input 
                        type="number" required
                        value={genericForm.order || 1} 
                        onChange={(e) => setGenericForm({ ...genericForm, order: e.target.value })}
                        className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Brief Description</label>
                    <textarea 
                      rows={2} required
                      value={genericForm.description || ""} 
                      onChange={(e) => setGenericForm({ ...genericForm, description: e.target.value })}
                      className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100"
                    ></textarea>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <button 
                      type="button"
                      onClick={() => { setIsAdding(false); setEditingId(null); setGenericForm({}); }}
                      className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-sm"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow"
                    >
                      {editingId ? "Commit Changes" : "Create Skill"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  {skills.map((skill) => (
                    <div key={skill.id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
                      <div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{skill.name}</h4>
                        <span className="text-xs text-zinc-400">{skill.category} &bull; Level: {skill.level}%</span>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => { setEditingId(skill.id); setGenericForm(skill); }}
                          className="px-3 py-1.5 bg-white dark:bg-zinc-950 text-xs font-semibold border rounded-lg text-zinc-600 dark:text-zinc-300"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleCRUDDelete("skills", skill.id)}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: EXPERIENCE MANAGEMENT */}
          {activeTab === "experience" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-900">
                <h2 className="font-sans font-bold text-xl text-zinc-900 dark:text-zinc-100">
                  Career Milestones Registry
                </h2>
                {!isAdding && !editingId && (
                  <button 
                    onClick={() => { setIsAdding(true); setGenericForm({ company: "", role: "", startDate: "", endDate: "", description: "", type: "Full-time", achievements: "", order: 1 }); }}
                    className="inline-flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-all shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Milestones</span>
                  </button>
                )}
              </div>

              {isAdding || editingId ? (
                <form onSubmit={(e) => handleCRUDSubmit(e, "experience")} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Company / Team</label>
                      <input 
                        type="text" required
                        value={genericForm.company || ""} 
                        onChange={(e) => setGenericForm({ ...genericForm, company: e.target.value })}
                        className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Role / Post</label>
                      <input 
                        type="text" required
                        value={genericForm.role || ""} 
                        onChange={(e) => setGenericForm({ ...genericForm, role: e.target.value })}
                        className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Type</label>
                      <select 
                        value={genericForm.type || "Full-time"} 
                        onChange={(e) => setGenericForm({ ...genericForm, type: e.target.value })}
                        className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100"
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Internship">Internship</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Volunteer">Volunteer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Timeline Start</label>
                      <input 
                        type="text" required placeholder="2025-01"
                        value={genericForm.startDate || ""} 
                        onChange={(e) => setGenericForm({ ...genericForm, startDate: e.target.value })}
                        className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Timeline End</label>
                      <input 
                        type="text" placeholder="Present or 2026-06"
                        value={genericForm.endDate || ""} 
                        onChange={(e) => setGenericForm({ ...genericForm, endDate: e.target.value })}
                        className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Display Order</label>
                      <input 
                        type="number" required
                        value={genericForm.order || 1} 
                        onChange={(e) => setGenericForm({ ...genericForm, order: e.target.value })}
                        className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">General Description</label>
                    <textarea 
                      rows={3} required
                      value={genericForm.description || ""} 
                      onChange={(e) => setGenericForm({ ...genericForm, description: e.target.value })}
                      className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Key Achievements (One per line)</label>
                    <textarea 
                      rows={3} placeholder="Pioneered distributed systems safety models&#10;Decreased loading cycles by 22%"
                      value={genericForm.achievements || ""} 
                      onChange={(e) => setGenericForm({ ...genericForm, achievements: e.target.value })}
                      className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100"
                    ></textarea>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <button 
                      type="button"
                      onClick={() => { setIsAdding(false); setEditingId(null); setGenericForm({}); }}
                      className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-sm"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow"
                    >
                      {editingId ? "Commit Changes" : "Create Milestones"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  {experiences.map((exp) => (
                    <div key={exp.id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
                      <div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{exp.role}</h4>
                        <span className="text-xs text-zinc-400">{exp.company} &bull; {exp.type}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => { setEditingId(exp.id); setGenericForm({ ...exp, achievements: exp.achievements ? exp.achievements.join("\n") : "" }); }}
                          className="px-3 py-1.5 bg-white dark:bg-zinc-950 text-xs font-semibold border rounded-lg text-zinc-600 dark:text-zinc-300"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleCRUDDelete("experience", exp.id)}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: EDUCATION MANAGEMENT */}
          {activeTab === "education" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-900">
                <h2 className="font-sans font-bold text-xl text-zinc-900 dark:text-zinc-100">
                  Academic Timeline Registry
                </h2>
                {!isAdding && !editingId && (
                  <button 
                    onClick={() => { setIsAdding(true); setGenericForm({ school: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", result: "", certificateUrl: "", order: 1 }); }}
                    className="inline-flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-all shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Education</span>
                  </button>
                )}
              </div>

              {isAdding || editingId ? (
                <form onSubmit={(e) => handleCRUDSubmit(e, "education")} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">University / College</label>
                      <input 
                        type="text" required
                        value={genericForm.school || ""} 
                        onChange={(e) => setGenericForm({ ...genericForm, school: e.target.value })}
                        className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Degree Earned</label>
                      <input 
                        type="text" required placeholder="Master of Science, Bachelor of Science"
                        value={genericForm.degree || ""} 
                        onChange={(e) => setGenericForm({ ...genericForm, degree: e.target.value })}
                        className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Field of Study</label>
                      <input 
                        type="text" required placeholder="Computer Science"
                        value={genericForm.fieldOfStudy || ""} 
                        onChange={(e) => setGenericForm({ ...genericForm, fieldOfStudy: e.target.value })}
                        className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Result (GPA / Honors)</label>
                      <input 
                        type="text" placeholder="GPA 3.92/4.00"
                        value={genericForm.result || ""} 
                        onChange={(e) => setGenericForm({ ...genericForm, result: e.target.value })}
                        className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Start Date</label>
                      <input 
                        type="text" required placeholder="2016-09"
                        value={genericForm.startDate || ""} 
                        onChange={(e) => setGenericForm({ ...genericForm, startDate: e.target.value })}
                        className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">End Date</label>
                      <input 
                        type="text" placeholder="2018-06"
                        value={genericForm.endDate || ""} 
                        onChange={(e) => setGenericForm({ ...genericForm, endDate: e.target.value })}
                        className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Certificate Doc URL</label>
                      <input 
                        type="text" 
                        value={genericForm.certificateUrl || ""} 
                        onChange={(e) => setGenericForm({ ...genericForm, certificateUrl: e.target.value })}
                        className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Display Order</label>
                      <input 
                        type="number" required
                        value={genericForm.order || 1} 
                        onChange={(e) => setGenericForm({ ...genericForm, order: e.target.value })}
                        className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <button 
                      type="button"
                      onClick={() => { setIsAdding(false); setEditingId(null); setGenericForm({}); }}
                      className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-sm"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow"
                    >
                      {editingId ? "Commit Changes" : "Create Item"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  {education.map((edu) => (
                    <div key={edu.id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
                      <div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{edu.degree} in {edu.fieldOfStudy}</h4>
                        <span className="text-xs text-zinc-400">{edu.school}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => { setEditingId(edu.id); setGenericForm(edu); }}
                          className="px-3 py-1.5 bg-white dark:bg-zinc-950 text-xs font-semibold border rounded-lg text-zinc-600 dark:text-zinc-300"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleCRUDDelete("education", edu.id)}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: ANNOUNCEMENTS */}
          {activeTab === "announcements" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-900">
                <h2 className="font-sans font-bold text-xl text-zinc-900 dark:text-zinc-100">
                  Manage Announcements Banners
                </h2>
                {!isAdding && !editingId && (
                  <button 
                    onClick={() => { setIsAdding(true); setGenericForm({ title: "", content: "", bannerUrl: "", priority: "Medium", publishDate: new Date().toISOString().split("T")[0], expiryDate: "", isActive: true }); }}
                    className="inline-flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-all shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Announcement</span>
                  </button>
                )}
              </div>

              {isAdding || editingId ? (
                <form onSubmit={(e) => handleCRUDSubmit(e, "announcements")} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Alert Title</label>
                    <input 
                      type="text" required
                      value={genericForm.title || ""} 
                      onChange={(e) => setGenericForm({ ...genericForm, title: e.target.value })}
                      className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Banner Image URL (optional)</label>
                    <input 
                      type="text" 
                      value={genericForm.bannerUrl || ""} 
                      onChange={(e) => setGenericForm({ ...genericForm, bannerUrl: e.target.value })}
                      className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1">Body Content</label>
                    <textarea 
                      rows={3} required
                      value={genericForm.content || ""} 
                      onChange={(e) => setGenericForm({ ...genericForm, content: e.target.value })}
                      className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Priority</label>
                      <select 
                        value={genericForm.priority || "Medium"} 
                        onChange={(e) => setGenericForm({ ...genericForm, priority: e.target.value })}
                        className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Publish Date</label>
                      <input 
                        type="date" required
                        value={genericForm.publishDate || ""} 
                        onChange={(e) => setGenericForm({ ...genericForm, publishDate: e.target.value })}
                        className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Expiry Date</label>
                      <input 
                        type="date" required
                        value={genericForm.expiryDate || ""} 
                        onChange={(e) => setGenericForm({ ...genericForm, expiryDate: e.target.value })}
                        className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                  </div>

                  <label className="flex items-center space-x-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    <input 
                      type="checkbox"
                      checked={!!genericForm.isActive}
                      onChange={(e) => setGenericForm({ ...genericForm, isActive: e.target.checked })}
                      className="rounded border-zinc-300 dark:border-zinc-800 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Active and showing popup alerts</span>
                  </label>

                  <div className="flex justify-end space-x-2 pt-4">
                    <button 
                      type="button"
                      onClick={() => { setIsAdding(false); setEditingId(null); setGenericForm({}); }}
                      className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-sm"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow"
                    >
                      {editingId ? "Commit Changes" : "Publish Announcement"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  {announcements.map((ann) => (
                    <div key={ann.id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
                      <div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{ann.title}</h4>
                        <span className="text-xs text-zinc-400">Priority: {ann.priority} &bull; Expiry: {ann.expiryDate}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => { setEditingId(ann.id); setGenericForm(ann); }}
                          className="px-3 py-1.5 bg-white dark:bg-zinc-950 text-xs font-semibold border rounded-lg text-zinc-600 dark:text-zinc-300"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleCRUDDelete("announcements", ann.id)}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: TESTIMONIALS MODERATION */}
          {activeTab === "testimonials" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="font-sans font-bold text-xl text-zinc-900 dark:text-zinc-100 pb-4 border-b border-zinc-100 dark:border-zinc-900">
                Testimonials Queue Moderation
              </h2>

              <div className="space-y-4">
                {testimonials.length === 0 ? (
                  <p className="text-sm text-zinc-400 italic">No testimonials submissions available in database.</p>
                ) : (
                  testimonials.map((test) => (
                    <div key={test.id} className="p-5 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">{test.name}</h4>
                          <span className="text-xs text-zinc-400">{test.role} &bull; {test.company}</span>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveTestimonial(test.id, test.isApproved)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                              test.isApproved 
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                                : "bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-emerald-500 hover:text-white"
                            }`}
                          >
                            {test.isApproved ? "Approved & Live" : "Click to Approve"}
                          </button>
                          
                          <button
                            onClick={() => handleCRUDDelete("testimonials", test.id)}
                            className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg border border-transparent hover:border-red-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-sm text-zinc-600 dark:text-zinc-400 italic leading-relaxed bg-white/50 dark:bg-zinc-950/50 p-3 rounded-lg border border-zinc-100/30 dark:border-zinc-900/40">
                        "{test.content}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 8: COMMENTS MODERATION */}
          {activeTab === "comments" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="font-sans font-bold text-xl text-zinc-900 dark:text-zinc-100 pb-4 border-b border-zinc-100 dark:border-zinc-900">
                Blog Comments Moderation Queue
              </h2>

              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-sm text-zinc-400 italic">No blog comment entries found.</p>
                ) : (
                  comments.map((comm) => (
                    <div key={comm.id} className="p-5 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{comm.authorName}</h4>
                          <span className="text-xs text-zinc-400 font-mono">{comm.authorEmail} &bull; {comm.date}</span>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveComment(comm.id, comm.isApproved)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                              comm.isApproved 
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                                : "bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-emerald-500 hover:text-white"
                            }`}
                          >
                            {comm.isApproved ? "Approved & Live" : "Click to Approve"}
                          </button>
                          
                          <button
                            onClick={() => handleCRUDDelete("comments", comm.id)}
                            className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-sm text-zinc-600 dark:text-zinc-400 bg-white/50 dark:bg-zinc-950/50 p-3 rounded-lg border border-zinc-100/30 dark:border-zinc-900/40">
                        {comm.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 9: INBOX MESSAGES */}
          {activeTab === "messages" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="font-sans font-bold text-xl text-zinc-900 dark:text-zinc-100 pb-4 border-b border-zinc-100 dark:border-zinc-900">
                Contact Form Submissions
              </h2>

              <div className="space-y-4">
                {messages.length === 0 ? (
                  <p className="text-sm text-zinc-400 italic">Your contact inbox is currently empty.</p>
                ) : (
                  messages.map((mess) => (
                    <div key={mess.id} className="p-5 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{mess.subject}</h4>
                          <span className="text-xs text-zinc-400 font-mono">From: {mess.name} ({mess.email}) &bull; {mess.date}</span>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleMarkMessageRead(mess.id, mess.isRead)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                              mess.isRead 
                                ? "bg-zinc-100 border-zinc-200 text-zinc-400" 
                                : "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white"
                            }`}
                          >
                            {mess.isRead ? "Marked Read" : "Mark as Read"}
                          </button>
                          
                          <button
                            onClick={() => handleCRUDDelete("messages", mess.id)}
                            className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed bg-white/50 dark:bg-zinc-950/50 p-3 rounded-lg border border-zinc-100/30 dark:border-zinc-900/40">
                        {mess.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 10: MEDIA MANAGER */}
          {activeTab === "media" && (
            <div className="animate-fade-in">
              <MediaManager />
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
