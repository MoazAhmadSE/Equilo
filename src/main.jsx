import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import AppRoutes from "./routes/AppRoutes.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

import "./index.css";
import "./assets/styles/theme.css";
import "react-toastify/dist/ReactToastify.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <div className="main-container">
          <AppRoutes />
        </div>
        <ToastContainer theme="dark" position="top-right" autoClose={3000} />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
