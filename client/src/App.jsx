import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import CartDrawer from "./components/cart/CartDrawer";
import MainLayout from "./layout/mainLayout";
import AdminRoute from "./routes/AdminRoute";
import ProtectedRoute from "./routes/ProtectedRoute";

// Lazy-loaded Public & User Pages (Code Splitting)
const Home = lazy(() => import("./pages/home/Home"));
const Programmes = lazy(() => import("./pages/programmes/Programmes"));
const ProgramDetails = lazy(() => import("./pages/programDetails/ProgramDetails"));
const Workouts = lazy(() => import("./pages/workouts/Workouts"));
const Calculator = lazy(() => import("./pages/calculator/Calculator"));
const Nutrition = lazy(() => import("./pages/nutrition/Nutrition"));
const Progress = lazy(() => import("./pages/progress/Progress"));
const Blog = lazy(() => import("./pages/blog/Blog"));
const BMICalculator = lazy(() => import("./pages/bmi/BMICalculator"));
const BMIHistory = lazy(() => import("./pages/bmi/BMIHistory"));
const Community = lazy(() => import("./pages/community/Community"));
const Login = lazy(() => import("./pages/login/Login"));
const Signup = lazy(() => import("./pages/signup/Signup"));
const Profile = lazy(() => import("./pages/userProfile/Profile"));
const Trainers = lazy(() => import("./pages/trainers/Trainers"));
const TrainerProfile = lazy(() => import("./pages/trainers/TrainerProfile"));
const FitnessLanding = lazy(() => import("./pages/FitnessLanding/FitnessLanding"));
const Checkout = lazy(() => import("./pages/Checkout/Checkout"));
const Workoutplanner = lazy(() => import("./pages/workoutplanner/Workoutplanner"));

// Lazy-loaded Admin Pages (Isolated Chunking)
const AdminDashboard = lazy(() => import("./pages/admin_pages/AdminDashboard/AdminDashboard"));
const Users = lazy(() => import("./pages/admin_pages/Users/Users"));
const AdminBlog = lazy(() => import("./pages/admin_pages/Blog/AdminBlog"));
const AdminNutrition = lazy(() => import("./pages/admin_pages/Nutrition/AdminNutrition"));
const AdminPrograms = lazy(() => import("./pages/admin_pages/Program/AdminPrograms"));
const AdminGoals = lazy(() => import("./pages/admin_pages/Goals/AdminGoals"));
const AdminProgress = lazy(() => import("./pages/admin_pages/Programs/AdminProgress"));
const AdminTrainers = lazy(() => import("./pages/admin_pages/Trainers/AdminTrainers"));
const AdminExerciseBank = lazy(() => import("./pages/admin_pages/ExerciseBank/AdminExerciseBank"));
const AdminWorkouts = lazy(() => import("./pages/admin_pages/Workouts/AdminWorkouts"));
const AdminBMIHistory = lazy(() => import("./pages/admin_pages/BMIHistory/AdminBMIHistory"));
const AdminCommunity = lazy(() => import("./pages/admin_pages/Community/AdminCommunity"));
const AdminAttendance = lazy(() => import("./pages/admin_pages/Attendance/AdminAttendance"));
const AdminBookings = lazy(() => import("./pages/admin_pages/Bookings/AdminBookings"));
const AdminChallenges = lazy(() => import("./pages/admin_pages/Challenges/AdminChallenges"));

// Route Loading Spinner Fallback
const PageLoader = () => (
  <div style={{
    minHeight: "60vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent"
  }}>
    <div style={{
      width: "38px",
      height: "38px",
      border: "3px solid rgba(255, 62, 62, 0.2)",
      borderTop: "3px solid #ff3e3e",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite"
    }} />
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <CartDrawer />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/programs" element={<Programmes />} />
                <Route path="/program/:id" element={<ProgramDetails />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/checkout/:id" element={<Checkout />} />
                <Route path="/exercises" element={<Workouts />} />
                <Route path="/calculator" element={<Calculator />} />
                <Route path="/bmi-calculator" element={<BMICalculator />} />
                <Route path="/bmi-history" element={<BMIHistory />} />
                <Route path="/nutrition" element={<Nutrition />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/trainers" element={<Trainers />} />
                <Route path="/trainer/:id" element={<TrainerProfile />} />
                <Route path="/community" element={<Community />} />
                <Route path="/trainer-info" element={<FitnessLanding />} />
                <Route path="/workout-planner" element={<Workoutplanner />} />

                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
              </Route>

              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              <Route path="/admin/users" element={
                <AdminRoute>
                  <Users />
                </AdminRoute>
              } />
              <Route path="/admin/blogs" element={
                <AdminRoute>
                  <AdminBlog />
                </AdminRoute>
              } />

              <Route path="/admin/nutrition" element={
                <AdminRoute>
                  <AdminNutrition />
                </AdminRoute>
              } />

              <Route
                path="/admin/programs"
                element={
                  <AdminRoute>
                    <AdminPrograms />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/goals"
                element={
                  <AdminRoute>
                    <AdminGoals />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/progress"
                element={
                  <AdminRoute>
                    <AdminProgress />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/trainers"
                element={
                  <AdminRoute>
                    <AdminTrainers />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/exercise-bank"
                element={
                  <AdminRoute>
                    <AdminExerciseBank />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/workouts"
                element={
                  <AdminRoute>
                    <AdminWorkouts />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/bmi-history"
                element={
                  <AdminRoute>
                    <AdminBMIHistory />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/community"
                element={
                  <AdminRoute>
                    <AdminCommunity />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/attendance"
                element={
                  <AdminRoute>
                    <AdminAttendance />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/bookings"
                element={
                  <AdminRoute>
                    <AdminBookings />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/challenges"
                element={
                  <AdminRoute>
                    <AdminChallenges />
                  </AdminRoute>
                }
              />

              <Route path="/admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
