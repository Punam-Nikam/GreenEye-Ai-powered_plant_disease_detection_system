import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./login.css";
import { useLanguage } from "../LanguageContext.jsx";
import translations from "../translations.js";


function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { lang } = useLanguage();
  const t = translations[lang];

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      // save token and name - we need these later
      localStorage.setItem("greeneye_token", response.data.token);
      localStorage.setItem("greeneye_name", response.data.name);

      navigate("/main");

    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Try again.");
    }

    setLoading(false);
  };



  return (
    
    <div className="login-wrapper">
      <div className="login-container">
        <h2>{t.login_title}</h2>

        <p>{t.login_sub}</p>
        <label>{t.login_email}</label>
        <label>{t.login_password}</label>
        <button>{loading ? t.login_loading : t.login_btn}</button>

        {/* Logo */}
        <div className="logo">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
            <path
              fill="#4caf50"
              d="M576 96C576 204.1 499.4 294.3 397.6 315.4C389.7 257.3 363.6 205 325.1 164.5C365.2 104 433.9 64 512 64L544 64C561.7 64 576 78.3 576 96zM64 160C64 142.3 78.3 128 96 128L128 128C251.7 128 352 228.3 352 352L352 544C352 561.7 337.7 576 320 576C302.3 576 288 561.7 288 544L288 384C164.3 384 64 283.7 64 160z"
            />
          </svg>
          <h1>GreenEye</h1>
        </div>

        <h2>Welcome Back</h2>
        <p>Login to your account</p>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label>Email Address</label>
          </div>

          <div className="input-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label>Password</label>
          </div>

          <div className="extra-options">
            <a href="#" className="forgot-password">
              Forgot Password?
            </a>
          </div>

          {error && <p className="error-msg">{error}</p>}   
          
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Secure Login"}
          </button>
        </form>

        <div className="signup-link">
          Don't have an account? <Link to="/register">Sign up</Link>
        </div>

      </div>
    </div>
  );
}

export default Login;