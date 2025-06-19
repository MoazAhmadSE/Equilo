import { useEffect, useState } from "react"

const useTheme = () => {
    const [theme, setTheme] = useState(() =>
        localStorage.getItem("theme") === "dark" ? "dark" : "light"
    );

    useEffect(() => {
        const html = document.documentElement;
        if (theme === "dark") {
            html.classList.add("dark");
        } else {
            html.classList.remove("dark");
        }
        localStorage.setItem("theme", theme);
    }, [theme])

    return [theme, setTheme];
};

export default useTheme;