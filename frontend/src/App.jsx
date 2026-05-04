// App.jsx
// =======
// Root component with theme management.

import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";

export default function App() {
  // Persist theme to localStorage
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("fnd-theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("fnd-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <Home />
    </div>
  );
}
