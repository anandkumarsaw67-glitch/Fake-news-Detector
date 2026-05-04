// AboutSection.jsx
// ================
// Explains how the AI model works with step cards and a feature grid.

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const STEPS = [
  {
    icon: "📝",
    title: "Text Input",
    desc: "You paste a news headline or full article into the detector.",
    color: "#7c3aed",
  },
  {
    icon: "🧠",
    title: "NLP Analysis",
    desc: "TF-IDF vectorization extracts the most important terms and n-grams from the text.",
    color: "#2563eb",
  },
  {
    icon: "🤖",
    title: "ML Classification",
    desc: "A trained Logistic Regression model predicts FAKE or REAL with a confidence probability.",
    color: "#06b6d4",
  },
  {
    icon: "🔎",
    title: "Explainability",
    desc: "Our rule-based layer highlights suspicious words and explains the reasoning behind the verdict.",
    color: "#10b981",
  },
];

const FEATURES = [
  { icon: "⚡", title: "Sensational Language", desc: "Detects clickbait and emotionally manipulative phrasing designed to provoke reactions." },
  { icon: "🔗", title: "Source Credibility", desc: "Checks for references to credible institutions, studies, or verified officials." },
  { icon: "📊", title: "Confidence Score", desc: "Shows how confident the model is in its prediction as a percentage." },
  { icon: "🕵️", title: "Conspiracy Patterns", desc: "Identifies common conspiracy language like 'deep state', 'cover-up', 'they don't want you to know'." },
  { icon: "📰", title: "Tone Analysis", desc: "Evaluates whether the writing is neutral/factual or biased and exaggerated." },
  { icon: "💡", title: "Keyword Highlights", desc: "Visually highlights the suspicious words that influenced the classification." },
];

function StepCard({ step, index }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="glass-card"
      style={{ padding: "30px", display: "flex", gap: 20, alignItems: "flex-start" }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: "var(--radius-md)",
        background: `${step.color}22`,
        border: `1px solid ${step.color}44`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.6rem", flexShrink: 0,
        boxShadow: `0 0 20px ${step.color}22`,
      }}>
        {step.icon}
      </div>
      <div>
        <div style={{
          display: "flex", alignItems: "center", gap: 12, marginBottom: 8,
        }}>
          <span style={{
            width: 26, height: 26, borderRadius: "50%",
            background: step.color, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.8rem", fontWeight: 800, flexShrink: 0,
          }}>
            {index + 1}
          </span>
          <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.05rem" }}>
            {step.title}
          </h4>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.65 }}>
          {step.desc}
        </p>
      </div>
    </motion.div>
  );
}

function FeatureCard({ feature, index }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="glass-card"
      style={{ padding: 24 }}
      whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(124,58,237,0.15)" }}
    >
      <div style={{ fontSize: "2rem", marginBottom: 12 }}>{feature.icon}</div>
      <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, marginBottom: 8 }}>{feature.title}</h4>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.65 }}>{feature.desc}</p>
    </motion.div>
  );
}

export default function AboutSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.05 });

  return (
    <section id="about" style={{ background: "var(--bg-secondary)" }}>
      <div className="container">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="section-title"
        >
          <h2>How It <span className="gradient-text">Works</span></h2>
          <div className="section-divider" />
          <p>Our system combines machine learning and rule-based NLP to deliver accurate, explainable fake news detection.</p>
        </motion.div>

        {/* Steps */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
          gap: 20,
          marginBottom: 80,
        }}>
          {STEPS.map((step, i) => <StepCard key={step.title} step={step} index={i} />)}
        </div>

        {/* Feature grid */}
        <motion.h3
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
          style={{
            textAlign: "center",
            fontFamily: "var(--font-heading)",
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: 36,
            color: "var(--text-secondary)",
          }}
        >
          Detection Features
        </motion.h3>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 18,
        }}>
          {FEATURES.map((f, i) => <FeatureCard key={f.title} feature={f} index={i} />)}
        </div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          style={{
            marginTop: 60,
            padding: "24px 32px",
            borderRadius: "var(--radius-lg)",
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.25)",
            display: "flex",
            gap: 16,
            alignItems: "flex-start",
          }}
        >
          <span style={{ fontSize: "1.5rem" }}>⚠️</span>
          <div>
            <p style={{ fontWeight: 600, marginBottom: 4, color: "var(--accent-orange)" }}>
              Important Disclaimer
            </p>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7 }}>
              This tool is intended as an educational aid and a first-pass filter. 
              It is not 100% accurate. Always verify important news through multiple 
              trusted, established sources. AI models can make mistakes.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
