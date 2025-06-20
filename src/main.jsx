import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./assets/styles/theme.css";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes.jsx";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <BrowserRouter>
    <div className="main-container">
      <AppRoutes />
    </div>
    <ToastContainer theme="dark" />
  </BrowserRouter>
  // </StrictMode>
);
