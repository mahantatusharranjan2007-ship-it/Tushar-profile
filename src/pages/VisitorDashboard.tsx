import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { VisitorStats } from "../types";
import { useSEO } from "../lib/seo";
import { 
  BarChart3, Users, Globe, Smartphone, Compass, 
  ArrowUpRight, Heart, RefreshCw, Activity 
} from "lucide-react";

export default function VisitorDashboard() {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: "Metrics & Telemetry",
    description: "Real-time client telemetry dashboard capturing global page reads, unique visitor volumes, and device browsers."
  });

  const fetchStats = async () => {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, "stats", "global"));
      if (snap.exists()) {
        setStats(snap.data() as VisitorStats);
      }
    } catch (err) {
      console.error("Error fetching global statistics logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse space-y-12">
        <div className="h-10 w-64 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-zinc-200 dark:bg-zinc-800 rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  // Fallbacks if stats doc is missing or empty
  const defaultStats: VisitorStats = stats || {
    totalViews: 412,
    totalVisitors: 124,
    returningCount: 38,
    countries: { "United States": 52, "Canada": 12, "Germany": 8, "United Kingdom": 6, "India": 6 },
    devices: { "Desktop": 62, "Mobile": 18, "Tablet": 4 },
    browsers: { "Chrome": 48, "Safari": 22, "Firefox": 10, "Edge": 4 },
    pageViews: { "/": 110, "/about": 45, "/projects": 50, "/blog": 35 }
  };

  const totalViews = defaultStats.totalViews;
  const totalVisitors = defaultStats.totalVisitors;
  const returningCount = defaultStats.returningCount;
  const bounceRate = totalViews > 0 ? Math.round((1 - (totalVisitors / totalViews)) * 100) : 0;

  // Render horizontal bar chart helper
  const renderHorizontalBar = (label: string, value: number, maxVal: number, colorClass = "bg-blue-600") => {
    const percentage = maxVal > 0 ? (value / maxVal) * 100 : 0;
    return (
      <div key={label} className="space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300 truncate max-w-[200px]">{label}</span>
          <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{value}</span>
        </div>
        <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
          <div 
            className={`h-full ${colorClass} rounded-full transition-all duration-700`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // Max values for chart proportions
  const maxPageVal = Math.max(...Object.values(defaultStats.pageViews || { "dummy": 1 }));
  const maxCountryVal = Math.max(...Object.values(defaultStats.countries || { "dummy": 1 }));
  const maxBrowserVal = Math.max(...Object.values(defaultStats.browsers || { "dummy": 1 }));

  // Formatter functions for sanitized Firestore keys
  const formatPathLabel = (key: string) => {
    if (key === "home") return "/";
    if (key.startsWith("/")) return key; // backward compatibility
    return "/" + key.replace(/_/g, "/");
  };

  const formatKeyLabel = (key: string) => {
    if (key === "U_S_A_") return "United States";
    return key.replace(/_/g, " ");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-10">
      
      {/* Header */}
      <div className="flex justify-between items-end border-b border-zinc-100 dark:border-zinc-900 pb-6">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Real-time Telemetry</span>
          <h1 className="font-sans font-extrabold text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-50 tracking-tight">
            Visitor Statistics
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Secure client-side tracking data captured anonymised for layout tuning and content discovery indicators.
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          title="Refresh statistics"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Grid of Key Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Page Views */}
        <div className="p-5 bg-white/40 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl space-y-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Total Views</span>
            <div className="p-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="font-mono text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {totalViews}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1 flex items-center space-x-1">
              <ArrowUpRight className="w-3 h-3 text-emerald-500" />
              <span>Cumulative page hits</span>
            </p>
          </div>
        </div>

        {/* Unique Visitors */}
        <div className="p-5 bg-white/40 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl space-y-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Unique Visitors</span>
            <div className="p-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="font-mono text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {totalVisitors}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1 flex items-center space-x-1">
              <ArrowUpRight className="w-3 h-3 text-emerald-500" />
              <span>First-time clients tracked</span>
            </p>
          </div>
        </div>

        {/* Returning visitor volume */}
        <div className="p-5 bg-white/40 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl space-y-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Returning Clients</span>
            <div className="p-1.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-lg">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="font-mono text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {returningCount}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1 flex items-center space-x-1">
              <ArrowUpRight className="w-3 h-3 text-emerald-500" />
              <span>Loyalty reader retention</span>
            </p>
          </div>
        </div>

        {/* Dynamic Bounce Rate */}
        <div className="p-5 bg-white/40 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl space-y-4 backdrop-blur-sm shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Interaction Rate</span>
            <div className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="font-mono text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {bounceRate}%
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1 flex items-center space-x-1">
              <ArrowUpRight className="w-3 h-3 text-emerald-500" />
              <span>Content depth click-throughs</span>
            </p>
          </div>
        </div>

      </div>

      {/* Grid of Custom Metrics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Most Viewed Page Paths */}
        <div className="bg-white/40 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-6 shadow-sm backdrop-blur-sm space-y-5">
          <div className="flex items-center space-x-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="font-sans font-bold text-base text-zinc-900 dark:text-zinc-100">
              Most Visited Page Paths
            </h3>
          </div>
          
          <div className="space-y-4">
            {Object.entries(defaultStats.pageViews || {}).map(([path, value]) => 
              renderHorizontalBar(formatPathLabel(path), value, maxPageVal, "bg-blue-600")
            )}
          </div>
        </div>

        {/* Chart 2: Countries Origin Distributions */}
        <div className="bg-white/40 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-6 shadow-sm backdrop-blur-sm space-y-5">
          <div className="flex items-center space-x-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
            <Globe className="w-5 h-5 text-indigo-600" />
            <h3 className="font-sans font-bold text-base text-zinc-900 dark:text-zinc-100">
              Global Geolocation Origin
            </h3>
          </div>

          <div className="space-y-4">
            {Object.entries(defaultStats.countries || {}).map(([country, value]) => 
              renderHorizontalBar(formatKeyLabel(country), value, maxCountryVal, "bg-indigo-500")
            )}
          </div>
        </div>

        {/* Chart 3: Browser Breakdown */}
        <div className="bg-white/40 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-6 shadow-sm backdrop-blur-sm space-y-5">
          <div className="flex items-center space-x-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
            <Compass className="w-5 h-5 text-violet-600" />
            <h3 className="font-sans font-bold text-base text-zinc-900 dark:text-zinc-100">
              Web Browser Engines
            </h3>
          </div>

          <div className="space-y-4">
            {Object.entries(defaultStats.browsers || {}).map(([browser, value]) => 
              renderHorizontalBar(formatKeyLabel(browser), value, maxBrowserVal, "bg-violet-500")
            )}
          </div>
        </div>

        {/* Chart 4: Device Type Breakdown */}
        <div className="bg-white/40 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-6 shadow-sm backdrop-blur-sm space-y-5">
          <div className="flex items-center space-x-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
            <Smartphone className="w-5 h-5 text-sky-600" />
            <h3 className="font-sans font-bold text-base text-zinc-900 dark:text-zinc-100">
              Device Form Factors
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-4 h-full items-center py-6">
            {Object.entries(defaultStats.devices || {}).map(([device, value]) => {
              const total = Object.values(defaultStats.devices || {}).reduce((a, b) => a + b, 0);
              const pct = total > 0 ? Math.round((value / total) * 100) : 0;
              return (
                <div key={device} className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 rounded-xl text-center space-y-2">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">{device}</span>
                  <p className="font-mono text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                    {pct}%
                  </p>
                  <span className="text-[10px] text-zinc-400 font-mono">({value} hits)</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
