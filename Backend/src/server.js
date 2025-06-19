import dotenv from 'dotenv';
import connectDB from './database/index.js';
import app from './app.js';

// Load environment variables
dotenv.config({
	path: './.env',
});

// Environment variables validation
const requiredEnvVars = ['PORT', 'MONGODB_URI', 'NODE_ENV', 'JWT_SECRET'];

for (const envVar of requiredEnvVars) {
	if (!process.env[envVar]) {
		console.error(`Error: ${envVar} is not defined in environment variables`);
		process.exit(1);
	}
}

const PORT = process.env.PORT || 8000;
let server;

// Start server function
const startServer = async () => {
	try {
		// Connect to database
		await connectDB();
		console.log('📦 Database connected successfully');

		// Start server
		server = app.listen(PORT, () => {
			console.log(`
🚀 Server is running in ${process.env.NODE_ENV} mode
🔗 URL: http://localhost:${PORT}
⏰ Time: ${new Date().toLocaleString()}
            `);
		});

		// Handle unhandled promise rejections
		process.on('unhandledRejection', err => {
			console.error('❌ UNHANDLED REJECTION! Shutting down...');
			console.error('Error:', err.name, err.message);
			gracefulShutdown();
		});

		// Handle uncaught exceptions
		process.on('uncaughtException', err => {
			console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
			console.error('Error:', err.name, err.message);
			process.exit(1);
		});

		// Handle SIGTERM
		process.on('SIGTERM', () => {
			console.log('👋 SIGTERM received. Performing graceful shutdown...');
			gracefulShutdown();
		});
	} catch (error) {
		console.error('❌ Database connection failed:', error.message);
		process.exit(1);
	}
};

// Graceful shutdown function
const gracefulShutdown = () => {
	console.log('🔄 Performing graceful shutdown...');
	server.close(() => {
		console.log('💤 Server closed');
		// Close database connection here if needed
		process.exit(1);
	});

	// Force shutdown after 10 seconds
	setTimeout(() => {
		console.error('⚠️ Could not close connections in time, forcefully shutting down');
		process.exit(1);
	}, 10000);
};

// Start the server
startServer();

// Export for testing purposes
export { server };
