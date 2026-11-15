import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { Announcement } from "../types";
import { X, AlertTriangle, Info, ShieldAlert } from "lucide-react";

export default function AnnouncementPopup() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function fetchAnnouncement() {
      try {
        const q = query(
          collection(db, "announcements"),
          where("isActive", "==", true)
        );
        const snap = await getDocs(q);
        if (snap.empty) return;

        const list: Announcement[] = [];
        const now = new Date();

        snap.forEach((doc) => {
          const data = doc.data() as Announcement;
          // Check expiration
          const expired = data.expiryDate ? new Date(data.expiryDate) < now : false;
          if (!expired) {
            list.push({ ...data, id: doc.id });
          }
        });

        if (list.length > 0) {
          // Sort by priority (High > Medium > Low) and publishDate
          list.sort((a, b) => {
            const pA = a.priority === "High" ? 3 : a.priority === "Medium" ? 2 : 1;
            const pB = b.priority === "High" ? 3 : b.priority === "Medium" ? 2 : 1;
            if (pA !== pB) return pB - pA;
            return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
          });

          const activeAnnouncement = list[0];
          // Check if user already dismissed this specific announcement
          const dismissedId = localStorage.getItem(`dismissed_announcement_${activeAnnouncement.id}`);
          if (dismissedId !== "true") {
            setAnnouncement(activeAnnouncement);
            setIsOpen(true);
          }
        }
      } catch (e) {
        console.error("Error loading active announcements:", e);
        handleFirestoreError(e, OperationType.LIST, "announcements");
      }
    }

    fetchAnnouncement();
  }, []);

  const handleDismiss = () => {
    if (announcement?.id) {
      localStorage.setItem(`dismissed_announcement_${announcement.id}`, "true");
    }
    setIsOpen(false);
  };

  if (!isOpen || !announcement) return null;

  const getPriorityStyles = (p: string) => {
    switch (p) {
      case "High":
        return {
          bg: "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900",
          text: "text-red-800 dark:text-red-400",
          icon: <ShieldAlert className="w-5 h-5 text-red-500" />
        };
      case "Medium":
        return {
          bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900",
          text: "text-amber-800 dark:text-amber-400",
          icon: <AlertTriangle className="w-5 h-5 text-amber-500" />
        };
      default:
        return {
          bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900",
          text: "text-blue-800 dark:text-blue-400",
          icon: <Info className="w-5 h-5 text-blue-500" />
        };
    }
  };

  const styles = getPriorityStyles(announcement.priority);

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full mx-4 sm:mx-0 p-1 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-2xl animate-bounce-subtle">
      <div className="bg-white dark:bg-zinc-950 rounded-[14px] overflow-hidden">
        {announcement.bannerUrl && (
          <div className="h-32 w-full overflow-hidden relative">
            <img 
              src={announcement.bannerUrl} 
              alt="Announcement Banner" 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="absolute top-2 right-2">
              <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-full bg-white/90 dark:bg-zinc-900/90 shadow-sm ${styles.text}`}>
                {announcement.priority} Priority
              </span>
            </div>
          </div>
        )}

        <div className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              {!announcement.bannerUrl && styles.icon}
              <h4 className="font-sans font-bold text-base text-zinc-900 dark:text-zinc-100">
                {announcement.title}
              </h4>
            </div>
            <button 
              onClick={handleDismiss}
              className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {announcement.content}
          </p>

          <div className="mt-4 flex justify-end">
            <button 
              onClick={handleDismiss}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-500 rounded-lg hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all"
            >
              Acknowledge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
