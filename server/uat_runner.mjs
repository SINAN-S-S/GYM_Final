import jwt from "jsonwebtoken";
import crypto from "crypto";

const BACKEND_URL = "https://gym-final-3uya.vercel.app";
const JWT_SECRET = process.env.JWT_SECRET || "_secret";

const ADMIN_ID = "69fa1cc2dc404fe5a4740882";
const adminToken = jwt.sign(
  { id: ADMIN_ID, role: "admin" },
  JWT_SECRET,
  { expiresIn: "2h" }
);

const results = {
  passed: [],
  failed: [],
  details: []
};

const assert = (condition, testName, meta = "") => {
  if (condition) {
    console.log(`[PASS] ${testName} ${meta ? "(" + meta + ")" : ""}`);
    results.passed.push(testName);
  } else {
    console.error(`[FAIL] ${testName} ${meta ? "- " + meta : ""}`);
    results.failed.push({ testName, meta });
  }
};

const runUAT = async () => {
  console.log("=================================================================");
  console.log("ALPHAFIT PRODUCTION USER ACCEPTANCE TESTING & SECURITY AUDIT");
  console.log(`Target Backend: ${BACKEND_URL}`);
  console.log("=================================================================\n");

  const timestamp = Date.now();
  const testEmailA = `uat_athlete_a_${timestamp}@alphafit.com`;
  const testEmailB = `uat_athlete_b_${timestamp}@alphafit.com`;
  const testPassword = "AlphaPass_2026!";

  let tokenA = "";
  let userA = null;
  let tokenB = "";
  let userB = null;

  try {
    // -------------------------------------------------------------
    // SECTION 1: REAL USER REGISTRATION & AUTHENTICATION
    // -------------------------------------------------------------
    console.log("\n--- 1. REAL USER REGISTRATION & LOGIN ---");
    
    // Register Member A
    const regResA = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: `AthleteA_${timestamp.toString().slice(-4)}`,
        email: testEmailA,
        password: testPassword,
        phone: "9876500001",
        weight: 76,
        height: 180,
        goal: "Hypertrophy & Strength"
      })
    });
    const regDataA = await regResA.json();
    assert(regResA.status === 201 && regDataA.token, "Register New Member A", `Status: ${regResA.status}`);
    userA = regDataA.user;

    // Login Member A
    const loginResA = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmailA, password: testPassword })
    });
    const loginDataA = await loginResA.json();
    assert(loginResA.status === 200 && loginDataA.token, "Login Member A with Credentials", `Status: ${loginResA.status}`);
    tokenA = loginDataA.token;

    const headersA = {
      Authorization: `Bearer ${tokenA}`,
      "Content-Type": "application/json"
    };

    // -------------------------------------------------------------
    // SECTION 2: PROFILE PAGE & EDITING PERSISTENCE
    // -------------------------------------------------------------
    console.log("\n--- 2. PROFILE LOADING & EDITING ---");

    const profRes = await fetch(`${BACKEND_URL}/api/users/profile`, { headers: headersA });
    const profData = await profRes.json();
    assert(profRes.status === 200 && profData.email === testEmailA, "Profile Initial Data Load", `Email: ${profData.email}`);

    // Update Profile
    const updateRes = await fetch(`${BACKEND_URL}/api/users/profile`, {
      method: "PUT",
      headers: headersA,
      body: JSON.stringify({
        phone: "9123456789",
        weight: 79,
        height: 181,
        goal: "Fat Loss & Conditioning"
      })
    });
    const updateData = await updateRes.json();
    assert(updateRes.status === 200 && updateData.phone === "9123456789", "Profile Edit & Save", `Phone: ${updateData.phone}`);

    // Verify Data Remains After Re-fetch (Persistence Check)
    const reProfRes = await fetch(`${BACKEND_URL}/api/users/profile`, { headers: headersA });
    const reProfData = await reProfRes.json();
    assert(
      reProfRes.status === 200 && reProfData.phone === "9123456789" && reProfData.weight === 79,
      "Profile Data Persistence After Re-fetch",
      `Weight: ${reProfData.weight}, Goal: ${reProfData.goal}`
    );

    // -------------------------------------------------------------
    // SECTION 3: ALL 9 MEMBER DASHBOARD TABS
    // -------------------------------------------------------------
    console.log("\n--- 3. ALL 9 MEMBER DASHBOARD TABS ---");

    // Tab 1: Overview & Access Status
    const accessRes = await fetch(`${BACKEND_URL}/api/users/access-status`, { headers: headersA });
    const accessData = await accessRes.json();
    assert(accessRes.status === 200 && typeof accessData.isLocked === "boolean", "Tab 1: Member Access Status Loaded", `Locked: ${accessData.isLocked}`);

    // Tab 2: Workouts (Log & Fetch)
    const logWorkoutRes = await fetch(`${BACKEND_URL}/api/workout-logs`, {
      method: "POST",
      headers: headersA,
      body: JSON.stringify({
        title: "Alpha Chest Destruction",
        category: "Chest",
        durationMinutes: 45,
        caloriesBurned: 380,
        exercises: [
          { name: "Incline Barbell Bench Press", sets: [{ reps: 10, weight: 80 }] }
        ],
        notes: "UAT automated workout log verification"
      })
    });
    const logWorkoutData = await logWorkoutRes.json();
    assert(logWorkoutRes.status === 201 && logWorkoutData.log?._id, "Tab 2: Log New Workout", `ID: ${logWorkoutData.log?._id}`);

    const getWorkoutsRes = await fetch(`${BACKEND_URL}/api/workout-logs/my`, { headers: headersA });
    const getWorkoutsData = await getWorkoutsRes.json();
    const workoutList = getWorkoutsData.logs || (Array.isArray(getWorkoutsData) ? getWorkoutsData : []);
    assert(
      getWorkoutsRes.status === 200 && workoutList.some((w) => w.title === "Alpha Chest Destruction"),
      "Tab 2: Workout History Retrieval",
      `Count: ${workoutList.length}`
    );

    // Tab 3: Body Progress & BMI
    const saveProgressRes = await fetch(`${BACKEND_URL}/api/progress`, {
      method: "POST",
      headers: headersA,
      body: JSON.stringify({
        weight: 79,
        height: 181,
        bodyFat: 14.5,
        chest: 104,
        waist: 82,
        arms: 38,
        notes: "UAT body progress log"
      })
    });
    const saveProgressData = await saveProgressRes.json();
    assert(saveProgressRes.status === 201 && (saveProgressData.progress?._id || saveProgressData._id), "Tab 3: Add Body Progress Log", `Status: ${saveProgressRes.status}`);

    const getProgressRes = await fetch(`${BACKEND_URL}/api/progress/my`, { headers: headersA });
    const getProgressData = await getProgressRes.json();
    const progressList = Array.isArray(getProgressData) ? getProgressData : (getProgressData.progress || []);
    assert(getProgressRes.status === 200 && progressList.length > 0, "Tab 3: Progress History & Chart Data", `Count: ${progressList.length}`);

    // Tab 4: Diet & Macros
    const dietRes = await fetch(`${BACKEND_URL}/api/diet-plans/my`, { headers: headersA });
    const dietData = await dietRes.json();
    assert(dietRes.status === 200 && dietData, "Tab 4: Diet Plan & Macros Retrieval", `Target Calories: ${dietData.dailyCalories || "Default Macro Profile"}`);

    // Tab 5: Attendance & QR Check-in
    const qrRes = await fetch(`${BACKEND_URL}/api/attendance/my-qr`, { headers: headersA });
    const qrData = await qrRes.json();
    assert(qrRes.status === 200 && qrData.qrToken, "Tab 5: Member QR Pass Generation", `Token: ${qrData.qrToken.slice(0, 18)}...`);

    const checkInRes = await fetch(`${BACKEND_URL}/api/attendance/check-in`, {
      method: "POST",
      headers: headersA,
      body: JSON.stringify({ qrToken: qrData.qrToken, method: "QR_SCAN" })
    });
    const checkInData = await checkInRes.json();
    assert(checkInRes.status === 201 && checkInData.attendance, "Tab 5: QR Attendance Check-In", `Check-In Time: ${checkInData.attendance?.checkInTime}`);

    // Duplicate Check-In Prevention (Data Integrity)
    const dupCheckInRes = await fetch(`${BACKEND_URL}/api/attendance/check-in`, {
      method: "POST",
      headers: headersA,
      body: JSON.stringify({ qrToken: qrData.qrToken, method: "QR_SCAN" })
    });
    assert(dupCheckInRes.status === 409, "Tab 5: Duplicate Attendance Check-In Blocked", `Status: ${dupCheckInRes.status} (Conflict)`);

    const attHistRes = await fetch(`${BACKEND_URL}/api/attendance/my-history`, { headers: headersA });
    const attHistData = await attHistRes.json();
    const attList = attHistData.history || attHistData.records || (Array.isArray(attHistData) ? attHistData : []);
    assert(attHistRes.status === 200 && attList.length >= 1, "Tab 5: Attendance History & Streak Tracking", `Visits: ${attList.length}, Streak: ${attHistData.streak || 1}`);

    // Tab 6: Trainers & Appointments
    const trainersRes = await fetch(`${BACKEND_URL}/api/trainers`);
    const trainersList = await trainersRes.json();
    assert(trainersRes.status === 200 && trainersList.length > 0, "Tab 6: Trainer Directory Loaded", `Found ${trainersList.length} Trainers`);

    const targetTrainer = trainersList[0];
    const bookingDate = new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0];
    const bookingSlot = "02:00 PM - 03:00 PM";

    const bookRes = await fetch(`${BACKEND_URL}/api/bookings`, {
      method: "POST",
      headers: headersA,
      body: JSON.stringify({
        trainer: targetTrainer._id,
        sessionDate: bookingDate,
        timeSlot: bookingSlot,
        notes: "UAT Trainer Booking Test"
      })
    });
    const bookData = await bookRes.json();
    const bookingId = bookData.booking?._id || bookData._id;
    assert(bookRes.status === 201 && bookingId, "Tab 6: Book Trainer Appointment", `Booking ID: ${bookingId}`);

    // Duplicate Booking Prevention (Data Integrity)
    const dupBookRes = await fetch(`${BACKEND_URL}/api/bookings`, {
      method: "POST",
      headers: headersA,
      body: JSON.stringify({
        trainer: targetTrainer._id,
        sessionDate: bookingDate,
        timeSlot: bookingSlot,
        notes: "UAT Duplicate Booking Attempt"
      })
    });
    assert(dupBookRes.status === 409, "Tab 6: Duplicate Trainer Booking Blocked", `Status: ${dupBookRes.status} (Conflict)`);

    const myBookingsRes = await fetch(`${BACKEND_URL}/api/bookings/mybookings`, { headers: headersA });
    const myBookings = await myBookingsRes.json();
    assert(myBookingsRes.status === 200 && myBookings.some((b) => b._id === bookingId), "Tab 6: User Bookings List Retrieval", `Count: ${myBookings.length}`);

    // Cancel Booking
    const cancelRes = await fetch(`${BACKEND_URL}/api/bookings/${bookingId}/cancel`, {
      method: "PUT",
      headers: headersA
    });
    assert(cancelRes.status === 200, "Tab 6: Cancel Trainer Appointment", `Status: ${cancelRes.status}`);

    // Tab 7: Challenges & Leaderboard
    const chalRes = await fetch(`${BACKEND_URL}/api/challenges`, { headers: headersA });
    const chalList = await chalRes.json();
    assert(chalRes.status === 200 && Array.isArray(chalList), "Tab 7: Challenges Directory Loaded", `Challenges: ${chalList.length}`);

    if (chalList.length > 0) {
      const joinRes = await fetch(`${BACKEND_URL}/api/challenges/${chalList[0]._id}/join`, {
        method: "POST",
        headers: headersA
      });
      assert(joinRes.status === 200 || joinRes.status === 201, "Tab 7: Join Fitness Challenge", `Challenge: ${chalList[0].title}`);
    }

    const leaderRes = await fetch(`${BACKEND_URL}/api/challenges/leaderboard`, { headers: headersA });
    const leaderData = await leaderRes.json();
    assert(leaderRes.status === 200 && Array.isArray(leaderData), "Tab 7: Community Leaderboard Loaded", `Athletes: ${leaderData.length}`);

    // Tab 8: Membership & Purchases
    const plansRes = await fetch(`${BACKEND_URL}/api/memberships/plans`);
    const plansData = await plansRes.json();
    assert(plansRes.status === 200 && Array.isArray(plansData) && plansData.length > 0, "Tab 8: Membership Plans Loaded", `Plans: ${plansData.length}`);

    const myPurchasesRes = await fetch(`${BACKEND_URL}/api/purchases/my-purchases`, { headers: headersA });
    const myPurchasesData = await myPurchasesRes.json();
    assert(myPurchasesRes.status === 200 && Array.isArray(myPurchasesData), "Tab 8: Purchase History Loaded", `Purchases: ${myPurchasesData.length}`);

    // Tab 9: Notifications
    const notifRes = await fetch(`${BACKEND_URL}/api/notifications/my`, { headers: headersA });
    const notifData = await notifRes.json();
    const notifList = notifData.notifications || notifData || [];
    assert(notifRes.status === 200 && Array.isArray(notifList), "Tab 9: Notifications Loaded", `Count: ${notifList.length}`);

    // AI Fitness Assistant & Gemini Live / Fallback Verification
    console.log("\n--- AI ASSISTANT / GEMINI TESTING ---");
    const aiRes = await fetch(`${BACKEND_URL}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "What is progressive overload and how to apply it?" })
    });
    const aiData = await aiRes.json();
    assert(
      aiRes.status === 200 && aiData.reply && (aiData.source === "gemini_live" || aiData.source === "alphafit_verified_protocol"),
      "AI Fitness Assistant Response",
      `Source: ${aiData.source}`
    );

    // AI Safety Filter Test
    const aiEmergencyRes = await fetch(`${BACKEND_URL}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "I am having chest pain and numbness in my left arm" })
    });
    const aiEmergencyData = await aiEmergencyRes.json();
    assert(
      aiEmergencyRes.status === 200 && aiEmergencyData.source === "safety_alert",
      "AI Medical Safety Guard (Immediate Emergency Referral)",
      `Source: ${aiEmergencyData.source}`
    );

    // -------------------------------------------------------------
    // SECTION 4: SECURITY & AUTHORIZATION TESTS
    // -------------------------------------------------------------
    console.log("\n--- 4. SECURITY & AUTHORIZATION TESTING ---");

    // 4.1 Unauthenticated Request to Protected Route
    const noAuthRes = await fetch(`${BACKEND_URL}/api/users/profile`);
    assert(noAuthRes.status === 401, "Security: Missing Token Blocked with 401", `Status: ${noAuthRes.status}`);

    // 4.2 Malformed/Invalid Token
    const badTokenRes = await fetch(`${BACKEND_URL}/api/users/profile`, {
      headers: { Authorization: "Bearer fake_invalid_jwt_tampered_123" }
    });
    assert(badTokenRes.status === 401, "Security: Invalid/Tampered Token Blocked with 401", `Status: ${badTokenRes.status}`);

    // 4.3 Member Forbidden from Admin Stats API
    const memberToAdminStats = await fetch(`${BACKEND_URL}/api/admin/dashboard-stats`, { headers: headersA });
    assert(memberToAdminStats.status === 403, "Security: Member Blocked from Admin Stats with 403", `Status: ${memberToAdminStats.status}`);

    // 4.4 Member Forbidden from Admin Users API
    const memberToAdminUsers = await fetch(`${BACKEND_URL}/api/admin/users`, { headers: headersA });
    assert(memberToAdminUsers.status === 403, "Security: Member Blocked from Admin Users with 403", `Status: ${memberToAdminUsers.status}`);

    // 4.5 Member Forbidden from Admin Broadcast API
    const memberToBroadcast = await fetch(`${BACKEND_URL}/api/admin/broadcast`, {
      method: "POST",
      headers: headersA,
      body: JSON.stringify({ message: "Unauthorized broadcast attempt", type: "urgent" })
    });
    assert(memberToBroadcast.status === 403, "Security: Member Blocked from Admin Broadcast with 403", `Status: ${memberToBroadcast.status}`);

    // 4.6 Cross-Member Data Isolation
    // Register Member B
    const regResB = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: `AthleteB_${timestamp.toString().slice(-4)}`,
        email: testEmailB,
        password: testPassword,
        phone: "9876500002",
        weight: 82,
        height: 185,
        goal: "Strength & Power"
      })
    });
    const regDataB = await regResB.json();
    tokenB = regDataB.token;
    userB = regDataB.user;

    const headersB = {
      Authorization: `Bearer ${tokenB}`,
      "Content-Type": "application/json"
    };

    // Member B reads their own workouts (should be empty, never see Member A's logs)
    const workoutsBRes = await fetch(`${BACKEND_URL}/api/workout-logs/my`, { headers: headersB });
    const workoutsBData = await workoutsBRes.json();
    const listB = workoutsBData.logs || workoutsBData || [];
    assert(
      workoutsBRes.status === 200 && !listB.some((w) => w.workoutName === "Alpha Chest Destruction"),
      "Security: Cross-Member Workout Isolation (Member B cannot view Member A's logs)",
      `Member B Logs Count: ${listB.length}`
    );

    // Member B reads their own attendance (should be 0, never see Member A's check-in)
    const attBRes = await fetch(`${BACKEND_URL}/api/attendance/my-history`, { headers: headersB });
    const attBData = await attBRes.json();
    const attBList = attBData.history || attBData.records || (Array.isArray(attBData) ? attBData : []);
    assert(
      attBRes.status === 200 && attBList.length === 0,
      "Security: Cross-Member Attendance Isolation (Member B cannot view Member A's check-in)",
      `Member B Visits: ${attBList.length}`
    );

    // 4.7 Password Hash Leakage Audit
    assert(!profData.password, "Security: Password Excluded from Profile API Response", "Field 'password' is omitted");
    assert(!loginDataA.user?.password, "Security: Password Excluded from Auth Login Payload", "Field 'password' is omitted");

    // -------------------------------------------------------------
    // SECTION 5: ADMIN OPERATIONS TESTING
    // -------------------------------------------------------------
    console.log("\n--- 5. ADMIN CONTROL PANEL OPERATIONS ---");

    const adminHeaders = {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "application/json"
    };

    // 5.1 Admin Dashboard Stats
    const adminStatsRes = await fetch(`${BACKEND_URL}/api/admin/dashboard-stats`, { headers: adminHeaders });
    const adminStatsData = await adminStatsRes.json();
    assert(
      adminStatsRes.status === 200 && adminStatsData.totalUsers > 0,
      "Admin: Dashboard Statistics Loaded",
      `Users: ${adminStatsData.totalUsers}, Workouts: ${adminStatsData.totalWorkouts}`
    );

    // 5.2 Admin Users List
    const adminUsersRes = await fetch(`${BACKEND_URL}/api/admin/users`, { headers: adminHeaders });
    const adminUsersData = await adminUsersRes.json();
    assert(
      adminUsersRes.status === 200 && Array.isArray(adminUsersData) && adminUsersData.length > 0,
      "Admin: Users Management Directory Loaded",
      `Users in DB: ${adminUsersData.length}`
    );

    // 5.3 Admin Attendance Audit
    const adminAttRes = await fetch(`${BACKEND_URL}/api/attendance/all`, { headers: adminHeaders });
    const adminAttData = await adminAttRes.json();
    const adminAttList = adminAttData.records || adminAttData.logs || [];
    assert(
      adminAttRes.status === 200 && Array.isArray(adminAttList),
      "Admin: Global Attendance Audit Logs",
      `Records: ${adminAttList.length}`
    );

    // 5.4 Admin Bookings Directory
    const adminBookingsRes = await fetch(`${BACKEND_URL}/api/bookings`, { headers: adminHeaders });
    const adminBookingsData = await adminBookingsRes.json();
    assert(
      adminBookingsRes.status === 200 && Array.isArray(adminBookingsData),
      "Admin: Global Trainer Bookings Directory",
      `Total Bookings: ${adminBookingsData.length}`
    );

    // 5.5 Admin Broadcast Message Create & Delete
    const broadcastCreateRes = await fetch(`${BACKEND_URL}/api/admin/broadcast`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify({
        message: `UAT Gym Alert: Facility hours extended for competition week (${timestamp})`,
        type: "info"
      })
    });
    const broadcastCreateData = await broadcastCreateRes.json();
    const broadcastId = broadcastCreateData.broadcast?._id;
    assert(broadcastCreateRes.status === 201 && broadcastId, "Admin: Publish Member Broadcast", `ID: ${broadcastId}`);

    if (broadcastId) {
      const broadcastDelRes = await fetch(`${BACKEND_URL}/api/admin/broadcast/${broadcastId}`, {
        method: "DELETE",
        headers: adminHeaders
      });
      assert(broadcastDelRes.status === 200, "Admin: Clean up / Delete Member Broadcast", `Status: ${broadcastDelRes.status}`);
    }

    // 5.6 Admin User Block / Unblock Lifecycle
    // Block Member B
    const blockRes = await fetch(`${BACKEND_URL}/api/admin/users/${userB._id || userB.id}/block`, {
      method: "PUT",
      headers: adminHeaders
    });
    assert(blockRes.status === 200, "Admin: Suspend / Block Member Account", `User: ${userB.username}`);

    // Verify Blocked Member is rejected at login
    const blockedLoginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmailB, password: testPassword })
    });
    assert(blockedLoginRes.status === 403, "Security: Suspended Member Login Denied with 403", `Status: ${blockedLoginRes.status}`);

    // Restore Member B
    const restoreRes = await fetch(`${BACKEND_URL}/api/admin/users/${userB._id || userB.id}/restore`, {
      method: "PUT",
      headers: adminHeaders
    });
    assert(restoreRes.status === 200, "Admin: Restore / Unblock Member Account", `Status: ${restoreRes.status}`);

    // -------------------------------------------------------------
    // SECTION 6: RAZORPAY PAYMENT GATEWAY AUDIT
    // -------------------------------------------------------------
    console.log("\n--- 6. RAZORPAY PAYMENT GATEWAY AUDIT ---");

    const orderRes = await fetch(`${BACKEND_URL}/api/payment/order`, {
      method: "POST",
      headers: headersA,
      body: JSON.stringify({ amount: 99, currency: "INR" })
    });
    const orderData = await orderRes.json();
    assert(orderRes.status === 200 && orderData.id, "Razorpay: Create Order ID", `Order ID: ${orderData.id}`);

    if (orderData.id) {
      // Test Tampered / Invalid Signature Rejection
      const badVerifyRes = await fetch(`${BACKEND_URL}/api/payment/verify`, {
        method: "POST",
        headers: headersA,
        body: JSON.stringify({
          razorpay_order_id: orderData.id,
          razorpay_payment_id: "pay_tampered_fake_999",
          razorpay_signature: "tampered_signature_hash_000"
        })
      });
      assert(badVerifyRes.status === 400, "Razorpay Security: Tampered Signature Rejected with 400", `Status: ${badVerifyRes.status}`);
    }

  } catch (err) {
    console.error("\n[FATAL ERROR during UAT execution]:", err);
    results.failed.push({ testName: "UAT Fatal Execution Error", meta: err.message });
  }

  console.log("\n=================================================================");
  console.log(`UAT SUMMARY: PASSED: ${results.passed.length} | FAILED: ${results.failed.length}`);
  console.log("=================================================================");
  
  if (results.failed.length > 0) {
    console.log("\nFAILED TESTS LIST:");
    console.log(JSON.stringify(results.failed, null, 2));
    process.exit(1);
  } else {
    console.log("\nALL ACCEPTANCE AND SECURITY TESTS PASSED WITH 100% SUCCESS!");
    process.exit(0);
  }
};

runUAT();
