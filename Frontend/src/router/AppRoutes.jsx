import { Routes, Route } from 'react-router-dom';
import Login from '../pages/auth/login.jsx';
import Register from '../pages/auth/register.jsx';
import AdminAuth from '../pages/auth/adminAuth.jsx';
import Homepage from '../pages/HomePage.jsx';
import UserDashboard from '../pages/dashboards/userDashboard.jsx';
import HospitalDashboard from '../pages/dashboards/hospitalDashboard.jsx';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Homepage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/auth" element={<AdminAuth />} />

      <Route path="/user/dashboard" element={<UserDashboard />} />
      <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
    </Routes>
  );
};

export default AppRoutes;
