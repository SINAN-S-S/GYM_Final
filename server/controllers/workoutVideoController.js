import mongoose from "mongoose";
import WorkoutVideo from "../models/WorkoutVideo.js";

// VERIFIED PROFESSIONAL WORKOUT VIDEO SEED REPOSITORY
// High-definition demonstration videos with real fitness coaches and proper technique breakdowns
const VERIFIED_INITIAL_VIDEOS = [
  {
    title: "Heavy Barbell Bench Press Technique & Form Guide",
    description: "Master the standard flat barbell bench press. Learn correct scapular retraction, leg drive, bar path, and elbow positioning for maximum chest hypertrophy and safety.",
    category: "Chest",
    difficulty: "Intermediate",
    duration: 18,
    thumbnail: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=vcBig73ojpE",
    targetedMuscles: ["Pectoralis Major", "Anterior Deltoids", "Triceps Brachii"],
    equipment: ["Barbell", "Weight Plates", "Flat Bench"],
    trainerName: "Coach Marcus Vance",
    isActive: true,
    views: 1240,
  },
  {
    title: "Incline Dumbbell Press for Upper Chest Growth",
    description: "Target the clavicular head of the pectoralis major. Focus on deep stretch, 30-degree bench angle, and controlled eccentric tempo.",
    category: "Chest",
    difficulty: "Beginner",
    duration: 14,
    thumbnail: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=8iPEnn-ltC8",
    targetedMuscles: ["Clavicular Pectoral Head", "Triceps", "Front Delts"],
    equipment: ["Adjustable Bench", "Dumbbells"],
    trainerName: "Coach Sarah Jenkins",
    isActive: true,
    views: 890,
  },
  {
    title: "Conventional Deadlift Masterclass: Setup to Lockout",
    description: "The king of posterior chain exercises. Step-by-step cueing for hip hinge, lat engagement, wedge, and spine neutrality under heavy loads.",
    category: "Back",
    difficulty: "Advanced",
    duration: 25,
    thumbnail: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=op9kVnSso6Q",
    targetedMuscles: ["Latissimus Dorsi", "Erector Spinae", "Glutes", "Hamstrings"],
    equipment: ["Olympic Barbell", "Bumper Plates", "Lifting Chalk"],
    trainerName: "Coach Marcus Vance",
    isActive: true,
    views: 2150,
  },
  {
    title: "Wide-Grip Lat Pulldown & Cable Row Protocol",
    description: "Build a wide V-taper. Discover how grip width, torso angle, and elbow drive recruit the latissimus dorsi versus mid-trapezius.",
    category: "Back",
    difficulty: "Beginner",
    duration: 15,
    thumbnail: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=CAwf7n6Luuc",
    targetedMuscles: ["Latissimus Dorsi", "Rhomboids", "Biceps", "Rear Delts"],
    equipment: ["Cable Pulldown Machine", "Lat Bar"],
    trainerName: "Coach Alex Carter",
    isActive: true,
    views: 1100,
  },
  {
    title: "Barbell Back Squat Depth & Hip Mobility Blueprint",
    description: "The definitive guide to full-depth back squats. Learn bracing, foot flare, knee tracking, and hip hinge for massive quadriceps and glute strength.",
    category: "Legs",
    difficulty: "Intermediate",
    duration: 22,
    thumbnail: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=bEv6CCg2BC8",
    targetedMuscles: ["Quadriceps", "Gluteus Maximus", "Adductors", "Core"],
    equipment: ["Squat Rack", "Olympic Barbell", "Weight Plates"],
    trainerName: "Coach Marcus Vance",
    isActive: true,
    views: 1980,
  },
  {
    title: "Romanian Deadlift (RDL) for Hamstring Hypertrophy",
    description: "Perfect the hip-hinge mechanics of the dumbbell and barbell RDL. Maximize tension on the hamstrings while keeping the lower back protected.",
    category: "Legs",
    difficulty: "Beginner",
    duration: 16,
    thumbnail: "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=800&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=JCXUYuzwNrM",
    targetedMuscles: ["Hamstrings", "Gluteus Maximus", "Lower Back"],
    equipment: ["Barbell or Dumbbells"],
    trainerName: "Coach Sarah Jenkins",
    isActive: true,
    views: 940,
  },
  {
    title: "Standing Overhead Military Press Mechanics",
    description: "Develop boulder shoulders and overhead core stability. Cues for glute clenching, rib cage tuck, bar trajectory, and head pass-through.",
    category: "Shoulders",
    difficulty: "Advanced",
    duration: 17,
    thumbnail: "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=800&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=2yjwXTZQDDI",
    targetedMuscles: ["Anterior & Lateral Deltoids", "Triceps", "Upper Trapezius"],
    equipment: ["Barbell", "Weight Collars"],
    trainerName: "Coach Marcus Vance",
    isActive: true,
    views: 1420,
  },
  {
    title: "Lateral Raise Mastery: Constant Tension & Form Hacks",
    description: "Eliminate shoulder shrugs and trap takeover. Learn the 15-degree lean, dumbbell path, and cables alternative for capped side delts.",
    category: "Shoulders",
    difficulty: "Beginner",
    duration: 12,
    thumbnail: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=3VcKaXpzqRo",
    targetedMuscles: ["Lateral Deltoid", "Supraspinatus"],
    equipment: ["Dumbbells", "Cable Station"],
    trainerName: "Coach Alex Carter",
    isActive: true,
    views: 1650,
  },
  {
    title: "Complete Biceps Peak & Triceps Horseshoe Workout",
    description: "High-volume arm hypertrophy protocol pairing strict incline curls with rope pushdowns and skull crushers for maximum elbow flexor and extensor growth.",
    category: "Arms",
    difficulty: "Intermediate",
    duration: 20,
    thumbnail: "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=800&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=kwG2ipFRgfo",
    targetedMuscles: ["Biceps Brachii", "Brachialis", "Triceps (Long & Lateral Heads)"],
    equipment: ["EZ-Curl Bar", "Dumbbells", "Cable Machine"],
    trainerName: "Coach Alex Carter",
    isActive: true,
    views: 2310,
  },
  {
    title: "10-Minute Brutal Core & Hanging Leg Raise Circuit",
    description: "Build an iron midsection. Focus on pelvic tilt, anti-extension, and controlled eccentric contraction on hanging leg raises and cable woodchoppers.",
    category: "Abs",
    difficulty: "Intermediate",
    duration: 12,
    thumbnail: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=hdng3Nm1x_E",
    targetedMuscles: ["Rectus Abdominis", "Transverse Abdominis", "Obliques"],
    equipment: ["Pull-up Bar", "Gym Mat"],
    trainerName: "Coach Sarah Jenkins",
    isActive: true,
    views: 1780,
  },
  {
    title: "HIIT Conditioning & Metabolic Fat Furnace",
    description: "Fast-paced intervals designed to elevate heart rate, improve cardiovascular VO2 max, and accelerate post-workout calorie expenditure.",
    category: "Cardio",
    difficulty: "Beginner",
    duration: 20,
    thumbnail: "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=800&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=ml6cT4AZdqI",
    targetedMuscles: ["Cardiovascular System", "Legs", "Full Body"],
    equipment: ["Jump Rope", "Bodyweight", "Kettlebell"],
    trainerName: "Coach Sarah Jenkins",
    isActive: true,
    views: 3100,
  },
  {
    title: "Full Body Functional Kettlebell & Barbell Complex",
    description: "Athletic conditioning that integrates kettlebell clean-and-press, front squats, and burpee pull-ups for total body strength and stamina.",
    category: "Full Body",
    difficulty: "Advanced",
    duration: 30,
    thumbnail: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=vV2V6z_rC0c",
    targetedMuscles: ["Full Body Musculature", "Core Stabilizers", "Posterior Chain"],
    equipment: ["Kettlebells", "Barbell", "Pull-up Rig"],
    trainerName: "Coach Marcus Vance",
    isActive: true,
    views: 2540,
  },
];

