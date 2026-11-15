import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { 
  collection, getDocs, query, where, addDoc, 
  increment, updateDoc, doc, getDoc 
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { BlogPost, BlogComment } from "../types";
import { useSEO } from "../lib/seo";
import { CardSkeleton, TextSkeleton } from "../components/LoadingSkeleton";
import ReactMarkdown from "react-markdown";
import { 
  Search, Calendar, Clock, Eye, Heart, Share2, 
  MessageSquare, User, Send, CheckCircle, AlertCircle, 
  ArrowLeft, Tag, Copy, Check 
} from "lucide-react";

export default function Blog() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // List States
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Detail States
  const [activePost, setActivePost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [liked, setLiked] = useState(false);

  // Comment Form States
  const [commentName, setCommentName] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [commentError, setCommentError] = useState("");

  const [copiedLink, setCopiedLink] = useState(false);

  // Dynamic SEO configurations
  useSEO({
    title: activePost ? activePost.title : "Engineering Blog",
    description: activePost 
      ? activePost.summary 
      : "Articles detailing large language model orchestrations, React 19 visual architectures, and database clustering."
  });

  // 1. Fetch posts on boot
  useEffect(() => {
    async function fetchPosts() {
      try {
        const snap = await getDocs(collection(db, "blog"));
        const list: BlogPost[] = [];
        snap.forEach((doc) => {
          const data = doc.data() as BlogPost;
          list.push({ ...data, id: doc.id });
        });
        setPosts(list);
      } catch (err) {
        console.error("Error loading blog posts:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [slug]);

  // 2. Fetch specific post if slug changed
  useEffect(() => {
    if (!slug) {
      setActivePost(null);
      return;
    }

    async function fetchPostDetail() {
      setLoadingDetail(true);
      try {
        // Find post by slug
        const q = query(collection(db, "blog"), where("slug", "==", slug));
        const snap = await getDocs(q);
        if (snap.empty) {
          navigate("/blog");
          return;
        }

        const docSnap = snap.docs[0];
        const postData = { ...docSnap.data(), id: docSnap.id } as BlogPost;
        setActivePost(postData);

        // Increment view count in Firestore asynchronously
        const postRef = doc(db, "blog", docSnap.id);
        await updateDoc(postRef, {
          views: increment(1)
        });

        // Fetch approved comments for this post
        const commSnap = await getDocs(collection(db, "comments"));
        const commList: BlogComment[] = [];
        commSnap.forEach((cDoc) => {
          const cData = cDoc.data() as BlogComment;
          if (cData.postId === docSnap.id && cData.isApproved) {
            commList.push({ ...cData, id: cDoc.id });
          }
        });
        setComments(commList);

      } catch (e) {
        console.error("Error loading blog details:", e);
      } finally {
        setLoadingDetail(false);
      }
    }

    fetchPostDetail();
  }, [slug, navigate]);

  // Handle Like Increment
  const handleLike = async () => {
    if (!activePost || liked) return;
    try {
      const postRef = doc(db, "blog", activePost.id!);
      await updateDoc(postRef, {
        likes: increment(1)
      });
      setLiked(true);
      setActivePost(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
    } catch (e) {
      console.warn("Could not register like:", e);
    }
  };

  // Submit Comments
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError("");
    setCommentSuccess(false);

    if (!commentName.trim() || !commentEmail.trim() || !commentContent.trim()) {
      setCommentError("Please fill out all commenting fields.");
      return;
    }

    setCommentSubmitting(true);

    try {
      await addDoc(collection(db, "comments"), {
        postId: activePost!.id!,
        authorName: commentName.trim(),
        authorEmail: commentEmail.trim(),
        content: commentContent.trim(),
        date: new Date().toISOString(),
        isApproved: false // awaits admin approval
      });

      setCommentSuccess(true);
      setCommentContent("");
    } catch (err) {
      console.error("Error logging comment:", err);
      setCommentError("Delivery error. Please retry or verify connection.");
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Filter lists
  const filteredPosts = posts.filter((p) => {
    // Hide drafts from visitors unless we have admin logged in
    const visible = p.isPublished;
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;

    return visible && matchesSearch && matchesCategory;
  });

  const categories = ["All", ...Array.from(new Set(posts.filter(p => p.isPublished).map((p) => p.category)))];

  // RELATED ARTICLES
  const relatedArticles = posts
    .filter(p => p.isPublished && p.id !== activePost?.id && p.category === activePost?.category)
    .slice(0, 2);

  // RENDER BLOG LIST SCREEN
  if (!slug) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-100 dark:border-zinc-900 pb-8">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Engineering Logs</span>
            <h1 className="font-sans font-extrabold text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-50 tracking-tight">
              Engineering Insights
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Technical breakdowns, system architecture deep dives, and tips on modern full-stack web engineering.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search articles, tags, subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-zinc-900 dark:text-zinc-100 shadow-sm"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-zinc-900 dark:text-zinc-100 shadow-sm font-medium"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            No articles match your criteria or are currently published.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredPosts.map((post) => (
              <Link 
                key={post.id} 
                to={`/blog/${post.slug}`}
                className="group flex flex-col bg-white/40 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
              >
                {post.coverImage && (
                  <div className="h-52 overflow-hidden relative">
                    <img 
                      src={post.coverImage} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&h=300&q=80";
                      }}
                    />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                      {post.category}
                    </span>
                    <h2 className="font-sans font-bold text-xl text-zinc-900 dark:text-zinc-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3">
                      {post.summary}
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-xs text-zinc-400 pt-3 border-t border-zinc-100 dark:border-zinc-900 font-medium">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{post.publishDate}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{post.readingTime} min read</span>
                      </span>
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 font-bold group-hover:underline">Read article &rarr;</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // RENDER DETAILED BLOG READING PAGE
  if (loadingDetail || !activePost) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20">
        <TextSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      
      {/* Navigation and quick stats bar */}
      <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-900 pb-4">
        <Link 
          to="/blog" 
          className="inline-flex items-center space-x-2 text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Articles</span>
        </Link>
        
        {/* Share & Like controllers */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleLike}
            disabled={liked}
            className={`p-2 rounded-lg border text-sm font-semibold transition-all flex items-center space-x-1.5 ${
              liked 
                ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400"
                : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-700"
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-red-600 dark:fill-red-400" : ""}`} />
            <span>{activePost.likes}</span>
          </button>
          
          <button 
            onClick={handleShare}
            className="p-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-700 transition-all flex items-center space-x-1"
          >
            {copiedLink ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
            <span className="text-xs hidden sm:inline">{copiedLink ? "Copied" : "Share"}</span>
          </button>
        </div>
      </div>

      {/* Hero Banner Cover */}
      <div className="space-y-6">
        {activePost.coverImage && (
          <div className="h-64 sm:h-96 rounded-3xl overflow-hidden shadow-md">
            <img 
              src={activePost.coverImage} 
              alt={activePost.title} 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&h=600&q=80";
              }}
            />
          </div>
        )}

        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            {activePost.category}
          </span>
          <h1 className="font-sans font-extrabold text-3xl sm:text-5xl text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight">
            {activePost.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-zinc-400 pt-1 font-medium">
            <span className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{activePost.publishDate}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{activePost.readingTime} min read</span>
            </span>
            <span className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{activePost.views} views</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Markdown Content */}
      <div className="prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 leading-relaxed text-base sm:text-lg border-b border-zinc-100 dark:border-zinc-900 pb-12">
        <ReactMarkdown>{activePost.content}</ReactMarkdown>
      </div>

      {/* Related articles panel */}
      {relatedArticles.length > 0 && (
        <div className="space-y-6 border-b border-zinc-100 dark:border-zinc-900 pb-12">
          <h3 className="font-sans font-bold text-lg text-zinc-900 dark:text-zinc-50">
            Related Articles
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {relatedArticles.map(rel => (
              <Link 
                key={rel.id} 
                to={`/blog/${rel.slug}`}
                className="p-5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl hover:border-zinc-300 block space-y-2 transition-all"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">{rel.category}</span>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 hover:text-blue-600">{rel.title}</h4>
                <p className="text-xs text-zinc-400 line-clamp-2">{rel.summary}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="space-y-8">
        <h3 className="font-sans font-bold text-2xl text-zinc-900 dark:text-zinc-50 flex items-center space-x-2">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          <span>Comments ({comments.length})</span>
        </h3>

        {/* Existing approved comments */}
        {comments.length === 0 ? (
          <p className="text-sm text-zinc-400 italic">No approved comments posted yet. Be the first to share your thoughts!</p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div 
                key={comment.id}
                className="p-5 bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-200/40 dark:border-zinc-800/40 rounded-2xl space-y-2"
              >
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-950 text-blue-600 rounded-full">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-200">{comment.authorName}</span>
                  </div>
                  <span className="text-zinc-400 font-mono">{new Date(comment.date).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 pl-8 leading-relaxed">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Post comment form */}
        <div className="bg-white/40 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-6 space-y-4 backdrop-blur-sm shadow-sm">
          <h4 className="font-sans font-bold text-lg text-zinc-900 dark:text-zinc-100">
            Post a Comment
          </h4>
          <p className="text-xs text-zinc-400">
            Your email address will remain confidential. Comments undergo administrator moderation before rendering live.
          </p>

          <form onSubmit={handleCommentSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  className="w-full px-4 py-2 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-zinc-900 dark:text-zinc-100 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. john@example.com"
                  value={commentEmail}
                  onChange={(e) => setCommentEmail(e.target.value)}
                  className="w-full px-4 py-2 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-zinc-900 dark:text-zinc-100 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                Your Comment *
              </label>
              <textarea
                required
                rows={4}
                placeholder="What did you think of the architectural takeaways?"
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                className="w-full px-4 py-2 text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-zinc-900 dark:text-zinc-100 shadow-sm resize-none"
              ></textarea>
            </div>

            {commentSuccess && (
              <div className="flex items-start space-x-2 text-xs text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 p-4 border border-emerald-100 dark:border-emerald-900/50 rounded-xl">
                <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-500 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">Comment Submitted for Moderation!</p>
                  <p className="text-[11px] text-zinc-500">
                    Thank you for your response. The comment has been queued in Firestore and will render live upon moderator review.
                  </p>
                </div>
              </div>
            )}

            {commentError && (
              <div className="flex items-center space-x-2 text-xs text-red-800 bg-red-50 p-3 rounded-lg border border-red-100">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                <span>{commentError}</span>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={commentSubmitting}
                className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white text-xs font-semibold rounded-lg shadow shadow-blue-500/10 transition-all active:scale-95"
              >
                <span>Post comment</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

          </form>
        </div>
      </div>

    </div>
  );
}
