// import { createContext, useState, useEffect } from "react";

// export const ThemeContext = createContext();

// export const ThemeProvider = ({ children }) => {
//     // Lấy theme từ localStorage hoặc theo system
//     const getInitialTheme = () => {
//         const savedTheme = localStorage.getItem("theme");
//         if (savedTheme) return savedTheme;

//         const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
//         return systemPrefersDark ? "dark" : "light";
//     };

//     const [theme, setTheme] = useState(getInitialTheme);
//     const [mode, setMode] = useState(localStorage.getItem("mode") || "system");

//     useEffect(() => {
//         if (mode === "system") {
//             const systemMedia = window.matchMedia("(prefers-color-scheme: dark)");
//             const updateTheme = () => setTheme(systemMedia.matches ? "dark" : "light");

//             updateTheme();
//             systemMedia.addEventListener("change", updateTheme);

//             return () => systemMedia.removeEventListener("change", updateTheme);
//         } else {
//             setTheme(mode);
//         }

//         localStorage.setItem("theme", theme);
//         localStorage.setItem("mode", mode);
//         document.documentElement.setAttribute("data-theme", theme);
//     }, [theme, mode]);

//     // Thay đổi mode (light, dark, system)
//     const toggleTheme = (newMode) => {
//         setMode(newMode);
//         if (newMode === "system") {
//             const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
//             setTheme(systemPrefersDark ? "dark" : "light");
//         } else {
//             setTheme(newMode);
//         }
//     };

//     return (
//         <ThemeContext.Provider value={{ theme, mode, toggleTheme }}>
//             {children}
//         </ThemeContext.Provider>
//     );
// };
import { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const getInitialTheme = () => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) return savedTheme;

        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        return systemPrefersDark ? "dark" : "light";
    };

    const [theme, setTheme] = useState(getInitialTheme);
    const [mode, setMode] = useState(localStorage.getItem("mode") || "system");

    useEffect(() => {
        if (mode === "system") {
            const systemMedia = window.matchMedia("(prefers-color-scheme: dark)");
            const updateTheme = () => setTheme(systemMedia.matches ? "dark" : "light");

            updateTheme();
            systemMedia.addEventListener("change", updateTheme);
            console.log("Đã thêm sự kiện thay đổi theme hệ thống", systemMedia.matches ? "dark" : "light");
            
            return () => systemMedia.removeEventListener("change", updateTheme);
        } else {
            setTheme(mode);
        }
        // Chỉ update localStorage khi theme hoặc mode thay đổi
        localStorage.setItem("theme", theme);
        localStorage.setItem("mode", mode);
        document.documentElement.setAttribute("data-theme", theme); // Set lại theme cho thẻ <html>
    }, [theme, mode]);

    const toggleTheme = (newMode) => {
        setMode(newMode);
        if (newMode === "system") {
            const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            setTheme(systemPrefersDark ? "dark" : "light");
            console.log("Đã chuyển sang chế độ hệ thống", systemPrefersDark ? "dark" : "light");
            
        } else {
            setTheme(newMode);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, mode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
