// api.js
// ======
// Service layer for communicating with the FastAPI backend.

import axios from "axios";

const BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

/**
 * Analyze a news text for fake/real classification.
 * @param {string} text - The news headline or article to analyze.
 * @returns {Promise<{prediction: string, confidence: number, explanation: string, highlighted_words: string[], factors: string[]}>}
 */
export async function analyzeText(text) {
  const response = await api.post("/analyze", { text });
  return response.data;
}

export default api;
