// History.jsx
// Shows all past scans for the logged-in user.
// Each scan shows disease name, severity, date, and full details.
// User can expand any scan to see full treatment + products.
// This is useful when user goes to local shop to buy pesticide —
// they open this page and show the recommendation.

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useLanguage } from "../LanguageContext.jsx";
import translations from "../translations.js";
import "./history.css";

export default function History() {
  const navigate  = useNavigate();
  const { lang }  = useLanguage();
  const t         = translations[lang];

  // scans = list of all past scans from MySQL
  const [scans,     setScans]     = useState([]);
  // loading = true while fetching from Flask
  const [loading,   setLoading]   = useState(true);
  // error = if fetch fails
  const [error,     setError]     = useState("");
  // expandedId = which scan card is currently expanded
  // null means none are expanded
  const [expandedId, setExpandedId] = useState(null);

  // Fetch history when page loads
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("greeneye_token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/scan/history",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setScans(response.data.scans || []);
      setLoading(false);

    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError("Could not load history. Please try again.");
        setLoading(false);
      }
    }
  };

  const onLogout = () => {
    localStorage.removeItem("greeneye_token");
    localStorage.removeItem("greeneye_name");
    navigate("/login");
  };

  // Toggle expand/collapse a scan card
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Format date nicely
  // "2025-07-24 10:30:00" → "24 Jul 2025, 10:30 AM"
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleString("en-IN", {
      day:    "numeric",
      month:  "short",
      year:   "numeric",
      hour:   "2-digit",
      minute: "2-digit",
    });
  };

  // Parse the full_result JSON string stored in MySQL
  // Returns an object with cause, treatment, prevention, fertilizers
  const parseResult = (fullResult) => {
    try {
      if (!fullResult) return null;
      return JSON.parse(fullResult);
    } catch {
      return null;
    }
  };

  // Severity badge color
  const getSeverityClass = (severity) => {
    if (!severity) return "";
    const s = severity.toLowerCase();
    if (s.includes("high"))   return "badge--high";
    if (s.includes("medium")) return "badge--medium";
    if (s.includes("low"))    return "badge--low";
    return "";
  };

  return (
    <div className="history-page">

      {/* ── NAVBAR ── */}
      <nav className="hist-navbar">
        <div className="hist-navbar__inner">
          <Link to="/" className="hist-navbar__logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="28" height="28">
              <path fill="#4caf50" d="M576 96C576 204.1 499.4 294.3 397.6 315.4C389.7 257.3 363.6 205 325.1 164.5C365.2 104 433.9 64 512 64L544 64C561.7 64 576 78.3 576 96zM64 160C64 142.3 78.3 128 96 128L128 128C251.7 128 352 228.3 352 352L352 544C352 561.7 337.7 576 320 576C302.3 576 288 561.7 288 544L288 384C164.3 384 64 283.7 64 160z"/>
            </svg>
            GreenEye
          </Link>

          <div className="hist-navbar__links">
            <Link to="/main" className="hist-nav-link">Dashboard</Link>
            <Link to="/history" className="hist-nav-link hist-nav-link--active">History</Link>
          </div>

          <button className="hist-logout" onClick={onLogout}>
            {t.logout || "Logout"}
          </button>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <main className="hist-main">

        <div className="hist-header">
          <div>
            <h1 className="hist-title">Scan History</h1>
            <p className="hist-sub">
              All your past plant analyses. Tap any card to see full details and product recommendations.
            </p>
          </div>
          <div className="hist-count">
            <strong>{scans.length}</strong>
            <span>Total Scans</span>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="hist-loading">
            <div className="hist-spinner" />
            <p>Loading your scan history...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="hist-error">
            <p>{error}</p>
            <button onClick={fetchHistory}>Try Again</button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && scans.length === 0 && (
          <div className="hist-empty">
            <div className="hist-empty__icon">🌿</div>
            <h3>No scans yet</h3>
            <p>
              Your plant analyses will appear here after your first scan.
              Each scan is saved so you can refer back to it any time —
              especially useful when buying products at the local shop.
            </p>
            <Link to="/main" className="hist-scan-btn">
              Scan your first plant
            </Link>
          </div>
        )}

        {/* Scan list */}
        {!loading && !error && scans.length > 0 && (
          <div className="hist-list">
            {scans.map((scan) => {
              const parsed    = parseResult(scan.full_result);
              const isOpen    = expandedId === scan.id;

              return (
                <div
                  className={`scan-card ${isOpen ? "scan-card--open" : ""}`}
                  key={scan.id}
                >
                  {/* Card header — always visible */}
                  <div
                    className="scan-card__header"
                    onClick={() => toggleExpand(scan.id)}
                  >
                    <div className="scan-card__left">
                      <div className="scan-card__icon">🌱</div>
                      <div>
                        <h3 className="scan-card__disease">
                          {scan.disease || "Unknown"}
                        </h3>
                        <p className="scan-card__date">
                          {formatDate(scan.scanned_at)}
                        </p>
                        {scan.image_name && (
                          <p className="scan-card__file">
                            {scan.image_name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="scan-card__right">
                      {scan.severity && (
                        <span className={`severity-badge ${getSeverityClass(scan.severity)}`}>
                          {scan.severity} risk
                        </span>
                      )}
                      <span className="scan-card__toggle">
                        {isOpen ? "▲ Hide" : "▼ Details"}
                      </span>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isOpen && parsed && (
                    <div className="scan-card__body">

                      {parsed.cause && (
                        <div className="scan-detail">
                          <h4>Why this happened</h4>
                          <p>{parsed.cause}</p>
                        </div>
                      )}

                      {parsed.symptoms && (
                        <div className="scan-detail">
                          <h4>Visible symptoms</h4>
                          <p>{parsed.symptoms}</p>
                        </div>
                      )}

                      {Array.isArray(parsed.treatment) && parsed.treatment.length > 0 && (
                        <div className="scan-detail">
                          <h4>Treatment steps</h4>
                          <ul>
                            {parsed.treatment.map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {Array.isArray(parsed.prevention) && parsed.prevention.length > 0 && (
                        <div className="scan-detail">
                          <h4>Prevention tips</h4>
                          <ul>
                            {parsed.prevention.map((tip, i) => (
                              <li key={i}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Products section — useful for local shop visits */}
                      {Array.isArray(parsed.fertilizers) && parsed.fertilizers.length > 0 && (
                        <div className="scan-detail">
                          <h4>Recommended products</h4>
                          <p className="shop-tip">
                            Show this to your local shop owner or search online:
                          </p>
                          <div className="product-list">
                            {parsed.fertilizers.map((f, i) => (
                              <div className="product-item" key={i}>
                                <div className="product-item__info">
                                  <strong>{f.name}</strong>
                                  <p>{f.use}</p>
                                </div>
                                <div className="product-item__btns">
                                  <a
                                    href={`https://www.amazon.in/s?k=${encodeURIComponent(f.buy_search)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="buy-btn buy-btn--amazon"
                                  >
                                    Amazon →
                                  </a>
                                  <a
                                    href={`https://www.flipkart.com/search?q=${encodeURIComponent(f.buy_search)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="buy-btn buy-btn--flipkart"
                                  >
                                    Flipkart →
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}