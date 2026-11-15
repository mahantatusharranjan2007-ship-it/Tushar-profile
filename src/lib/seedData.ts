import { doc, getDoc, setDoc, collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import { 
  Profile, Project, Experience, Skill, Education, 
  Certificate, Achievement, GalleryItem, BlogPost, 
  Testimonial, Announcement 
} from "../types";

export async function isDatabaseEmpty(): Promise<boolean> {
  try {
    const profileDoc = await getDoc(doc(db, "profile", "main"));
    return !profileDoc.exists();
  } catch (error) {
    console.error("Error checking database status:", error);
    return false; // Return false to prevent blind seeding which causes write permission errors
  }
}

export async function seedDatabase() {
  // Automatic migration logic if the database has already been seeded with the old name
  try {
    const profileDocRef = doc(db, "profile", "main");
    const profileSnap = await getDoc(profileDocRef);
    if (profileSnap.exists()) {
      const profileData = profileSnap.data();
      if (profileData && profileData.name === "Prasanna Mahanta") {
        console.log("Migrating existing database profile from Prasanna Mahanta to Tushar Ranjan Mahanta...");
        await setDoc(profileDocRef, {
          name: "Tushar Ranjan Mahanta",
          bio: profileData.bio ? profileData.bio.replace(/Prasanna/g, "Tushar Ranjan") : ""
        }, { merge: true });
        console.log("✅ Profile name migrated to Tushar Ranjan Mahanta successfully!");
      }
    }
  } catch (err) {
    console.error("Error running database migration check:", err);
  }

  const empty = await isDatabaseEmpty();
  if (!empty) {
    console.log("Database already seeded. Skipping default initialization.");
    return;
  }

  console.log("Database is empty. Populating beautiful portfolio seed data...");

  // 1. Profile Seed
  const defaultProfile: Profile = {
    name: "Tushar Ranjan Mahanta",
    title: "Lead AI Systems & Full-Stack Architect",
    shortIntro: "I design intelligent systems, orchestrate autonomous agents, and craft ultra-premium web interfaces.",
    bio: "A highly analytical and systems-oriented engineering leader with over 8 years of experience building scalable, responsive web solutions. Specializing in Node.js architectures, distributed microservices, edge computing, and modern user-focused React interfaces. Dedicated to creating high-utility, resilient software that solves concrete real-world workflows.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80",
    resumeUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    email: "mahantatusharranjan2007@gmail.com",
    whatsapp: "+15550199341",
    linkedin: "https://linkedin.com/in/mahanta",
    github: "https://github.com/mahantapurna",
    location: "San Francisco, CA",
    careerGoals: "My mission is to advance the state of user-facing systems by weaving state-of-the-art AI agents seamlessly into lightweight, low-latency, resilient web environments.",
    languages: ["English (Native)", "Spanish (Professional Working)", "Sanskrit (Classical)"],
    interests: ["Generative Typography", "Blue-water Sailing", "Espresso Extraction Science", "Analog Synthesizers"],
    currentFocus: "Local WebGPU model inference, secure multi-agent consensus networks, and low-latency full-stack application structures."
  };

  // Helper to add documents to a collection
  const seedCollection = async <T>(collName: string, items: T[]) => {
    try {
      const collRef = collection(db, collName);
      for (const item of items) {
        await addDoc(collRef, item as any);
      }
      console.log(`✅ Collection [${collName}] seeded with ${items.length} items.`);
    } catch (e) {
      console.error(`Error seeding [${collName}]:`, e);
    }
  };

  // 2. Projects Seed
  const defaultProjects: Project[] = [
    {
      title: "OmniAgent Orchestrator",
      description: "A highly resilient orchestration engine allowing developer teams to define, visualize, and monitor autonomous multi-agent task chains with real-time feedback.",
      liveUrl: "https://github.com/mahantapurna",
      githubUrl: "https://github.com/mahantapurna",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&h=400&q=80",
      technologies: ["React", "TypeScript", "Node.js", "Gemini API", "Socket.io"],
      features: [
        "Interactive visual graph designer for task execution loops",
        "Deterministic rate-limiting and cost-tracking per sub-agent",
        "Comprehensive browser-based terminal debugging window"
      ],
      startDate: "2025-09",
      endDate: "Present",
      isFeatured: true,
      category: "AI Tools",
      order: 1
    },
    {
      title: "ScribeDoc Cloud Editor",
      description: "A secure, server-side-rendered rich document editor optimized for rapid team wikis, supporting offline synchronizations and deep-linking markdown previews.",
      liveUrl: "https://github.com/mahantapurna",
      githubUrl: "https://github.com/mahantapurna",
      imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&h=400&q=80",
      technologies: ["React", "Firestore", "Tailwind CSS", "Vite", "PWA"],
      features: [
        "Conflict-free local synchronizations on unstable networks",
        "Side-by-side dynamic HTML live markdown compiling engine",
        "Granular role-based page and folder hierarchy system"
      ],
      startDate: "2024-04",
      endDate: "2024-12",
      isFeatured: true,
      category: "Full-Stack",
      order: 2
    },
    {
      title: "Nova Dashboard Engine",
      description: "An elegant enterprise telemetry system delivering millisecond-precision metric charting for distributed container logs and global Cloud Run ingress.",
      liveUrl: "https://github.com/mahantapurna",
      githubUrl: "https://github.com/mahantapurna",
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&h=400&q=80",
      technologies: ["React", "D3.js", "Firebase Auth", "Tailwind CSS"],
      features: [
        "Staggered sub-second rendering for up to 100k data vertices",
        "Adaptive dark-light color palette balancing for critical status highlights",
        "Export configurations into standard JSON formats"
      ],
      startDate: "2023-01",
      endDate: "2023-10",
      isFeatured: false,
      category: "Frontend",
      order: 3
    }
  ];
  await seedCollection("projects", defaultProjects);

  // 3. Experience Seed
  const defaultExperience: Experience[] = [
    {
      company: "Cognitive Labs AI",
      role: "Lead Full-Stack & AI Systems Architect",
      startDate: "2024-06",
      endDate: "Present",
      description: "Directing technical development for distributed multi-agent enterprise setups. Engineered an internal system wrapping the Gemini API with strict schema-validation guards, boosting token safety by 40%.",
      type: "Full-time",
      achievements: [
        "Designed resilient full-stack Express middleware serving millions of monthly requests on Cloud Run",
        "Pioneered lightweight local state syncing using IndexedDB with automated Firestore fallback"
      ],
      order: 1
    },
    {
      company: "Aether Software Corp",
      role: "Senior Full-Stack Freelancer",
      startDate: "2021-02",
      endDate: "2024-05",
      description: "Delivered highly interactive, responsive dashboards, SaaS templates, and customized client relationship managers for logistics and telemetry start-ups across North America.",
      type: "Freelance",
      achievements: [
        "Crafted optimized fluid UI components styled with Tailwind CSS, supporting complete light and dark transitions",
        "Scaled backend APIs to fetch, normalize, and cache geographic and shipment data dynamically"
      ],
      order: 2
    },
    {
      company: "OpenSource Developers Collective",
      role: "Systems Contributor & Advisor",
      startDate: "2019-09",
      endDate: "2021-01",
      description: "Volunteered as core system contributor to open-source state machines and interactive charting visualizers. Mentored over 15 junior engineering interns in code quality, linting standards, and type safety.",
      type: "Volunteer",
      achievements: [
        "Developed custom SVG rendering enhancements for D3.js charting extensions",
        "Maintained build tool integration documentation helping 200+ global contributors"
      ],
      order: 3
    }
  ];
  await seedCollection("experience", defaultExperience);

  // 4. Skills Seed
  const defaultSkills: Skill[] = [
    // Frontend
    { name: "React & TypeScript", category: "Frontend", level: 95, description: "Declarative component structures, custom hook mechanics, and complex application states.", icon: "ReactIcon", order: 1 },
    { name: "Tailwind CSS & Motion", category: "Frontend", level: 90, description: "Premium responsive styling, modular typography hierarchies, and buttery-smooth animations.", icon: "Sparkles", order: 2 },
    // Backend
    { name: "Node.js & Express", category: "Backend", level: 92, description: "Highly modular server setups, secured REST endpoints, proxying systems, and middleware pipelines.", icon: "Server", order: 3 },
    // Database
    { name: "Firestore NoSQL Database", category: "Database", level: 88, description: "Real-time updates, scalable schema modeling, efficient composite indexing, and sub-collection trees.", icon: "Database", order: 4 },
    { name: "PostgreSQL & Drizzle ORM", category: "Database", level: 85, description: "Relational constraints, complex transaction executions, and performance query tuning.", icon: "Layers", order: 5 },
    // Cloud
    { name: "Google Cloud Run & IAM", category: "Cloud", level: 86, description: "Containerized deployment configurations, stateless execution scalability, and secure service roles.", icon: "Cloud", order: 6 },
    // AI Tools
    { name: "Gemini API Orchestrations", category: "AI Tools", level: 90, description: "State-of-the-art model configurations, function-calling, JSON structures, and system prompt tuning.", icon: "Cpu", order: 7 },
    // Deployment
    { name: "Docker & CI/CD Pipelines", category: "Deployment", level: 82, description: "GitHub Actions integrations, containerization setups, and standard production builds.", icon: "Terminal", order: 8 },
    // Soft Skills
    { name: "Technical Mentorship", category: "Soft Skills", level: 95, description: "Guiding product direction, reviewing architectural blueprints, and promoting high engineering standards.", icon: "Users", order: 9 }
  ];
  await seedCollection("skills", defaultSkills);

  // 5. Education Seed
  const defaultEducation: Education[] = [
    {
      school: "Stanford University",
      degree: "Master of Science",
      fieldOfStudy: "Computer Science (Intelligent Systems Focus)",
      startDate: "2016-09",
      endDate: "2018-06",
      result: "GPA 3.92/4.00",
      certificateUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      order: 1
    },
    {
      school: "University of California, Berkeley",
      degree: "Bachelor of Science",
      fieldOfStudy: "Electrical Engineering & Computer Sciences (EECS)",
      startDate: "2012-09",
      endDate: "2016-05",
      result: "Honors with Distinction",
      certificateUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      order: 2
    }
  ];
  await seedCollection("education", defaultEducation);

  // 6. Certificates Seed
  const defaultCertificates: Certificate[] = [
    {
      title: "TensorFlow Certified Developer",
      organization: "Google",
      date: "2024-08-12",
      description: "Validation of expertise in designing, training, and optimizing deep neural networks for computer vision, natural language processing, and sequence forecasting.",
      credentialId: "TF-9428-CH",
      credentialUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80",
      imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80"
    },
    {
      title: "Professional Cloud Architect",
      organization: "Google Cloud",
      date: "2023-05-19",
      description: "Validates ability to design, develop, and manage robust, secure, highly scalable, and dynamic Google Cloud solutions to drive business objectives.",
      credentialId: "GCP-PCA-8239",
      credentialUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80",
      imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80"
    }
  ];
  await seedCollection("certificates", defaultCertificates);

  // 7. Achievements Seed
  const defaultAchievements: Achievement[] = [
    {
      title: "First Place - Global AI Systems Hackathon",
      date: "2025-03-22",
      description: "Pioneered a low-latency multi-agent safety framework running edge inferences on client browsers, beating 450 global engineering cohorts.",
      imageUrl: "https://images.unsplash.com/photo-1496181130204-755241524eab?auto=format&fit=crop&w=600&h=400&q=80",
      order: 1
    },
    {
      title: "Excellence in Engineering Award - Cognitive Labs",
      date: "2024-12-15",
      description: "Awarded top engineering citation for modernizing our core data pipeline, scaling reliability to 99.999% availability.",
      imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&h=400&q=80",
      order: 2
    }
  ];
  await seedCollection("achievements", defaultAchievements);

  // 8. Gallery Seed
  const defaultGallery: GalleryItem[] = [
    {
      title: "Workspace Aesthetic",
      description: "The primary environment where software architectural designs materialize into functional code structures.",
      imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&h=600&q=80",
      date: "2026-01-10",
      category: "Professional Workspace",
      order: 1
    },
    {
      title: "Distributed Cluster Visualized",
      description: "Visual rendering of decentralized data streams communicating over secure web sockets.",
      imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&h=600&q=80",
      date: "2025-11-15",
      category: "Conceptual Technology",
      order: 2
    },
    {
      title: "Pacific Horizon Sailing",
      description: "Recharging mental faculties on a weekend sail. Balance is a critical element of high-efficiency work output.",
      imageUrl: "https://images.unsplash.com/photo-1505244760056-10b7b8753f5b?auto=format&fit=crop&w=800&h=600&q=80",
      date: "2025-08-05",
      category: "Personal Interests",
      order: 3
    }
  ];
  await seedCollection("gallery", defaultGallery);

  // 9. Blog Seed
  const defaultBlog: BlogPost[] = [
    {
      title: "Orchestrating Resilient LLM Workflows: A Developer Guide",
      slug: "orchestrating-resilient-llm-workflows",
      content: `## The Future is Multi-Agent

In complex operations, passing context sequentially to a single large model often results in context degradation, drift, or catastrophic forgetting. Splitting workflows into autonomous sub-agents with narrow scopes is the most robust strategy.

### 1. Structure Your Tasks Deterministically

Avoid loose instructions. Provide strict output formats:

\`\`\`json
{
  "status": "APPROVED" | "REJECTED",
  "reason": "Clarification on metrics required"
}
\`\`\`

### 2. Safeguards with Express

When serving these workflows over HTTP:
- Always run schema validation.
- Implement rate limiting to contain API expenses.
- Provide real-time callback updates to the client.

By keeping the interfaces highly focused and leveraging custom types, you create systems that can scale infinitely.`,
      summary: "Explore architectural strategies to design safe, cost-efficient, and multi-agent AI systems using modern Node.js and the @google/genai SDK.",
      coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&h=500&q=80",
      category: "Artificial Intelligence",
      tags: ["AI Orchestration", "Node.js", "Gemini API", "Software Design"],
      publishDate: "2026-06-20",
      isPublished: true,
      readingTime: 6,
      views: 142,
      likes: 38
    },
    {
      title: "Mastering Fluid Layouts with Tailwind v4 & Motion",
      slug: "mastering-fluid-layouts-tailwind-v4",
      content: `## Elegant Styling Made Extremely Easy

Tailwind CSS v4 introduces deep compiling enhancements that streamline container fluid spacing and custom design-theme variables directly inside the global styles file.

### Custom Theme Variable Declarations

Setting up unified design tokens ensures your dark and light mode screens share perfect geometric balance:

\`\`\`css
@theme {
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;
  --color-brand: #3b82f6;
}
\`\`\`

### Combining with Motion Animations

Use micro-animations for hover feedback. A slight scaling or custom translation guides user gaze directly toward call-to-action buttons. Smooth layouts are critical for premium visual hierarchies.`,
      summary: "A practical guide to implementing fluid layouts, custom font pairings, and unified token systems using Tailwind CSS v4 and standard React animations.",
      coverImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&h=500&q=80",
      category: "Frontend Development",
      tags: ["Tailwind CSS", "Vite", "Motion", "User Experience"],
      publishDate: "2026-05-14",
      isPublished: true,
      readingTime: 4,
      views: 98,
      likes: 27
    }
  ];
  await seedCollection("blog", defaultBlog);

  // 10. Testimonials Seed
  const defaultTestimonials: Testimonial[] = [
    {
      name: "Dr. Sarah Henderson",
      role: "VP of Product",
      company: "Cognitive Labs AI",
      content: "Tushar has an unparalleled talent for translating complex machine learning models into gorgeous, intuitive interfaces. His focus on performance and clean type layouts is a masterclass in frontend excellence.",
      rating: 5,
      date: "2026-05-02",
      isApproved: true,
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80"
    },
    {
      name: "Marcus Vance",
      role: "Engineering Manager",
      company: "Aether Software Corp",
      content: "During his time freelancing with Aether, Tushar designed a dynamic logistics analytics board that processed telemetry streams in real time. He writes immaculate code, designs beautiful assets, and communicates with extreme clarity.",
      rating: 5,
      date: "2025-11-18",
      isApproved: true,
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80"
    }
  ];
  await seedCollection("testimonials", defaultTestimonials);

  // 11. Announcement Seed
  const defaultAnnouncements: Announcement[] = [
    {
      title: "🚀 Open Source Release: OmniAgent Orchestrator",
      content: "I am super excited to announce that the source code for my OmniAgent multi-agent designer is now open-source. Find the visual editor and client libraries on my GitHub profile!",
      bannerUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=300&q=80",
      priority: "High",
      publishDate: "2026-07-01",
      expiryDate: "2026-08-31",
      isActive: true
    }
  ];
  await seedCollection("announcements", defaultAnnouncements);

  // 12. Visitor Stats Seed Document
  try {
    const defaultStats = {
      totalViews: 240,
      totalVisitors: 84,
      returningCount: 22,
      countries: { "United States": 52, "Canada": 12, "Germany": 8, "United Kingdom": 6, "India": 6 },
      devices: { "Desktop": 62, "Mobile": 18, "Tablet": 4 },
      browsers: { "Chrome": 48, "Safari": 22, "Firefox": 10, "Edge": 4 },
      pageViews: { "/": 110, "/about": 45, "/projects": 50, "/blog": 35 }
    };
    await setDoc(doc(db, "stats", "global"), defaultStats);
    console.log("✅ Visitor Stats seeded successfully!");
  } catch (e) {
    console.error("Error seeding stats:", e);
  }

  // 13. Profile Seed (Run last so that initial seeding rules aren't blocked prematurely)
  try {
    await setDoc(doc(db, "profile", "main"), defaultProfile);
    console.log("✅ Profile seeded successfully!");
  } catch (e) {
    console.error("Error seeding profile:", e);
  }

  console.log("🎉 Beautiful portfolio database seeding complete!");
}
