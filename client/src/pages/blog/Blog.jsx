import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  resolveImageUrl,
  getBlogFallbackImage,
  onImageError,
  BLOG_FALLBACK_IMAGES,
} from "../../utils/imageUrl";
import "./Blog.css";

const DEMO_BLOGS = [
  {
    _id: "demo1",
    title: "The Science of Progressive Overload",
    category: "Training & Strength",
    content: `Progressive overload is the gradual increase of stress placed upon the body during training. It is the single most important principle in strength and muscle development.

Without consistently challenging your muscles beyond what they're accustomed to, muscular adaptation stalls completely. This applies not just to adding weight to the bar, but also increasing total reps, sets, frequency, or shortening rest periods.

Track every single session in your training log and aim for small, consistent improvements each week. Even an increase of 1 kg or 1 additional rep represents progressive overload over time.`,
    author: "Coach Arjun",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    image: BLOG_FALLBACK_IMAGES.workouts,
  },
  {
    _id: "demo2",
    title: "Healthy Nutrition Tips for Muscle Gain",
    category: "Nutrition & Macros",
    content: `Nutrition plays a major role in muscle building and post-workout recovery. A balanced diet containing clean protein, healthy fats, complex carbohydrates, and essential micronutrients is what fuels protein synthesis.

Foods such as whole eggs, chicken breast, fish, oats, brown rice, avocados, and raw nuts are foundational to a high-performance fitness lifestyle. 

Ensure you hit a daily protein intake of 1.6g to 2.2g per kilogram of body weight to support continuous muscle tissue repair and avoid metabolic fatigue.`,
    author: "Nutritionist Priya",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    image: BLOG_FALLBACK_IMAGES.nutrition,
  },
  {
    _id: "demo3",
    title: "Benefits of Daily Cardio & Heart Health",
    category: "Cardio & Endurance",
    content: `Cardio exercises help optimize cardiovascular output, burn excess calories, and increase pulmonary stamina. Activities such as sprint intervals, rowing, cycling, and incline walking condition your aerobic energy systems.

Performing regular cardio also promotes nutrient delivery to recovering muscle tissues, clears metabolic waste products, and significantly boosts mental resilience and mood through endorphin release.`,
    author: "Dr. Meena",
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    image: BLOG_FALLBACK_IMAGES.cardio,
  },
  {
    _id: "demo4",
    title: "Why Regular Body Composition & BMI Tracking Matters",
    category: "Health & Science",
    content: `Tracking body metrics helps athletes objectively monitor visceral changes beyond what standard bathroom scales report. Height-to-weight proportions and body fat percentages provide concrete benchmarks for bulking, cutting, or maintenance phases.

Consistent biometric tracking ensures you adjust caloric surplus or deficit precisely before plateauing, keeping your fitness progression measurable and scientific.`,
    author: "Coach Arjun",
    createdAt: new Date(Date.now() - 11 * 86400000).toISOString(),
    image: BLOG_FALLBACK_IMAGES.bmi,
  },
  {
    _id: "demo5",
    title: "Best Home Workouts Without Equipment",
    category: "Home Training",
    content: `Calisthenics and bodyweight mastery allow you to maintain elite conditioning without access to a commercial gym. Compound movements like decline push-ups, explosive squats, hollow body holds, and pike presses recruit primary and stabilizing muscle groups simultaneously.

With high-intensity interval formats, bodyweight circuits deliver exceptional hypertrophy and endurance while saving travel time.`,
    author: "Coach Vikram",
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    image: BLOG_FALLBACK_IMAGES.home,
  },
];

const CATEGORIES = ["ALL", "Training", "Nutrition", "Cardio", "Health", "Home"];

