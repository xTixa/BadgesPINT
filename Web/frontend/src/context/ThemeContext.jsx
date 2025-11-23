import React, { createContext, useState, useContext, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Persistência no localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const persisted = localStorage.getItem("darkMode");
    return persisted === null ? false : persisted === "true";
  });

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    // Troca a classe no body globalmente
    if (darkMode) document.body.classList.add("bg-dark", "text-light");
    else document.body.classList.remove("bg-dark", "text-light");
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
