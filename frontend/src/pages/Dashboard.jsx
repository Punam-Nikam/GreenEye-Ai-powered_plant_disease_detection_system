import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './dashboard.css';
import { useLanguage } from "../LanguageContext.jsx";
import translations from "../translations.js";

import uploadImage  from '../assets/uploading.png';
import analyzeImage from '../assets/analyze.png';
import resultImage  from '../assets/result.png';

import axios from 'axios';

export default function Dashboard() {
  const [file,        setFile]        = useState(null);
  const [preview,     setPreview]     = useState(null);
  const [status,      setStatus]      = useState('idle');
  const [result,      setResult]      = useState(null);
  const [errorMsg,    setErrorMsg]    = useState('');
  const [dragActive,  setDragActive]  = useState(false);

  // lang = currently selected language
  // t    = shortcut to all text for that language
  const { lang, setLang } = useLanguage();
  const t = translations[lang];

  const inputRef = useRef(null);
  const navigate = useNavigate();

  const hasResult = status === 'done' && !!result;

  const handleFile = (selected) => {
    if (!selected) return;
    if (!selected.type.startsWith('image/')) {
      setErrorMsg('Please upload an image file.');
      setStatus('error');
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setStatus('idle');
    setResult(null);
    setErrorMsg('');
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const onLogout = () => {
    localStorage.removeItem('greeneye_token');
    localStorage.removeItem('greeneye_name');
    navigate('/login');
  };

  const analyze = async () => {
    if (!file) return;
    setStatus('analyzing');
    setErrorMsg('');
    setResult(null);

    const formData = new FormData();
    formData.append('image', file);

    // Send the selected language to Flask so Gemini responds in that language
    const langName = lang === 'hi' ? 'hindi' : lang === 'mr' ? 'marathi' : 'english';
    formData.append('language', langName);

    try {
      const token = localStorage.getItem('greeneye_token');

      const response = await axios.post(
        'http://localhost:5000/api/scan/analyse',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;

      setResult({
        disease:     data.disease,
        confidence:  data.severity === 'High'   ? 0.90
                   : data.severity === 'Medium' ? 0.75
                   : 0.60,
        cause:       data.cause,
        symptoms:    data.symptoms,
        treatment:   Array.isArray(data.treatment)  ? data.treatment  : [data.treatment],
        precautions: Array.isArray(data.prevention) ? data.prevention : [data.prevention],
        fertilizers: data.fertilizers || [],
      });

      setStatus('done');

    } catch (err) {
      if (err.response?.status === 401) {
        setErrorMsg('Session expired. Please login again.');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setErrorMsg(err.response?.data?.error || 'Analysis failed. Please try again.');
      }
      setStatus('error');
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setStatus('idle');
    setErrorMsg('');
  };

  return (
    <div className="dashboard">

      {/* ─── NAVBAR ─── */}
      <nav className="dash-navbar">
        <div className="dash-navbar__inner">
          <Link to="/" className="dash-navbar__logo">
            <span className="logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="40" height="40">
                <path
                  fill="#4caf50"
                  d="M576 96C576 204.1 499.4 294.3 397.6 315.4C389.7 257.3 363.6 205 325.1 164.5C365.2 104 433.9 64 512 64L544 64C561.7 64 576 78.3 576 96zM64 160C64 142.3 78.3 128 96 128L128 128C251.7 128 352 228.3 352 352L352 544C352 561.7 337.7 576 320 576C302.3 576 288 561.7 288 544L288 384C164.3 384 64 283.7 64 160z"
                />
              </svg>
            </span>
            GreenEye
          </Link>

          {/* Language switcher buttons in navbar */}
          <div className="lang-switcher">
            <span className="lang-label">{t.langLabel}:</span>
            <button
              className={lang === 'en' ? 'lang-btn lang-btn--active' : 'lang-btn'}
              onClick={() => setLang('en')}
            >
              EN
            </button>
            <button
              className={lang === 'hi' ? 'lang-btn lang-btn--active' : 'lang-btn'}
              onClick={() => setLang('hi')}
            >
              हि
            </button>
            <button
              className={lang === 'mr' ? 'lang-btn lang-btn--active' : 'lang-btn'}
              onClick={() => setLang('mr')}
            >
              म
            </button>
          </div>

          <button className="dash-navbar__logout" onClick={onLogout}>
            {t.logout}
          </button>
          <Link to="/history" style={{
            color: "rgba(255,255,255,0.7)",
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 500,
            marginRight: 16,
          }}>
            My History
          </Link>
        </div>

      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="hero">
        <div className="hero__overlay" />
        <div className="hero__content">
          <span className="hero__badge">{t.heroBadge}</span>
          <h1 className="hero__title">
            {t.heroTitle}
            <br />
            <span className="hero__title--highlight">{t.heroHighlight}</span>
          </h1>
          <p className="hero__tagline">{t.heroTagline}</p>
          <div className="hero__stats">
            <span className="hero__stat"><strong>{t.heroStat1}</strong></span>
            <span className="hero__stat"><strong>{t.heroStat2}</strong></span>
          </div>
          <button className="hero__cta">{t.heroCta}</button>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="how-section">
        <div className="how-section__inner">
          <div className="section-header">
            <span className="section-header__badge">{t.howBadge}</span>
            <h2 className="section-header__title">{t.howTitle}</h2>
            <p className="section-header__sub">{t.howSub}</p>
          </div>

          <div className="how-grid">
            <div className="how-card">
              <div className="how-card__image">
                <img src={uploadImage} alt="Upload" />
                <span className="how-card__step">01</span>
              </div>
              <h3 className="how-card__title">{t.step1Title}</h3>
              <p className="how-card__desc">{t.step1Desc}</p>
            </div>

            <div className="how-card">
              <div className="how-card__image">
                <img src={analyzeImage} alt="Analyze" />
                <span className="how-card__step">02</span>
              </div>
              <h3 className="how-card__title">{t.step2Title}</h3>
              <p className="how-card__desc">{t.step2Desc}</p>
            </div>

            <div className="how-card">
              <div className="how-card__image">
                <img src={resultImage} alt="Results" />
                <span className="how-card__step">03</span>
              </div>
              <h3 className="how-card__title">{t.step3Title}</h3>
              <p className="how-card__desc">{t.step3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SCAN SECTION ─── */}
      <section className="scan-section">
        <div className="scan-section__inner">
          <div className="scan-header">
            <h2>{t.scanTitle}</h2>
            <p>{t.scanSub}</p>
          </div>

          <div className="upload-wrapper">
            <div
              className={`upload-panel ${dragActive ? 'upload-panel--active' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
            >
              {preview ? (
                <div className="upload-preview">
                  <img src={preview} alt="Selected leaf" />
                  {status === 'analyzing' && (
                    <div className="scan-line scan-line--loop" aria-hidden="true" />
                  )}
                  <div className="upload-actions">
                    <button className="btn btn--ghost" onClick={reset}>
                      {t.chooseAnother}
                    </button>
                    <button
                      className="btn btn--primary"
                      onClick={analyze}
                      disabled={status === 'analyzing'}
                    >
                      {status === 'analyzing' ? t.analyzing : t.analyzeBtn}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="upload-empty">
                  <div className="upload-empty__icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.2699 2H9.72993C9.12993 2 8.59993 2.33 8.31993 2.86L6.18993 6.86C6.08993 7.05 5.88993 7.17 5.67993 7.17H4.99993C3.33993 7.17 1.99993 8.51 1.99993 10.17V16.17C1.99993 17.83 3.33993 19.17 4.99993 19.17H18.9999C20.6599 19.17 21.9999 17.83 21.9999 16.17V10.17C21.9999 8.51 20.6599 7.17 18.9999 7.17H18.3199C18.1099 7.17 17.9099 7.05 17.8099 6.86L15.6799 2.86C15.3999 2.33 14.8699 2 14.2699 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M11.9999 15.17V10.17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9.5 12.67L12 15.17L14.5 12.67" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="upload-empty__title">{t.dragText}</p>
                  <button className="btn btn--primary" onClick={() => inputRef.current?.click()}>
                    {t.choosePhoto}
                  </button>
                  <ul className="upload-tips">
                    <li>{t.tip1}</li>
                    <li>{t.tip2}</li>
                    <li>{t.tip3}</li>
                  </ul>
                </div>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>
          </div>

          {status === 'error' && (
            <div className="error-banner">
              <strong>{t.errorTitle}</strong> {errorMsg}
            </div>
          )}

          {/* ─── RESULTS ─── */}
          {hasResult && (
            <div className="result-report">

              {/* Disease name + confidence */}
              <div className="result-report__header">
                <div>
                  <span className="result-report__label">{t.diagnosisLabel}</span>
                  <h2 className="result-report__disease">{result.disease}</h2>
                </div>
                <span className="result-report__confidence">
                  {Math.round((result.confidence || 0) * 100)}% {t.confidence}
                </span>
              </div>

              {/* Why this happens */}
              {result.cause && (
                <div className="result-block">
                  <h3>{t.whyHappens}</h3>
                  <p>{result.cause}</p>
                </div>
              )}

              {/* Visible symptoms */}
              {result.symptoms && (
                <div className="result-block">
                  <h3>{t.symptoms}</h3>
                  <p>{result.symptoms}</p>
                </div>
              )}

              {/* Treatment steps */}
              {Array.isArray(result.treatment) && result.treatment.length > 0 && (
                <div className="result-block">
                  <h3>{t.solution}</h3>
                  <ul>
                    {result.treatment.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Prevention tips */}
              {Array.isArray(result.precautions) && result.precautions.length > 0 && (
                <div className="result-block">
                  <h3>{t.precautions}</h3>
                  <ul>
                    {result.precautions.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Fertilizer / product recommendations with buy buttons */}
              {Array.isArray(result.fertilizers) && result.fertilizers.length > 0 && (
                <div className="result-block">
                  <h3>{t.products}</h3>
                  <div className="product-grid">
                    {result.fertilizers.map((f, i) => (
                      <div className="product-card" key={i}>
                        <div className="product-card__image-placeholder">🌿</div>
                        <h4 className="product-card__name">{f.name}</h4>
                        <p className="product-card__desc">{f.use}</p>
                        <div className="product-card__footer">
                          <a
                            href={`https://www.amazon.in/s?k=${encodeURIComponent(f.buy_search)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn--primary btn--sm"
                          >
                            {t.buyAmazon} →
                          </a>
                          <a
                            href={`https://www.flipkart.com/search?q=${encodeURIComponent(f.buy_search)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn--ghost btn--sm"
                          >
                            {t.buyFlipkart} →
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
      </section>

    </div>
  );
}