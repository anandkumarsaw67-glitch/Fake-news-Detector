// InputSection.jsx
// ================
// News text and media input area with character counter, image upload, and animated Detect button.

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";

const EXAMPLE_NEWS = [
  {
    label: "🚨 Fake Example",
    text: "SHOCKING: Scientists discover 100% proven miracle cure for cancer that big pharma is desperately trying to hide from the public!",
    type: "fake",
  },
  {
    label: "✅ Real Example",
    text: "According to a study published in The Lancet, researchers at Oxford University found that moderate physical exercise reduces cardiovascular disease risk by 35%, based on data from 50,000 participants.",
    type: "real",
  },
];

export default function InputSection({ onDetect, loading }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const maxChars = 5000;
  const charPercent = Math.min((text.length / maxChars) * 100, 100);

  const handleDetect = () => {
    // We allow detecting if there's an image OR enough text
    if (!image && text.trim().length < 10) return;
    onDetect(text.trim(), image);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.ctrlKey) handleDetect();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <section id="detect" style={{ background: "var(--bg-secondary)", padding: "100px 0" }}>
      <div className="container">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* Title */}
          <div className="section-title">
            <h2>Analyze Your <span className="gradient-text">News</span></h2>
            <div className="section-divider" />
            <p>Paste a headline or upload an image of a news article. Our AI will analyze it for signs of misinformation.</p>
          </div>

          {/* Example buttons */}
          {!imagePreview && (
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 28, flexWrap: "wrap" }}>
              {EXAMPLE_NEWS.map(ex => (
                <motion.button
                  key={ex.label}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setText(ex.text)}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 99,
                    border: `1px solid ${ex.type === "fake" ? "rgba(239,68,68,0.4)" : "rgba(16,185,129,0.4)"}`,
                    background: ex.type === "fake" ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)",
                    color: ex.type === "fake" ? "var(--fake-color)" : "var(--real-color)",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  {ex.label}
                </motion.button>
              ))}
            </div>
          )}

          {/* Card */}
          <div className="glass-card" style={{ maxWidth: 800, margin: "0 auto", padding: "36px" }}>
            
            {/* Image Preview Area */}
            <AnimatePresence>
              {imagePreview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: "hidden", marginBottom: 20 }}
                >
                  <div style={{ position: "relative", width: "100%", maxHeight: 300, borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border)" }}>
                    <img src={imagePreview} alt="Upload preview" style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000" }} />
                    <button 
                      onClick={clearImage}
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        background: "rgba(0,0,0,0.6)",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: 32,
                        height: 32,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backdropFilter: "blur(4px)",
                        fontSize: "1.2rem"
                      }}
                    >
                      ×
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Textarea */}
            <div style={{ position: "relative", marginBottom: 20 }}>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={maxChars}
                rows={imagePreview ? 3 : 8}
                placeholder={imagePreview ? "Add context about this image (optional)..." : "Paste your news headline or article here…"}
                style={{
                  width: "100%",
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: "18px",
                  color: "var(--text-primary)",
                  fontSize: "1rem",
                  fontFamily: "var(--font-body)",
                  lineHeight: 1.7,
                  resize: "vertical",
                  outline: "none",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  boxShadow: text.length > 0 ? "0 0 0 2px rgba(124,58,237,0.2)" : "none",
                  minHeight: imagePreview ? 100 : 180,
                }}
                onFocus={e => { e.target.style.borderColor = "var(--accent-purple)"; }}
                onBlur={e => { e.target.style.borderColor = "var(--border)"; }}
              />
              {/* Char count */}
              <div style={{
                position: "absolute",
                bottom: 12,
                right: 14,
                fontSize: "0.78rem",
                color: charPercent > 90 ? "var(--accent-orange)" : "var(--text-muted)",
              }}>
                {text.length} / {maxChars}
              </div>
            </div>

            {/* Progress bar */}
            <div style={{
              height: 3,
              borderRadius: 99,
              background: "var(--border)",
              marginBottom: 24,
              overflow: "hidden",
            }}>
              <motion.div
                animate={{ width: `${charPercent}%` }}
                style={{
                  height: "100%",
                  background: charPercent > 90 ? "var(--accent-orange)" : "var(--gradient-accent)",
                  borderRadius: 99,
                  backgroundSize: "200% 100%",
                  animation: "gradientShift 3s ease infinite",
                }}
              />
            </div>

            {/* Buttons row */}
            <div style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}>
              {/* Detect Button */}
              <motion.button
                className="btn-primary"
                onClick={handleDetect}
                disabled={loading || (!image && text.trim().length < 10)}
                whileHover={{ scale: loading ? 1 : 1.04 }}
                whileTap={{ scale: loading ? 1 : 0.97 }}
                style={{ flex: "2 1 200px" }}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                    Analyzing…
                  </>
                ) : (
                  <>🔍 Detect Now</>
                )}
              </motion.button>

              {/* Upload Button */}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                style={{ display: "none" }}
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                style={{
                  padding: "14px 24px",
                  borderRadius: 99,
                  border: "1px solid var(--accent-purple)",
                  background: "rgba(124,58,237,0.1)",
                  color: "var(--accent-purple)",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600,
                  flex: "1 1 120px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8
                }}
              >
                📷 {image ? "Change Image" : "Upload Image"}
              </motion.button>

              {/* Clear Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setText(""); clearImage(); }}
                disabled={!text && !image}
                style={{
                  padding: "14px 24px",
                  borderRadius: 99,
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--text-secondary)",
                  cursor: (text || image) ? "pointer" : "not-allowed",
                  fontSize: "0.9rem",
                  fontFamily: "var(--font-heading)",
                  opacity: (text || image) ? 1 : 0.5,
                  flex: "0 1 auto",
                }}
              >
                🗑 Clear
              </motion.button>
            </div>

            <p style={{
              marginTop: 14,
              fontSize: "0.78rem",
              color: "var(--text-muted)",
              textAlign: "center",
            }}>
              {image ? "Image analysis mode active • Add context text for better results" : "Tip: Ctrl+Enter to analyze • Minimum 10 characters required"}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
