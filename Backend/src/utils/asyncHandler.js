/**
 * Async middleware handler for Express.js routes.
 * Wraps async route handlers to automatically catch errors and forward them to Express error handlers.
 *
 * @param {Function} fn - The async route handler function (req, res, next) => {}
 * @returns {Function} Express middleware function
 * @throws {TypeError} If input is not a function
 */
const asyncHandler = fn => {
	// Validate input type during initialization
	if (typeof fn !== 'function') {
		throw new TypeError('asyncHandler requires a function argument');
	}

	return (req, res, next) => {
		// Create a safe execution context
		const executionPromise = Promise.resolve(fn(req, res, next));

		// Handle errors and process rejections
		executionPromise.catch(error => {
			// Preserve existing error status or default to 500
			if (!error.statusCode) {
				error.statusCode = 500;
			}
			next(error);
		});
	};
};

export { asyncHandler };
