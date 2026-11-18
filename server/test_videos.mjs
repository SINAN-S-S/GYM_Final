import dotenv from "dotenv";
dotenv.config({ path: "./server/.env" });
import http from "http";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import app from "./app.js";
import connectDB from "./config/mongodb.js";
import WorkoutVideo from "./models/WorkoutVideo.js";

const PORT = 5566;
const BASE_URL = `http://localhost:${PORT}`;

const JWT_SECRET = process.env.JWT_SECRET || "_secret";

const ADMIN_ID = "69fa1cc2dc404fe5a4740882";
const adminToken = jwt.sign(
  { id: ADMIN_ID, role: "admin" },
  JWT_SECRET,
  { expiresIn: "1h" }
);

const userToken = jwt.sign(
  { id: "69fa1f37dc404fe5a4740883", role: "user" },
  JWT_SECRET,
  { expiresIn: "1h" }
);

const runTests = async () => {
  console.log("=== TESTING WORKOUT VIDEO LIBRARY BACKEND & API ===");

  await connectDB();
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`[Test Server] Running on ${BASE_URL}\n`);

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, meta = "") => {
    if (condition) {
      console.log(`[PASS] ${testName} ${meta ? "(" + meta + ")" : ""}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} ${meta ? "- " + meta : ""}`);
      failed++;
    }
  };

  try {
    // 1. Initial Fetch & Auto-Seeding
    const resAll = await fetch(`${BASE_URL}/api/workout-videos`);
    const allVideos = await resAll.json();
    assert(
      resAll.status === 200 && Array.isArray(allVideos) && allVideos.length >= 12,
      "GET /api/workout-videos: Auto-seeded verified library",
      `Count: ${allVideos.length}`
    );

    // 2. Category Coverage Check (All 8 Required Categories)
    const requiredCategories = [
      "Chest",
      "Back",
      "Legs",
      "Shoulders",
      "Arms",
      "Abs",
      "Cardio",
      "Full Body",
    ];
    const foundCategories = [...new Set(allVideos.map((v) => v.category))];
    const hasAllCategories = requiredCategories.every((cat) =>
      foundCategories.some((fc) => fc.toLowerCase() === cat.toLowerCase())
    );
    assert(hasAllCategories, "Category Coverage: All 8 required categories exist", foundCategories.join(", "));

    // 3. Category Filter
    const resChest = await fetch(`${BASE_URL}/api/workout-videos?category=Chest`);
    const chestVideos = await resChest.json();
    assert(
      resChest.status === 200 &&
        chestVideos.length > 0 &&
        chestVideos.every((v) => v.category === "Chest"),
      "Filter by Category (Chest)",
      `Found: ${chestVideos.length}`
    );

    // 4. Difficulty Filter
    const resBeginner = await fetch(`${BASE_URL}/api/workout-videos?difficulty=Beginner`);
    const beginnerVideos = await resBeginner.json();
    assert(
      resBeginner.status === 200 &&
        beginnerVideos.length > 0 &&
        beginnerVideos.every((v) => v.difficulty === "Beginner"),
      "Filter by Difficulty (Beginner)",
      `Found: ${beginnerVideos.length}`
    );

    // 5. Search by Name / Movement
    const resSearch = await fetch(`${BASE_URL}/api/workout-videos?search=Bench Press`);
    const searchVideos = await resSearch.json();
    assert(
      resSearch.status === 200 &&
        searchVideos.some((v) => v.title.includes("Bench Press")),
      "Search by Movement Name ('Bench Press')",
      `Matches: ${searchVideos.length}`
    );

    // 6. Search by Target Muscle
    const resMuscle = await fetch(`${BASE_URL}/api/workout-videos?search=Hamstring`);
    const muscleVideos = await resMuscle.json();
    assert(
      resMuscle.status === 200 && muscleVideos.length > 0,
      "Search by Targeted Muscle ('Hamstring')",
      `Matches: ${muscleVideos.length}`
    );

    // 7. Video Details & Related Videos Retrieval
    const targetVideo = allVideos[0];
    const initialViews = targetVideo.views || 0;
    const resDetail = await fetch(`${BASE_URL}/api/workout-videos/${targetVideo._id}`);
    const detailData = await resDetail.json();
    assert(
      resDetail.status === 200 &&
        detailData.video &&
        detailData.video.views === initialViews + 1,
      "GET /api/workout-videos/:id: View count incremented",
      `Views: ${detailData.video?.views}`
    );
    assert(
      Array.isArray(detailData.relatedVideos) && detailData.relatedVideos.length > 0,
      "Related Videos Generated",
      `Related count: ${detailData.relatedVideos?.length}`
    );

    // 8. Security Guard: Member / Non-admin cannot create or delete
    const resForbiddenCreate = await fetch(`${BASE_URL}/api/workout-videos`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Malicious Upload Attempt",
        description: "Should be blocked",
        category: "Chest",
        duration: 10,
        thumbnail: "https://example.com/thumb.jpg",
        videoUrl: "https://youtube.com/watch?v=123",
      }),
    });
    assert(
      resForbiddenCreate.status === 403,
      "Security: Regular user blocked from creating video (HTTP 403)",
      `Status: ${resForbiddenCreate.status}`
    );

    // 9. Admin Create Video
    const resAdminCreate = await fetch(`${BASE_URL}/api/workout-videos`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Incline Cable Flyes for Inner Upper Chest Definition",
        description: "Focus on continuous muscular tension, elbow angle, and peak contraction across the sternum.",
        category: "Chest",
        difficulty: "Intermediate",
        duration: 14,
        thumbnail: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop&q=80",
        videoUrl: "https://www.youtube.com/watch?v=taI4XduLpTk",
        targetedMuscles: ["Pectoralis Major Sternal Head", "Anterior Deltoid"],
        equipment: ["Dual Cable Cross", "D-Handles"],
        trainerName: "Coach Marcus Vance",
        isActive: true,
      }),
    });
    const createdData = await resAdminCreate.json();
    const createdId = createdData.video?._id;
    assert(
      resAdminCreate.status === 201 && createdId,
      "Admin: POST /api/workout-videos (Created successfully)",
      `ID: ${createdId}`
    );

    // 10. Admin Update Video
    const resAdminUpdate = await fetch(`${BASE_URL}/api/workout-videos/${createdId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        duration: 16,
        description: "Updated detailed coaching cues for scapular depression and peak squeeze.",
      }),
    });
    const updatedData = await resAdminUpdate.json();
    assert(
      resAdminUpdate.status === 200 && updatedData.video?.duration === 16,
      "Admin: PUT /api/workout-videos/:id (Updated duration & cues)",
      `Duration: ${updatedData.video?.duration}m`
    );

    // 11. Admin Toggle Status (Deactivate)
    const resDeactivate = await fetch(`${BASE_URL}/api/workout-videos/${createdId}/toggle-status`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const deactData = await resDeactivate.json();
    assert(
      resDeactivate.status === 200 && deactData.isActive === false,
      "Admin: PATCH /api/workout-videos/:id/toggle-status (Deactivated)",
      `isActive: ${deactData.isActive}`
    );

    // Verify deactivated video is hidden from public member listing
    const resMemberListing = await fetch(`${BASE_URL}/api/workout-videos`);
    const memberListing = await resMemberListing.json();
    assert(
      !memberListing.some((v) => v._id === createdId),
      "Visibility: Deactivated video is hidden from Member Video Library",
      "Hidden confirmed"
    );

    // 12. Admin Delete Video
    const resDelete = await fetch(`${BASE_URL}/api/workout-videos/${createdId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      resDelete.status === 200,
      "Admin: DELETE /api/workout-videos/:id (Safely removed)",
      `Status: ${resDelete.status}`
    );

    // Verify deletion
    const resCheckDeleted = await fetch(`${BASE_URL}/api/workout-videos/${createdId}`);
    assert(
      resCheckDeleted.status === 404,
      "Verification: Deleted video returns HTTP 404",
      `Status: ${resCheckDeleted.status}`
    );

    console.log("\n==========================================");
    console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log("==========================================\n");
  } catch (err) {
    console.error("Test execution error:", err);
  } finally {
    server.close();
    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
};

runTests();
