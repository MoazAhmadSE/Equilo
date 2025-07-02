import { Route, Routes, Navigate } from "react-router-dom"; // ⬅️ Add Navigate
import App from "../pages/App";
import Home from "../pages/Home";
import Group from "../pages/Group";
import Account from "../pages/Account";
import History from "../pages/History";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import VerifyEmail from "../pages/VerifyEmail";
import ResetPassword from "../pages/ResetPassword";
import JoinGroupPage from "../pages/JoinGroupPage";
import RedirectGate from "./RedirectGate";
import PageNotFound from "../pages/PageNotFound";

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <RedirectGate>
            <App />
          </RedirectGate>
        }
      >
        {/* ✅ Redirect root `/` to `/login` */}
        <Route index element={<Navigate to="/login" replace />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="verifyemail" element={<VerifyEmail />} />
        <Route path="resetpassword" element={<ResetPassword />} />

        <Route path="equilo/home" element={<Home />}>
          <Route index element={<Dashboard />} />
          <Route path="group/:groupId" element={<Group />} />
          <Route path="history" element={<History />} />
          <Route path="account" element={<Account />} />
          <Route path="group/join/:groupId" element={<JoinGroupPage />} />
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