function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/blogs`);
      const data = Array.isArray(res.data) ? res.data : [];
      if (data.length === 0) {
        setBlogs(DEMO_BLOGS);
      } else {
        // Map category if missing
        const formatted = data.map((b) => {
          let cat = b.category;
          if (!cat) {
            const titleLow = b.title?.toLowerCase() || "";
            if (titleLow.includes("nutrition") || titleLow.includes("meal")) cat = "Nutrition";
            else if (titleLow.includes("cardio") || titleLow.includes("run")) cat = "Cardio";
            else if (titleLow.includes("bmi") || titleLow.includes("health")) cat = "Health";
            else if (titleLow.includes("home") || titleLow.includes("equipment")) cat = "Home";
            else cat = "Training";
          }
          return { ...b, category: cat };
        });
        setBlogs(formatted);
      }
    } catch {
      setBlogs(DEMO_BLOGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Filtered blogs
  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const matchCat =
        activeCategory === "ALL" ||
        b.category?.toLowerCase().includes(activeCategory.toLowerCase());

      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        b.title?.toLowerCase().includes(q) ||
        b.content?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q);

      return matchCat && matchQuery;
    });
  }, [blogs, activeCategory, searchQuery]);

  const featured = filteredBlogs[0] || null;
  const secondary = filteredBlogs.slice(1);

  const calculateReadTime = (text) => {
    const words = text ? text.split(/\s+/).length : 200;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} MIN READ`;
  };

  const handleShare = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="blog-page">
      <div className="blog-container">
        {/* Page Header */}
        <header className="blog-header">
          <div className="header-titles">
            <span className="section-num">08 — ATHLETE INTEL &amp; KNOWLEDGE</span>
            <h1 className="heavy-title">LEARN &amp; <br /> DOMINATE</h1>
          </div>
          <p className="header-desc">
            Evidence-based training protocols, hypertrophy science, sports nutrition, and recovery
            methodologies authored by AlphaFit coaches.
          </p>
        </header>

        {/* Search & Category Filter Controls */}
        <div className="blog-controls-wrapper">
          <div className="blog-search-box">
            <span className="search-ico">🔍</span>
            <input
              type="text"
              placeholder="Search articles on workouts, nutrition, cardio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="blog-search-input"
            />
            {searchQuery && (
              <button className="clear-btn" onClick={() => setSearchQuery("")}>
                ✕
              </button>
            )}
          </div>

          <div className="blog-category-tabs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`blog-tab-btn ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === "ALL" ? "ALL ARTICLES" : cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading Intel Articles...</div>
        ) : filteredBlogs.length === 0 ? (
          <div className="empty-state">
            <h3>NO ARTICLES FOUND</h3>
            <p>Try searching for other fitness topics or reset filters.</p>
            <button
              className="reset-blog-btn"
              onClick={() => {
                setActiveCategory("ALL");
                setSearchQuery("");
              }}
            >
              SHOW ALL ARTICLES
            </button>
          </div>
        ) : (
          <>
            {/* ── FEATURED HERO ARTICLE ── */}
            {featured && (
              <section
                className="featured-post-card"
                onClick={() => setSelectedBlog(featured)}
              >
                <div className="featured-image-box">
                  <img
                    src={resolveImageUrl(
                      featured.image,
                      getBlogFallbackImage(featured.title, featured.content)
                    )}
                    alt={featured.title}
                    loading="lazy"
                    onError={(e) =>
                      onImageError(
                        e,
                        getBlogFallbackImage(featured.title, featured.content)
                      )
                    }
                    className="featured-cover-img"
                  />
                  <span className="featured-overlay-badge">FEATURED INTEL</span>
                </div>

                <div className="featured-content-box">
                  <div className="article-meta-row">
                    <span className="category-pill">{featured.category || "FITNESS"}</span>
                    <span className="read-time-pill">{calculateReadTime(featured.content)}</span>
                  </div>

                  <h2 className="featured-title">{featured.title}</h2>
                  <p className="featured-excerpt">
                    {featured.content?.slice(0, 240)}...
                  </p>

                  <div className="featured-footer-row">
                    <div className="author-byline">
                      <div className="author-avatar">🏋️</div>
                      <div className="author-details">
                        <strong className="author-name">{featured.author || "AlphaFit Coach"}</strong>
                        <span className="publish-date">
                          {new Date(featured.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <button
                      className="read-more-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBlog(featured);
                      }}
                    >
                      READ FULL ARTICLE →
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* ── SECONDARY ARTICLES GRID ── */}
            {secondary.length > 0 && (
              <div className="articles-grid">
                {secondary.map((post) => {
                  const fallback = getBlogFallbackImage(post.title, post.content);
                  const imageSrc = resolveImageUrl(post.image, fallback);

                  return (
                    <article
                      key={post._id}
                      className="article-card"
                      onClick={() => setSelectedBlog(post)}
                    >
                      <div className="card-image-box">
                        <img
                          src={imageSrc}
                          alt={post.title}
                          loading="lazy"
                          onError={(e) => onImageError(e, fallback)}
                          className="card-thumb-img"
                        />
                        <span className="card-category-tag">{post.category || "FITNESS"}</span>
                      </div>

                      <div className="card-content-area">
                        <div className="card-meta">
                          <span>{calculateReadTime(post.content)}</span>
                          <span>•</span>
                          <span>
                            {new Date(post.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>

                        <h3 className="card-title">{post.title}</h3>
                        <p className="card-snippet">{post.content?.slice(0, 115)}...</p>

                        <div className="card-bottom-bar">
                          <span className="card-author">By {post.author || "Coach"}</span>
                          <button
                            className="card-read-link"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBlog(post);
                            }}
                          >
                            READ MORE →
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ===================================================
            REDESIGNED ARTICLE DETAILS MODAL / POPUP
        =================================================== */}
        {selectedBlog && (
          <div
            className="blog-modal-backdrop"
            onClick={() => setSelectedBlog(null)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="blog-modal-container"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sticky Top Bar with Close Button */}
              <div className="modal-sticky-bar">
                <div className="sticky-title-preview">
                  <span className="modal-category-badge">{selectedBlog.category || "FITNESS"}</span>
                  <span className="sticky-post-title">{selectedBlog.title}</span>
                </div>
                <div className="sticky-actions">
                  <button className="share-btn" onClick={handleShare} title="Copy Article Link">
                    {copiedLink ? "✓ COPIED" : "🔗 SHARE"}
                  </button>
                  <button
                    className="modal-exit-btn"
                    onClick={() => setSelectedBlog(null)}
                    aria-label="Close Article"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Scrollable Content Body */}
              <div className="blog-modal-scroll-area">
                {/* Hero Visual Box */}
                <div className="modal-hero-visual">
                  {selectedBlog.videoUrl ? (
                    <div className="modal-video-wrapper">
                      <iframe
                        src={
                          selectedBlog.videoUrl.includes("watch?v=")
                            ? selectedBlog.videoUrl.replace("watch?v=", "embed/")
                            : selectedBlog.videoUrl
                        }
                        title={selectedBlog.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="modal-video-iframe"
                      ></iframe>
                    </div>
                  ) : (
                    <img
                      src={resolveImageUrl(
                        selectedBlog.image,
                        getBlogFallbackImage(selectedBlog.title, selectedBlog.content)
                      )}
                      alt={selectedBlog.title}
                      loading="lazy"
                      onError={(e) =>
                        onImageError(
                          e,
                          getBlogFallbackImage(selectedBlog.title, selectedBlog.content)
                        )
                      }
                      className="modal-hero-img"
                    />
                  )}
                </div>

                <div className="modal-article-body">
                  <div className="modal-article-meta-row">
                    <span className="meta-cat">{selectedBlog.category || "FITNESS"}</span>
                    <span className="meta-time">{calculateReadTime(selectedBlog.content)}</span>
                    <span className="meta-date">
                      Published on{" "}
                      {new Date(selectedBlog.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <h1 className="modal-article-title">{selectedBlog.title}</h1>

                  {/* Author Credential Card */}
                  <div className="author-card">
                    <div className="author-avatar-large">🏋️</div>
                    <div className="author-bio">
                      <strong>Written by {selectedBlog.author || "AlphaFit Coaching Staff"}</strong>
                      <p>Certified Strength &amp; Conditioning Specialist • AlphaFit Athletic Council</p>
                    </div>
                  </div>

                  <div className="modal-divider"></div>

                  {/* Formatted Article Content */}
                  <div className="article-prose">
                    {selectedBlog.content ? (
                      selectedBlog.content
                        .split(/\n\s*\n/)
                        .map((paragraph, index) => (
                          <p key={index} className="prose-paragraph">
                            {paragraph}
                          </p>
                        ))
                    ) : (
                      <p className="prose-paragraph">
                        Comprehensive training guidance and nutritional strategies verified by
                        AlphaFit coaches.
                      </p>
                    )}

                    {/* Stylized Key Takeaways Box */}
                    <div className="prose-takeaway-box">
                      <div className="takeaway-badge">💡 COACH’S DIRECTIVE</div>
                      <h4>KEY PROTOCOLS FOR APPLICATION</h4>
                      <ul>
                        <li>Consistency in progressive overload yields greater long-term results than sporadic intensity spikes.</li>
                        <li>Support high training volume with adequate protein, hydration, and 7-9 hours of restorative sleep.</li>
                        <li>Log each workout metric to ensure systematic, measurable progression.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Modal Footer Actions */}
                  <div className="modal-article-footer">
                    <button
                      className="modal-back-btn"
                      onClick={() => setSelectedBlog(null)}
                    >
                      ← BACK TO ALL ARTICLES
                    </button>
                    <button className="modal-share-btn" onClick={handleShare}>
                      {copiedLink ? "✓ LINK COPIED" : "SHARE ARTICLE"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Blog;
