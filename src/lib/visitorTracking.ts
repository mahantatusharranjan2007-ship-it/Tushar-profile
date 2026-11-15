import { doc, updateDoc, increment, setDoc, getDoc, collection, addDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./firebase";
import { VisitorLog } from "../types";

// Simple helper to detect browser
function getBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("SamsungBrowser")) return "Samsung Browser";
  if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
  if (ua.includes("Trident")) return "Internet Explorer";
  if (ua.includes("Edge")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Unknown";
}

// Simple helper to detect device type
function getDeviceType(): string {
  const width = window.innerWidth;
  if (width < 640) return "Mobile";
  if (width < 1024) return "Tablet";
  return "Desktop";
}

// Fetch visitor country via free IP API
async function getVisitorCountry(): Promise<string> {
  try {
    // Attempt real fetch to ipapi.co
    const res = await fetch("https://ipapi.co/json/");
    if (res.ok) {
      const data = await res.json();
      if (data.country_name) {
        return data.country_name;
      }
    }
  } catch (err) {
    console.warn("Could not retrieve visitor location from API, defaulting:", err);
  }
  return "United States"; // Fallback default
}

// Sanitization functions to prevent invalid characters or dot-nested path errors in Firestore keys
function sanitizePathKey(path: string): string {
  if (path === "/" || !path) return "home";
  return path
    .replace(/^\/+|\/+$/g, "") // remove leading/trailing slashes
    .replace(/[\/.]/g, "_")    // replace any other slashes or dots with underscores
    .replace(/[~*\[\]]/g, ""); // remove other forbidden characters
}

function sanitizeKey(key: string): string {
  if (!key) return "unknown";
  return key
    .replace(/[.\/]/g, "_")
    .replace(/[~*\[\]]/g, "");
}

export async function trackPageView(path: string) {
  try {
    // Avoid tracking in some specific fast-reloading environments if needed, but let's track generally
    const browser = getBrowser();
    const device = getDeviceType();
    
    // Check local storage for returning visitor status
    const returningKey = "portfolio_returning_visitor";
    const isReturning = localStorage.getItem(returningKey) === "true";
    if (!isReturning) {
      localStorage.setItem(returningKey, "true");
    }

    const country = await getVisitorCountry();
    const timestamp = new Date().toISOString();

    const log: VisitorLog = {
      country,
      device,
      browser,
      path,
      timestamp,
      isReturning
    };

    // 1. Add raw log to Firestore
    await addDoc(collection(db, "visitors"), log);

    // 2. Safely increment stats/global
    const statsDocRef = doc(db, "stats", "global");
    
    // Ensure stats document exists
    const statsSnap = await getDoc(statsDocRef);
    const pKey = sanitizePathKey(path);
    const cKey = sanitizeKey(country);
    const dKey = sanitizeKey(device);
    const bKey = sanitizeKey(browser);

    if (!statsSnap.exists()) {
      await setDoc(statsDocRef, {
        totalViews: 1,
        totalVisitors: isReturning ? 0 : 1,
        returningCount: isReturning ? 1 : 0,
        countries: { [cKey]: 1 },
        devices: { [dKey]: 1 },
        browsers: { [bKey]: 1 },
        pageViews: { [pKey]: 1 }
      });
    } else {
      // Use standard firestore dot notation for deep updates safely
      const updates: Record<string, any> = {
        totalViews: increment(1),
        [`pageViews.${pKey}`]: increment(1)
      };

      if (!isReturning) {
        updates.totalVisitors = increment(1);
      } else {
        updates.returningCount = increment(1);
      }

      // Add increments for maps
      updates[`countries.${cKey}`] = increment(1);
      updates[`devices.${dKey}`] = increment(1);
      updates[`browsers.${bKey}`] = increment(1);

      await updateDoc(statsDocRef, updates);
    }
    console.log(`Tracked pageview: ${path}`);
  } catch (error) {
    console.error("Error in page tracking:", error);
    handleFirestoreError(error, OperationType.WRITE, "visitors");
  }
}
