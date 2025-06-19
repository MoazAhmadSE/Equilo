import useTheme from "../hooks/useTheme";
import "../css/components/ToggleTheme.css";

const ToggleTheme = () => {
  const [theme, setTheme] = useTheme();

  return (
    <button
      className="toggle-theme-btn"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? "☀ Light" : "🌙 Dark"}
    </button>
  );
};

export default ToggleTheme;
