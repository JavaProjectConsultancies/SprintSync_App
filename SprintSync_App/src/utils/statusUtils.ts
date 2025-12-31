import { WorkflowLane } from '../services/api/entities/workflowLaneApi';

/**
 * Standard status labels for common task/issue statuses
 */
const STANDARD_STATUS_LABELS: Record<string, string> = {
    'todo': 'To Do',
    'to_do': 'To Do',
    'inprogress': 'In Progress',
    'in_progress': 'In Progress',
    'qa': 'QA/Review',
    'qa_review': 'QA/Review',
    'done': 'Done',
    'completed': 'Done',
    'blocked': 'Blocked',
    'cancelled': 'Cancelled',
    'backlog': 'Backlog',
    'stories': 'Stories',
};

/**
 * Standard status colors for common task/issue statuses
 */
const STANDARD_STATUS_COLORS: Record<string, string> = {
    'todo': 'bg-blue-100 text-blue-800 border-blue-200',
    'to_do': 'bg-blue-100 text-blue-800 border-blue-200',
    'inprogress': 'bg-orange-100 text-orange-800 border-orange-200',
    'in_progress': 'bg-orange-100 text-orange-800 border-orange-200',
    'qa': 'bg-purple-100 text-purple-800 border-purple-200',
    'qa_review': 'bg-purple-100 text-purple-800 border-purple-200',
    'done': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'completed': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'blocked': 'bg-red-100 text-red-800 border-red-200',
    'cancelled': 'bg-gray-100 text-gray-800 border-gray-200',
    'backlog': 'bg-gray-100 text-gray-800 border-gray-200',
    'stories': 'bg-green-100 text-green-800 border-green-200',
};

/**
 * Check if a status value represents a custom lane
 */
export function isCustomLaneStatus(status?: string | null): boolean {
    if (!status) return false;
    return status.startsWith('custom_lane_');
}

/**
 * Get the display label for a status value.
 * Checks standard statuses first, then looks up custom lane names from provided workflow lanes.
 * 
 * @param status - The status value to get a label for
 * @param workflowLanes - Optional array of workflow lanes to look up custom lane names
 * @returns The human-readable label for the status
 */
export function getStatusLabel(
    status?: string | null,
    workflowLanes?: WorkflowLane[]
): string {
    if (!status) return 'Unknown';

    const normalizedStatus = status.toLowerCase().trim();

    // Check standard status labels first
    if (STANDARD_STATUS_LABELS[normalizedStatus]) {
        return STANDARD_STATUS_LABELS[normalizedStatus];
    }

    // Check if this is a custom lane status
    if (isCustomLaneStatus(status) && workflowLanes && workflowLanes.length > 0) {
        const lane = workflowLanes.find(l => l.statusValue === status);
        if (lane) {
            return lane.title;
        }
    }

    // If workflow lanes are provided, also check if status matches any lane's statusValue
    if (workflowLanes && workflowLanes.length > 0) {
        const lane = workflowLanes.find(l => l.statusValue === status);
        if (lane) {
            return lane.title;
        }
    }

    // Fallback: format the status value nicely
    return formatStatusValue(status);
}

/**
 * Get the color classes for a status value.
 * Checks standard statuses first, then looks up custom lane colors from provided workflow lanes.
 * 
 * @param status - The status value to get colors for
 * @param workflowLanes - Optional array of workflow lanes to look up custom lane colors
 * @returns The color classes for the status
 */
export function getStatusColor(
    status?: string | null,
    workflowLanes?: WorkflowLane[]
): string {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200';

    const normalizedStatus = status.toLowerCase().trim();

    // Check standard status colors first
    if (STANDARD_STATUS_COLORS[normalizedStatus]) {
        return STANDARD_STATUS_COLORS[normalizedStatus];
    }

    // Check if this is a custom lane status and get its color
    if (workflowLanes && workflowLanes.length > 0) {
        const lane = workflowLanes.find(l => l.statusValue === status);
        if (lane && lane.color) {
            // Convert hex color to tailwind-like classes
            return getColorClassesFromHex(lane.color);
        }
    }

    // Default color
    return 'bg-gray-100 text-gray-800 border-gray-200';
}

/**
 * Format a raw status value into a human-readable string
 * @param status - Raw status value (e.g., "custom_lane_123" or "in_progress")
 * @returns Formatted string (e.g., "Custom Lane" or "In Progress")
 */
export function formatStatusValue(status: string): string {
    // Remove custom_lane_ prefix and underscores/dashes
    let formatted = status
        .replace(/^custom_lane_\d+$/, 'Custom')
        .replace(/custom_lane_/gi, '')
        .replace(/_/g, ' ')
        .replace(/-/g, ' ');

    // Capitalize first letter of each word
    formatted = formatted
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

    return formatted;
}

/**
 * Convert a hex color to approximate Tailwind-like background/text/border classes
 */
function getColorClassesFromHex(hex: string): string {
    // For simplicity, return a style-based approach
    // In practice, you might want to map to actual Tailwind classes
    const rgb = hexToRgb(hex);
    if (!rgb) {
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }

    // Create a lighter version for background
    // This is a simple approximation - actual implementation might need CSS custom properties
    return `bg-opacity-10 text-current border-opacity-30`;
}

/**
 * Convert hex color to RGB object
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
}

/**
 * Get inline styles for a custom lane color
 * Use this when you need more precise color control than Tailwind classes
 */
export function getCustomLaneStyles(color: string): {
    backgroundColor: string;
    color: string;
    borderColor: string;
} {
    const rgb = hexToRgb(color);
    if (!rgb) {
        return {
            backgroundColor: '#f3f4f6',
            color: '#1f2937',
            borderColor: '#e5e7eb',
        };
    }

    return {
        backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
        color: color,
        borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
    };
}

/**
 * Normalize a status string for comparison
 */
export function normalizeStatus(status?: string | null): string {
    if (!status) return '';
    return status.toLowerCase().trim().replace(/-/g, '_');
}