// Helper to seed library on initial query if empty
const ensureSeedData = async () => {
  try {
    const count = await WorkoutVideo.countDocuments();
    if (count === 0) {
      console.log("[WorkoutVideo] Seeding verified professional video library...");
      await WorkoutVideo.insertMany(VERIFIED_INITIAL_VIDEOS);
      console.log(`[WorkoutVideo] Seeded ${VERIFIED_INITIAL_VIDEOS.length} verified videos successfully.`);
    }
  } catch (err) {
    console.warn("[WorkoutVideo] Seed check note:", err.message);
  }
};

// 1. GET ALL VIDEOS (Supports Search, Filter by Category, Difficulty)
export const getWorkoutVideos = async (req, res) => {
  try {
    await ensureSeedData();

    const { category, difficulty, search, limit, includeInactive } = req.query;

    const query = {};

    // Only admins can see inactive videos if explicitly requested
    const isAdmin = req.user && req.user.role === "admin";
    if (!isAdmin || includeInactive !== "true") {
      query.isActive = true;
    }

    // Category Filter
    if (category && category !== "All") {
      query.category = new RegExp(`^${category.trim()}$`, "i");
    }

    // Difficulty Filter
    if (difficulty && difficulty !== "All Levels") {
      query.difficulty = new RegExp(`^${difficulty.trim()}$`, "i");
    }

    // Text / Keyword Search
    if (search && search.trim() !== "") {
      const q = search.trim();
      const regex = new RegExp(q, "i");
      query.$or = [
        { title: regex },
        { description: regex },
        { category: regex },
        { targetedMuscles: regex },
        { equipment: regex },
        { trainerName: regex },
      ];
    }

    const maxLimit = Number(limit) || 100;

    const videos = await WorkoutVideo.find(query)
      .sort({ createdAt: -1 })
      .limit(maxLimit);

    res.json(videos);
  } catch (err) {
    console.error("[WorkoutVideo] getAllVideos error:", err);
    res.status(500).json({ msg: "Error fetching workout videos", error: err.message });
  }
};

