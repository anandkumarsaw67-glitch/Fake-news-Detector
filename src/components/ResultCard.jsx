// ResultCard.jsx
// ==============
// Animated result card showing FAKE/REAL prediction, confidence ring, highlighted explanation,
// factor tags, and collapsible previous searches panel.

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

// ── Factor label map ──────────────────────────
const FACTOR_LABELS = {
  sensational_language:  "⚡ Sensational Language",
  all_caps_words:        "🔊 All-Caps Words",
  no_credible_sources:   "🔗 No Credible Sources",
  clickbait_patterns:    "🎣 Clickbait Patterns",
  conspiracy_language:   "🕵️ Conspiracy Language",
  emotional_manipulation:"😡 Emotional Manipulation",
  vague_attribution:     "❓ Vague Attribution",
  numerical_exaggeration:"📈 Numerical Exaggeration",
  credible_sources:      "✅ Credible Sources",
  data_backed:           "📊 Data-Backed",
  neutral_tone:          "🧘 Neutral Tone",
  verified_reports:      "📋 Verified Reports",
  expert_cited:          "🎓 Expert Cited",
  peer_reviewed:         "🔬 Peer-Reviewed Research",
};

// ── Highlight suspicious words in text ────────
function HighlightedExplanation({ text, highlightedWords }) {
  if (!highlightedWords || highlightedWords.length === 0) {
    return <p style={{ lineHeight: 1.8, color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>{text}</p>;
  }

  const escaped = highlightedWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(regex);

  return (
    <p style={{ lineHeight: 1.8, color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>
      {parts.map((part, i) =>
        highlightedWords.some(w => w.toLowerCase() === part.toLowerCase()) ? (
          <span key={i} className="highlight-word">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
}

// ── Loading Skeleton ───────────────────────────
function LoadingSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card"
      style={{ padding: 40, maxWidth: 820, margin: "0 auto" }}
    >
      <div style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="skeleton" style={{ width: 110, height: 110, borderRadius: "50%", flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div className="skeleton" style={{ height: 38, width: "60%", marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 18, width: "40%", marginBottom: 24 }} />
          <div className="skeleton" style={{ height: 16, width: "100%", marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 16, width: "90%", marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 16, width: "75%", marginBottom: 20 }} />
          <div style={{ display: "flex", gap: 8 }}>
            {[80, 100, 90].map((w, i) => (
              <div key={i} className="skeleton" style={{ height: 28, width: w, borderRadius: 99 }} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main ResultCard ────────────────────────────
export default function ResultCard({ result, loading, history, onSelectHistory }) {
  const [showHistory, setShowHistory] = useState(false);
  const cardRef = useRef(null);

  // Scroll into view when result comes in
  useEffect(() => {
    if (result && cardRef.current) {
      setTimeout(() => cardRef.current.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    }
  }, [result]);

  if (!loading && !result) return null;

  const isFake = result?.prediction === "FAKE";
  const color   = isFake ? "var(--fake-color)"  : "var(--real-color)";
  const glow    = isFake ? "var(--fake-glow)"   : "var(--real-glow)";
  const bgGlow  = isFake
    ? "rgba(239,68,68,0.08)"
    : "rgba(16,185,129,0.08)";
  const confPct = result ? Math.round(result.confidence * 100) : 0;

  return (
    <section
      ref={cardRef}
      id="result"
      style={{ padding: "60px 0 80px", background: "var(--bg-primary)" }}
    >
      <div className="container">
        {/* History toggle */}
        {history.length > 0 && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              onClick={() => setShowHistory(h => !h)}
              style={{
                padding: "8px 20px",
                borderRadius: 99,
                border: "1px solid var(--border)",
                background: "var(--bg-card)",
                color: "var(--text-secondary)",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontFamily: "var(--font-heading)",
              }}
            >
              📜 {showHistory ? "Hide" : "Show"} History ({history.length})
            </motion.button>
          </div>
        )}

        {/* History panel */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: "hidden", marginBottom: 20 }}
            >
              <div className="glass-card" style={{ padding: 20, maxWidth: 820, margin: "0 auto" }}>
                <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: 14, fontWeight: 600 }}>
                  PREVIOUS SEARCHES
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {history.map((h, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => { onSelectHistory(h); setShowHistory(false); }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 14px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border)",
                        cursor: "pointer",
                        background: "var(--bg-card)",
                        transition: "background 0.2s",
                      }}
                    >
                      <span style={{
                        fontWeight: 800,
                        fontSize: "0.75rem",
                        color: h.result.prediction === "FAKE" ? "var(--fake-color)" : "var(--real-color)",
                        minWidth: 40,
                      }}>
                        {h.result.prediction}
                      </span>
                      <span style={{
                        flex: 1,
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                        {h.text}
                      </span>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        {Math.round(h.result.confidence * 100)}%
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main result / skeleton */}
        <AnimatePresence mode="wait">
          {loading ? (
            <LoadingSkeleton key="skeleton" />
          ) : result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="glass-card"
              style={{
                padding: "40px",
                maxWidth: 820,
                margin: "0 auto",
                border: `1px solid ${isFake ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}`,
                boxShadow: `0 0 60px ${glow}, var(--shadow-card)`,
                background: bgGlow,
              }}
            >
              <div style={{
                display: "flex",
                gap: "clamp(20px, 5vw, 36px)",
                alignItems: "center",
                flexWrap: "wrap",
                justifyContent: "center",
              }}>

                {/* Confidence Ring */}
                <div style={{ flexShrink: 0, textAlign: "center" }}>
                  <div style={{ width: 120, height: 120, position: "relative" }}>
                    <CircularProgressbar
                      value={confPct}
                      text={`${confPct}%`}
                      styles={buildStyles({
                        pathColor:        color,
                        trailColor:       "var(--border)",
                        textColor:        color,
                        textSize:         "1.4rem",
                        pathTransitionDuration: 1.2,
                      })}
                    />
                  </div>
                  <p style={{ marginTop: 8, fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
                    CONFIDENCE
                  </p>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  {/* Prediction badge */}
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    style={{ marginBottom: 12 }}
                  >
                    <span
                      className={`badge ${isFake ? "badge-fake" : "badge-real"}`}
                      style={{ fontSize: "1.1rem", padding: "8px 22px", letterSpacing: 2 }}
                    >
                      {isFake ? "⚠️" : "✅"} {result.prediction}
                    </span>
                  </motion.div>

                  {/* AI Source Badge */}
                  <div style={{ marginBottom: 16 }}>
                    <span style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 6
                    }}>
                      {result.source === "gemini" ? (
                        <>✨ Powered by Google Gemini 1.5</>
                      ) : (
                        <>⚙️ Local Analysis (Gemini Offline)</>
                      )}
                    </span>
                  </div>

                  <h3 style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    marginBottom: 16,
                    color: "var(--text-primary)",
                  }}>
                    {isFake
                      ? "This appears to be Misinformation"
                      : "This appears to be Credible News"}
                  </h3>

                  {/* Factor tags */}
                  <div style={{ marginBottom: 20 }}>
                    {result.factors.map(f => (
                      <span
                        key={f}
                        className={`factor-tag ${isFake ? "factor-tag-fake" : "factor-tag-real"}`}
                      >
                        {FACTOR_LABELS[f] || f}
                      </span>
                    ))}
                  </div>

                  {/* Explanation */}
                  <div style={{
                    padding: "18px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                  }}>
                    <p style={{
                      fontSize: "0.78rem",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                      marginBottom: 10,
                      letterSpacing: 0.8,
                    }}>
                      ANALYSIS EXPLANATION
                    </p>
                    <HighlightedExplanation
                      text={result.explanation}
                      highlightedWords={result.highlighted_words}
                    />
                  </div>

                  {/* Highlighted words section */}
                  {result.highlighted_words?.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600, marginBottom: 8 }}>
                        SUSPICIOUS WORDS DETECTED
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {result.highlighted_words.map(word => (
                          <span key={word} className="highlight-word" style={{ fontSize: "0.85rem" }}>
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}
