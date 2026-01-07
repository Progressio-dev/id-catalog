/**
 * Utility Functions and Helpers
 */

/**
 * Logger class for consistent logging
 */
export class Logger {
    constructor(moduleName) {
        this.moduleName = moduleName;
        this.logs = [];
    }

    _log(level, ...args) {
        const timestamp = new Date().toISOString();
        const message = args.join(' ');
        const logEntry = { timestamp, level, module: this.moduleName, message };
        
        this.logs.push(logEntry);
        console[level](`[${timestamp}] [${this.moduleName}] [${level.toUpperCase()}]`, ...args);
        
        // Keep only last 1000 logs
        if (this.logs.length > 1000) {
            this.logs.shift();
        }
    }

    info(...args) {
        this._log('info', ...args);
    }

    warn(...args) {
        this._log('warn', ...args);
    }

    error(...args) {
        this._log('error', ...args);
    }

    debug(...args) {
        this._log('debug', ...args);
    }

    getLogs() {
        return this.logs;
    }

    async exportLogs() {
        try {
            const logsText = this.logs.map(log => 
                `${log.timestamp} [${log.level.toUpperCase()}] [${log.module}] ${log.message}`
            ).join('\n');
            
            // In UXP, we would use the file system API to save
            console.log('Exporting logs:', logsText);
            return logsText;
        } catch (error) {
            console.error('Failed to export logs:', error);
            throw error;
        }
    }
}

/**
 * Show status message in the UI
 */
export function showStatus(message) {
    const statusElement = document.getElementById('statusMessage');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.style.color = '#6e6e6e';
    }
}

/**
 * Show error message in the UI
 */
export function showError(message) {
    const statusElement = document.getElementById('statusMessage');
    if (statusElement) {
        statusElement.textContent = '❌ ' + message;
        statusElement.style.color = '#E34850';
    }
    console.error(message);
}

/**
 * Show success message in the UI
 */
export function showSuccess(message) {
    const statusElement = document.getElementById('statusMessage');
    if (statusElement) {
        statusElement.textContent = '✓ ' + message;
        statusElement.style.color = '#2D9D78';
    }
    
    // Reset after 5 seconds
    setTimeout(() => {
        showStatus('Ready');
    }, 5000);
}

/**
 * Validate file extension
 */
export function validateFileExtension(filename, allowedExtensions) {
    const ext = filename.split('.').pop().toLowerCase();
    return allowedExtensions.includes(ext);
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Detect data type from value
 */
export function detectDataType(value) {
    if (value === null || value === undefined || value === '') {
        return 'empty';
    }
    
    // Check for number
    if (!isNaN(value) && !isNaN(parseFloat(value))) {
        return 'number';
    }
    
    // Check for boolean
    if (value === 'true' || value === 'false' || typeof value === 'boolean') {
        return 'boolean';
    }
    
    // Check for date
    const datePattern = /^\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}/;
    if (datePattern.test(value)) {
        return 'date';
    }
    
    // Check for URL
    try {
        new URL(value);
        return 'url';
    } catch (e) {
        // Not a URL
    }
    
    // Check for image path
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.tif', '.tiff', '.psd', '.ai', '.eps'];
    if (imageExtensions.some(ext => value.toLowerCase().endsWith(ext))) {
        return 'image';
    }
    
    // Default to text
    return 'text';
}

/**
 * Parse CSV line (simple implementation)
 */
export function parseCSVLine(line, delimiter = ',') {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i++; // Skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === delimiter && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result;
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Deep clone object
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    
    const clonedObj = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            clonedObj[key] = deepClone(obj[key]);
        }
    }
    return clonedObj;
}

/**
 * Generate unique ID
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9_\-\.]/gi, '_').toLowerCase();
}

/**
 * Format currency
 */
export function formatCurrency(value, currency = 'USD', locale = 'en-US') {
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency
        }).format(value);
    } catch (error) {
        return value;
    }
}

/**
 * Format date
 */
export function formatDate(value, format = 'short', locale = 'en-US') {
    try {
        const date = new Date(value);
        return new Intl.DateTimeFormat(locale, {
            dateStyle: format
        }).format(date);
    } catch (error) {
        return value;
    }
}

/**
 * Validate image path
 */
export function isValidImagePath(path) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.tif', '.tiff', '.psd', '.ai', '.eps', '.pdf'];
    return imageExtensions.some(ext => path.toLowerCase().endsWith(ext));
}

/**
 * Convert points to millimeters
 */
export function pointsToMM(points) {
    return points * 0.352778;
}

/**
 * Convert millimeters to points
 */
export function mmToPoints(mm) {
    return mm / 0.352778;
}

/**
 * Batch process array
 */
export async function batchProcess(items, batchSize, processFn, onProgress) {
    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
        batches.push(items.slice(i, i + batchSize));
    }
    
    const results = [];
    for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const batchResults = await Promise.all(batch.map(processFn));
        results.push(...batchResults);
        
        if (onProgress) {
            onProgress(results.length, items.length, `Processing batch ${i + 1} of ${batches.length}`);
        }
    }
    
    return results;
}

/**
 * Sleep/delay utility
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retry(fn, maxAttempts = 3, delayMs = 1000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === maxAttempts) {
                throw error;
            }
            await sleep(delayMs * Math.pow(2, attempt - 1));
        }
    }
}

/**
 * Get InDesign application
 */
export function getInDesignApp() {
    try {
        // In UXP, we access InDesign through the app object
        if (typeof require !== 'undefined') {
            const { app } = require('indesign');
            return app;
        }
        return null;
    } catch (error) {
        console.error('Failed to get InDesign app:', error);
        return null;
    }
}

/**
 * Get active document
 */
export function getActiveDocument() {
    try {
        const app = getInDesignApp();
        if (app && app.documents.length > 0) {
            return app.documents[0];
        }
        return null;
    } catch (error) {
        console.error('Failed to get active document:', error);
        return null;
    }
}

/**
 * Create InDesign document if none exists
 */
export async function ensureDocument() {
    try {
        const app = getInDesignApp();
        if (!app) {
            throw new Error('InDesign application not available');
        }
        
        if (app.documents.length === 0) {
            return app.documents.add();
        }
        
        return app.documents[0];
    } catch (error) {
        console.error('Failed to ensure document:', error);
        throw error;
    }
}

export default {
    Logger,
    showStatus,
    showError,
    showSuccess,
    validateFileExtension,
    formatFileSize,
    detectDataType,
    parseCSVLine,
    debounce,
    deepClone,
    generateId,
    sanitizeFilename,
    formatCurrency,
    formatDate,
    isValidImagePath,
    pointsToMM,
    mmToPoints,
    batchProcess,
    sleep,
    retry,
    getInDesignApp,
    getActiveDocument,
    ensureDocument
};
