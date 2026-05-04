// Hero.jsx
// ========
// Animated hero section with particle-like floating orbs, typing animation, and gradient background.

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { Link } from "react-scroll";

// ── Floating Orb ──────────────────────────────
function Orb({ top, left, size, color, delay, duration }) {
  return (
    <motion.div
      animate={{ y: [0, -24, 0], x: [0, 12, 0], scale: [1, 1.08, 1] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
      style={{
        position: "absolute",
        top, left,
        width: size, height: size,
        borderRadius: "50%",
        background: color,
        filter: "blur(60px)",
        opacity: 0.35,
        pointerEvents: "none",
      }}
    />
  );
}

// ── Particle Canvas ───────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(124,58,237,${p.alpha})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

export default function Hero() {
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
  };
  const childVariants = {
    hidden:  { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  return (
    <section
      id="hero"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: "var(--gradient-hero)",
      }}
    >
      <ParticleCanvas />

      {/* Background orbs */}
      <Orb top="10%"  left="5%"  size="400px" color="radial-gradient(circle, #7c3aed, transparent)" delay={0}   duration={7} />
      <Orb top="60%"  left="70%" size="350px" color="radial-gradient(circle, #2563eb, transparent)" delay={1.5} duration={9} />
      <Orb top="30%"  left="80%" size="250px" color="radial-gradient(circle, #06b6d4, transparent)" delay={0.8} duration={6} />
      <Orb top="75%"  left="10%" size="280px" color="radial-gradient(circle, #4f46e5, transparent)" delay={2}   duration={8} />

      <div className="container" style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible">

          {/* Badge */}
          <motion.div variants={childVariants}>
            <span className="badge badge-fake" style={{ marginBottom: 24, display: "inline-flex" }}>
              🤖 &nbsp; AI-Powered Detection
            </span>
          </motion.div>

          {/* Main title */}
          <motion.h1 variants={childVariants} style={{
            fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: 24,
            letterSpacing: "-0.02em",
          }}>
            Detect{" "}
            <span className="gradient-text">Fake News</span>
            <br />
            <span style={{ color: "var(--text-secondary)", fontWeight: 700 }}>Instantly</span>
          </motion.h1>

          {/* Typing subtitle */}
          <motion.div variants={childVariants} style={{
            fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
            color: "var(--text-secondary)",
            marginBottom: 48,
            height: "2.2em",
          }}>
            <TypeAnimation
              sequence={[
                "Paste any headline and let AI analyze it.",
                2500,
                "Get confidence scores and keyword highlights.",
                2500,
                "Understand why something is fake or real.",
                2500,
                "Fight misinformation with intelligence.",
                2500,
              ]}
              repeat={Infinity}
              speed={55}
            />
          </motion.div>

          {/* CTA buttons */}
          <motion.div variants={childVariants} style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="detect" smooth duration={700} offset={-80}>
              <motion.button
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                style={{ fontSize: "1.05rem", padding: "16px 44px" }}
              >
                🔍 Start Detecting
              </motion.button>
            </Link>
            <Link to="about" smooth duration={700} offset={-80}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: "16px 36px",
                  border: "1px solid var(--border)",
                  borderRadius: 99,
                  background: "var(--bg-card)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: 500,
                  backdropFilter: "blur(12px)",
                  fontFamily: "var(--font-heading)",
                }}
              >
                How It Works →
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={childVariants}
            style={{
              display: "flex",
              gap: "min(40px, 8vw)",
              justifyContent: "center",
              marginTop: 72,
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "Accuracy",    value: "94%",   icon: "🎯" },
              { label: "Analyses",    value: "50K+", icon: "📰" },
              { label: "Indicators",  value: "20+",   icon: "🔎" },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: "center", minWidth: 100 }}>
                <div style={{ fontSize: "1.8rem", marginBottom: 4 }}>{stat.icon}</div>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.2rem, 4vw, 1.8rem)", fontWeight: 800 }} className="gradient-text">
                  {stat.value}
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.8 }}
        style={{
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          color: "var(--text-muted)",
          fontSize: "1.5rem",
          cursor: "pointer",
        }}
      >
        ↓
      </motion.div>
    </section>
  );
}
