// High-quality, verified transparent PNG / isolated product images directly from official CDNs
export const PRODUCT_FALLBACK_IMAGES = {
  // Optimum Nutrition Gold Standard Whey (Official transparent PNG render)
  on_gold: "https://www.optimumnutrition.com/cdn/shop/files/US_GSW_2LB_Banana_FOP.png?v=1791382094&width=1200",
  // MuscleBlaze Biozyme Whey (Official CDN isolated render)
  muscleblaze: "https://img8.hkrtcdn.com/39078/prd_3907787-MuscleBlaze-Biozyme-Performance-Whey-4.4-lb-Rich-Chocolate_o.jpg",
  // Myprotein Impact Whey Isolate (Official CDN render)
  myprotein: "https://static.thcdn.com/productimg/original/10852482-2555304620117685.jpg",
  // Mass Gainer (Official Serious Mass transparent PNG render)
  mass_gainer: "https://www.optimumnutrition.com/cdn/shop/files/US_SERIOUS_MASS_12lb_6064797_Strawberry_1.png?v=1761675472&width=1200",
  // Micronized Creatine Monohydrate (Official transparent PNG render)
  creatine: "https://www.optimumnutrition.com/cdn/shop/files/EU_ON_CreatinePowder_317g_93sv_Unflavoured_6079780_1__aligned.png?v=1787657746&width=1200",
  // Pre-Workout (Official Gold Standard Pre-Workout transparent PNG render)
  pre_workout: "https://www.optimumnutrition.com/cdn/shop/files/on-1146473_Image_01.png?v=1755790955&width=1200",
  // Vitamins & Minerals (Official Opti-Men Multivitamin transparent PNG render)
  vitamins: "https://www.optimumnutrition.com/cdn/shop/files/ON_OptiMen_90ct_FOP.png?v=1791831696&width=1200",
  // General Store Fallback (Official transparent PNG render)
  default_product: "https://www.optimumnutrition.com/cdn/shop/files/US_GSW_2LB_Banana_FOP.png?v=1791382094&width=1200",
};

// Curated Blog Hero Images matching topics
export const BLOG_FALLBACK_IMAGES = {
  workouts: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop",
  nutrition: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1200&auto=format&fit=crop",
  cardio: "https://images.unsplash.com/photo-1483721310020-03333e577078?q=80&w=1200&auto=format&fit=crop",
  bmi: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1200&auto=format&fit=crop",
  home: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=1200&auto=format&fit=crop",
  default_blog: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop",
};

/**
 * Returns a high-res matching fallback image based on product name or brand.
 */
export const getProductFallbackImage = (name = "", brand = "", category = "") => {
  const text = `${name} ${brand} ${category}`.toLowerCase();
  if (text.includes("optimum") || text.includes("gold standard") || text.includes("on ")) {
    return PRODUCT_FALLBACK_IMAGES.on_gold;
  }
  if (text.includes("muscleblaze") || text.includes("biozyme")) {
    return PRODUCT_FALLBACK_IMAGES.muscleblaze;
  }
  if (text.includes("myprotein") || text.includes("impact")) {
    return PRODUCT_FALLBACK_IMAGES.myprotein;
  }
  if (text.includes("gainer")) {
    return PRODUCT_FALLBACK_IMAGES.mass_gainer;
  }
  if (text.includes("creatine")) {
    return PRODUCT_FALLBACK_IMAGES.creatine;
  }
  if (text.includes("pre-workout") || text.includes("pre workout")) {
    return PRODUCT_FALLBACK_IMAGES.pre_workout;
  }
  if (text.includes("vitamin") || text.includes("mineral") || text.includes("omega")) {
    return PRODUCT_FALLBACK_IMAGES.vitamins;
  }
  return PRODUCT_FALLBACK_IMAGES.default_product;
};

/**
 * Returns a high-res matching fallback image based on blog title or content.
 */
export const getBlogFallbackImage = (title = "", content = "") => {
  const text = `${title} ${content}`.toLowerCase();
  if (text.includes("nutrition") || text.includes("diet") || text.includes("protein") || text.includes("meal")) {
    return BLOG_FALLBACK_IMAGES.nutrition;
  }
  if (text.includes("cardio") || text.includes("running") || text.includes("heart")) {
    return BLOG_FALLBACK_IMAGES.cardio;
  }
  if (text.includes("bmi") || text.includes("track") || text.includes("weight")) {
    return BLOG_FALLBACK_IMAGES.bmi;
  }
  if (text.includes("home") || text.includes("equipment")) {
    return BLOG_FALLBACK_IMAGES.home;
  }
  if (text.includes("beginner") || text.includes("workout") || text.includes("squat")) {
    return BLOG_FALLBACK_IMAGES.workouts;
  }
  return BLOG_FALLBACK_IMAGES.default_blog;
};

/**
 * Resolves any image URL dynamically:
 * - Replaces localhost:5000 with VITE_BACKEND_URL
 * - Prefixes relative /uploads/ with VITE_BACKEND_URL
 * - If missing or known to fail, provides a guaranteed high-res fallback
 */
export const resolveImageUrl = (url, fallback = PRODUCT_FALLBACK_IMAGES.default_product) => {
  if (!url || typeof url !== "string" || url.trim() === "") {
    return fallback;
  }

  const trimmed = url.trim();

  // Safely resolve backend base URL in both local and production Vercel environments
  const rawBase = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "");
  const isProductionRemote = typeof window !== "undefined" && window.location && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
  const backendBase = (isProductionRemote && rawBase.includes("localhost:5000")) ? "" : rawBase;

  // If URL has localhost:5000/uploads, point to current active backend base
  if (trimmed.includes("localhost:5000/uploads/")) {
    const filename = trimmed.split("localhost:5000/uploads/")[1];
    return `${backendBase}/uploads/${filename}`;
  }

  // If relative path starting with /uploads
  if (trimmed.startsWith("/uploads/")) {
    return `${backendBase}${trimmed}`;
  }

  return trimmed;
};

/**
 * Standard image onError handler to smoothly substitute fallback without infinite loops
 */
export const onImageError = (e, fallback) => {
  if (e.target.src !== fallback) {
    e.target.onerror = null; // Prevent infinite fallback loops
    e.target.src = fallback;
  }
};

