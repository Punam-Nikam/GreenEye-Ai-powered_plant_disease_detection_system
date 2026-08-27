import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './home.css';
import plantsImg from '../assets/crop.jpg';
import potatoImg from '../assets/potato.jpg';
import tomatoImg from '../assets/tomato.jpg';
import { useLanguage } from "../LanguageContext.jsx";
import translations from "../translations.js";


export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const { lang, setLang } = useLanguage();
  const t = translations[lang];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToWhy = (e) => {
    e.preventDefault();
    document.getElementById('why-greeneye')?.scrollIntoView({ behavior: 'smooth' });
  };

const crops = [
  { name: 'Maize', image: plantsImg, detects: 'Early Blight, Late Blight, Leaf Mold' },
  { name: 'Potato', image: potatoImg, detects: 'Early Blight, Late Blight, Scab' },
  { name: 'Tomato', image: tomatoImg, detects: 'Blast, Bacterial Blight, Brown Spot' },
];

  const reasons = [
    {
      title: 'AI Powered',
      copy: 'Every scan runs through a model trained specifically on crop disease imagery, not a generic vision API.',
    },
    {
      title: 'Fast Prediction',
      copy: 'Upload a photo and get a diagnosis in seconds, not days waiting on an agronomist visit.',
    },
    {
      title: 'Accurate Results',
      copy: 'Confidence scores are shown alongside every result, so you know how much to trust the call.',
    },
    {
      title: 'Works for Any Plant',
      copy: 'Not locked to a handful of crops. Upload a leaf from anything you grow and GreenEye will take a look.',
    },
  ];

  return (
    <div className="home">
      <nav className={`navbar ${scrolled ? 'navbar--solid' : ''}`}>
        <div className="navbar__inner">
          <Link to="/" className="navbar__logo">
            <span className="navbar__logo-mark" aria-hidden="true">  
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="40" height="40">
            <path
              fill="#4caf50"
              d="M576 96C576 204.1 499.4 294.3 397.6 315.4C389.7 257.3 363.6 205 325.1 164.5C365.2 104 433.9 64 512 64L544 64C561.7 64 576 78.3 576 96zM64 160C64 142.3 78.3 128 96 128L128 128C251.7 128 352 228.3 352 352L352 544C352 561.7 337.7 576 320 576C302.3 576 288 561.7 288 544L288 384C164.3 384 64 283.7 64 160z"
            />
          </svg></span>
            GreenEye
          </Link>
          <div className="navbar__actions">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1.5px solid #2e7d32",
                background: "transparent",
                color: "#2e7d32",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily: "inherit",
                outline: "none",
              }}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="mr">मराठी</option>
            </select>
            <li onClick={() => scrollTo("features")}>Features</li>
            <Link to="/login" className="navbar__link">Login</Link>
            <Link to="/register" className="navbar__cta">Register</Link>
          </div>
        </div>
      </nav>

      <header className="hero">
        <div className="hero__overlay" />
        <div className="hero__content">
          <span className="hero__eyebrow">AI Plant Diagnostics</span>
          <h1 className="hero__title">
            AI-Powered Plant<br />Disease Detection
          </h1>
          <p className="hero__subtitle">
            Upload a leaf photo and GreenEye tells you what's wrong and how to
            fix it, in seconds. Built for farmers and gardeners who need an
            answer today, not after the crop is already lost.
          </p>
          <div className="hero__actions">
            <button className="btn btn--primary" onClick={() => navigate('/register')}>
              Start Detection
            </button>
            <a href="#why-greeneye" className="btn btn--ghost" onClick={scrollToWhy}>
              Learn More
            </a>
          </div>
        </div>
        <div className="hero__visual">
          <div className="scan-line" aria-hidden="true" />
          <img src="/images/hero-plant.png" alt="" className="hero__plant" />
        </div>
      </header>

      <section className="crops">
        <h2 className="section-title">Build to Identify many Crop Diseases</h2>
        <p className="section-subtitle">GreenEye help you identify diseases in your crops quickly and accurately with multiple crops and provide solutions.</p>
        <div className="crops__grid">
          {crops.map((crop) => (
            <div className="crop-card" key={crop.name}>
              <img src={crop.image} alt={`${crop.name} leaf`} className="crop-card__image" />
              <h3 className="crop-card__name">{crop.name}</h3>
              <p className="crop-card__detects">Detects: {crop.detects}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="why" id="why-greeneye">
        <h2 className="section-title">Why use GreenEye?</h2>
        <div className="why__grid">
          {reasons.map((reason) => (
            <div className="why-card" key={reason.title}>
              <span className="why-card__check" aria-hidden="true"></span>
              <h3 className="why-card__title">{reason.title}</h3>
              <p className="why-card__copy">{reason.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__brand">
            <span className="navbar__logo-mark" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="40" height="40">
            <path
              fill="#4caf50"
              d="M576 96C576 204.1 499.4 294.3 397.6 315.4C389.7 257.3 363.6 205 325.1 164.5C365.2 104 433.9 64 512 64L544 64C561.7 64 576 78.3 576 96zM64 160C64 142.3 78.3 128 96 128L128 128C251.7 128 352 228.3 352 352L352 544C352 561.7 337.7 576 320 576C302.3 576 288 561.7 288 544L288 384C164.3 384 64 283.7 64 160z"
            />
          </svg></span>
            GreenEye
          </div>
          <p className="footer__tagline">AI-powered plant disease detection for farmers and gardeners.</p>
          <div className="footer__links">
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
          <p className="footer__copyright">© {new Date().getFullYear()} GreenEye. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}