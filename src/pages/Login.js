
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiUrl } from "../config/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({});
    setSuccess("");

    const newErrors = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!email.toLowerCase().endsWith("@gmail.com")) {
      newErrors.email = "Please use a valid Gmail address.";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required.";
    }

    // Stop if frontend validation fails
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const loginData = {
        email: email.trim(),
        password,
      };

      console.log("📤 Sending login data:", loginData);

      const response = await fetch(apiUrl("login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      console.log("✅ Login API Response:", data);

      // Backend validation / login error
      if (!response.ok || !data.success) {
        const backendErrors = {};

        if (data.errors) {
          if (data.errors.email) {
            backendErrors.email = data.errors.email[0];
          }

          if (data.errors.password) {
            backendErrors.password = data.errors.password[0];
          }
        }

        // Invalid credentials
        if (response.status === 401) {
          backendErrors.email = "Invalid email or password.";
          backendErrors.password = "Invalid email or password.";
        }

        if (Object.keys(backendErrors).length === 0) {
          backendErrors.email =
            data.message || "Login failed. Please try again.";
        }

        setErrors(backendErrors);
        return;
      }

      // Store user
      const userToStore = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        is_admin: data.user.is_admin || false,
      };

      localStorage.setItem("user", JSON.stringify(userToStore));

      // Store Sanctum token
      if (data.access_token) {
        localStorage.setItem("auth_token", data.access_token);
        localStorage.setItem("token_type", data.token_type || "Bearer");
      }

      console.log("👤 User stored:", userToStore);

      // Success
      setSuccess("Login successful!");

      // Redirect after short delay
      setTimeout(() => {
        navigate("/ResumeLanding");
      }, 700);
    } catch (error) {
      console.error("❌ Login error:", error);

      setErrors({
        email: "Unable to connect to the server.",
        password: "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) => {
    if (errors[field]) {
      return "border-red-500 bg-red-50 focus:ring-red-400";
    }

    if (
      field === "email" &&
      email &&
      email.toLowerCase().endsWith("@gmail.com")
    ) {
      return "border-green-500 bg-green-50 focus:ring-green-400";
    }

    if (field === "password" && password) {
      return "border-green-500 bg-green-50 focus:ring-green-400";
    }

    return "border-gray-300 focus:ring-[#043442]";
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#e5e7e7]">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-sm">

        <h2 className="text-2xl font-bold text-center text-[#043442] mb-6">
          Login
        </h2>

        {/* Success Message */}
        {success && (
          <div className="mb-4 rounded-lg border border-green-500 bg-green-50 px-4 py-3 text-sm text-green-700">
            ✅ {success}
          </div>
        )}

        {/* Error Message */}
        {errors.email && errors.password && (
          <div className="mb-4 rounded-lg border border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">
            ❌ {errors.email}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Email */}
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);

                // Remove error while user corrects input
                setErrors((prev) => ({
                  ...prev,
                  email: "",
                }));
              }}
              placeholder="Email"
              className={`border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${inputClass(
                "email"
              )}`}
            />

            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);

                setErrors((prev) => ({
                  ...prev,
                  password: "",
                }));
              }}
              placeholder="Password"
              className={`border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${inputClass(
                "password"
              )}`}
            />

            {errors.password && !errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className={`text-white font-semibold py-2 rounded-lg transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#043442] hover:bg-[#032c36]"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-4">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-[#043442] font-semibold hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

