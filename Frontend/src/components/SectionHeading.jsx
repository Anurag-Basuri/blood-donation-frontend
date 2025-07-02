import React from 'react';

const SectionHeading = ({ title, subtitle, icon }) => {
	return (
		<div className="text-center mb-12">
			<div className="text-red-500 text-4xl mb-4">{icon}</div>
			<h2 className="text-3xl font-bold text-gray-800">{title}</h2>
			<p className="text-gray-500 mt-2">{subtitle}</p>
		</div>
	);
};

export default SectionHeading;
