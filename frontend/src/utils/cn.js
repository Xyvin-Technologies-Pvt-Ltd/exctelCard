/**
 * Utility function for conditionally joining class names
 * Similar to clsx/classnames but simpler
 */
export function cn(...inputs) {
    return inputs
        .filter(Boolean)
        .join(' ')
        .trim();
} 