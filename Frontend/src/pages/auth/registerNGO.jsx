import React from 'react';
import { Heart, Users, Building2 } from 'lucide-react';

const AccountTypeStep = ({ setRole, next }) => {
	const roles = [
		{
			id: 'user',
			label: 'Normal User',
			icon: Heart,
			color: 'from-red-500 via-pink-500 to-rose-500',
			description: 'Register to donate blood and save lives',
		},
		{
			id: 'ngo',
			label: 'NGO',
			icon: Users,
			color: 'from-green-500 via-emerald-500 to-teal-500',
			description: 'Register your organization to organize blood drives',
		},
		{
			id: 'hospital',
			label: 'Hospital',
			icon: Building2,
			color: 'from-blue-500 via-cyan-500 to-teal-500',
			description: 'Register your hospital to connect with donors',
		},
	];

	return (
		<div className="space-y-8">
			<div className="text-center">
				<div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
					<Users className="w-8 h-8 text-white" />
				</div>
				<h2 className="text-3xl font-bold text-white mb-2">Create Your Account</h2>
				<p className="text-gray-300">Join our lifesaving community today</p>
			</div>

			<div className="space-y-4">
				<h3 className="text-xl font-semibold text-white mb-4">Select Account Type</h3>
				<div className="grid grid-cols-1 gap-4">
					{roles.map(r => (
						<button
							key={r.id}
							onClick={() => {
								setRole(r.id);
								setTimeout(next, 300);
							}}
							className={`p-6 rounded-xl border-2 transition-all duration-300 group relative overflow-hidden text-left hover:scale-[1.02] ${
								r.id === 'user'
									? `border-white/20 hover:border-white/40 bg-gradient-to-r ${r.color}/10 hover:${r.color}/20`
									: `border-white/20 hover:border-white/40 bg-white/5`
							}`}
						>
							<div className="flex items-center space-x-4 relative z-10">
								<div
									className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
										r.id === 'user'
											? 'bg-gradient-to-r from-red-500 to-pink-500'
											: r.id === 'ngo'
											? 'bg-gradient-to-r from-green-500 to-teal-500'
											: 'bg-gradient-to-r from-blue-500 to-cyan-500'
									}`}
								>
									<r.icon className="w-7 h-7 text-white" />
								</div>
								<div>
									<p className="font-semibold text-lg text-white">{r.label}</p>
									<p className="text-sm text-gray-300">{r.description}</p>
								</div>
							</div>
							<div
								className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-r ${r.color}`}
							></div>
						</button>
					))}
				</div>
			</div>
		</div>
	);
};

export default AccountTypeStep;
