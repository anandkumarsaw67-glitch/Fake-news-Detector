// Home.jsx
// ========
// Main page aggregating all sections.

import React, { useState, useCallback } from "react";
import Hero from "../components/Hero";
import InputSection from "../components/InputSection";
import ResultCard from "../components/ResultCard";
import AboutSection from "../components/AboutSection";
import Footer from "../components/Footer";
import { analyzeText } from "../services/api";

const MAX_HISTORY = 10;

export default function Home() {
  const [loading, setLoading]   = useState(false);
  const [result,  setResult]    = useState(null);
  const [error,   setError]     = useState(null);
  const [history, setHistory]   = useState([]);

  const handleDetect = useCallback(async (text) => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const data = await analyzeText(text);
      setResult(data);
      // Save to history (prepend, cap at MAX_HISTORY)
      setHistory(prev => [
        { text: text.length > 80 ? text.slice(0, 80) + "…" : text, result: data },
        ...prev.slice(0, MAX_HISTORY - 1),
      ]);
    } catch (err) {
      const msg = err.response?.data?.detail
        || err.message
        || "Failed to connect to the backend. Make sure the server is running on port 8000.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectHistory = useCallback((item) => {
    setResult(item.result);
  }, []);

  return (
    <>
      <Hero />
      <InputSection onDetect={handleDetect} loading={loading} />

      {/* Error banner */}
      {error && (
        <div style={{
          background: "var(--bg-primary)",
          padding: "0 0 40px",
        }}>
          <div className="container">
            <div style={{
              maxWidth: 820,
              margin: "0 auto",
              padding: 20,
              borderRadius: "var(--radius-md)",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "var(--fake-color)",
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}>
              <span style={{ fontSize: "1.3rem" }}>⚠️</span>
              <div>
                <strong style={{ display: "block", marginBottom: 4 }}>Analysis Error</strong>
                <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>{error}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <ResultCard
        result={result}
        loading={loading}
        history={history}
        onSelectHistory={handleSelectHistory}
      />
      <AboutSection />
      <Footer />
    </>
  );
}
