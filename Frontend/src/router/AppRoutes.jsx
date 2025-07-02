import { Routes, Route } from 'react-router-dom';
import Auth from '../pages/auth/auth.jsx';

const AppRoutes = () => {
	return (
		<Routes>
			<Route path="/auth" element={<Auth />} />
		</Routes>
	);
};

export default AppRoutes;
