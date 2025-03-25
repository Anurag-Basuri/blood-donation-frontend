import React from "react";

const Card = ({ title, description, children }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:scale-105 transition-transform">
      {children}
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2">{description}</p>
    </div>
  );
};

export default Card;
