import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import InterviewPreparation from "./pages/InterviewPreparation";
import Navbar from "./Components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Faqs from "./pages/Faqs";
import About from "./pages/About";
import UploadResume from "./pages/UploadResume";
import ResumeLanding from "./pages/ResumeLanding";
import CreateResume from "./pages/CreateResume";
import Templates from "./pages/Templates";
import EnhancedResume from "./pages/EnhancedResume";
import JobTracker from "./pages/JobTracker";
import CoverLetter from "./pages/CoverLetter";
// Admin
import Dashboard from "./Admin/Dashboard";
import AdminLayout from "./Admin/AdminLayout";
import Users from "./Admin/Users";
import AdminModulePage from "./Admin/AdminModulePage";


/* =========================================================
   ADMIN ROUTES
========================================================= */

function AdminRoutes() {
  return (
    <AdminLayout>
      <Routes>

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/users"
          element={<Users />}
        />

        <Route
          path="/resumes"
          element={<AdminModulePage module="resumes" />}
        />

        <Route
          path="/templates"
          element={<AdminModulePage module="templates" />}
        />

        <Route
          path="/analytics"
          element={<AdminModulePage module="analytics" />}
        />

        <Route
          path="/settings"
          element={<AdminModulePage module="settings" />}
        />

        <Route
          path="/enhanced-resume"
          element={<EnhancedResume />}
        />

      </Routes>
    </AdminLayout>
  );
}


/* =========================================================
   MAIN APP
========================================================= */

function App() {
  const location = useLocation();

  const isAdminRoute =
    location.pathname.startsWith("/admin");

  return (
    <div className="App">

      {/* Navbar hidden on admin pages */}
      {!isAdminRoute && <Navbar />}

      <main className={!isAdminRoute ? "pt-16" : ""}>

        <Routes>

          {/* PUBLIC ROUTES */}

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />

          <Route
            path="/about"
            element={<About />}
          />

          {/* DATABASE TEMPLATES PAGE */}
          <Route
            path="/templates"
            element={<Templates />}
          />
          <Route
  path="/job-tracker"
  element={<JobTracker />}
/>

<Route path="/cover-letter" element={<CoverLetter />} />
<Route
  path="/interview"
  element={<InterviewPreparation />}
/>

          <Route
            path="/upload"
            element={<UploadResume />}
          />

          <Route
            path="/faqs"
            element={<Faqs />}
          />

          <Route
            path="/create"
            element={<CreateResume />}
          />

          <Route
            path="/ResumeLanding"
            element={<ResumeLanding />}
          />

          <Route
            path="/resume-landing"
            element={<ResumeLanding />}
          />

          <Route
            path="/enhanced-resume"
            element={<EnhancedResume />}
          />


          {/* ADMIN */}

          <Route
            path="/admin/*"
            element={<AdminRoutes />}
          />

          <Route
            path="/logout"
            element={<Home />}
          />

        </Routes>

      </main>
    </div>
  );
}


/* =========================================================
   ROUTER WRAPPER
========================================================= */

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}