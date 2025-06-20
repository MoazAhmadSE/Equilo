import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import "../css/components/CircularLoader.css";

const CircularLoader = () => {
  return (
    <div className="circular-loader-wrapper">
      <CircularProgress size={64} thickness={5} />
    </div>
  );
};

export default CircularLoader;