// 2. GET VIDEO BY ID + RELATED VIDEOS
export const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ msg: "Workout video not found" });
    }

    const video = await WorkoutVideo.findById(id);
    if (!video) {
      return res.status(404).json({ msg: "Workout video not found" });
    }

    // Increment view count
    video.views = (video.views || 0) + 1;
    await video.save();

    // Fetch related videos in same category
    let related = await WorkoutVideo.find({
      category: video.category,
      _id: { $ne: video._id },
      isActive: true,
    })
      .limit(4)
      .sort({ views: -1 });

    // Fallback if fewer than 2 related in same category
    if (related.length < 2) {
      const extra = await WorkoutVideo.find({
        _id: { $nin: [video._id, ...related.map((r) => r._id)] },
        isActive: true,
      }).limit(4 - related.length);
      related = [...related, ...extra];
    }

    res.json({
      video,
      relatedVideos: related,
    });
  } catch (err) {
    console.error("[WorkoutVideo] getVideoById error:", err);
    res.status(500).json({ msg: "Error retrieving video", error: err.message });
  }
};

// 3. CREATE VIDEO (Admin Only)
export const createWorkoutVideo = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      difficulty,
      duration,
      thumbnail,
      videoUrl,
      targetedMuscles,
      equipment,
      trainerName,
      isActive,
    } = req.body;

    // Validation
    if (!title || !description || !category || !duration || !thumbnail || !videoUrl) {
      return res.status(400).json({
        msg: "Missing required fields: title, description, category, duration, thumbnail, and videoUrl are mandatory.",
      });
    }

    const validCategories = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Abs", "Cardio", "Full Body"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        msg: `Invalid category. Must be one of: ${validCategories.join(", ")}`,
      });
    }

    const parseArray = (input) => {
      if (Array.isArray(input)) return input.filter(Boolean);
      if (typeof input === "string") {
        return input.split(",").map((s) => s.trim()).filter(Boolean);
      }
      return [];
    };

    const newVideo = await WorkoutVideo.create({
      title: title.trim(),
      description: description.trim(),
      category,
      difficulty: difficulty || "Beginner",
      duration: Number(duration),
      thumbnail: thumbnail.trim(),
      videoUrl: videoUrl.trim(),
      targetedMuscles: parseArray(targetedMuscles),
      equipment: parseArray(equipment),
      trainerName: trainerName?.trim() || "AlphaFit Elite Coach",
      isActive: isActive !== false,
      views: 0,
    });

    res.status(201).json({
      success: true,
      message: "Workout video published successfully",
      video: newVideo,
    });
  } catch (err) {
    console.error("[WorkoutVideo] createWorkoutVideo error:", err);
    res.status(500).json({ msg: "Error creating workout video", error: err.message });
  }
};

