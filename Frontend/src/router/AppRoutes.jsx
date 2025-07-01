import { Routes, Route } from "react-router-dom";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
    </Routes>
  );
};

export default AppRoutes;
