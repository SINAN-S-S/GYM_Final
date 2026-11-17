import "dotenv/config";
import app from "./app.js";
import http from "http";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import crypto from "crypto";

import connectDB from "./config/mongodb.js";

const PORT = 5555;
const BASE_URL = `http://localhost:${PORT}`;

const runTests = async () => {
  console.log("=== STARTING FULL END-TO-END AUDIT & VERIFICATION ===");

  await connectDB();
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`[Test Server] Running on ${BASE_URL}`);

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = "") => {
    if (condition) {
      console.log(` PASS: ${testName}`);
      passed++;
    } else {
      console.error(` FAIL: ${testName} ${details ? "- " + details : ""}`);
      failed++;
    }
  };

  try {
    // 1. Database Connection & Collections
    assert(mongoose.connection.readyState === 1, "Database Connected (MongoDB Fitness)");

    // Generate tokens for testing
    const adminToken = jwt.sign(
      { id: "69fa1cc2dc404fe5a4740882", role: "admin" },
      process.env.JWT_SECRET || "_secret",
      { expiresIn: "1h" }
    );

    const userToken = jwt.sign(
      { id: "69fa1f37dc404fe5a4740883", role: "user" },
      process.env.JWT_SECRET || "_secret",
      { expiresIn: "1h" }
    );

    // 2. Base Route
    const resHome = await fetch(`${BASE_URL}/`);
    const homeJson = await resHome.json();
    assert(resHome.status === 200 && homeJson.success, "GET / (Server Health Check)");

    // 3. Workouts Route
    const resWorkouts = await fetch(`${BASE_URL}/api/workouts`);
    const workouts = await resWorkouts.json();
    assert(resWorkouts.status === 200 && Array.isArray(workouts), `GET /api/workouts (Found ${workouts.length} workouts)`);

    // 4. Programs Route
    const resPrograms = await fetch(`${BASE_URL}/api/programs`);
    const programs = await resPrograms.json();
    assert(resPrograms.status === 200 && Array.isArray(programs), `GET /api/programs (Found ${programs.length} programs)`);

    // 5. Trainers Route
    const resTrainers = await fetch(`${BASE_URL}/api/trainers`);
    const trainers = await resTrainers.json();
    assert(resTrainers.status === 200 && Array.isArray(trainers), `GET /api/trainers (Found ${trainers.length} trainers)`);

    // 6. Blogs Route
    const resBlogs = await fetch(`${BASE_URL}/api/blogs`);
    const blogs = await resBlogs.json();
    assert(resBlogs.status === 200 && Array.isArray(blogs), `GET /api/blogs (Found ${blogs.length} blogs)`);

    // 7. Nutrition Route
    const resNutrition = await fetch(`${BASE_URL}/api/nutrition`);
    const nutrition = await resNutrition.json();
    assert(resNutrition.status === 200 && Array.isArray(nutrition), `GET /api/nutrition (Found ${nutrition.length} items)`);

    // 8. Protein Powders Route
    const resPowders = await fetch(`${BASE_URL}/api/protein-powders`);
    const powders = await resPowders.json();
    assert(resPowders.status === 200 && Array.isArray(powders), `GET /api/protein-powders (Found ${powders.length} items)`);

    // 9. Community Posts Route
    const resCommunity = await fetch(`${BASE_URL}/api/community`);
    const community = await resCommunity.json();
    assert(resCommunity.status === 200 && Array.isArray(community), `GET /api/community (Found ${community.length} posts)`);

    // 10. Goals Route
    const resGoals = await fetch(`${BASE_URL}/api/goals`);
    const goals = await resGoals.json();
    assert(resGoals.status === 200 && Array.isArray(goals), `GET /api/goals (Found ${goals.length} goals)`);

    // 11. Protocol Route
    const resProtocol = await fetch(`${BASE_URL}/api/protocol`);
    const protocol = await resProtocol.json();
    assert(resProtocol.status === 200 && protocol && protocol.schedule, "GET /api/protocol (Weekly Protocol loaded)");

    // 12. Exercise Bank Route
    const resExerciseBank = await fetch(`${BASE_URL}/api/exercise-bank`);
    const exercises = await resExerciseBank.json();
    assert(resExerciseBank.status === 200 && Array.isArray(exercises), `GET /api/exercise-bank (Found ${exercises.length} exercises)`);

    // 13. User Profile Route (GET & PUT)
    const resProfile = await fetch(`${BASE_URL}/api/users/profile`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const profile = await resProfile.json();
    assert(resProfile.status === 200 && profile.email, `GET /api/users/profile for user: ${profile.email}`);

    const resUpdateProfile = await fetch(`${BASE_URL}/api/users/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ phone: "9876543210", goal: "Muscle Gain" })
    });
    const updatedProfile = await resUpdateProfile.json();
    assert(resUpdateProfile.status === 200 && updatedProfile.phone === "9876543210", "PUT /api/users/profile (Updated phone and goal successfully)");

    // 14. Access Status Route
    const resAccess = await fetch(`${BASE_URL}/api/users/access-status`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const access = await resAccess.json();
    assert(resAccess.status === 200 && typeof access.isLocked === "boolean", `GET /api/users/access-status (Locked: ${access.isLocked})`);

    // 15. User Bookings & Purchases
    const resUserBookings = await fetch(`${BASE_URL}/api/bookings/mybookings`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const userBookings = await resUserBookings.json();
    assert(resUserBookings.status === 200 && Array.isArray(userBookings), `GET /api/bookings/mybookings (Found ${userBookings.length} bookings)`);

    const resUserPurchases = await fetch(`${BASE_URL}/api/purchases/my-purchases`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const userPurchases = await resUserPurchases.json();
    assert(resUserPurchases.status === 200 && Array.isArray(userPurchases), `GET /api/purchases/my-purchases (Found ${userPurchases.length} purchases)`);

    // 16. BMI Route (User Create & Get)
    const resSaveBMI = await fetch(`${BASE_URL}/api/bmi`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        weight: 75,
        height: 180,
        bmi: 23.1,
        status: "Normal Weight"
      })
    });
    const bmiRecord = await resSaveBMI.json();
    assert(resSaveBMI.status === 201 && bmiRecord.record?._id, "POST /api/bmi (Saved BMI Record)");

    const resGetBMI = await fetch(`${BASE_URL}/api/bmi`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const bmiHistory = await resGetBMI.json();
    assert(resGetBMI.status === 200 && Array.isArray(bmiHistory) && bmiHistory.length > 0, `GET /api/bmi (Found ${bmiHistory.length} records)`);

    // Clean up created BMI record
    if (bmiRecord.record?._id) {
      await fetch(`${BASE_URL}/api/bmi/admin/${bmiRecord.record._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` }
      });
    }

    // 17. Admin Dashboard Stats
    const resStats = await fetch(`${BASE_URL}/api/admin/dashboard-stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const stats = await resStats.json();
    assert(resStats.status === 200 && stats.totalUsers > 0, `GET /api/admin/dashboard-stats (Users: ${stats.totalUsers}, Workouts: ${stats.totalWorkouts})`);

    // 18. Admin Users List
    const resAdminUsers = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminUsers = await resAdminUsers.json();
    assert(resAdminUsers.status === 200 && Array.isArray(adminUsers), `GET /api/admin/users (Found ${adminUsers.length} users)`);

    // 19. Admin Bookings & Purchases
    const resAllBookings = await fetch(`${BASE_URL}/api/bookings`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const allBookings = await resAllBookings.json();
    assert(resAllBookings.status === 200 && Array.isArray(allBookings), `GET /api/bookings (Admin: Found ${allBookings.length} bookings)`);

    const resAllPurchases = await fetch(`${BASE_URL}/api/purchases`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const allPurchases = await resAllPurchases.json();
    assert(resAllPurchases.status === 200 && Array.isArray(allPurchases), `GET /api/purchases (Admin: Found ${allPurchases.length} purchases)`);

    // 20. Admin Broadcast Create & Delete
    const resBroadcast = await fetch(`${BASE_URL}/api/admin/broadcast`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: "Test Broadcast Announcement", type: "info" })
    });
    const broadcastJson = await resBroadcast.json();
    assert(resBroadcast.status === 201 && broadcastJson.broadcast?._id, "POST /api/admin/broadcast (Created broadcast)");

    if (broadcastJson.broadcast?._id) {
      const resDelBroadcast = await fetch(`${BASE_URL}/api/admin/broadcast/${broadcastJson.broadcast._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert(resDelBroadcast.status === 200, "DELETE /api/admin/broadcast/:id (Deleted broadcast)");
    }

    // 21. Razorpay Order Creation
    const resOrder = await fetch(`${BASE_URL}/api/payment/order`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ amount: 99, currency: "INR" })
    });
    const orderJson = await resOrder.json();
    assert(resOrder.status === 200 && orderJson.id, `POST /api/payment/order (Generated Razorpay Order: ${orderJson.id})`);

    // 22. Razorpay Signature Verification (Valid Signature)
    if (orderJson.id) {
      const mockPaymentId = `pay_test_${Date.now()}`;
      const signBody = orderJson.id + "|" + mockPaymentId;
      const validSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "test")
        .update(signBody)
        .digest("hex");

      const resVerify = await fetch(`${BASE_URL}/api/payment/verify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          razorpay_order_id: orderJson.id,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: validSignature,
          itemId: "69fdc1866be5d01e8c7df81c",
          itemType: "program",
          amount: 99
        })
      });
      const verifyJson = await resVerify.json();
      assert(resVerify.status === 200 && verifyJson.success, "POST /api/payment/verify (Valid signature accepted & purchase recorded)");

      // 23. Razorpay Signature Verification (Invalid Signature Rejection)
      const resBadVerify = await fetch(`${BASE_URL}/api/payment/verify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          razorpay_order_id: orderJson.id,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: "invalid_fake_signature_hash_12345"
        })
      });
      assert(resBadVerify.status === 400, "POST /api/payment/verify (Invalid signature rejected with 400)");
    }

    // 24. Demo Payment (Simulate Success)
    const testProgramId = "69fdc2f56be5d01e8c7df86c";
    const resDemoSuccess = await fetch(`${BASE_URL}/api/payment/demo`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        itemId: testProgramId,
        itemType: "program",
        amount: 149,
        simulateFailure: false
      })
    });
    const demoSuccessJson = await resDemoSuccess.json();
    assert(
      (resDemoSuccess.status === 201 || resDemoSuccess.status === 200) &&
      demoSuccessJson.purchase?.paymentMethod === "DEMO",
      `POST /api/payment/demo (Success simulation recorded: ${demoSuccessJson.purchase?.transactionId})`
    );

    // 25. Demo Payment (Simulate Failure)
    const resDemoFailure = await fetch(`${BASE_URL}/api/payment/demo`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        itemId: "69fdc1866be5d01e8c7df81c",
        itemType: "program",
        amount: 99,
        simulateFailure: true
      })
    });
    const demoFailureJson = await resDemoFailure.json();
    assert(
      resDemoFailure.status === 400 &&
      demoFailureJson.purchase?.status === "Failed",
      "POST /api/payment/demo (Failure simulation rejected with 400 and logged as Failed)"
    );

    // 26. Duplicate Payment Check
    const resDuplicate = await fetch(`${BASE_URL}/api/payment/demo`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        itemId: testProgramId,
        itemType: "program",
        amount: 149,
        simulateFailure: false
      })
    });
    const duplicateJson = await resDuplicate.json();
    assert(
      resDuplicate.status === 200 && duplicateJson.alreadyOwned === true,
      "Duplicate Payment Prevention (Detects already owned program)"
    );

    // 26b. Store Cart Multi-Item Checkout with Shipping Address
    const resCartCheckout = await fetch(`${BASE_URL}/api/payment/demo`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        itemType: "StoreCart",
        amount: 3200,
        simulateFailure: false,
        items: [
          { name: "Whey Protein Isolate", price: 1999, quantity: 1 },
          { name: "Creatine Monohydrate", price: 1201, quantity: 1 }
        ],
        shippingAddress: {
          fullName: "Alpha Athlete",
          phone: "9876543210",
          street: "123 Gym Street",
          city: "Metropolis",
          state: "Karnataka",
          postalCode: "560001"
        }
      })
    });
    const cartCheckoutJson = await resCartCheckout.json();
    assert(
      resCartCheckout.status === 201 &&
      cartCheckoutJson.purchase?.itemType === "StoreCart" &&
      cartCheckoutJson.purchase?.items?.length === 2 &&
      cartCheckoutJson.purchase?.shippingAddress?.city === "Metropolis",
      "Store Cart Multi-Item Checkout (Saved with items & shipping address)"
    );

    // 27. Membership Activation Status Check
    const resAccessAfterPay = await fetch(`${BASE_URL}/api/users/access-status`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const accessJson = await resAccessAfterPay.json();
    assert(
      resAccessAfterPay.status === 200 && accessJson.hasPurchased === true,
      "Membership Activation Verification (Access status hasPurchased: true)"
    );

    // 28. Authorization check: Non-admin trying admin route
    const resUnauthorized = await fetch(`${BASE_URL}/api/admin/dashboard-stats`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert(resUnauthorized.status === 403, "Authorization Guard (Blocked normal user from Admin stats with 403)");

    console.log(`\n========================================`);
    console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log(`========================================\n`);

  } catch (error) {
    console.error("Test execution error:", error);
  } finally {
    server.close();
    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
};

runTests();
