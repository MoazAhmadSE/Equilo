import { Navigate, Route, Routes } from "react-router-dom";
import App from "../pages/app";
import Home from "../pages/Home";
import Group from "../pages/Group";
import Account from "../pages/Account";
import History from "../pages/History";
import PageNotFound from "../pages/PageNotFound";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import VerifyEmail from "../pages/VerifyEmail";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Navigate to="login" replace />} />
        <Route path="signup" element={<Signup />} />
        <Route path="verifyemail" element={<VerifyEmail />} />
        <Route path="login" element={<Login />} />

        <Route path="/equilo/home" element={<Home />}>
          <Route index element={<Dashboard />} />
          <Route path="group" element={<Group />} />
          <Route path="history" element={<History />} />
          <Route path="account" element={<Account />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
