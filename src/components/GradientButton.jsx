import React from "react";

const GradientButton = ({ text, icon, className = "", glow = false }) => {
  return (
    <button
      className={`bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-full px-6 py-3 flex items-center justify-center transition-transform transform hover:scale-105 ${
        glow ? "shadow-lg shadow-red-500/50" : ""
      } ${className}`}
    >
      {text}
      {icon && <span className="ml-2">{icon}</span>}
    </button>
  );
};

export default GradientButton;
