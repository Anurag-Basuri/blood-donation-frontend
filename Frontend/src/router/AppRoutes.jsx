import { Routes, Route } from 'react-router-dom';
import Login from '../pages/auth/login.jsx';
import AdminAuth from '../pages/auth/adminAuth.jsx';

const AppRoutes = () => {
	return (
		<Routes>
			<Route path="/login" element={<Login />} />
			<Route path="/admin/auth" element={<AdminAuth />} />
		</Routes>
	);
};

export default AppRoutes;
