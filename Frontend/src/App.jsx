import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './router/AppRoutes.jsx';

const App = () => {
	return (
		<Router>
			<Toaster position="top-right" />
			<AppRoutes />
		</Router>
	);
};

export default App;
