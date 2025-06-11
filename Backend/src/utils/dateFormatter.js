/**
 * Utility functions for formatting dates consistently across the application
 */

const defaultOptions = {
    dateStyle: 'medium',
    timeStyle: 'short'
};

/**
 * Format a date with optional time
 * @param {Date|string} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = defaultOptions) => {
    try {
        const dateObj = new Date(date);
        if (isNaN(dateObj)) {
            throw new Error('Invalid date');
        }
        return new Intl.DateTimeFormat('en-US', options).format(dateObj);
    } catch (error) {
        console.error('Date formatting error:', error);
        return 'Invalid date';
    }
};

/**
 * Format date only
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateOnly = (date) => {
    return formatDate(date, { dateStyle: 'medium' });
};

/**
 * Format time only
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted time string
 */
export const formatTimeOnly = (date) => {
    return formatDate(date, { timeStyle: 'short' });
};

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 * @param {Date|string} date - Date to compare
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = then - now;
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

    if (Math.abs(diffSec) < 60) return rtf.format(diffSec, 'second');
    if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
    if (Math.abs(diffHour) < 24) return rtf.format(diffHour, 'hour');
    return rtf.format(diffDay, 'day');
};