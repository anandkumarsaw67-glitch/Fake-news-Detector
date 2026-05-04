// Navbar.jsx
// ==========
// Sticky glassmorphism navbar with smooth-scroll links and dark/light toggle.

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-scroll";

const NAV_LINKS = [
  { to: "hero",    label: "Home" },
  { to: "detect",  label: "Detect" },
  { to: "about",   label: "How It Works" },
];

export default function Navbar({ theme, toggleTheme }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 1000,
        padding: scrolled ? "10px 0" : "18px 0",
        background: scrolled
          ? "rgba(10,10,20,0.85)"
          : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "none",
        transition: "all 0.4s ease",
      }}
    >
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.04 }}
          style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "var(--gradient-button)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, boxShadow: "0 0 14px rgba(124,58,237,0.5)",
          }}>🔍</div>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.15rem" }}>
            Fake<span className="gradient-text">News</span>
          </span>
        </motion.div>

        {/* Desktop Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="nav-links-desktop">
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              smooth duration={600}
              offset={-80}
              style={{
                padding: "8px 18px",
                borderRadius: 99,
                cursor: "pointer",
                color: "var(--text-secondary)",
                fontWeight: 500,
                fontSize: "0.92rem",
                transition: "all 0.2s",
              }}
              activeStyle={{ color: "var(--text-primary)", background: "var(--border)" }}
              onMouseEnter={e => { e.target.style.color = "var(--text-primary)"; }}
              onMouseLeave={e => { e.target.style.color = "var(--text-secondary)"; }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Theme toggle */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            style={{
              width: 40, height: 40,
              borderRadius: "50%",
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, color: "var(--text-primary)",
              backdropFilter: "blur(10px)",
            }}
            title="Toggle theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </motion.button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="mobile-menu-btn"
            style={{
              display: "none",
              background: "none", border: "none",
              color: "var(--text-primary)", fontSize: 22, cursor: "pointer",
            }}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              overflow: "hidden",
              borderTop: "1px solid var(--border)",
              background: "rgba(10,10,20,0.95)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="container" style={{ padding: "12px 24px", display: "flex", flexDirection: "column", gap: 4 }}>
              {NAV_LINKS.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  smooth duration={600}
                  offset={-80}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    color: "var(--text-secondary)",
                    fontWeight: 500,
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </motion.nav>
  );
}
