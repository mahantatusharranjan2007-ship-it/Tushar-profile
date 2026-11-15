import { useState } from "react";
import { Link, Copy, Check, Image as ImageIcon, Trash2, Globe, AlertCircle } from "lucide-react";

export default function MediaManager() {
  const [url, setUrl] = useState("");
  const [previewName, setPreviewName] = useState("");
  const [gallery, setGallery] = useState<{ name: string; url: string }[]>(() => {
    const local = localStorage.getItem("portfolio_quick_media_links");
    return local ? JSON.parse(local) : [
      { name: "Tushar Avatar", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80" },
      { name: "Workspace Art", url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&h=600&q=80" },
      { name: "Orchestration Banner", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=300&q=80" }
    ];
  });
  
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [validationError, setValidationError] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const saveToLocal = (newGallery: { name: string; url: string }[]) => {
    localStorage.setItem("portfolio_quick_media_links", JSON.stringify(newGallery));
    setGallery(newGallery);
  };

  const validateUrl = (testUrl: string): boolean => {
    if (!testUrl) return false;
    try {
      new URL(testUrl);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    
    if (!url.trim()) {
      setValidationError("Please enter a URL.");
      return;
    }

    if (!validateUrl(url)) {
      setValidationError("Please enter a valid HTTP/HTTPS URL.");
      return;
    }

    setIsValidating(true);
    
    // Attempt load check
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setIsValidating(false);
      const name = previewName.trim() || `Image ${gallery.length + 1}`;
      const newGallery = [...gallery, { name, url }];
      saveToLocal(newGallery);
      setUrl("");
      setPreviewName("");
    };
    img.onerror = () => {
      setIsValidating(false);
      setValidationError("Could not load image. Make sure the URL is direct and supports cross-origin loading, or double check your path.");
    };
  };

  const handleCopy = (txt: string, idx: number) => {
    navigator.clipboard.writeText(txt);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDelete = (idx: number) => {
    const filtered = gallery.filter((_, i) => i !== idx);
    saveToLocal(filtered);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <ImageIcon className="w-5 h-5 text-blue-600" />
        <h3 className="font-sans font-bold text-lg text-zinc-900 dark:text-zinc-100">
          Media Link Manager
        </h3>
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
        Store and validate image URLs directly. Paste them into any portfolio card, blog, banner, or certificate fields.
      </p>

      {/* Input Form */}
      <form onSubmit={handleAddMedia} className="space-y-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Friendly Name
            </label>
            <input
              type="text"
              placeholder="e.g. Hero Background, Project Banner"
              value={previewName}
              onChange={(e) => setPreviewName(e.target.value)}
              className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Image URL
            </label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/photo-..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        {validationError && (
          <div className="flex items-center space-x-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-2.5 rounded-lg border border-red-100 dark:border-red-900/50">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="text-xs text-zinc-400 flex items-center space-x-1">
            <Globe className="w-3.5 h-3.5" />
            <span>Supports standard image extensions (.png, .jpg, Unsplash links)</span>
          </div>
          <button
            type="submit"
            disabled={isValidating}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 rounded-lg transition-colors active:scale-95"
          >
            {isValidating ? "Validating Link..." : "Add to Library"}
          </button>
        </div>
      </form>

      {/* Library Grid */}
      <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-3">
        Saved Media Links ({gallery.length})
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-72 overflow-y-auto pr-1">
        {gallery.map((media, idx) => (
          <div 
            key={idx} 
            className="flex items-center space-x-3 p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 rounded-xl group hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
          >
            {/* Aspect frame preview */}
            <div className="w-12 h-12 rounded-lg bg-zinc-200 dark:bg-zinc-800 overflow-hidden flex-shrink-0 border border-zinc-200 dark:border-zinc-700">
              <img 
                src={media.url} 
                alt={media.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?auto=format&fit=crop&w=100&h=100&q=80"; // fallback
                }}
              />
            </div>
            {/* Info + Copy bar */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {media.name}
              </p>
              <p className="text-xs text-zinc-400 truncate select-all">
                {media.url}
              </p>
            </div>
            {/* Quick Actions */}
            <div className="flex space-x-1">
              <button
                onClick={() => handleCopy(media.url, idx)}
                className="p-1.5 hover:bg-white dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 rounded-lg text-zinc-400 hover:text-blue-600 transition-all"
                title="Copy URL"
              >
                {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => handleDelete(idx)}
                className="p-1.5 hover:bg-white dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 rounded-lg text-zinc-400 hover:text-red-500 transition-all"
                title="Delete URL"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
