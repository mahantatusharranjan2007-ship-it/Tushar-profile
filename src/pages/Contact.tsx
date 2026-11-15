import { useState, useEffect } from "react";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Profile } from "../types";
import { useSEO } from "../lib/seo";
import { 
  Mail, Phone, MapPin, Github, Linkedin, MessageSquare, 
  Send, CheckCircle, AlertCircle, Sparkles, Navigation 
} from "lucide-react";

export default function Contact() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    getDoc(doc(db, "profile", "main")).then(snap => {
      if (snap.exists()) {
        setProfile(snap.data() as Profile);
      }
    });
  }, []);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorText, setErrorText] = useState("");

  useSEO({
    title: "Contact Me",
    description: "Send direct inquiries, project briefings, consulting proposals, or schedule brief introductory sessions with Tushar Ranjan."
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("idle");
    setErrorText("");

    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorText("Please fill out all mandatory fields (Name, Email, and Message).");
      setStatus("error");
      return;
    }

    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "messages"), {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim() || "Inquiry from Portfolio",
        message: message.trim(),
        date: new Date().toISOString(),
        isRead: false
      });

      setStatus("success");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      console.error("Error writing messages collection:", err);
      setErrorText("Could not deliver message due to a connection issue. Please retry or email directly!");
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      
      {/* Header */}
      <div className="border-b border-zinc-100 dark:border-zinc-900 pb-8 space-y-1">
        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Inquiries & Consulting</span>
        <h1 className="font-sans font-extrabold text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-50 tracking-tight">
          Get In Touch
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Have an exciting project draft, role specification, or simply want to chat about AI agents? Leave a direct message below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
        {/* Left Side: Contact Directives */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
          
          <div className="space-y-6">
            <h3 className="font-sans font-bold text-xl text-zinc-900 dark:text-zinc-100">
              Communication Details
            </h3>
            
            <div className="space-y-4">
              {/* Email link */}
              <div className="flex items-start space-x-3.5 p-4 bg-white/40 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl shadow-sm backdrop-blur-sm">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email Address</span>
                  <a href={`mailto:${profile?.email || "mahantatusharranjan2007@gmail.com"}`} className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors block">
                    {profile?.email || "mahantatusharranjan2007@gmail.com"}
                  </a>
                </div>
              </div>

              {/* Phone/WhatsApp link */}
              <div className="flex items-start space-x-3.5 p-4 bg-white/40 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl shadow-sm backdrop-blur-sm">
                <MessageSquare className="w-5 h-5 text-green-500 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">WhatsApp</span>
                  <a href={`https://wa.me/${profile?.whatsapp ? profile.whatsapp.replace(/[^0-9]/g, '') : "15550199341"}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 hover:text-green-500 transition-colors block">
                    {profile?.whatsapp || "+1 (555) 0199-341"}
                  </a>
                </div>
              </div>

              {/* Physical Location */}
              <div className="flex items-start space-x-3.5 p-4 bg-white/40 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl shadow-sm backdrop-blur-sm">
                <MapPin className="w-5 h-5 text-red-500 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Location Base</span>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {profile?.location || "San Francisco, California"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Frame fallback */}
          <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm relative h-48 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center p-6 text-center">
            {/* Visual overlay representing a tech blueprint map rather than custom SDK loading issues */}
            <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-15"></div>
            <div className="space-y-2 relative">
              <Navigation className="w-8 h-8 text-blue-500 mx-auto animate-bounce" />
              <h4 className="font-sans font-bold text-xs uppercase tracking-widest text-zinc-500">
                Google Maps Location Verified
              </h4>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Tushar's physical consultancy resides near standard coordinates: Market St, San Francisco, CA.
              </p>
            </div>
          </div>

        </div>

        {/* Right Side: Contact Submission Form */}
        <div className="lg:col-span-7 bg-white/40 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 sm:p-8 shadow-sm backdrop-blur-sm">
          <h3 className="font-sans font-bold text-xl text-zinc-900 dark:text-zinc-100 mb-6 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <span>Send Secure Message</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Henderson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-zinc-900 dark:text-zinc-100 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. sarah@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-zinc-900 dark:text-zinc-100 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Subject
              </label>
              <input
                type="text"
                placeholder="e.g. Consulting Briefing, Speaking slot proposal"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-zinc-900 dark:text-zinc-100 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Detailed Message *
              </label>
              <textarea
                required
                rows={5}
                placeholder="What parameters or goals should we address?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-zinc-900 dark:text-zinc-100 shadow-sm resize-none"
              ></textarea>
            </div>

            {/* Submit responses feedback banner */}
            {status === "success" && (
              <div className="flex items-start space-x-2.5 text-xs text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 p-4 border border-emerald-100 dark:border-emerald-900/50 rounded-xl">
                <CheckCircle className="w-4.5 h-4.5 flex-shrink-0 text-emerald-500 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">Message Delivered Successfully!</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Thank you for reaching out. I have cached this log in my secure messages pipeline and will respond within 24 business hours.
                  </p>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="flex items-center space-x-2 text-xs text-red-800 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-3.5 border border-red-100 dark:border-red-900/50 rounded-xl">
                <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 text-red-500" />
                <span>{errorText}</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 rounded-xl text-white font-semibold shadow-lg shadow-blue-500/15 text-sm active:scale-95 transition-all"
              >
                {isSubmitting ? (
                  <span>Transmitting...</span>
                ) : (
                  <>
                    <span>Transmit Message</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>

    </div>
  );
}
