import React, { createContext, useState, useEffect } from "react";

// Tạo Context
export const ThemeContext = createContext();

// Provider Component
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");

  // Hàm áp dụng theme
  const applyTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  };

  // Hàm kiểm tra theme hệ thống
  const checkSystemTheme = () => {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    applyTheme(systemTheme);
  };

  // Xử lý khi thay đổi theme
  const handleThemeChange = (selectedTheme) => {
    setTheme(selectedTheme);

    if (selectedTheme === "system") {
      checkSystemTheme();
      // Lắng nghe thay đổi theme hệ thống
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", checkSystemTheme);
    } else {
      applyTheme(selectedTheme);
      // Xóa lắng nghe nếu không cần thiết
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", checkSystemTheme);
    }
  };

  // Khởi tạo theme khi component được mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);

    if (savedTheme === "system") {
      checkSystemTheme();
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", checkSystemTheme);
    } else {
      applyTheme(savedTheme);
    }

    // Cleanup listener khi component unmount
    return () => {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", checkSystemTheme);
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, handleThemeChange }}>
      {children}
    </ThemeContext.Provider>
  );
};
