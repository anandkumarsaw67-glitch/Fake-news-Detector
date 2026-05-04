// Footer.jsx
// ==========
// Clean animated footer with gradient text and links.

import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-scroll";

export default function Footer() {
  return (
    <footer style={{
      background: "var(--bg-primary)",
      borderTop: "1px solid var(--border)",
      padding: "60px 0 30px",
    }}>
      <div className="container">
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 40,
          marginBottom: 50,
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "var(--gradient-button)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18,
              }}>🔍</div>
              <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.1rem" }}>
                Fake<span className="gradient-text">News</span>Detector
              </span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.7, maxWidth: 240 }}>
              An AI-powered tool to help you identify and understand misinformation in the news.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p style={{ fontWeight: 700, marginBottom: 16, fontSize: "0.85rem", color: "var(--text-secondary)", letterSpacing: 1, textTransform: "uppercase" }}>
              Navigate
            </p>
            {[
              { to: "hero",   label: "Home" },
              { to: "detect", label: "Detect" },
              { to: "about",  label: "How It Works" },
            ].map(link => (
              <Link
                key={link.to}
                to={link.to}
                smooth
                duration={600}
                offset={-80}
                style={{
                  display: "block",
                  color: "var(--text-muted)",
                  marginBottom: 10,
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  transition: "color 0.2s",
                }}
                onMouseEnter={e => e.target.style.color = "var(--text-primary)"}
                onMouseLeave={e => e.target.style.color = "var(--text-muted)"}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Tech stack */}
          <div>
            <p style={{ fontWeight: 700, marginBottom: 16, fontSize: "0.85rem", color: "var(--text-secondary)", letterSpacing: 1, textTransform: "uppercase" }}>
              Built With
            </p>
            {[
              "⚛️  React + Vite",
              "🎞️  Framer Motion",
              "🐍  FastAPI (Python)",
              "🤖  Scikit-learn",
              "🧮  TF-IDF + LR Model",
            ].map(tech => (
              <p key={tech} style={{ color: "var(--text-muted)", marginBottom: 8, fontSize: "0.88rem" }}>{tech}</p>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: "1px solid var(--border)",
          paddingTop: 28,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.83rem" }}>
            © 2026 FakeNewsDetector. Built for educational purposes.
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.83rem" }}>
            Made with ❤️ using{" "}
            <span className="gradient-text" style={{ fontWeight: 600 }}>AI</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
