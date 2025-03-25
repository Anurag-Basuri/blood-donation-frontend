import React from "react";

const TestimonialCard = ({ quote, author, role, avatar }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <p className="text-gray-700 italic mb-4">"{quote}"</p>
      <div className="flex items-center">
        <img
          src={avatar}
          alt={`${author}'s avatar`}
          className="w-12 h-12 rounded-full mr-4"
        />
        <div>
          <h4 className="text-lg font-semibold">{author}</h4>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
