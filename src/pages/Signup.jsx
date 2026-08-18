import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiUrl } from "../config/api";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Check whether a field is valid
  const isValid = (field) => {
    if (field === "name") {
      return name.trim().length >= 2;
    }

    if (field === "email") {
      return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
    }

    if (field === "password") {
      return password.length >= 8;
    }

    if (field === "confirmPassword") {
      return confirmPassword !== "" && confirmPassword === password;
    }

    return false;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required.";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
      newErrors.email = "Please enter a valid Gmail address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate frontend
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const userData = {
      name: name.trim(),
      email: email.trim(),
      password,
      password_confirmation: confirmPassword,
    };

    try {
      const response = await fetch(apiUrl("register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      console.log("API Response:", data);

      if (response.ok && data.success) {
        const userToStore = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
        };

        localStorage.setItem("user", JSON.stringify(userToStore));
        localStorage.setItem("auth_token", data.access_token);
        localStorage.setItem("token_type", data.token_type);

        // No alert
        navigate("/ResumeLanding");
      } else {
        // Laravel validation errors
        if (data.errors) {
          const backendErrors = {};

          Object.keys(data.errors).forEach((field) => {
            backendErrors[field] = data.errors[field][0];
          });

          setErrors(backendErrors);
        } else {
          setErrors({
            general: data.message || "Registration failed. Please try again.",
          });
        }
      }
    } catch (error) {
      console.error("Registration error:", error);

      setErrors({
        general: "Unable to connect to the server. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Dynamic input border
  const getInputClass = (field, value) => {
    const base =
      "border rounded-lg p-2 w-full focus:outline-none focus:ring-2 transition ";

    if (errors[field]) {
      return (
        base +
        "border-red-500 focus:ring-red-400 bg-red-50"
      );
    }

    if (value && isValid(field)) {
      return (
        base +
        "border-green-500 focus:ring-green-400 bg-green-50"
      );
    }

    return (
      base +
      "border-gray-300 focus:ring-[#043442]"
    );
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#e5e7e7]">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-sm">

        <h2 className="text-2xl font-bold text-center text-[#043442] mb-6">
          Sign Up
        </h2>

        {/* General Error */}
        {errors.general && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-300 text-red-600 text-sm">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Name */}
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);

                if (errors.name) {
                  setErrors((prev) => ({
                    ...prev,
                    name: "",
                  }));
                }
              }}
              placeholder="Full Name"
              className={getInputClass("name", name)}
            />

            {errors.name && (
              <p className="text-red-500 text-xs mt-1">
                {errors.name}
              </p>
            )}

            {!errors.name && name && isValid("name") && (
              <p className="text-green-600 text-xs mt-1">
                ✓ Name looks good
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);

                if (errors.email) {
                  setErrors((prev) => ({
                    ...prev,
                    email: "",
                  }));
                }
              }}
              placeholder="example@gmail.com"
              className={getInputClass("email", email)}
            />

            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email}
              </p>
            )}

            {!errors.email && email && isValid("email") && (
              <p className="text-green-600 text-xs mt-1">
                ✓ Valid Gmail address
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

                if (errors.password || errors.confirmPassword) {
                  setErrors((prev) => ({
                    ...prev,
                    password: "",
                    confirmPassword: "",
                  }));
                }
              }}
              placeholder="Password"
              className={getInputClass("password", password)}
            />

            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password}
              </p>
            )}

            {!errors.password && password && isValid("password") && (
              <p className="text-green-600 text-xs mt-1">
                ✓ Password is strong enough
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);

                if (errors.confirmPassword) {
                  setErrors((prev) => ({
                    ...prev,
                    confirmPassword: "",
                  }));
                }
              }}
              placeholder="Confirm Password"
              className={getInputClass(
                "confirmPassword",
                confirmPassword
              )}
            />

            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword}
              </p>
            )}

            {!errors.confirmPassword &&
              confirmPassword &&
              isValid("confirmPassword") && (
                <p className="text-green-600 text-xs mt-1">
                  ✓ Passwords match
                </p>
              )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`text-white font-semibold py-2 rounded-lg transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#043442] hover:bg-[#032c36]"
            }`}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#043442] font-semibold hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}