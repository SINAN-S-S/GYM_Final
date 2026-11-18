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

// Curated Trainer High-Res Portraits
export const TRAINER_FALLBACK_IMAGES = {
  afsal: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
  shamil: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=1000&auto=format&fit=crop",
  salman: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000&auto=format&fit=crop",
  anas: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1000&auto=format&fit=crop",
  shibil: "https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?q=80&w=1000&auto=format&fit=crop",
  misriya: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1000&auto=format&fit=crop",
  default_trainer: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1000&auto=format&fit=crop",
};

// Curated Workout Program Covers
export const PROGRAM_FALLBACK_IMAGES = {
  fat_loss: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000&auto=format&fit=crop",
  muscle_gain: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000&auto=format&fit=crop",
  home: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=1000&auto=format&fit=crop",
  strength: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop",
  athlete: "https://images.unsplash.com/photo-1483721310020-03333e577078?q=80&w=1000&auto=format&fit=crop",
  weight_gain: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1000&auto=format&fit=crop",
  default_program: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop",
};

// Curated Workout Routine Covers
export const WORKOUT_FALLBACK_IMAGES = {
  strength: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop",
  beginner: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000&auto=format&fit=crop",
  hiit: "https://images.unsplash.com/photo-1483721310020-03333e577078?q=80&w=1000&auto=format&fit=crop",
  default_workout: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop",
};

/**
 * Returns a high-res matching fallback image based on trainer name or expertise.
 */
export const getTrainerFallbackImage = (name = "", expertise = "") => {
  const text = `${name} ${expertise}`.toLowerCase();
  if (text.includes("misriya") || text.includes("female") || text.includes("yoga") || text.includes("pilates")) {
    return TRAINER_FALLBACK_IMAGES.misriya;
  }
  if (text.includes("afsal") || text.includes("bodybuilding")) return TRAINER_FALLBACK_IMAGES.afsal;
  if (text.includes("shamil") || text.includes("crossfit")) return TRAINER_FALLBACK_IMAGES.shamil;
  if (text.includes("salman") || text.includes("hiit")) return TRAINER_FALLBACK_IMAGES.salman;
  if (text.includes("anas") || text.includes("powerlifting")) return TRAINER_FALLBACK_IMAGES.anas;
  if (text.includes("shibil") || text.includes("rehab") || text.includes("mobility")) return TRAINER_FALLBACK_IMAGES.shibil;
  return TRAINER_FALLBACK_IMAGES.default_trainer;
};

/**
 * Returns a high-res matching fallback image based on program title.
 */
export const getProgramFallbackImage = (title = "") => {
  const t = (title || "").toLowerCase();
  if (t.includes("fat loss") || t.includes("cut") || t.includes("shred")) {
    return PROGRAM_FALLBACK_IMAGES.fat_loss;
  }
  if (t.includes("muscle gain") || t.includes("hypertrophy") || t.includes("pro")) {
    return PROGRAM_FALLBACK_IMAGES.muscle_gain;
  }
  if (t.includes("home")) {
    return PROGRAM_FALLBACK_IMAGES.home;
  }
  if (t.includes("strength") || t.includes("conditioning")) {
    return PROGRAM_FALLBACK_IMAGES.strength;
  }
  if (t.includes("athlete")) {
    return PROGRAM_FALLBACK_IMAGES.athlete;
  }
  if (t.includes("weight gain") || t.includes("mass")) {
    return PROGRAM_FALLBACK_IMAGES.weight_gain;
  }
  return PROGRAM_FALLBACK_IMAGES.default_program;
};

/**
 * Returns a high-res matching fallback image based on workout title.
 */
export const getWorkoutFallbackImage = (title = "") => {
  const t = (title || "").toLowerCase();
  if (t.includes("beginner")) return WORKOUT_FALLBACK_IMAGES.beginner;
  if (t.includes("strength") || t.includes("heavy") || t.includes("upper") || t.includes("lower")) {
    return WORKOUT_FALLBACK_IMAGES.strength;
  }
  if (t.includes("hiit") || t.includes("cardio") || t.includes("conditioning")) {
    return WORKOUT_FALLBACK_IMAGES.hiit;
  }
  return WORKOUT_FALLBACK_IMAGES.default_workout;
};

/**
 * Returns a high-res matching fallback image for whole foods macro items.
 */
export const getFoodFallbackImage = (name = "") => {
  const t = (name || "").toLowerCase();
  if (t.includes("bar")) return "https://images.unsplash.com/photo-1622484212850-eb596d769edc?q=80&w=1000&auto=format&fit=crop";
  if (t.includes("gainer")) return PRODUCT_FALLBACK_IMAGES.mass_gainer;
  if (t.includes("oat")) return "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=1000&auto=format&fit=crop";
  if (t.includes("butter") || t.includes("peanut")) return "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=1000&auto=format&fit=crop";
  return "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1000&auto=format&fit=crop";
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
  if (text.includes("shaker")) {
    return "https://www.optimumnutrition.com/cdn/shop/files/C101268_Image_01_aligned.png?v=1787732132&width=1000";
  }
  if (text.includes("glove")) {
    return "https://pngimg.com/uploads/gloves/gloves_PNG80314.png";
  }
  if (text.includes("dumbbell")) {
    return "https://pngimg.com/uploads/dumbbell/dumbbell_PNG16378.png";
  }
  if (text.includes("yoga") || text.includes("mat")) {
    return "https://www.pngmart.com/files/5/Yoga-Mat-PNG-Transparent-Image.png";
  }
  if (text.includes("belt")) {
    return "https://pngimg.com/uploads/belt/belt_PNG9570.png";
  }
  if (text.includes("rope")) {
    return "https://pngimg.com/uploads/rope/rope_PNG18080.png";
  }
  if (text.includes("bag") || text.includes("duffel")) {
    return "https://pngimg.com/uploads/backpack/backpack_PNG6353.png";
  }
  if (text.includes("bottle") || text.includes("flask")) {
    return "https://pngimg.com/uploads/water_bottle/water_bottle_PNG10152.png";
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
  const DEFAULT_PROD_BACKEND = "https://gym-final-3uya.vercel.app";
  const DEFAULT_DEV_BACKEND = "http://localhost:5000";
  const isLocal = typeof window !== "undefined" && window.location && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  const getBackendBase = () => {
    if (isLocal) return DEFAULT_DEV_BACKEND;
    const configured = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "").replace(/\/api$/, "");
    const isObsolete = /localhost|127\.0\.0\.1|gym-final-u29p|onrender|gym-final-five|gym-final-qsuh/.test(configured);
    if (!configured || isObsolete) return DEFAULT_PROD_BACKEND;
    return configured;
  };
  const backendBase = getBackendBase();

  // If in production and URL points to localhost:5000, replace host with active backend base
  if (!isLocal && (trimmed.includes("localhost:5000") || trimmed.includes("127.0.0.1:5000"))) {
    return trimmed.replace(/^https?:\/\/(localhost|127\.0\.0\.1):5000/, backendBase);
  }

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

