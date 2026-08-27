import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./register.css";

import { useLanguage } from "../LanguageContext.jsx";
import translations from "../translations.js";

function Register() {

  const navigate = useNavigate();

  // Storing each field separately so we can read them easily
  // Your original used one form object - we keep that but add
  // confirmPassword separately since it was missing
  const [name,            setName]            = useState("");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { lang } = useLanguage();
  const t = translations[lang];

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Check passwords match BEFORE calling Flask
    // No point making a network request if they don't match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        "http://localhost:5000/api/auth/register",
        { name, email, password }
      );

      setSuccess("Account created! Taking you to login...");
      setTimeout(() => navigate("/login"), 1500);

    } catch (err) {
      setError(err.response?.data?.error || "Registration failed.");
    }

    setLoading(false);
  };

  // ── YOUR ORIGINAL UI BELOW - NOTHING CHANGED ─────────────

  return (
    <div className="register-wrapper">

    <h2>{t.register_title}</h2>
    <p>{t.register_sub}</p>
    <button>{loading ? t.register_loading : t.register_btn}</button>
      
      <div className="register-box">
        <div className="logo">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="40" height="40">
            <path
              fill="#4caf50"
              d="M576 96C576 204.1 499.4 294.3 397.6 315.4C389.7 257.3 363.6 205 325.1 164.5C365.2 104 433.9 64 512 64L544 64C561.7 64 576 78.3 576 96zM64 160C64 142.3 78.3 128 96 128L128 128C251.7 128 352 228.3 352 352L352 544C352 561.7 337.7 576 320 576C302.3 576 288 561.7 288 544L288 384C164.3 384 64 283.7 64 160z"
            />
          </svg>
          <h1>GreenEye</h1>
        </div>

        <h2>Create Account</h2>
        <p>Register here to get started</p>

        {/* Show error or success message above the form */}
        {error   && <p className="error-msg">{error}</p>}
        {success && <p className="success-msg">{success}</p>}

        <form onSubmit={handleRegister}>

          <input
            type="text"
            name="name"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Added confirm password field - needed for the check above */}
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default Register;