import { useAuth } from '../hooks/useAuth';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoutes = ({ allowedRoles = [] }) => {
	const { user, loading } = useAuth();
	const location = useLocation();

	if (loading) {
		return <div className="flex justify-center items-center h-screen text-lg">Loading...</div>;
	}

	if (!user) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	if (allowedRoles.length && !allowedRoles.includes(user.role)) {
		return <Navigate to="/unauthorized" replace />;
	}

	return <Outlet />;
};

export default ProtectedRoutes;
