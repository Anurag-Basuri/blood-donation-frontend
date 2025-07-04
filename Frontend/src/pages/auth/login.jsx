import { useState } from 'react';
import axiosInstance from '../../services/api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
	const navigate = useNavigate();
	const [role, setRole] = useState('user'); // user | ngo | hospital
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleSubmit = async e => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			const res = await axiosInstance.post(`/auth/login`, {
				email,
				password,
				role,
			});
			// save user/token if needed
			navigate('/dashboard'); // update with your home/dashboard route
		} catch (err) {
			console.error(err);
			setError(err.response?.data?.message || 'Login failed.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-500 to-teal-400">
			<div className="bg-white/10 backdrop-blur-md p-10 rounded-xl shadow-lg w-full max-w-md border border-white/20">
				<h2 className="text-3xl font-bold text-white mb-6 text-center">
					Login to LifeConnect
				</h2>

				{/* Role Toggle */}
				<div className="flex mb-6 rounded-lg overflow-hidden border border-white/30">
					{['user', 'ngo', 'hospital'].map(type => (
						<button
							key={type}
							onClick={() => setRole(type)}
							className={`w-full py-2 text-sm font-semibold capitalize transition ${
								role === type
									? 'bg-white text-black'
									: 'text-white hover:bg-white/10'
							}`}
						>
							{type}
						</button>
					))}
				</div>

				<form onSubmit={handleSubmit} className="space-y-5">
					{/* Email */}
					<div>
						<label className="block text-white text-sm font-medium mb-1">Email</label>
						<input
							type="email"
							value={email}
							onChange={e => setEmail(e.target.value)}
							className="w-full px-4 py-2 rounded-md bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
							placeholder="you@example.com"
							required
						/>
					</div>

					{/* Password */}
					<div>
						<label className="block text-white text-sm font-medium mb-1">
							Password
						</label>
						<input
							type="password"
							value={password}
							onChange={e => setPassword(e.target.value)}
							className="w-full px-4 py-2 rounded-md bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
							placeholder="••••••••"
							required
						/>
					</div>

					{/* Error */}
					{error && <p className="text-red-300 text-sm">{error}</p>}

					{/* Submit */}
					<button
						type="submit"
						disabled={loading}
						className="w-full bg-white text-black font-semibold py-2 rounded-md hover:bg-white/90 transition"
					>
						{loading ? 'Logging in...' : 'Login'}
					</button>
				</form>

				<p className="text-center text-white text-sm mt-6">
					Don’t have an account?{' '}
					<a href="/register" className="underline hover:text-white/80">
						Register
					</a>
				</p>
			</div>
		</div>
	);
};

export default Login;
