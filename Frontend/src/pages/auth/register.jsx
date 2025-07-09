import { useState } from 'react';
import { RegisterUser } from './registerUser.jsx';
import { RegisterNGO } from './registerNGO.jsx';
import { RegisterHospital } from './registerHospital.jsx';
import { FormProvider } from '../../context/FormContext';

const roles = ['user', 'ngo', 'hospital'];

export default function Register() {
	const [step, setStep] = useState(0);
	const [role, setRole] = useState('user');

	const next = () => setStep(s => s + 1);

	return (
		<FormProvider>
			<div className="max-w-xl mx-auto p-6 space-y-6 bg-white/10 backdrop-blur rounded-xl shadow-lg">
				{step === 0 && (
					<div>
						<h2 className="text-2xl font-bold mb-4 text-white">
							Choose Your Account Type
						</h2>
						<div className="grid grid-cols-3 gap-4">
							{roles.map(r => (
								<button
									key={r}
									onClick={() => {
										setRole(r);
										next();
									}}
									className="p-4 bg-white/20 hover:bg-white/30 rounded-lg text-white transition"
								>
									{r.toUpperCase()}
								</button>
							))}
						</div>
					</div>
				)}

				{step === 1 && role === 'user' && <RegisterUser next={next} />}
				{step === 1 && role === 'ngo' && <RegisterNGO next={next} />}
				{step === 1 && role === 'hospital' && <RegisterHospital next={next} />}

				{step === 2 && (
					<div className="text-center text-white">
						🎉 Registration complete! Please check your email.
					</div>
				)}
			</div>
		</FormProvider>
	);
}
