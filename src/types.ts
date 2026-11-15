export interface Profile {
  name: string;
  title: string;
  shortIntro: string;
  bio: string;
  avatarUrl: string;
  resumeUrl: string;
  email: string;
  whatsapp: string;
  linkedin: string;
  github: string;
  location: string;
  careerGoals: string;
  languages: string[];
  interests: string[];
  currentFocus: string;
}

export interface Project {
  id?: string;
  title: string;
  description: string;
  liveUrl: string;
  githubUrl: string;
  imageUrl: string;
  technologies: string[];
  features: string[];
  startDate: string;
  endDate: string;
  isFeatured: boolean;
  category: string;
  order: number;
}

export interface Experience {
  id?: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  type: "Internship" | "Freelance" | "Volunteer" | "Full-time";
  achievements: string[];
  order: number;
}

export interface Skill {
  id?: string;
  name: string;
  category: "Frontend" | "Backend" | "Database" | "Cloud" | "AI Tools" | "Deployment" | "Soft Skills";
  level: number; // percentage (e.g. 85)
  description: string;
  icon: string; // lucide icon name
  order: number;
}

export interface Education {
  id?: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  result: string;
  certificateUrl: string;
  order: number;
}

export interface Certificate {
  id?: string;
  title: string;
  organization: string;
  date: string;
  description: string;
  credentialId: string;
  credentialUrl: string;
  imageUrl: string;
}

export interface Achievement {
  id?: string;
  title: string;
  date: string;
  description: string;
  imageUrl: string;
  order: number;
}

export interface GalleryItem {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  category: string;
  order: number;
}

export interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content: string; // Markdown supported
  summary: string;
  coverImage: string;
  category: string;
  tags: string[];
  publishDate: string;
  isPublished: boolean;
  readingTime: number;
  views: number;
  likes: number;
}

export interface BlogComment {
  id?: string;
  postId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  date: string;
  isApproved: boolean;
}

export interface Announcement {
  id?: string;
  title: string;
  content: string;
  bannerUrl: string;
  priority: "Low" | "Medium" | "High";
  publishDate: string;
  expiryDate: string;
  isActive: boolean;
}

export interface Testimonial {
  id?: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number; // 1-5
  date: string;
  isApproved: boolean;
  avatarUrl: string;
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  isRead: boolean;
}

export interface VisitorLog {
  id?: string;
  ip?: string;
  country: string;
  device: string;
  browser: string;
  path: string;
  timestamp: string;
  isReturning: boolean;
}

export interface VisitorStats {
  totalViews: number;
  countries: Record<string, number>;
  devices: Record<string, number>;
  browsers: Record<string, number>;
  pageViews: Record<string, number>;
  returningCount: number;
  totalVisitors: number;
}
