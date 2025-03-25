import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./router/AppRoutes.jsx";

const App = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;
