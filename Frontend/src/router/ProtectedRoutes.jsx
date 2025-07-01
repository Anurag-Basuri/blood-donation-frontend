import { useAuth } from '../hooks/useAuth.js';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoutes = () => {
	const { user, loading } = useAuth();

	if (loading) {
		return <div>Loading...</div>;
	}

	return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoutes;
