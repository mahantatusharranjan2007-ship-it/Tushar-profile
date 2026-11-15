import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { GalleryItem } from "../types";
import { useSEO } from "../lib/seo";
import { 
  Camera, Eye, X, ChevronLeft, ChevronRight, 
  Layers, Calendar, Tag, ImageOff 
} from "lucide-react";

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);

  useSEO({
    title: "Media Gallery",
    description: "Browse through Tushar Ranjan's professional photography, tech workspaces, speaking engagements, and visual interests."
  });

  useEffect(() => {
    async function loadGallery() {
      try {
        const q = query(collection(db, "gallery"), orderBy("order", "asc"));
        const snap = await getDocs(q);
        const list: GalleryItem[] = [];
        snap.forEach((doc) => {
          list.push({ ...doc.data(), id: doc.id } as GalleryItem);
        });
        setItems(list);
      } catch (err) {
        console.error("Error loading gallery photos:", err);
        handleFirestoreError(err, OperationType.LIST, "gallery");
      } finally {
        setLoading(false);
      }
    }
    loadGallery();
  }, []);

  const categories = ["All", ...Array.from(new Set(items.map((i) => i.category)))];

  const filteredItems = items.filter((item) => {
    return selectedCategory === "All" || item.category === selectedCategory;
  });

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeItemIndex === null) return;
    setActiveItemIndex((prev) => (prev === 0 ? filteredItems.length - 1 : prev! - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeItemIndex === null) return;
    setActiveItemIndex((prev) => (prev === filteredItems.length - 1 ? 0 : prev! + 1));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-100 dark:border-zinc-900 pb-8">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Visual Log</span>
          <h1 className="font-sans font-extrabold text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-50 tracking-tight">
            Professional Media Gallery
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            A curated compilation of workspace configurations, conceptual structures, and visual personal interests.
          </p>
        </div>

        {/* Categories slider */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all border ${
                selectedCategory === cat
                  ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/10"
                  : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-square bg-zinc-200 dark:bg-zinc-800 rounded-2xl"></div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <ImageOff className="w-16 h-16 text-zinc-300 dark:text-zinc-700 animate-pulse" />
          <h3 className="font-sans font-bold text-lg text-zinc-900 dark:text-zinc-100">
            No gallery media entries yet.
          </h3>
          <p className="text-zinc-500 max-w-sm text-sm">
            Please verify category filter selections or seed resources in the administrative media module.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              onClick={() => setActiveItemIndex(index)}
              className="group relative aspect-square bg-zinc-100 dark:bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer border border-zinc-200/40 dark:border-zinc-800/40 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter grayscale group-hover:grayscale-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?auto=format&fit=crop&w=400&h=400&q=80";
                }}
              />
              {/* Image hover label card */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 space-y-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-blue-400 bg-blue-950/60 border border-blue-900 px-2 py-0.5 rounded-full w-max">
                  {item.category}
                </span>
                <h3 className="font-sans font-bold text-base text-white truncate">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-300 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center space-x-1.5 pt-1 text-[10px] text-zinc-400 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{item.date}</span>
                </div>
              </div>

              {/* Fast expansion top corner hover loop */}
              <div className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-zinc-900/90 rounded-lg shadow border border-zinc-200/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Eye className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Preview overlay modal */}
      {activeItemIndex !== null && filteredItems[activeItemIndex] && (
        <div 
          className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveItemIndex(null)}
        >
          {/* Close button top right */}
          <button
            onClick={() => setActiveItemIndex(null)}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-200"
            aria-label="Close preview"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Core frame with navigation */}
          <div className="relative max-w-5xl w-full flex items-center justify-center">
            
            {/* Left selector */}
            <button
              onClick={handlePrev}
              className="absolute left-2 sm:left-4 z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all active:scale-90"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Img asset */}
            <div className="max-h-[70vh] sm:max-h-[75vh] w-auto overflow-hidden rounded-xl border border-white/10 shadow-2xl">
              <img
                src={filteredItems[activeItemIndex].imageUrl}
                alt={filteredItems[activeItemIndex].title}
                className="max-h-[70vh] sm:max-h-[75vh] object-contain w-full"
                onClick={(e) => e.stopPropagation()} // prevent dismiss on clicking photo
              />
            </div>

            {/* Right selector */}
            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-4 z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all active:scale-90"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

          </div>

          {/* Description footer panel */}
          <div className="mt-6 max-w-xl text-center space-y-2 text-white px-4" onClick={(e) => e.stopPropagation()}>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
              {filteredItems[activeItemIndex].category}
            </span>
            <h3 className="font-sans font-bold text-xl tracking-tight">
              {filteredItems[activeItemIndex].title}
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {filteredItems[activeItemIndex].description}
            </p>
            <div className="inline-flex items-center space-x-1.5 text-xs text-zinc-400 font-mono pt-1">
              <Camera className="w-4 h-4 text-zinc-500" />
              <span>Captured {filteredItems[activeItemIndex].date}</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
