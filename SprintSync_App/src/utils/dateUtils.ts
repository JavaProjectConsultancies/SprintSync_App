/**
 * Centralized Date Utility Functions for SprintSync
 * All date formatting and parsing should use these functions
 * Standard Format: DD-MM-YYYY
 */

/**
 * Format a date to DD-MM-YYYY format
 * @param dateInput - Date object, ISO string, or any parseable date string
 * @returns Formatted date string in DD-MM-YYYY format
 */
export const formatDateDDMMYYYY = (dateInput: Date | string | null | undefined): string => {
    if (!dateInput) return '';

    try {
        let date: Date;
        if (typeof dateInput === 'string') {
            // If it's a YYYY-MM-DD string (no time), parse it manually to avoid UTC offset
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
                const [year, month, day] = dateInput.split('-').map(Number);
                date = new Date(year, month - 1, day);
            } else {
                date = new Date(dateInput);
            }
        } else {
            date = dateInput;
        }

        if (isNaN(date.getTime())) {
            return '';
        }

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    } catch {
        return '';
    }
};

/**
 * Format a date with time in DD-MM-YYYY HH:MM format
 * @param dateInput - Date object or ISO string
 * @returns Formatted date string with time
 */
export const formatDateTimeDDMMYYYY = (dateInput: Date | string | null | undefined): string => {
    if (!dateInput) return '';

    try {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

        if (isNaN(date.getTime())) {
            return '';
        }

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${day}-${month}-${year} ${hours}:${minutes}`;
    } catch {
        return '';
    }
};

/**
 * Format a date for display in short format (DD-MM-YY)
 * @param dateInput - Date object or ISO string
 * @returns Short formatted date string
 */
export const formatDateShort = (dateInput: Date | string | null | undefined): string => {
    if (!dateInput) return '';

    try {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

        if (isNaN(date.getTime())) {
            return '';
        }

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);

        return `${day}-${month}-${year}`;
    } catch {
        return '';
    }
};

/**
 * Format a date with month name (DD Mon YYYY)
 * @param dateInput - Date object or ISO string
 * @returns Formatted date string with month name
 */
export const formatDateWithMonth = (dateInput: Date | string | null | undefined): string => {
    if (!dateInput) return '';

    try {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

        if (isNaN(date.getTime())) {
            return '';
        }

        const day = String(date.getDate()).padStart(2, '0');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();

        return `${day} ${month} ${year}`;
    } catch {
        return '';
    }
};

/**
 * Parse DD-MM-YYYY string to Date object
 * @param dateString - Date string in DD-MM-YYYY format
 * @returns Date object or null if invalid
 */
export const parseDDMMYYYY = (dateString: string): Date | null => {
    if (!dateString) return null;

    try {
        // Handle DD-MM-YYYY format
        const ddmmyyyyRegex = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
        const match = dateString.match(ddmmyyyyRegex);

        if (match) {
            const day = parseInt(match[1], 10);
            const month = parseInt(match[2], 10) - 1; // Months are 0-indexed
            const year = parseInt(match[3], 10);

            const date = new Date(year, month, day);

            // Validate the date is valid
            if (date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
                return date;
            }
        }

        // Try parsing as ISO string or other formats
        // If it's a YYYY-MM-DD string, parse it as local time
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            const [year, month, day] = dateString.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            return isNaN(date.getTime()) ? null : date;
        }

        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
    } catch {
        return null;
    }
};

/**
 * Convert date to ISO string format for API/database
 * @param dateInput - Date object or date string
 * @returns ISO string format (YYYY-MM-DDTHH:mm:ss.sssZ)
 */
export const toISOString = (dateInput: Date | string | null | undefined): string => {
    if (!dateInput) return '';

    try {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

        if (isNaN(date.getTime())) {
            return '';
        }

        return date.toISOString();
    } catch {
        return '';
    }
};

/**
 * Convert date to YYYY-MM-DD format for HTML date inputs and database
 * @param dateInput - Date object or date string
 * @returns Date string in YYYY-MM-DD format
 */
export const toDateInputFormat = (dateInput: Date | string | null | undefined): string => {
    if (!dateInput) return '';

    try {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

        if (isNaN(date.getTime())) {
            return '';
        }

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    } catch {
        return '';
    }
};

/**
 * Get relative time string (e.g., "2 hours ago", "3 days ago")
 * @param dateInput - Date object or ISO string
 * @returns Relative time string
 */
export const getRelativeTime = (dateInput: Date | string | null | undefined): string => {
    if (!dateInput) return '';

    try {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

        if (isNaN(date.getTime())) {
            return '';
        }

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        const diffMonths = Math.floor(diffDays / 30);
        const diffYears = Math.floor(diffDays / 365);

        if (diffYears > 0) return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
        if (diffMonths > 0) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
        if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        return 'Just now';
    } catch {
        return '';
    }
};

/**
 * Format date for calendar display (Month and Year)
 * @param dateInput - Date object or ISO string
 * @returns Month and Year string (e.g., "December 2024")
 */
export const formatMonthYear = (dateInput: Date | string | null | undefined): string => {
    if (!dateInput) return '';

    try {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

        if (isNaN(date.getTime())) {
            return '';
        }

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    } catch {
        return '';
    }
};

// Legacy alias for backward compatibility - use formatDateDDMMYYYY instead
export const formatDate = formatDateDDMMYYYY;