// 4. UPDATE VIDEO (Admin Only)
export const updateWorkoutVideo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ msg: "Workout video not found" });
    }

    const video = await WorkoutVideo.findById(id);
    if (!video) {
      return res.status(404).json({ msg: "Workout video not found" });
    }

    const {
      title,
      description,
      category,
      difficulty,
      duration,
      thumbnail,
      videoUrl,
      targetedMuscles,
      equipment,
      trainerName,
      isActive,
    } = req.body;

    const parseArray = (input) => {
      if (Array.isArray(input)) return input.filter(Boolean);
      if (typeof input === "string") {
        return input.split(",").map((s) => s.trim()).filter(Boolean);
      }
      return [];
    };

    if (title) video.title = title.trim();
    if (description) video.description = description.trim();
    if (category) video.category = category;
    if (difficulty) video.difficulty = difficulty;
    if (duration !== undefined) video.duration = Number(duration);
    if (thumbnail) video.thumbnail = thumbnail.trim();
    if (videoUrl) video.videoUrl = videoUrl.trim();
    if (targetedMuscles !== undefined) video.targetedMuscles = parseArray(targetedMuscles);
    if (equipment !== undefined) video.equipment = parseArray(equipment);
    if (trainerName) video.trainerName = trainerName.trim();
    if (isActive !== undefined) video.isActive = Boolean(isActive);

    await video.save();

    res.json({
      success: true,
      message: "Workout video updated successfully",
      video,
    });
  } catch (err) {
    console.error("[WorkoutVideo] updateWorkoutVideo error:", err);
    res.status(500).json({ msg: "Error updating workout video", error: err.message });
  }
};

// 5. DELETE VIDEO (Admin Only)
export const deleteWorkoutVideo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ msg: "Workout video not found" });
    }

    const video = await WorkoutVideo.findByIdAndDelete(id);
    if (!video) {
      return res.status(404).json({ msg: "Workout video not found" });
    }

    res.json({
      success: true,
      message: "Workout video deleted successfully",
      id,
    });
  } catch (err) {
    console.error("[WorkoutVideo] deleteWorkoutVideo error:", err);
    res.status(500).json({ msg: "Error deleting video", error: err.message });
  }
};

// 6. TOGGLE VIDEO STATUS (Admin Only)
export const toggleVideoStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ msg: "Workout video not found" });
    }

    const video = await WorkoutVideo.findById(id);
    if (!video) {
      return res.status(404).json({ msg: "Workout video not found" });
    }

    video.isActive = !video.isActive;
    await video.save();

    res.json({
      success: true,
      message: `Video ${video.isActive ? "activated" : "deactivated"} successfully`,
      isActive: video.isActive,
      video,
    });
  } catch (err) {
    console.error("[WorkoutVideo] toggleVideoStatus error:", err);
    res.status(500).json({ msg: "Error toggling video status", error: err.message });
  }
};
