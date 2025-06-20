import { Outlet } from "react-router-dom";
import ToggleTheme from "../components/ToggleTheme";
import constants from "../assets/constants/static.json";
import "../css/pages/App.css";

const App = () => {
  return (
    <>
      <header className="navbar-container">
        <div className="navbar">
          <div className="app-name">{constants.appName}</div>
          <div className="toggle-userinfo">
            <ToggleTheme />
            <div className="user"></div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>
    </>
  );
};

export default App;
