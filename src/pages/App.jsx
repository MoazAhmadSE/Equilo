import { Outlet } from "react-router-dom";
import Header from "../components/app/Header";
import "../css/pages/App.css";

const App = () => {
  return (
    <>
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
    </>
  );
};

export default App;
