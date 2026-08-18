
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { apiUrl, authHeaders } from "../config/api";

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const response = await fetch(apiUrl("logout"), {
        method: "POST",
        headers: authHeaders({
          "Content-Type": "application/json",
        }),
      });

      console.log("Logout response:", response.status);
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Clear authentication data
      localStorage.removeItem("auth_token");
      localStorage.removeItem("token_type");
      localStorage.removeItem("user");
      localStorage.removeItem("admin");
      localStorage.removeItem("isAdmin");

      sessionStorage.removeItem("auth_token");
      sessionStorage.removeItem("token_type");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("admin");
      sessionStorage.removeItem("isAdmin");

      // Go to login page
      navigate("/login", { replace: true });

      setLoggingOut(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">

      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between px-6 py-4">

            <h1 className="text-2xl font-bold text-gray-800">
              Admin Dashboard
            </h1>

            <div className="flex items-center space-x-4">

              <span className="text-gray-600">
                Welcome, Admin
              </span>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="
                  bg-[#043442]
                  text-white
                  px-4
                  py-2
                  rounded-lg
                  font-semibold
                  hover:bg-[#032c36]
                  transition
                  disabled:bg-gray-400
                  disabled:cursor-not-allowed
                "
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>

            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;
