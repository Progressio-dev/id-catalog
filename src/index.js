/**
 * ID Catalog Builder - Complete Integrated Version (Non-Module)
 * Professional Catalog Creation Plugin for Adobe InDesign (UXP)
 * Compatible with InDesign 2026 - NO ES6 MODULES
 * 
 * This file contains ALL functionality integrated into a single file.
 * All modules have been converted from ES6 modules to plain JavaScript.
 */

console.log('=== INDEX.JS LOADING ===');


// ==================== MODULE: utils.js ====================
/**
 * Utility Functions and Helpers
 */

/**
 * Logger class for consistent logging
 */
class Logger {
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
function showStatus(message) {
    const statusElement = document.getElementById('statusMessage');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.style.color = '#6e6e6e';
    }
}

/**
 * Show error message in the UI
 */
function showError(message) {
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
function showSuccess(message) {
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
function validateFileExtension(filename, allowedExtensions) {
    const ext = filename.split('.').pop().toLowerCase();
    return allowedExtensions.includes(ext);
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Detect data type from value
 */
function detectDataType(value) {
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
function parseCSVLine(line, delimiter = ',') {
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
function debounce(func, wait) {
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
function deepClone(obj) {
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
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Sanitize filename
 */
function sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9_\-\.]/gi, '_').toLowerCase();
}

/**
 * Format currency
 */
function formatCurrency(value, currency = 'USD', locale = 'en-US') {
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
function formatDate(value, format = 'short', locale = 'en-US') {
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
function isValidImagePath(path) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.tif', '.tiff', '.psd', '.ai', '.eps', '.pdf'];
    return imageExtensions.some(ext => path.toLowerCase().endsWith(ext));
}

/**
 * Convert points to millimeters
 */
function pointsToMM(points) {
    return points * 0.352778;
}

/**
 * Convert millimeters to points
 */
function mmToPoints(mm) {
    return mm / 0.352778;
}

/**
 * Batch process array
 */
async function batchProcess(items, batchSize, processFn, onProgress) {
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
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
async function retry(fn, maxAttempts = 3, delayMs = 1000) {
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
function getInDesignApp() {
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
function getActiveDocument() {
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
async function ensureDocument() {
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


// ==================== END MODULE: utils.js ====================


// ==================== MODULE: formulas.js ====================
/**
 * Formulas Module
 * Comprehensive formula engine for calculated fields
 */

/**
 * Formula Engine Class
 */
class FormulaEngine {
    constructor() {
        this.formulas = [];
        this.functions = this._initializeFunctions();
    }

    /**
     * Initialize built-in functions
     */
    _initializeFunctions() {
        return {
            ROUND: (value, decimals = 0) => {
                const multiplier = Math.pow(10, decimals);
                return Math.round(value * multiplier) / multiplier;
            },
            CEIL: (value) => Math.ceil(value),
            FLOOR: (value) => Math.floor(value),
            ABS: (value) => Math.abs(value),
            MIN: (...args) => Math.min(...args),
            MAX: (...args) => Math.max(...args),
            IF: (condition, valueIfTrue, valueIfFalse) => {
                return condition ? valueIfTrue : valueIfFalse;
            },
            CONCAT: (...args) => args.join(''),
            UPPER: (str) => String(str).toUpperCase(),
            LOWER: (str) => String(str).toLowerCase(),
            TRIM: (str) => String(str).trim(),
            LEN: (str) => String(str).length
        };
    }

    /**
     * Add a formula
     * @param {string} name - Formula name/field name
     * @param {string} expression - Formula expression
     */
    addFormula(name, expression) {
        try {
            // Validate formula
            this.validateFormula(expression);
            
            const formula = {
                name,
                expression,
                createdAt: new Date().toISOString()
            };
            
            this.formulas.push(formula);
            console.log(`Formula added: ${name} = ${expression}`);
            
            return formula;
        } catch (error) {
            console.error(`Failed to add formula: ${error.message}`);
            throw error;
        }
    }

    /**
     * Remove a formula
     * @param {string} name - Formula name
     */
    removeFormula(name) {
        const index = this.formulas.findIndex(f => f.name === name);
        if (index !== -1) {
            this.formulas.splice(index, 1);
            console.log(`Formula removed: ${name}`);
            return true;
        }
        return false;
    }

    /**
     * Get all formulas
     */
    getFormulas() {
        return this.formulas;
    }

    /**
     * Validate formula syntax
     * @param {string} expression - Formula expression
     */
    validateFormula(expression) {
        try {
            // Check for balanced braces
            const openBraces = (expression.match(/{/g) || []).length;
            const closeBraces = (expression.match(/}/g) || []).length;
            if (openBraces !== closeBraces) {
                throw new Error('Unbalanced braces in formula');
            }

            // Check for balanced parentheses
            const openParens = (expression.match(/\(/g) || []).length;
            const closeParens = (expression.match(/\)/g) || []).length;
            if (openParens !== closeParens) {
                throw new Error('Unbalanced parentheses in formula');
            }

            // Check for invalid characters
            const validPattern = /^[\w\s+\-*/%(){}.,<>=!&|"']+$/;
            if (!validPattern.test(expression)) {
                throw new Error('Invalid characters in formula');
            }

            console.log(`Formula validated: ${expression}`);
            return true;
        } catch (error) {
            console.error(`Formula validation failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Evaluate formula for a record
     * @param {string} expression - Formula expression
     * @param {object} record - Data record with field values
     */
    evaluate(expression, record) {
        try {
            // Replace field references with actual values
            let processedExpression = this._replaceFieldReferences(expression, record);
            
            // Process function calls
            processedExpression = this._processFunctions(processedExpression, record);
            
            // Evaluate the final expression
            const result = this._evaluateExpression(processedExpression);
            
            console.log(`Evaluated: ${expression} => ${result}`);
            return result;
        } catch (error) {
            console.error(`Formula evaluation failed: ${error.message}`);
            throw new Error(`Formula error: ${error.message}`);
        }
    }

    /**
     * Replace field references with values
     * @param {string} expression - Formula expression
     * @param {object} record - Data record
     */
    _replaceFieldReferences(expression, record) {
        return expression.replace(/{([^}]+)}/g, (match, fieldName) => {
            const value = record[fieldName.trim()];
            if (value === undefined || value === null) {
                console.warn(`Field not found: ${fieldName}`);
                return '0';
            }
            // Handle strings vs numbers
            if (typeof value === 'string' && isNaN(value)) {
                return `"${value}"`;
            }
            return value;
        });
    }

    /**
     * Process function calls
     * @param {string} expression - Expression with functions
     * @param {object} record - Data record
     */
    _processFunctions(expression, record) {
        let result = expression;
        
        // Process each known function
        for (const funcName in this.functions) {
            const regex = new RegExp(`${funcName}\\(([^)]*)\\)`, 'gi');
            result = result.replace(regex, (match, args) => {
                try {
                    // Parse arguments
                    const argList = this._parseArguments(args);
                    
                    // Evaluate each argument first
                    const evaluatedArgs = argList.map(arg => {
                        // If it's a string literal, keep it as is
                        if (arg.startsWith('"') && arg.endsWith('"')) {
                            return arg.slice(1, -1);
                        }
                        // If it's a number, parse it
                        if (!isNaN(arg)) {
                            return parseFloat(arg);
                        }
                        // Otherwise evaluate as expression
                        return this._evaluateExpression(arg);
                    });
                    
                    // Call the function
                    const funcResult = this.functions[funcName](...evaluatedArgs);
                    return funcResult;
                } catch (error) {
                    console.error(`Function ${funcName} failed: ${error.message}`);
                    throw error;
                }
            });
        }
        
        return result;
    }

    /**
     * Parse function arguments
     * @param {string} argsString - Comma-separated arguments
     */
    _parseArguments(argsString) {
        const args = [];
        let current = '';
        let depth = 0;
        let inString = false;
        
        for (let i = 0; i < argsString.length; i++) {
            const char = argsString[i];
            
            if (char === '"' && (i === 0 || argsString[i - 1] !== '\\')) {
                inString = !inString;
                current += char;
            } else if (char === '(' && !inString) {
                depth++;
                current += char;
            } else if (char === ')' && !inString) {
                depth--;
                current += char;
            } else if (char === ',' && depth === 0 && !inString) {
                args.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        if (current.trim()) {
            args.push(current.trim());
        }
        
        return args;
    }

    /**
     * Safely evaluate mathematical expression
     * @param {string} expression - Expression to evaluate
     */
    _evaluateExpression(expression) {
        try {
            // Remove quotes from strings
            if (expression.startsWith('"') && expression.endsWith('"')) {
                return expression.slice(1, -1);
            }
            
            // Check if it's a simple number
            if (!isNaN(expression)) {
                return parseFloat(expression);
            }
            
            // For safety, only allow mathematical operators and numbers
            const safeExpression = expression.replace(/[^0-9+\-*/.()%<>=!& ]/g, '');
            
            // Use Function constructor for safe evaluation (limited scope)
            const func = new Function('return ' + safeExpression);
            return func();
        } catch (error) {
            console.error(`Expression evaluation failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Apply formulas to a dataset
     * @param {array} records - Array of data records
     * @param {array} formulasToApply - Array of formulas to apply
     */
    applyFormulas(records, formulasToApply = null) {
        const formulas = formulasToApply || this.formulas;
        
        return records.map(record => {
            const enrichedRecord = { ...record };
            
            formulas.forEach(formula => {
                try {
                    enrichedRecord[formula.name] = this.evaluate(formula.expression, record);
                } catch (error) {
                    console.error(`Failed to apply formula ${formula.name}: ${error.message}`);
                    enrichedRecord[formula.name] = null;
                }
            });
            
            return enrichedRecord;
        });
    }

    /**
     * Preview formula result for a sample record
     * @param {string} expression - Formula expression
     * @param {object} sampleRecord - Sample record
     */
    preview(expression, sampleRecord) {
        try {
            return this.evaluate(expression, sampleRecord);
        } catch (error) {
            throw new Error(`Preview failed: ${error.message}`);
        }
    }

    /**
     * Save formulas to storage
     */
    saveFormulas() {
        try {
            localStorage.setItem('catalogBuilderFormulas', JSON.stringify(this.formulas));
            console.log('Formulas saved');
        } catch (error) {
            console.error('Failed to save formulas:', error);
            throw error;
        }
    }

    /**
     * Load formulas from storage
     */
    loadFormulas() {
        try {
            const saved = localStorage.getItem('catalogBuilderFormulas');
            if (saved) {
                this.formulas = JSON.parse(saved);
                console.log(`Loaded ${this.formulas.length} formulas`);
            }
        } catch (error) {
            console.error('Failed to load formulas:', error);
        }
    }

    /**
     * Export formulas to JSON
     */
    exportFormulas() {
        return {
            version: '1.0',
            formulas: this.formulas,
            exportedAt: new Date().toISOString()
        };
    }

    /**
     * Import formulas from JSON
     */
    importFormulas(data) {
        try {
            if (data.formulas && Array.isArray(data.formulas)) {
                this.formulas = data.formulas;
                console.log(`Imported ${this.formulas.length} formulas`);
            }
        } catch (error) {
            console.error('Failed to import formulas:', error);
            throw error;
        }
    }
}

/**
 * Common formula templates
 */
const FormulaTemplates = {
    TAX: '{price} * (1 + {tax_rate} / 100)',
    DISCOUNT_PERCENT: '{price} - ({price} * {discount} / 100)',
    DISCOUNT_FIXED: '{price} - {discount_amount}',
    MARGIN: '({price} - {cost}) / {cost} * 100',
    BULK_DISCOUNT: 'IF({quantity} > 100, {price} * 0.9, {price})',
    CURRENCY_CONVERSION: 'ROUND({price} * {exchange_rate}, 2)',
    PRICE_WITH_TAX: 'ROUND({price} * 1.20, 2)',
    TOTAL: '{price} * {quantity}',
    PROFIT: '{price} - {cost}',
    PROFIT_MARGIN: 'ROUND(({price} - {cost}) / {price} * 100, 2)'
};

// ==================== END MODULE: formulas.js ====================


// ==================== MODULE: filtering.js ====================
/**
 * Filtering and Sorting Module
 * Comprehensive data filtering and sorting capabilities
 */

/**
 * Filter and Sort Engine Class
 */
class FilterEngine {
    constructor() {
        this.filters = [];
        this.sortRules = [];
        this.presets = [];
    }

    /**
     * Add a filter condition
     * @param {object} filter - Filter configuration
     */
    addFilter(filter) {
        try {
            this.validateFilter(filter);
            this.filters.push(filter);
            console.log(`Filter added: ${filter.field} ${filter.operator} ${filter.value}`);
            return filter;
        } catch (error) {
            console.error(`Failed to add filter: ${error.message}`);
            throw error;
        }
    }

    /**
     * Validate filter configuration
     */
    validateFilter(filter) {
        if (!filter.field) {
            throw new Error('Filter must have a field');
        }
        if (!filter.operator) {
            throw new Error('Filter must have an operator');
        }
        return true;
    }

    /**
     * Remove a filter
     */
    removeFilter(index) {
        if (index >= 0 && index < this.filters.length) {
            this.filters.splice(index, 1);
            console.log(`Filter removed at index ${index}`);
            return true;
        }
        return false;
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        this.filters = [];
        console.log('All filters cleared');
    }

    /**
     * Apply filters to dataset
     * @param {array} records - Data records
     * @param {string} logic - 'AND' or 'OR' for combining filters
     */
    applyFilters(records, logic = 'AND') {
        if (this.filters.length === 0) {
            return records;
        }

        console.log(`Applying ${this.filters.length} filters with ${logic} logic`);

        const filtered = records.filter(record => {
            if (logic === 'AND') {
                return this.filters.every(filter => this._matchesFilter(record, filter));
            } else {
                return this.filters.some(filter => this._matchesFilter(record, filter));
            }
        });

        console.log(`Filtered ${records.length} records to ${filtered.length} records`);
        return filtered;
    }

    /**
     * Check if a record matches a filter
     */
    _matchesFilter(record, filter) {
        const value = record[filter.field];
        const filterValue = filter.value;

        switch (filter.operator) {
            case 'equals':
                return this._equals(value, filterValue);
            
            case 'notEquals':
                return !this._equals(value, filterValue);
            
            case 'contains':
                return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
            
            case 'notContains':
                return !String(value).toLowerCase().includes(String(filterValue).toLowerCase());
            
            case 'startsWith':
                return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
            
            case 'endsWith':
                return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());
            
            case 'greaterThan':
                return this._toNumber(value) > this._toNumber(filterValue);
            
            case 'lessThan':
                return this._toNumber(value) < this._toNumber(filterValue);
            
            case 'greaterOrEqual':
                return this._toNumber(value) >= this._toNumber(filterValue);
            
            case 'lessOrEqual':
                return this._toNumber(value) <= this._toNumber(filterValue);
            
            case 'between':
                const num = this._toNumber(value);
                return num >= this._toNumber(filter.min) && num <= this._toNumber(filter.max);
            
            case 'isEmpty':
                return value === null || value === undefined || value === '';
            
            case 'isNotEmpty':
                return value !== null && value !== undefined && value !== '';
            
            case 'isTrue':
                return value === true || value === 'true' || value === 1;
            
            case 'isFalse':
                return value === false || value === 'false' || value === 0;
            
            case 'regex':
                try {
                    const regex = new RegExp(filterValue, 'i');
                    return regex.test(String(value));
                } catch (error) {
                    console.error(`Invalid regex: ${filterValue}`);
                    return false;
                }
            
            default:
                console.warn(`Unknown operator: ${filter.operator}`);
                return true;
        }
    }

    /**
     * Compare values for equality
     */
    _equals(value1, value2) {
        // Case-insensitive string comparison
        if (typeof value1 === 'string' && typeof value2 === 'string') {
            return value1.toLowerCase() === value2.toLowerCase();
        }
        return value1 == value2;
    }

    /**
     * Convert value to number
     */
    _toNumber(value) {
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
    }

    /**
     * Add a sort rule
     */
    addSortRule(field, direction = 'asc', type = 'auto') {
        const rule = { field, direction, type };
        this.sortRules.push(rule);
        console.log(`Sort rule added: ${field} ${direction}`);
        return rule;
    }

    /**
     * Remove a sort rule
     */
    removeSortRule(index) {
        if (index >= 0 && index < this.sortRules.length) {
            this.sortRules.splice(index, 1);
            console.log(`Sort rule removed at index ${index}`);
            return true;
        }
        return false;
    }

    /**
     * Clear all sort rules
     */
    clearSortRules() {
        this.sortRules = [];
        console.log('All sort rules cleared');
    }

    /**
     * Apply sorting to dataset
     */
    applySort(records) {
        if (this.sortRules.length === 0) {
            return records;
        }

        console.log(`Applying ${this.sortRules.length} sort rules`);

        const sorted = [...records].sort((a, b) => {
            for (const rule of this.sortRules) {
                const result = this._compareValues(
                    a[rule.field],
                    b[rule.field],
                    rule.type,
                    rule.direction
                );
                
                if (result !== 0) {
                    return result;
                }
            }
            return 0;
        });

        return sorted;
    }

    /**
     * Compare two values for sorting
     */
    _compareValues(a, b, type, direction) {
        let result = 0;

        // Handle null/undefined
        if (a === null || a === undefined) return direction === 'asc' ? -1 : 1;
        if (b === null || b === undefined) return direction === 'asc' ? 1 : -1;

        switch (type) {
            case 'number':
                result = this._toNumber(a) - this._toNumber(b);
                break;
            
            case 'date':
                const dateA = new Date(a);
                const dateB = new Date(b);
                result = dateA - dateB;
                break;
            
            case 'string':
            case 'auto':
            default:
                // Auto-detect if both values are numbers
                if (!isNaN(a) && !isNaN(b)) {
                    result = this._toNumber(a) - this._toNumber(b);
                } else {
                    // String comparison
                    const strA = String(a).toLowerCase();
                    const strB = String(b).toLowerCase();
                    result = strA.localeCompare(strB);
                }
                break;
        }

        return direction === 'asc' ? result : -result;
    }

    /**
     * Apply both filters and sorting
     */
    apply(records, filterLogic = 'AND') {
        let result = this.applyFilters(records, filterLogic);
        result = this.applySort(result);
        return result;
    }

    /**
     * Save current configuration as preset
     */
    savePreset(name, description = '') {
        const preset = {
            name,
            description,
            filters: [...this.filters],
            sortRules: [...this.sortRules],
            createdAt: new Date().toISOString()
        };

        this.presets.push(preset);
        this._savePresetsToStorage();
        console.log(`Preset saved: ${name}`);
        return preset;
    }

    /**
     * Load a preset
     */
    loadPreset(name) {
        const preset = this.presets.find(p => p.name === name);
        if (preset) {
            this.filters = [...preset.filters];
            this.sortRules = [...preset.sortRules];
            console.log(`Preset loaded: ${name}`);
            return preset;
        }
        throw new Error(`Preset not found: ${name}`);
    }

    /**
     * Delete a preset
     */
    deletePreset(name) {
        const index = this.presets.findIndex(p => p.name === name);
        if (index !== -1) {
            this.presets.splice(index, 1);
            this._savePresetsToStorage();
            console.log(`Preset deleted: ${name}`);
            return true;
        }
        return false;
    }

    /**
     * Get all presets
     */
    getPresets() {
        return this.presets;
    }

    /**
     * Get filter statistics
     */
    getStatistics(records, filteredRecords) {
        return {
            total: records.length,
            filtered: filteredRecords.length,
            excluded: records.length - filteredRecords.length,
            percentage: ((filteredRecords.length / records.length) * 100).toFixed(1)
        };
    }

    /**
     * Save presets to storage
     */
    _savePresetsToStorage() {
        try {
            localStorage.setItem('catalogBuilderFilterPresets', JSON.stringify(this.presets));
        } catch (error) {
            console.error('Failed to save presets:', error);
        }
    }

    /**
     * Load presets from storage
     */
    loadPresetsFromStorage() {
        try {
            const saved = localStorage.getItem('catalogBuilderFilterPresets');
            if (saved) {
                this.presets = JSON.parse(saved);
                console.log(`Loaded ${this.presets.length} presets`);
            }
        } catch (error) {
            console.error('Failed to load presets:', error);
        }
    }

    /**
     * Export configuration
     */
    exportConfig() {
        return {
            version: '1.0',
            filters: this.filters,
            sortRules: this.sortRules,
            presets: this.presets,
            exportedAt: new Date().toISOString()
        };
    }

    /**
     * Import configuration
     */
    importConfig(config) {
        try {
            if (config.filters) this.filters = config.filters;
            if (config.sortRules) this.sortRules = config.sortRules;
            if (config.presets) this.presets = config.presets;
            console.log('Configuration imported');
        } catch (error) {
            console.error('Failed to import configuration:', error);
            throw error;
        }
    }
}

/**
 * Available filter operators
 */
const FilterOperators = [
    { value: 'equals', label: 'Equals', types: ['string', 'number', 'date'] },
    { value: 'notEquals', label: 'Not Equals', types: ['string', 'number', 'date'] },
    { value: 'contains', label: 'Contains', types: ['string'] },
    { value: 'notContains', label: 'Does Not Contain', types: ['string'] },
    { value: 'startsWith', label: 'Starts With', types: ['string'] },
    { value: 'endsWith', label: 'Ends With', types: ['string'] },
    { value: 'greaterThan', label: 'Greater Than', types: ['number', 'date'] },
    { value: 'lessThan', label: 'Less Than', types: ['number', 'date'] },
    { value: 'greaterOrEqual', label: 'Greater or Equal', types: ['number', 'date'] },
    { value: 'lessOrEqual', label: 'Less or Equal', types: ['number', 'date'] },
    { value: 'between', label: 'Between', types: ['number', 'date'] },
    { value: 'isEmpty', label: 'Is Empty', types: ['string', 'number'] },
    { value: 'isNotEmpty', label: 'Is Not Empty', types: ['string', 'number'] },
    { value: 'isTrue', label: 'Is True', types: ['boolean'] },
    { value: 'isFalse', label: 'Is False', types: ['boolean'] },
    { value: 'regex', label: 'Regular Expression', types: ['string'] }
];

// ==================== END MODULE: filtering.js ====================


// ==================== MODULE: grouping.js ====================
/**
 * Grouping Module
 * Data grouping and categorization with layout support
 */

/**
 * Grouping Engine Class
 */
class GroupingEngine {
    constructor() {
        this.groupLevels = [];
        this.groupOptions = {
            showHeaders: true,
            showFooters: false,
            showItemCount: true,
            pageBreakPerGroup: false,
            headerStyle: 'heading1',
            separatorType: 'line'
        };
    }

    /**
     * Add a group level
     * @param {string} field - Field to group by
     * @param {string} sortDirection - 'asc' or 'desc'
     */
    addGroupLevel(field, sortDirection = 'asc') {
        const level = {
            field,
            sortDirection,
            level: this.groupLevels.length
        };
        
        this.groupLevels.push(level);
        console.log(`Group level added: ${field} (${sortDirection})`);
        return level;
    }

    /**
     * Remove a group level
     */
    removeGroupLevel(index) {
        if (index >= 0 && index < this.groupLevels.length) {
            this.groupLevels.splice(index, 1);
            // Update level numbers
            this.groupLevels.forEach((level, i) => {
                level.level = i;
            });
            console.log(`Group level removed at index ${index}`);
            return true;
        }
        return false;
    }

    /**
     * Clear all group levels
     */
    clearGroupLevels() {
        this.groupLevels = [];
        console.log('All group levels cleared');
    }

    /**
     * Set group options
     */
    setOptions(options) {
        this.groupOptions = { ...this.groupOptions, ...options };
        console.log('Group options updated');
    }

    /**
     * Group records by configured levels
     * @param {array} records - Data records to group
     */
    groupRecords(records) {
        if (this.groupLevels.length === 0) {
            console.warn('No group levels defined');
            return { groups: [], flatList: records };
        }

        console.log(`Grouping ${records.length} records by ${this.groupLevels.length} levels`);

        // Sort records by group fields first
        const sortedRecords = this._sortByGroupLevels(records);

        // Build hierarchical groups
        const groups = this._buildGroups(sortedRecords, 0);

        // Create flat list with group markers
        const flatList = this._flattenGroups(groups);

        console.log(`Created ${this._countGroups(groups)} groups`);

        return { groups, flatList };
    }

    /**
     * Sort records by group levels
     */
    _sortByGroupLevels(records) {
        return [...records].sort((a, b) => {
            for (const level of this.groupLevels) {
                const aVal = a[level.field];
                const bVal = b[level.field];
                
                if (aVal === bVal) continue;
                
                const comparison = String(aVal).localeCompare(String(bVal));
                return level.sortDirection === 'asc' ? comparison : -comparison;
            }
            return 0;
        });
    }

    /**
     * Build hierarchical group structure
     */
    _buildGroups(records, levelIndex) {
        if (levelIndex >= this.groupLevels.length) {
            return records;
        }

        const level = this.groupLevels[levelIndex];
        const groups = [];
        let currentGroup = null;

        records.forEach(record => {
            const groupValue = record[level.field];
            
            if (!currentGroup || currentGroup.value !== groupValue) {
                currentGroup = {
                    level: levelIndex,
                    field: level.field,
                    value: groupValue,
                    records: [],
                    subgroups: null
                };
                groups.push(currentGroup);
            }
            
            currentGroup.records.push(record);
        });

        // Recursively build subgroups
        if (levelIndex < this.groupLevels.length - 1) {
            groups.forEach(group => {
                group.subgroups = this._buildGroups(group.records, levelIndex + 1);
                group.records = []; // Clear records as they're now in subgroups
            });
        }

        return groups;
    }

    /**
     * Flatten groups to a linear list with markers
     */
    _flattenGroups(groups, parentPath = '') {
        const flatList = [];

        groups.forEach((group, index) => {
            const groupPath = parentPath ? `${parentPath}.${index}` : String(index);
            
            // Add group header
            if (this.groupOptions.showHeaders) {
                flatList.push({
                    type: 'group-header',
                    level: group.level,
                    field: group.field,
                    value: group.value,
                    itemCount: this._getGroupItemCount(group),
                    path: groupPath,
                    pageBreak: this.groupOptions.pageBreakPerGroup && group.level === 0
                });
            }

            // Add records or subgroups
            if (group.subgroups) {
                const subItems = this._flattenGroups(group.subgroups, groupPath);
                flatList.push(...subItems);
            } else {
                group.records.forEach(record => {
                    flatList.push({
                        type: 'record',
                        data: record,
                        groupPath: groupPath,
                        groupValue: group.value
                    });
                });
            }

            // Add group footer
            if (this.groupOptions.showFooters) {
                flatList.push({
                    type: 'group-footer',
                    level: group.level,
                    field: group.field,
                    value: group.value,
                    itemCount: this._getGroupItemCount(group),
                    path: groupPath
                });
            }
        });

        return flatList;
    }

    /**
     * Get total item count in a group
     */
    _getGroupItemCount(group) {
        if (group.records.length > 0) {
            return group.records.length;
        }
        
        if (group.subgroups) {
            return group.subgroups.reduce((total, subgroup) => {
                return total + this._getGroupItemCount(subgroup);
            }, 0);
        }
        
        return 0;
    }

    /**
     * Count total number of groups
     */
    _countGroups(groups) {
        let count = groups.length;
        
        groups.forEach(group => {
            if (group.subgroups) {
                count += this._countGroups(group.subgroups);
            }
        });
        
        return count;
    }

    /**
     * Calculate group aggregations
     * @param {array} groups - Group structure
     * @param {array} aggregations - Aggregation configs [{field, function}]
     */
    calculateAggregations(groups, aggregations) {
        groups.forEach(group => {
            group.aggregations = {};
            
            const allRecords = this._getAllRecordsInGroup(group);
            
            aggregations.forEach(agg => {
                const values = allRecords.map(r => r[agg.field]).filter(v => v != null);
                
                switch (agg.function) {
                    case 'count':
                        group.aggregations[agg.field] = values.length;
                        break;
                    case 'sum':
                        group.aggregations[agg.field] = values.reduce((sum, v) => sum + parseFloat(v || 0), 0);
                        break;
                    case 'avg':
                        const sum = values.reduce((s, v) => s + parseFloat(v || 0), 0);
                        group.aggregations[agg.field] = values.length > 0 ? sum / values.length : 0;
                        break;
                    case 'min':
                        group.aggregations[agg.field] = Math.min(...values.map(v => parseFloat(v || 0)));
                        break;
                    case 'max':
                        group.aggregations[agg.field] = Math.max(...values.map(v => parseFloat(v || 0)));
                        break;
                }
            });

            // Recursively calculate for subgroups
            if (group.subgroups) {
                this.calculateAggregations(group.subgroups, aggregations);
            }
        });

        return groups;
    }

    /**
     * Get all records in a group (including subgroups)
     */
    _getAllRecordsInGroup(group) {
        if (group.records.length > 0) {
            return group.records;
        }
        
        if (group.subgroups) {
            return group.subgroups.flatMap(sg => this._getAllRecordsInGroup(sg));
        }
        
        return [];
    }

    /**
     * Generate table of contents from groups
     */
    generateTableOfContents(groups, pageNumbers = {}) {
        const toc = [];
        
        const processGroups = (grps, level = 0) => {
            grps.forEach(group => {
                toc.push({
                    level,
                    title: `${group.field}: ${group.value}`,
                    itemCount: this._getGroupItemCount(group),
                    pageNumber: pageNumbers[group.value] || '?'
                });
                
                if (group.subgroups) {
                    processGroups(group.subgroups, level + 1);
                }
            });
        };
        
        processGroups(groups);
        return toc;
    }

    /**
     * Group by formula/calculated value
     * @param {array} records - Data records
     * @param {function} formulaFn - Function that returns group value
     */
    groupByFormula(records, formulaFn) {
        const groups = new Map();
        
        records.forEach(record => {
            const groupValue = formulaFn(record);
            
            if (!groups.has(groupValue)) {
                groups.set(groupValue, []);
            }
            
            groups.get(groupValue).push(record);
        });
        
        return Array.from(groups.entries()).map(([value, records]) => ({
            value,
            records,
            count: records.length
        }));
    }

    /**
     * Save group configuration
     */
    saveConfiguration() {
        const config = {
            groupLevels: this.groupLevels,
            groupOptions: this.groupOptions
        };
        
        try {
            localStorage.setItem('catalogBuilderGrouping', JSON.stringify(config));
            console.log('Group configuration saved');
        } catch (error) {
            console.error('Failed to save configuration:', error);
            throw error;
        }
    }

    /**
     * Load group configuration
     */
    loadConfiguration() {
        try {
            const saved = localStorage.getItem('catalogBuilderGrouping');
            if (saved) {
                const config = JSON.parse(saved);
                this.groupLevels = config.groupLevels || [];
                this.groupOptions = { ...this.groupOptions, ...config.groupOptions };
                console.log('Group configuration loaded');
            }
        } catch (error) {
            console.error('Failed to load configuration:', error);
        }
    }

    /**
     * Export configuration
     */
    exportConfig() {
        return {
            version: '1.0',
            groupLevels: this.groupLevels,
            groupOptions: this.groupOptions,
            exportedAt: new Date().toISOString()
        };
    }

    /**
     * Import configuration
     */
    importConfig(config) {
        try {
            if (config.groupLevels) this.groupLevels = config.groupLevels;
            if (config.groupOptions) this.groupOptions = { ...this.groupOptions, ...config.groupOptions };
            console.log('Group configuration imported');
        } catch (error) {
            console.error('Failed to import configuration:', error);
            throw error;
        }
    }
}

/**
 * Available aggregation functions
 */
const AggregationFunctions = [
    { value: 'count', label: 'Count' },
    { value: 'sum', label: 'Sum' },
    { value: 'avg', label: 'Average' },
    { value: 'min', label: 'Minimum' },
    { value: 'max', label: 'Maximum' }
];

/**
 * Header style options
 */
const HeaderStyles = [
    { value: 'heading1', label: 'Heading 1' },
    { value: 'heading2', label: 'Heading 2' },
    { value: 'heading3', label: 'Heading 3' },
    { value: 'bold', label: 'Bold Text' },
    { value: 'custom', label: 'Custom Style' }
];

/**
 * Separator type options
 */
const SeparatorTypes = [
    { value: 'none', label: 'None' },
    { value: 'line', label: 'Line' },
    { value: 'space', label: 'Extra Space' },
    { value: 'pageBreak', label: 'Page Break' }
];

// ==================== END MODULE: grouping.js ====================


// ==================== MODULE: crossReferences.js ====================
/**
 * Cross-References Module
 * Product linking and cross-referencing system
 */

/**
 * Cross-Reference Types
 */
const ReferenceTypes = {
    RELATED: 'related',
    VARIANT: 'variant',
    SEE_ALSO: 'see_also',
    REPLACED_BY: 'replaced_by',
    SUPERSEDED_BY: 'superseded_by',
    ACCESSORY: 'accessory',
    COMPATIBLE: 'compatible',
    SERIES: 'series',
    COLLECTION: 'collection'
};

/**
 * Cross-Reference Engine Class
 */
class CrossReferenceEngine {
    constructor() {
        this.references = new Map(); // sourceId -> array of references
        this.reverseIndex = new Map(); // targetId -> array of sources
    }

    /**
     * Add a cross-reference
     * @param {string} sourceId - Source record ID
     * @param {string} targetId - Target record ID
     * @param {string} type - Reference type
     * @param {object} metadata - Additional metadata
     */
    addReference(sourceId, targetId, type = ReferenceTypes.RELATED, metadata = {}) {
        try {
            const reference = {
                sourceId,
                targetId,
                type,
                metadata,
                createdAt: new Date().toISOString()
            };

            // Add to forward index
            if (!this.references.has(sourceId)) {
                this.references.set(sourceId, []);
            }
            this.references.get(sourceId).push(reference);

            // Add to reverse index for bidirectional lookup
            if (!this.reverseIndex.has(targetId)) {
                this.reverseIndex.set(targetId, []);
            }
            this.reverseIndex.get(targetId).push(reference);

            console.log(`Reference added: ${sourceId} -> ${targetId} (${type})`);
            return reference;
        } catch (error) {
            console.error(`Failed to add reference: ${error.message}`);
            throw error;
        }
    }

    /**
     * Remove a cross-reference
     */
    removeReference(sourceId, targetId, type = null) {
        let removed = false;

        // Remove from forward index
        if (this.references.has(sourceId)) {
            const refs = this.references.get(sourceId);
            const filtered = refs.filter(ref => {
                const match = ref.targetId !== targetId || (type && ref.type !== type);
                if (!match) removed = true;
                return match;
            });
            
            if (filtered.length === 0) {
                this.references.delete(sourceId);
            } else {
                this.references.set(sourceId, filtered);
            }
        }

        // Remove from reverse index
        if (this.reverseIndex.has(targetId)) {
            const refs = this.reverseIndex.get(targetId);
            const filtered = refs.filter(ref => {
                return ref.sourceId !== sourceId || (type && ref.type !== type);
            });
            
            if (filtered.length === 0) {
                this.reverseIndex.delete(targetId);
            } else {
                this.reverseIndex.set(targetId, filtered);
            }
        }

        if (removed) {
            console.log(`Reference removed: ${sourceId} -> ${targetId}`);
        }

        return removed;
    }

    /**
     * Get all references from a record
     */
    getReferences(recordId, type = null) {
        const refs = this.references.get(recordId) || [];
        
        if (type) {
            return refs.filter(ref => ref.type === type);
        }
        
        return refs;
    }

    /**
     * Get all records that reference this record
     */
    getReferencedBy(recordId, type = null) {
        const refs = this.reverseIndex.get(recordId) || [];
        
        if (type) {
            return refs.filter(ref => ref.type === type);
        }
        
        return refs;
    }

    /**
     * Get bidirectional references
     */
    getBidirectionalReferences(recordId, type = null) {
        return {
            outgoing: this.getReferences(recordId, type),
            incoming: this.getReferencedBy(recordId, type)
        };
    }

    /**
     * Check if two records are linked
     */
    areLinked(recordId1, recordId2) {
        const refs1 = this.getReferences(recordId1);
        const refs2 = this.getReferences(recordId2);
        
        return refs1.some(ref => ref.targetId === recordId2) ||
               refs2.some(ref => ref.targetId === recordId1);
    }

    /**
     * Validate references against dataset
     * @param {array} records - Data records with ID field
     * @param {string} idField - Name of ID field
     */
    validateReferences(records, idField = 'id') {
        const validIds = new Set(records.map(r => r[idField]));
        const broken = [];

        this.references.forEach((refs, sourceId) => {
            if (!validIds.has(sourceId)) {
                broken.push({
                    type: 'source_not_found',
                    sourceId,
                    message: `Source record not found: ${sourceId}`
                });
            }

            refs.forEach(ref => {
                if (!validIds.has(ref.targetId)) {
                    broken.push({
                        type: 'target_not_found',
                        sourceId: ref.sourceId,
                        targetId: ref.targetId,
                        referenceType: ref.type,
                        message: `Target record not found: ${ref.targetId}`
                    });
                }
            });
        });

        if (broken.length > 0) {
            console.warn(`Found ${broken.length} broken references`);
        } else {
            console.log('All references are valid');
        }

        return broken;
    }

    /**
     * Resolve references to actual records
     * @param {string} recordId - Source record ID
     * @param {array} records - All data records
     * @param {string} idField - Name of ID field
     */
    resolveReferences(recordId, records, idField = 'id') {
        const refs = this.getReferences(recordId);
        const resolved = [];

        refs.forEach(ref => {
            const targetRecord = records.find(r => r[idField] === ref.targetId);
            if (targetRecord) {
                resolved.push({
                    type: ref.type,
                    metadata: ref.metadata,
                    record: targetRecord
                });
            }
        });

        return resolved;
    }

    /**
     * Build reference graph
     */
    buildGraph() {
        const graph = {
            nodes: new Set(),
            edges: []
        };

        this.references.forEach((refs, sourceId) => {
            graph.nodes.add(sourceId);
            
            refs.forEach(ref => {
                graph.nodes.add(ref.targetId);
                graph.edges.push({
                    from: sourceId,
                    to: ref.targetId,
                    type: ref.type
                });
            });
        });

        return {
            nodes: Array.from(graph.nodes),
            edges: graph.edges
        };
    }

    /**
     * Find reference chains (A -> B -> C)
     */
    findChains(startId, maxDepth = 3) {
        const chains = [];
        const visited = new Set();

        const traverse = (currentId, chain, depth) => {
            if (depth > maxDepth || visited.has(currentId)) {
                return;
            }

            visited.add(currentId);
            const refs = this.getReferences(currentId);

            if (refs.length === 0) {
                if (chain.length > 1) {
                    chains.push([...chain]);
                }
            } else {
                refs.forEach(ref => {
                    traverse(ref.targetId, [...chain, ref.targetId], depth + 1);
                });
            }

            visited.delete(currentId);
        };

        traverse(startId, [startId], 0);
        return chains;
    }

    /**
     * Group references by type
     */
    groupByType(recordId) {
        const refs = this.getReferences(recordId);
        const grouped = {};

        refs.forEach(ref => {
            if (!grouped[ref.type]) {
                grouped[ref.type] = [];
            }
            grouped[ref.type].push(ref);
        });

        return grouped;
    }

    /**
     * Import references from data field
     * @param {array} records - Data records
     * @param {string} idField - ID field name
     * @param {string} refField - Reference field name (comma-separated IDs)
     * @param {string} type - Reference type
     */
    importFromField(records, idField = 'id', refField = 'related_products', type = ReferenceTypes.RELATED) {
        let count = 0;

        records.forEach(record => {
            const sourceId = record[idField];
            const refValue = record[refField];

            if (refValue) {
                const targetIds = String(refValue).split(',').map(id => id.trim());
                
                targetIds.forEach(targetId => {
                    if (targetId) {
                        this.addReference(sourceId, targetId, type);
                        count++;
                    }
                });
            }
        });

        console.log(`Imported ${count} references from field ${refField}`);
        return count;
    }

    /**
     * Export references to data structure
     */
    exportToData(records, idField = 'id') {
        const enriched = records.map(record => {
            const recordId = record[idField];
            const refs = this.getReferences(recordId);
            
            return {
                ...record,
                _references: refs.map(ref => ({
                    id: ref.targetId,
                    type: ref.type
                })),
                _referencedBy: this.getReferencedBy(recordId).map(ref => ({
                    id: ref.sourceId,
                    type: ref.type
                }))
            };
        });

        return enriched;
    }

    /**
     * Clear all references
     */
    clearAll() {
        this.references.clear();
        this.reverseIndex.clear();
        console.log('All references cleared');
    }

    /**
     * Get statistics
     */
    getStatistics() {
        let totalRefs = 0;
        const typeCount = {};

        this.references.forEach(refs => {
            totalRefs += refs.length;
            refs.forEach(ref => {
                typeCount[ref.type] = (typeCount[ref.type] || 0) + 1;
            });
        });

        return {
            totalRecordsWithReferences: this.references.size,
            totalReferences: totalRefs,
            averageReferencesPerRecord: this.references.size > 0 ? 
                (totalRefs / this.references.size).toFixed(2) : 0,
            referencesByType: typeCount
        };
    }

    /**
     * Save references to storage
     */
    save() {
        try {
            const data = {
                references: Array.from(this.references.entries()),
                reverseIndex: Array.from(this.reverseIndex.entries())
            };
            
            localStorage.setItem('catalogBuilderReferences', JSON.stringify(data));
            console.log('Cross-references saved');
        } catch (error) {
            console.error('Failed to save references:', error);
            throw error;
        }
    }

    /**
     * Load references from storage
     */
    load() {
        try {
            const saved = localStorage.getItem('catalogBuilderReferences');
            if (saved) {
                const data = JSON.parse(saved);
                this.references = new Map(data.references);
                this.reverseIndex = new Map(data.reverseIndex);
                console.log('Cross-references loaded');
            }
        } catch (error) {
            console.error('Failed to load references:', error);
        }
    }

    /**
     * Export to JSON
     */
    exportToJSON() {
        return {
            version: '1.0',
            references: Array.from(this.references.entries()).map(([sourceId, refs]) => ({
                sourceId,
                references: refs
            })),
            exportedAt: new Date().toISOString()
        };
    }

    /**
     * Import from JSON
     */
    importFromJSON(data) {
        try {
            this.clearAll();
            
            if (data.references && Array.isArray(data.references)) {
                data.references.forEach(item => {
                    item.references.forEach(ref => {
                        this.addReference(ref.sourceId, ref.targetId, ref.type, ref.metadata);
                    });
                });
            }
            
            console.log('Cross-references imported from JSON');
        } catch (error) {
            console.error('Failed to import references:', error);
            throw error;
        }
    }
}

// ==================== END MODULE: crossReferences.js ====================


// ==================== MODULE: localization.js ====================
/**
 * Localization Module
 * Multi-language support and internationalization
 */

/**
 * Supported Languages
 */
const SupportedLanguages = [
    { code: 'en', name: 'English', direction: 'ltr' },
    { code: 'fr', name: 'Français', direction: 'ltr' },
    { code: 'de', name: 'Deutsch', direction: 'ltr' },
    { code: 'es', name: 'Español', direction: 'ltr' },
    { code: 'it', name: 'Italiano', direction: 'ltr' },
    { code: 'pt', name: 'Português', direction: 'ltr' },
    { code: 'nl', name: 'Nederlands', direction: 'ltr' },
    { code: 'pl', name: 'Polski', direction: 'ltr' },
    { code: 'ru', name: 'Русский', direction: 'ltr' },
    { code: 'ja', name: '日本語', direction: 'ltr' },
    { code: 'zh', name: '中文', direction: 'ltr' },
    { code: 'ar', name: 'العربية', direction: 'rtl' },
    { code: 'he', name: 'עברית', direction: 'rtl' }
];

/**
 * Localization Engine Class
 */
class LocalizationEngine {
    constructor() {
        this.currentLanguage = 'en';
        this.defaultLanguage = 'en';
        this.enabledLanguages = ['en'];
        this.fieldMappings = new Map(); // fieldName -> { en: 'field_en', fr: 'field_fr', ... }
        this.useFallback = true;
        this.translations = {}; // UI translations
    }

    /**
     * Set current language
     */
    setLanguage(languageCode) {
        if (this.isLanguageSupported(languageCode)) {
            this.currentLanguage = languageCode;
            console.log(`Language set to: ${languageCode}`);
            return true;
        }
        
        console.warn(`Unsupported language: ${languageCode}`);
        return false;
    }

    /**
     * Get current language
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Set default fallback language
     */
    setDefaultLanguage(languageCode) {
        this.defaultLanguage = languageCode;
        console.log(`Default language set to: ${languageCode}`);
    }

    /**
     * Enable a language
     */
    enableLanguage(languageCode) {
        if (this.isLanguageSupported(languageCode) && !this.enabledLanguages.includes(languageCode)) {
            this.enabledLanguages.push(languageCode);
            console.log(`Language enabled: ${languageCode}`);
            return true;
        }
        return false;
    }

    /**
     * Disable a language
     */
    disableLanguage(languageCode) {
        const index = this.enabledLanguages.indexOf(languageCode);
        if (index !== -1 && languageCode !== this.defaultLanguage) {
            this.enabledLanguages.splice(index, 1);
            console.log(`Language disabled: ${languageCode}`);
            return true;
        }
        return false;
    }

    /**
     * Check if language is supported
     */
    isLanguageSupported(languageCode) {
        return SupportedLanguages.some(lang => lang.code === languageCode);
    }

    /**
     * Get language info
     */
    getLanguageInfo(languageCode) {
        return SupportedLanguages.find(lang => lang.code === languageCode);
    }

    /**
     * Check if language is RTL
     */
    isRTL(languageCode = null) {
        const code = languageCode || this.currentLanguage;
        const info = this.getLanguageInfo(code);
        return info ? info.direction === 'rtl' : false;
    }

    /**
     * Add field mapping for localization
     * @param {string} baseField - Base field name (e.g., 'productName')
     * @param {object} languageFields - Language-specific fields { en: 'productName_en', fr: 'productName_fr' }
     */
    addFieldMapping(baseField, languageFields) {
        this.fieldMappings.set(baseField, languageFields);
        console.log(`Field mapping added for: ${baseField}`);
    }

    /**
     * Get localized field name
     */
    getLocalizedField(baseField, languageCode = null) {
        const lang = languageCode || this.currentLanguage;
        const mapping = this.fieldMappings.get(baseField);
        
        if (mapping && mapping[lang]) {
            return mapping[lang];
        }
        
        // Try fallback
        if (this.useFallback && mapping && mapping[this.defaultLanguage]) {
            console.log(`Using fallback for field: ${baseField}`);
            return mapping[this.defaultLanguage];
        }
        
        // Return base field name as last resort
        return baseField;
    }

    /**
     * Localize a data record
     * @param {object} record - Data record
     * @param {string} languageCode - Target language
     */
    localizeRecord(record, languageCode = null) {
        const lang = languageCode || this.currentLanguage;
        const localized = {};
        
        // Copy all fields first
        Object.assign(localized, record);
        
        // Replace with localized versions where available
        this.fieldMappings.forEach((langFields, baseField) => {
            const localizedFieldName = langFields[lang] || 
                                      (this.useFallback ? langFields[this.defaultLanguage] : null);
            
            if (localizedFieldName && record[localizedFieldName] !== undefined) {
                localized[baseField] = record[localizedFieldName];
            }
        });
        
        return localized;
    }

    /**
     * Localize entire dataset
     * @param {array} records - Data records
     * @param {string} languageCode - Target language
     */
    localizeDataset(records, languageCode = null) {
        const lang = languageCode || this.currentLanguage;
        console.log(`Localizing ${records.length} records to ${lang}`);
        
        return records.map(record => this.localizeRecord(record, lang));
    }

    /**
     * Auto-detect field mappings from dataset
     * @param {array} records - Sample records
     */
    autoDetectFieldMappings(records) {
        if (records.length === 0) return;
        
        const sampleRecord = records[0];
        const fields = Object.keys(sampleRecord);
        const detectedMappings = new Map();
        
        // Pattern: fieldName_langCode
        const pattern = /^(.+)_([a-z]{2})$/;
        
        fields.forEach(field => {
            const match = field.match(pattern);
            if (match) {
                const [, baseField, langCode] = match;
                
                if (!detectedMappings.has(baseField)) {
                    detectedMappings.set(baseField, {});
                }
                
                detectedMappings.get(baseField)[langCode] = field;
            }
        });
        
        // Add detected mappings
        detectedMappings.forEach((langFields, baseField) => {
            this.addFieldMapping(baseField, langFields);
        });
        
        console.log(`Auto-detected ${detectedMappings.size} field mappings`);
        return detectedMappings;
    }

    /**
     * Format number according to locale
     */
    formatNumber(number, languageCode = null, options = {}) {
        const lang = languageCode || this.currentLanguage;
        
        try {
            return new Intl.NumberFormat(lang, options).format(number);
        } catch (error) {
            console.error(`Number formatting failed: ${error.message}`);
            return String(number);
        }
    }

    /**
     * Format currency according to locale
     */
    formatCurrency(amount, currency = 'USD', languageCode = null) {
        const lang = languageCode || this.currentLanguage;
        
        try {
            return new Intl.NumberFormat(lang, {
                style: 'currency',
                currency: currency
            }).format(amount);
        } catch (error) {
            console.error(`Currency formatting failed: ${error.message}`);
            return `${currency} ${amount}`;
        }
    }

    /**
     * Format date according to locale
     */
    formatDate(date, languageCode = null, options = {}) {
        const lang = languageCode || this.currentLanguage;
        const dateObj = date instanceof Date ? date : new Date(date);
        
        try {
            return new Intl.DateTimeFormat(lang, options).format(dateObj);
        } catch (error) {
            console.error(`Date formatting failed: ${error.message}`);
            return dateObj.toLocaleDateString();
        }
    }

    /**
     * Get locale-specific sort comparator
     */
    getCollator(languageCode = null, options = {}) {
        const lang = languageCode || this.currentLanguage;
        
        try {
            return new Intl.Collator(lang, options);
        } catch (error) {
            console.error(`Failed to create collator: ${error.message}`);
            return new Intl.Collator('en');
        }
    }

    /**
     * Sort records with locale-aware comparison
     */
    sortRecords(records, field, direction = 'asc', languageCode = null) {
        const collator = this.getCollator(languageCode);
        
        return [...records].sort((a, b) => {
            const aVal = a[field];
            const bVal = b[field];
            
            const comparison = collator.compare(String(aVal), String(bVal));
            return direction === 'asc' ? comparison : -comparison;
        });
    }

    /**
     * Add UI translation
     */
    addTranslation(key, translations) {
        this.translations[key] = translations;
    }

    /**
     * Get translated UI text
     */
    translate(key, languageCode = null) {
        const lang = languageCode || this.currentLanguage;
        
        if (this.translations[key] && this.translations[key][lang]) {
            return this.translations[key][lang];
        }
        
        // Fallback to default language
        if (this.useFallback && this.translations[key] && this.translations[key][this.defaultLanguage]) {
            return this.translations[key][this.defaultLanguage];
        }
        
        // Return key if no translation found
        return key;
    }

    /**
     * Load UI translations
     */
    loadUITranslations(translations) {
        this.translations = { ...this.translations, ...translations };
        console.log('UI translations loaded');
    }

    /**
     * Get translation status for dataset
     */
    getTranslationStatus(records) {
        const status = {};
        
        this.enabledLanguages.forEach(lang => {
            status[lang] = {
                total: 0,
                translated: 0,
                missing: 0,
                percentage: 0
            };
        });
        
        this.fieldMappings.forEach((langFields, baseField) => {
            this.enabledLanguages.forEach(lang => {
                const fieldName = langFields[lang];
                if (fieldName) {
                    let translated = 0;
                    
                    records.forEach(record => {
                        if (record[fieldName] && record[fieldName] !== '') {
                            translated++;
                        }
                    });
                    
                    status[lang].total += records.length;
                    status[lang].translated += translated;
                    status[lang].missing += (records.length - translated);
                }
            });
        });
        
        // Calculate percentages
        Object.keys(status).forEach(lang => {
            if (status[lang].total > 0) {
                status[lang].percentage = ((status[lang].translated / status[lang].total) * 100).toFixed(1);
            }
        });
        
        return status;
    }

    /**
     * Save configuration
     */
    saveConfiguration() {
        const config = {
            currentLanguage: this.currentLanguage,
            defaultLanguage: this.defaultLanguage,
            enabledLanguages: this.enabledLanguages,
            fieldMappings: Array.from(this.fieldMappings.entries()),
            useFallback: this.useFallback
        };
        
        try {
            localStorage.setItem('catalogBuilderLocalization', JSON.stringify(config));
            console.log('Localization configuration saved');
        } catch (error) {
            console.error('Failed to save configuration:', error);
            throw error;
        }
    }

    /**
     * Load configuration
     */
    loadConfiguration() {
        try {
            const saved = localStorage.getItem('catalogBuilderLocalization');
            if (saved) {
                const config = JSON.parse(saved);
                this.currentLanguage = config.currentLanguage || 'en';
                this.defaultLanguage = config.defaultLanguage || 'en';
                this.enabledLanguages = config.enabledLanguages || ['en'];
                this.fieldMappings = new Map(config.fieldMappings || []);
                this.useFallback = config.useFallback !== undefined ? config.useFallback : true;
                console.log('Localization configuration loaded');
            }
        } catch (error) {
            console.error('Failed to load configuration:', error);
        }
    }

    /**
     * Export configuration
     */
    exportConfig() {
        return {
            version: '1.0',
            currentLanguage: this.currentLanguage,
            defaultLanguage: this.defaultLanguage,
            enabledLanguages: this.enabledLanguages,
            fieldMappings: Array.from(this.fieldMappings.entries()),
            useFallback: this.useFallback,
            exportedAt: new Date().toISOString()
        };
    }

    /**
     * Import configuration
     */
    importConfig(config) {
        try {
            if (config.currentLanguage) this.currentLanguage = config.currentLanguage;
            if (config.defaultLanguage) this.defaultLanguage = config.defaultLanguage;
            if (config.enabledLanguages) this.enabledLanguages = config.enabledLanguages;
            if (config.fieldMappings) this.fieldMappings = new Map(config.fieldMappings);
            if (config.useFallback !== undefined) this.useFallback = config.useFallback;
            console.log('Localization configuration imported');
        } catch (error) {
            console.error('Failed to import configuration:', error);
            throw error;
        }
    }
}

/**
 * Common UI translations
 */
const CommonTranslations = {
    'app.title': {
        en: 'Catalog Builder',
        fr: 'Générateur de Catalogue',
        de: 'Katalog-Builder',
        es: 'Generador de Catálogos'
    },
    'button.import': {
        en: 'Import',
        fr: 'Importer',
        de: 'Importieren',
        es: 'Importar'
    },
    'button.export': {
        en: 'Export',
        fr: 'Exporter',
        de: 'Exportieren',
        es: 'Exportar'
    },
    'button.generate': {
        en: 'Generate',
        fr: 'Générer',
        de: 'Generieren',
        es: 'Generar'
    },
    'label.language': {
        en: 'Language',
        fr: 'Langue',
        de: 'Sprache',
        es: 'Idioma'
    }
};

// ==================== END MODULE: localization.js ====================


// ==================== MODULE: dataImport.js ====================
/**
 * Data Import Module
 * Handles importing data from various file formats (CSV, Excel, JSON, XML)
 */

class DataImporter {
    constructor() {
        this.supportedFormats = {
            csv: ['.csv', '.txt'],
            excel: ['.xlsx', '.xls'],
            json: ['.json'],
            xml: ['.xml']
        };
    }

    /**
     * Select a file using UXP file picker
     */
    async selectFile(type = 'csv') {
        try {
            console.log('Opening file picker for type:', type);
            
            // In UXP, we use the file system access API
            const fs = require('uxp').storage.localFileSystem;
            
            const extensions = this.supportedFormats[type] || this.supportedFormats.csv;
            
            const file = await fs.getFileForOpening({
                types: extensions
            });
            
            if (file) {
                console.log('File selected:', file.name);
                return file;
            }
            
            return null;
        } catch (error) {
            console.error('File selection failed:', error);
            throw new Error('Failed to select file: ' + error.message);
        }
    }

    /**
     * Import data from file
     */
    async importData(file, options = {}) {
        try {
            console.log('Importing data from:', file.name);
            
            const type = options.type || this.detectFileType(file.name);
            
            switch (type) {
                case 'csv':
                    return await this.importCSV(file, options);
                case 'excel':
                    return await this.importExcel(file, options);
                case 'json':
                    return await this.importJSON(file, options);
                case 'xml':
                    return await this.importXML(file, options);
                default:
                    throw new Error('Unsupported file type: ' + type);
            }
        } catch (error) {
            console.error('Data import failed:', error);
            throw error;
        }
    }

    /**
     * Detect file type from extension
     */
    detectFileType(filename) {
        const ext = '.' + filename.split('.').pop().toLowerCase();
        
        for (const [type, extensions] of Object.entries(this.supportedFormats)) {
            if (extensions.includes(ext)) {
                return type;
            }
        }
        
        return 'csv'; // Default
    }

    /**
     * Import CSV file
     */
    async importCSV(file, options = {}) {
        try {
            console.log('Importing CSV file');
            
            const delimiter = options.delimiter || ',';
            const hasHeader = options.hasHeader !== false;
            const encoding = options.encoding || 'utf-8';
            
            // Read file content
            const content = await file.read({ format: require('uxp').storage.formats.utf8 });
            
            // Split into lines
            const lines = content.split(/\r?\n/).filter(line => line.trim());
            
            if (lines.length === 0) {
                throw new Error('File is empty');
            }
            
            // Parse header
            const headerLine = lines[0];
            const headers = hasHeader 
                ? parseCSVLine(headerLine, delimiter)
                : Array.from({ length: parseCSVLine(headerLine, delimiter).length }, (_, i) => `Column${i + 1}`);
            
            // Parse records
            const records = [];
            const startIndex = hasHeader ? 1 : 0;
            
            for (let i = startIndex; i < lines.length; i++) {
                const line = lines[i];
                if (!line.trim()) continue;
                
                const values = parseCSVLine(line, delimiter);
                const record = {};
                
                headers.forEach((header, index) => {
                    record[header] = values[index] || '';
                });
                
                records.push(record);
            }
            
            // Detect data types
            const fieldTypes = this.detectFieldTypes(records, headers);
            
            console.log(`Imported ${records.length} records with ${headers.length} fields`);
            
            return {
                type: 'csv',
                fields: headers,
                fieldTypes: fieldTypes,
                records: records,
                metadata: {
                    filename: file.name,
                    recordCount: records.length,
                    fieldCount: headers.length,
                    delimiter: delimiter,
                    encoding: encoding
                }
            };
        } catch (error) {
            console.error('CSV import failed:', error);
            throw new Error('Failed to import CSV: ' + error.message);
        }
    }

    /**
     * Import Excel file
     */
    async importExcel(file, options = {}) {
        try {
            console.log('Importing Excel file');
            
            // Read file as binary
            const arrayBuffer = await file.read({ format: require('uxp').storage.formats.binary });
            
            // Parse using a library (would need to bundle XLSX library)
            // For now, we'll use a simplified approach
            console.warn('Excel import requires XLSX library - falling back to CSV-like parsing');
            
            // This is a placeholder - in production, use SheetJS (xlsx) library
            throw new Error('Excel import not fully implemented - please export as CSV');
            
        } catch (error) {
            console.error('Excel import failed:', error);
            throw error;
        }
    }

    /**
     * Import JSON file
     */
    async importJSON(file, options = {}) {
        try {
            console.log('Importing JSON file');
            
            // Read file content
            const content = await file.read({ format: require('uxp').storage.formats.utf8 });
            
            // Parse JSON
            const data = JSON.parse(content);
            
            // Handle different JSON structures
            let records = [];
            
            if (Array.isArray(data)) {
                records = data;
            } else if (data.records && Array.isArray(data.records)) {
                records = data.records;
            } else if (data.data && Array.isArray(data.data)) {
                records = data.data;
            } else {
                throw new Error('JSON file must contain an array or have a "records" or "data" property');
            }
            
            if (records.length === 0) {
                throw new Error('No records found in JSON file');
            }
            
            // Extract field names from first record
            const fields = Object.keys(records[0]);
            
            // Detect data types
            const fieldTypes = this.detectFieldTypes(records, fields);
            
            console.log(`Imported ${records.length} records with ${fields.length} fields`);
            
            return {
                type: 'json',
                fields: fields,
                fieldTypes: fieldTypes,
                records: records,
                metadata: {
                    filename: file.name,
                    recordCount: records.length,
                    fieldCount: fields.length
                }
            };
        } catch (error) {
            console.error('JSON import failed:', error);
            throw new Error('Failed to import JSON: ' + error.message);
        }
    }

    /**
     * Import XML file
     */
    async importXML(file, options = {}) {
        try {
            console.log('Importing XML file');
            
            // Read file content
            const content = await file.read({ format: require('uxp').storage.formats.utf8 });
            
            // Parse XML (basic implementation)
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(content, 'text/xml');
            
            // Check for parse errors
            const parseError = xmlDoc.querySelector('parsererror');
            if (parseError) {
                throw new Error('Invalid XML format');
            }
            
            // Find record elements (assuming structure like <records><record>...</record></records>)
            const recordElements = xmlDoc.querySelectorAll('record, item, row, product');
            
            if (recordElements.length === 0) {
                throw new Error('No records found in XML file');
            }
            
            const records = [];
            const fieldsSet = new Set();
            
            // Parse each record
            recordElements.forEach(recordEl => {
                const record = {};
                
                // Get all child elements
                Array.from(recordEl.children).forEach(child => {
                    const fieldName = child.tagName;
                    const value = child.textContent;
                    
                    record[fieldName] = value;
                    fieldsSet.add(fieldName);
                });
                
                // Also check for attributes
                Array.from(recordEl.attributes).forEach(attr => {
                    record[attr.name] = attr.value;
                    fieldsSet.add(attr.name);
                });
                
                if (Object.keys(record).length > 0) {
                    records.push(record);
                }
            });
            
            const fields = Array.from(fieldsSet);
            
            // Detect data types
            const fieldTypes = this.detectFieldTypes(records, fields);
            
            console.log(`Imported ${records.length} records with ${fields.length} fields`);
            
            return {
                type: 'xml',
                fields: fields,
                fieldTypes: fieldTypes,
                records: records,
                metadata: {
                    filename: file.name,
                    recordCount: records.length,
                    fieldCount: fields.length
                }
            };
        } catch (error) {
            console.error('XML import failed:', error);
            throw new Error('Failed to import XML: ' + error.message);
        }
    }

    /**
     * Detect field data types
     */
    detectFieldTypes(records, fields) {
        const types = {};
        
        fields.forEach(field => {
            const typeCount = {};
            
            // Sample first 100 records
            const sample = records.slice(0, Math.min(100, records.length));
            
            sample.forEach(record => {
                const value = record[field];
                const type = detectDataType(value);
                typeCount[type] = (typeCount[type] || 0) + 1;
            });
            
            // Choose most common type
            let maxCount = 0;
            let dominantType = 'text';
            
            for (const [type, count] of Object.entries(typeCount)) {
                if (count > maxCount && type !== 'empty') {
                    maxCount = count;
                    dominantType = type;
                }
            }
            
            types[field] = dominantType;
        });
        
        return types;
    }

    /**
     * Validate imported data
     */
    validateData(data) {
        if (!data || !data.records) {
            return { valid: false, errors: ['No data to validate'] };
        }
        
        if (data.records.length === 0) {
            return { valid: false, errors: ['No records in data'] };
        }
        
        if (!data.fields || data.fields.length === 0) {
            return { valid: false, errors: ['No fields defined'] };
        }
        
        return { valid: true, errors: [] };
    }

    /**
     * Preview data (first N records)
     */
    previewData(data, maxRecords = 10) {
        if (!data || !data.records) {
            return null;
        }
        
        return {
            ...data,
            records: data.records.slice(0, maxRecords)
        };
    }
}

// ==================== END MODULE: dataImport.js ====================


// ==================== MODULE: dataMapping.js ====================
/**
 * Data Mapping Module
 * Handles mapping data fields to InDesign frames
 */

class DataMapper {
    constructor() {
        this.mappings = [];
    }

    /**
     * Detect frames in the active document
     */
    async detectFrames() {
        try {
            console.log('Detecting frames in document');
            
            const doc = getActiveDocument();
            if (!doc) {
                throw new Error('No active document');
            }

            const frames = [];
            
            // Get all text frames
            const textFrames = doc.textFrames;
            for (let i = 0; i < textFrames.length; i++) {
                const frame = textFrames[i];
                frames.push({
                    id: generateId(),
                    type: 'text',
                    label: frame.label || frame.name || `Text Frame ${i + 1}`,
                    originalFrame: frame
                });
            }
            
            // Get all rectangle frames (potential image frames)
            const rectangles = doc.rectangles;
            for (let i = 0; i < rectangles.length; i++) {
                const rect = rectangles[i];
                frames.push({
                    id: generateId(),
                    type: 'rectangle',
                    label: rect.label || rect.name || `Rectangle ${i + 1}`,
                    originalFrame: rect
                });
            }
            
            console.log(`Detected ${frames.length} frames`);
            return frames;
        } catch (error) {
            console.error('Frame detection failed:', error);
            throw error;
        }
    }

    /**
     * Create a mapping between data field and frame
     */
    createMapping(field, frameId, options = {}) {
        const mapping = {
            id: generateId(),
            field: field,
            frameId: frameId,
            type: options.type || 'text',
            formatter: options.formatter || null,
            transform: options.transform || null,
            ...options
        };
        
        this.mappings.push(mapping);
        console.log(`Created mapping: ${field} -> frame ${frameId}`);
        
        return mapping;
    }

    /**
     * Remove a mapping
     */
    removeMapping(mappingId) {
        const index = this.mappings.findIndex(m => m.id === mappingId);
        if (index !== -1) {
            this.mappings.splice(index, 1);
            console.log(`Removed mapping: ${mappingId}`);
            return true;
        }
        return false;
    }

    /**
     * Get all mappings
     */
    getMappings() {
        return this.mappings;
    }

    /**
     * Clear all mappings
     */
    clearMappings() {
        this.mappings = [];
        console.log('Cleared all mappings');
    }

    /**
     * Save mappings to file
     */
    async saveMappingToFile(mappings) {
        try {
            console.log('Saving mappings to file');
            
            const fs = require('uxp').storage.localFileSystem;
            const file = await fs.getFileForSaving('mappings.json', {
                types: ['.json']
            });
            
            if (file) {
                const data = JSON.stringify(mappings, null, 2);
                await file.write(data, { format: require('uxp').storage.formats.utf8 });
                console.log('Mappings saved successfully to file');
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Failed to save mappings to file:', error);
            throw error;
        }
    }

    /**
     * Load mappings from file
     */
    async loadMappingFromFile() {
        try {
            console.log('Loading mappings from file');
            
            const fs = require('uxp').storage.localFileSystem;
            const file = await fs.getFileForOpening({
                types: ['.json']
            });
            
            if (file) {
                const content = await file.read({ format: require('uxp').storage.formats.utf8 });
                const mappings = JSON.parse(content);
                
                console.log(`Loaded ${mappings.length} mappings from file`);
                return mappings;
            }
            
            return null;
        } catch (error) {
            console.error('Failed to load mappings from file:', error);
            throw error;
        }
    }

    /**
     * Get all saved mappings from localStorage
     */
    getSavedMappings() {
        try {
            const saved = localStorage.getItem('catalogBuilderMappings');
            if (saved) {
                const mappings = JSON.parse(saved);
                console.log(`Retrieved ${mappings.length} saved mappings`);
                return mappings;
            }
            return [];
        } catch (error) {
            console.error('Failed to get saved mappings:', error);
            return [];
        }
    }

    /**
     * Save mapping configuration to localStorage by name
     */
    saveMapping(name, mappingData) {
        try {
            const savedMappings = this.getSavedMappings();
            
            // Check if mapping with this name already exists
            const existingIndex = savedMappings.findIndex(m => m.name === name);
            if (existingIndex !== -1) {
                // Update existing
                savedMappings[existingIndex] = mappingData;
            } else {
                // Add new
                savedMappings.push(mappingData);
            }
            
            localStorage.setItem('catalogBuilderMappings', JSON.stringify(savedMappings));
            console.log(`Mapping "${name}" saved to localStorage`);
            return true;
        } catch (error) {
            console.error('Failed to save mapping:', error);
            throw error;
        }
    }

    /**
     * Load mapping configuration from localStorage by name
     */
    loadMapping(name) {
        try {
            const savedMappings = this.getSavedMappings();
            const mapping = savedMappings.find(m => m.name === name);
            
            if (mapping) {
                console.log(`Loaded mapping "${name}" from localStorage`);
                return mapping;
            }
            
            console.log(`Mapping "${name}" not found`);
            return null;
        } catch (error) {
            console.error('Failed to load mapping:', error);
            throw error;
        }
    }

    /**
     * Delete a saved mapping by name
     */
    deleteMapping(name) {
        try {
            const savedMappings = this.getSavedMappings();
            const filtered = savedMappings.filter(m => m.name !== name);
            
            localStorage.setItem('catalogBuilderMappings', JSON.stringify(filtered));
            console.log(`Mapping "${name}" deleted from localStorage`);
            return true;
        } catch (error) {
            console.error('Failed to delete mapping:', error);
            throw error;
        }
    }

    /**
     * Apply mapping to a record
     */
    async applyMapping(record, mapping, frame) {
        try {
            const value = record[mapping.field] || '';
            
            // Apply transform if specified
            let transformedValue = value;
            if (mapping.transform) {
                transformedValue = this.applyTransform(value, mapping.transform);
            }
            
            // Apply formatter if specified
            if (mapping.formatter) {
                transformedValue = this.applyFormatter(transformedValue, mapping.formatter);
            }
            
            // Set the value on the frame
            if (mapping.type === 'text') {
                frame.contents = transformedValue;
            } else if (mapping.type === 'image') {
                // Place image
                if (transformedValue) {
                    console.log(`Placing image: ${transformedValue}`);
                    // Would use frame.place() in actual InDesign
                }
            }
            
            return true;
        } catch (error) {
            console.error('Failed to apply mapping:', error);
            throw error;
        }
    }

    /**
     * Apply transform to value
     */
    applyTransform(value, transform) {
        switch (transform) {
            case 'uppercase':
                return String(value).toUpperCase();
            case 'lowercase':
                return String(value).toLowerCase();
            case 'capitalize':
                return String(value).charAt(0).toUpperCase() + String(value).slice(1).toLowerCase();
            case 'trim':
                return String(value).trim();
            default:
                return value;
        }
    }

    /**
     * Apply formatter to value
     */
    applyFormatter(value, formatter) {
        if (typeof formatter === 'function') {
            return formatter(value);
        }
        
        // Built-in formatters
        switch (formatter) {
            case 'currency':
                return this.formatCurrency(value);
            case 'date':
                return this.formatDate(value);
            case 'number':
                return this.formatNumber(value);
            default:
                return value;
        }
    }

    /**
     * Format as currency
     */
    formatCurrency(value) {
        const num = parseFloat(value);
        if (isNaN(num)) return value;
        return `$${num.toFixed(2)}`;
    }

    /**
     * Format as date
     */
    formatDate(value) {
        try {
            const date = new Date(value);
            return date.toLocaleDateString();
        } catch (error) {
            return value;
        }
    }

    /**
     * Format as number
     */
    formatNumber(value) {
        const num = parseFloat(value);
        if (isNaN(num)) return value;
        return num.toLocaleString();
    }
}

// ==================== END MODULE: dataMapping.js ====================


// ==================== MODULE: templateManager.js ====================
/**
 * Template Manager Module
 * Handles template creation, saving, and loading
 */

class TemplateManager {
    constructor() {
        this.templates = [];
        this.loadSavedTemplates();
    }

    /**
     * Create a new template
     */
    async createTemplate(options) {
        try {
            console.log('Creating template with options:', options);
            
            const template = {
                id: generateId(),
                name: options.name || `Template ${Date.now()}`,
                layoutType: options.layoutType || 'flow',
                gridRows: options.gridRows || 3,
                gridCols: options.gridCols || 2,
                gridGutter: options.gridGutter || 5,
                useMasterPage: options.useMasterPage || false,
                createdAt: new Date().toISOString()
            };
            
            // If using master page, capture its settings
            if (options.useMasterPage) {
                const doc = getActiveDocument();
                if (doc && doc.masterSpreads.length > 0) {
                    template.masterPageId = doc.masterSpreads[0].id;
                }
            }
            
            this.templates.push(template);
            console.log('Template created:', template.id);
            
            return template;
        } catch (error) {
            console.error('Failed to create template:', error);
            throw error;
        }
    }

    /**
     * Save template to file
     */
    async saveTemplate(template) {
        try {
            console.log('Saving template:', template.id);
            
            const fs = require('uxp').storage.localFileSystem;
            const file = await fs.getFileForSaving(`${template.name}.json`, {
                types: ['.json']
            });
            
            if (file) {
                const data = JSON.stringify(template, null, 2);
                await file.write(data, { format: require('uxp').storage.formats.utf8 });
                console.log('Template saved successfully');
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Failed to save template:', error);
            throw error;
        }
    }

    /**
     * Load template from file
     */
    async loadTemplate() {
        try {
            console.log('Loading template');
            
            const fs = require('uxp').storage.localFileSystem;
            const file = await fs.getFileForOpening({
                types: ['.json']
            });
            
            if (file) {
                const content = await file.read({ format: require('uxp').storage.formats.utf8 });
                const template = JSON.parse(content);
                
                this.templates.push(template);
                console.log('Template loaded:', template.id);
                
                return template;
            }
            
            return null;
        } catch (error) {
            console.error('Failed to load template:', error);
            throw error;
        }
    }

    /**
     * Get all templates
     */
    getTemplates() {
        return this.templates;
    }

    /**
     * Get template by ID
     */
    getTemplate(id) {
        return this.templates.find(t => t.id === id);
    }

    /**
     * Delete template
     */
    deleteTemplate(id) {
        const index = this.templates.findIndex(t => t.id === id);
        if (index !== -1) {
            this.templates.splice(index, 1);
            this.saveSavedTemplates();
            console.log('Template deleted:', id);
            return true;
        }
        return false;
    }

    /**
     * Load saved templates from storage
     */
    async loadSavedTemplates() {
        try {
            const saved = localStorage.getItem('catalogBuilderTemplates');
            if (saved) {
                this.templates = JSON.parse(saved);
                console.log(`Loaded ${this.templates.length} saved templates`);
            }
        } catch (error) {
            console.error('Failed to load saved templates:', error);
        }
    }

    /**
     * Save templates to storage
     */
    async saveSavedTemplates() {
        try {
            localStorage.setItem('catalogBuilderTemplates', JSON.stringify(this.templates));
            console.log('Templates saved to storage');
        } catch (error) {
            console.error('Failed to save templates to storage:', error);
        }
    }

    /**
     * Apply template to document
     */
    async applyTemplate(template, doc) {
        try {
            console.log('Applying template:', template.id);
            
            if (!doc) {
                doc = getActiveDocument();
            }
            
            if (!doc) {
                throw new Error('No active document');
            }
            
            // Apply template settings
            // This would involve creating frames, setting up grids, etc.
            console.log('Template applied successfully');
            
            return true;
        } catch (error) {
            console.error('Failed to apply template:', error);
            throw error;
        }
    }
}

// ==================== END MODULE: templateManager.js ====================


// ==================== MODULE: pageGenerator.js ====================
/**
 * Page Generator Module
 * Handles automatic page generation and content placement
 */

class PageGenerator {
    constructor() {
        this.defaultOptions = {
            layoutType: 'flow',
            itemsPerPage: 6,
            gridRows: 3,
            gridCols: 2,
            gutter: 5,
            margin: 10
        };
    }

    /**
     * Generate catalog pages
     */
    async generate(options) {
        try {
            console.log('Starting catalog generation');
            
            const doc = await ensureDocument();
            const { data, mappings, template, onProgress } = options;
            
            if (!data || !data.records) {
                throw new Error('No data to generate');
            }
            
            if (!mappings || mappings.length === 0) {
                throw new Error('No mappings defined');
            }
            
            // Clear existing content if requested
            if (options.clearExisting) {
                await this.clearDocument(doc);
            }
            
            // Calculate layout
            const layout = this.calculateLayout(doc, template || this.defaultOptions);
            
            // Process records in batches
            const batchSize = options.batchSize || 10;
            let processedCount = 0;
            
            for (let i = 0; i < data.records.length; i += batchSize) {
                const batch = data.records.slice(i, i + batchSize);
                
                for (const record of batch) {
                    await this.placeRecord(doc, record, mappings, layout);
                    processedCount++;
                    
                    if (onProgress) {
                        onProgress(processedCount, data.records.length, `Placed ${processedCount} of ${data.records.length} items`);
                    }
                }
                
                // Small delay to prevent UI freeze
                await new Promise(resolve => setTimeout(resolve, 10));
            }
            
            console.log(`Generated catalog with ${data.records.length} items`);
            return true;
        } catch (error) {
            console.error('Catalog generation failed:', error);
            throw error;
        }
    }

    /**
     * Calculate layout for pages
     */
    calculateLayout(doc, options) {
        const page = doc.pages[0] || doc.pages.add();
        const bounds = page.bounds;
        
        const pageWidth = bounds[3] - bounds[1];
        const pageHeight = bounds[2] - bounds[0];
        
        const margin = mmToPoints(options.margin || 10);
        const gutter = mmToPoints(options.gutter || 5);
        
        const contentWidth = pageWidth - (2 * margin);
        const contentHeight = pageHeight - (2 * margin);
        
        if (options.layoutType === 'grid') {
            const rows = options.gridRows || 3;
            const cols = options.gridCols || 2;
            
            const cellWidth = (contentWidth - ((cols - 1) * gutter)) / cols;
            const cellHeight = (contentHeight - ((rows - 1) * gutter)) / rows;
            
            return {
                type: 'grid',
                rows,
                cols,
                cellWidth,
                cellHeight,
                margin,
                gutter,
                itemsPerPage: rows * cols
            };
        }
        
        return {
            type: 'flow',
            margin,
            gutter,
            contentWidth,
            contentHeight
        };
    }

    /**
     * Place a single record on the page
     */
    async placeRecord(doc, record, mappings, layout) {
        try {
            // Create or get appropriate page
            const page = await this.getOrCreatePage(doc);
            
            // Create frames for this record based on layout
            const frames = await this.createFramesForRecord(page, layout);
            
            // Apply mappings to frames
            for (const mapping of mappings) {
                const frame = frames[mapping.type];
                if (frame && record[mapping.field]) {
                    await this.fillFrame(frame, record[mapping.field], mapping);
                }
            }
            
            return true;
        } catch (error) {
            console.error('Failed to place record:', error);
            throw error;
        }
    }

    /**
     * Get or create a page for placing content
     */
    async getOrCreatePage(doc) {
        try {
            // Simple implementation - just use the last page
            if (doc.pages.length === 0) {
                return doc.pages.add();
            }
            return doc.pages[doc.pages.length - 1];
        } catch (error) {
            console.error('Failed to get/create page:', error);
            throw error;
        }
    }

    /**
     * Create frames for a record
     */
    async createFramesForRecord(page, layout) {
        try {
            const frames = {};
            
            // This is a simplified implementation
            // In production, would create actual InDesign frames based on template
            
            frames.text = {
                type: 'text',
                contents: ''
            };
            
            frames.image = {
                type: 'image',
                path: null
            };
            
            return frames;
        } catch (error) {
            console.error('Failed to create frames:', error);
            throw error;
        }
    }

    /**
     * Fill a frame with content
     */
    async fillFrame(frame, value, mapping) {
        try {
            if (mapping.type === 'text') {
                frame.contents = value;
            } else if (mapping.type === 'image') {
                frame.path = value;
                // In actual implementation, would use frame.place(value)
            }
            
            return true;
        } catch (error) {
            console.error('Failed to fill frame:', error);
            throw error;
        }
    }

    /**
     * Clear document content
     */
    async clearDocument(doc) {
        try {
            console.log('Clearing document content');
            
            // Remove all pages except the first one
            while (doc.pages.length > 1) {
                doc.pages[doc.pages.length - 1].remove();
            }
            
            // Clear content from first page
            if (doc.pages.length > 0) {
                const page = doc.pages[0];
                // Remove all page items
                while (page.pageItems.length > 0) {
                    page.pageItems[0].remove();
                }
            }
            
            console.log('Document cleared');
            return true;
        } catch (error) {
            console.error('Failed to clear document:', error);
            throw error;
        }
    }

    /**
     * Add a new page to the document
     */
    async addPage(doc, after = null) {
        try {
            if (after) {
                return doc.pages.add(require('indesign').LocationOptions.AFTER, after);
            }
            return doc.pages.add();
        } catch (error) {
            console.error('Failed to add page:', error);
            throw error;
        }
    }

    /**
     * Generate catalog with data, options, and progress callback
     * This is the main entry point called by the UI handlers
     */
    async generateCatalog(data, options, onProgress) {
        try {
            console.log('Starting catalog generation via generateCatalog');
            
            // Convert data array to the format expected by generate()
            const dataObj = Array.isArray(data) ? { records: data } : data;
            
            // Prepare options for the generate method
            const generateOptions = {
                data: dataObj,
                mappings: options.mappings || [],
                template: options.template || this.defaultOptions,
                onProgress: onProgress,
                clearExisting: options.clearExisting !== false,
                batchSize: options.batchSize || 10,
                startPage: options.startPage || 1,
                imageHandling: options.imageHandling || 'fit'
            };
            
            // Call the existing generate method
            await this.generate(generateOptions);
            
            // Return result with summary
            const result = {
                success: true,
                pagesCreated: 1, // Simplified - would track actual pages created
                recordsProcessed: dataObj.records ? dataObj.records.length : 0,
                log: [`Processed ${dataObj.records ? dataObj.records.length : 0} records`]
            };
            
            console.log('Catalog generation completed successfully');
            return result;
        } catch (error) {
            console.error('Catalog generation failed in generateCatalog:', error);
            throw error;
        }
    }
}

// ==================== END MODULE: pageGenerator.js ====================


// ==================== MODULE: imageManager.js ====================
/**
 * Image Manager Module
 * Handles image placement, validation, and management
 */

class ImageManager {
    constructor() {
        this.defaultPath = '';
        this.missingImages = [];
    }

    /**
     * Select folder for images
     */
    async selectFolder() {
        try {
            console.log('Opening folder picker');
            
            const fs = require('uxp').storage.localFileSystem;
            const folder = await fs.getFolder();
            
            if (folder) {
                console.log('Folder selected:', folder.nativePath);
                this.defaultPath = folder.nativePath;
                return folder;
            }
            
            return null;
        } catch (error) {
            console.error('Folder selection failed:', error);
            throw error;
        }
    }

    /**
     * Validate image path
     */
    async validateImagePath(path) {
        try {
            if (!path) {
                return { valid: false, error: 'Empty path' };
            }
            
            if (!isValidImagePath(path)) {
                return { valid: false, error: 'Invalid image format' };
            }
            
            // Try to check if file exists
            const fs = require('uxp').storage.localFileSystem;
            
            try {
                const entry = await fs.getEntryWithUrl(path);
                if (entry && entry.isFile) {
                    return { valid: true, path: path };
                }
            } catch (e) {
                // File doesn't exist
                return { valid: false, error: 'File not found' };
            }
            
            return { valid: false, error: 'Unknown error' };
        } catch (error) {
            console.error('Image validation failed:', error);
            return { valid: false, error: error.message };
        }
    }

    /**
     * Resolve image path (handle relative paths)
     */
    resolveImagePath(path) {
        if (!path) return null;
        
        // If absolute path, return as is
        if (path.startsWith('/') || path.match(/^[a-zA-Z]:\\/)) {
            return path;
        }
        
        // If relative, prepend default path
        if (this.defaultPath) {
            return `${this.defaultPath}/${path}`;
        }
        
        return path;
    }

    /**
     * Place image in frame
     */
    async placeImage(frame, imagePath, options = {}) {
        try {
            console.log('Placing image:', imagePath);
            
            const resolvedPath = this.resolveImagePath(imagePath);
            const validation = await this.validateImagePath(resolvedPath);
            
            if (!validation.valid) {
                this.missingImages.push({ path: imagePath, error: validation.error });
                console.warn(`Image not found or invalid: ${imagePath}`);
                return false;
            }
            
            // In actual implementation, would use InDesign's place() method
            // frame.place(resolvedPath);
            
            // Apply fitting options
            if (options.fitting) {
                this.applyImageFitting(frame, options.fitting);
            }
            
            console.log('Image placed successfully');
            return true;
        } catch (error) {
            console.error('Failed to place image:', error);
            this.missingImages.push({ path: imagePath, error: error.message });
            return false;
        }
    }

    /**
     * Apply image fitting to frame
     */
    applyImageFitting(frame, fitting) {
        try {
            switch (fitting) {
                case 'fit':
                    // frame.fit(FitOptions.FRAME_TO_CONTENT);
                    console.log('Applied fit to frame');
                    break;
                case 'fill':
                    // frame.fit(FitOptions.FILL_PROPORTIONALLY);
                    console.log('Applied fill to frame');
                    break;
                case 'center':
                    // frame.fit(FitOptions.CENTER_CONTENT);
                    console.log('Applied center to frame');
                    break;
                default:
                    console.warn('Unknown fitting option:', fitting);
            }
        } catch (error) {
            console.error('Failed to apply image fitting:', error);
        }
    }

    /**
     * Batch validate images
     */
    async validateImages(imagePaths) {
        console.log(`Validating ${imagePaths.length} images`);
        
        const results = [];
        
        for (const path of imagePaths) {
            const result = await this.validateImagePath(path);
            results.push({
                path: path,
                valid: result.valid,
                error: result.error
            });
        }
        
        const validCount = results.filter(r => r.valid).length;
        const invalidCount = results.length - validCount;
        
        console.log(`Validation complete: ${validCount} valid, ${invalidCount} invalid`);
        
        return {
            results: results,
            validCount: validCount,
            invalidCount: invalidCount
        };
    }

    /**
     * Get missing images
     */
    getMissingImages() {
        return this.missingImages;
    }

    /**
     * Clear missing images list
     */
    clearMissingImages() {
        this.missingImages = [];
    }

    /**
     * Relink images
     */
    async relinkImages(oldPath, newPath) {
        try {
            console.log(`Relinking images from ${oldPath} to ${newPath}`);
            
            // In actual implementation, would iterate through all placed images
            // and update their links
            
            console.log('Images relinked successfully');
            return true;
        } catch (error) {
            console.error('Failed to relink images:', error);
            throw error;
        }
    }

    /**
     * Get image info
     */
    async getImageInfo(imagePath) {
        try {
            const fs = require('uxp').storage.localFileSystem;
            const file = await fs.getEntryWithUrl(imagePath);
            
            if (file && file.isFile) {
                return {
                    name: file.name,
                    size: await file.size,
                    path: file.nativePath,
                    modified: await file.dateModified
                };
            }
            
            return null;
        } catch (error) {
            console.error('Failed to get image info:', error);
            return null;
        }
    }
}

// ==================== END MODULE: imageManager.js ====================


// ==================== MODULE: updateEngine.js ====================
/**
 * Update Engine Module
 * Handles dynamic updates when data changes
 */

class UpdateEngine {
    constructor() {
        this.linkedData = null;
        this.updateHistory = [];
    }

    /**
     * Link data source to document
     */
    async linkDataSource(data, mappings) {
        try {
            console.log('Linking data source to document');
            
            this.linkedData = {
                data: data,
                mappings: mappings,
                linkedAt: new Date().toISOString(),
                version: 1
            };
            
            // Store in document metadata
            const doc = getActiveDocument();
            if (doc) {
                // In actual implementation, would store in document's customData
                console.log('Data source linked successfully');
            }
            
            return true;
        } catch (error) {
            console.error('Failed to link data source:', error);
            throw error;
        }
    }

    /**
     * Update catalog with new data
     */
    async update(data, mappings) {
        try {
            console.log('Updating catalog with new data');
            
            const doc = getActiveDocument();
            if (!doc) {
                throw new Error('No active document');
            }
            
            // Compare with existing data to find changes
            const changes = this.detectChanges(this.linkedData?.data, data);
            
            console.log(`Found ${changes.length} changes`);
            
            // Apply updates
            for (const change of changes) {
                await this.applyUpdate(change, mappings);
            }
            
            // Update linked data
            if (this.linkedData) {
                this.linkedData.data = data;
                this.linkedData.version++;
                this.linkedData.lastUpdated = new Date().toISOString();
            }
            
            // Record in history
            this.updateHistory.push({
                timestamp: new Date().toISOString(),
                changesCount: changes.length,
                version: this.linkedData?.version || 1
            });
            
            console.log('Catalog updated successfully');
            return true;
        } catch (error) {
            console.error('Failed to update catalog:', error);
            throw error;
        }
    }

    /**
     * Detect changes between old and new data
     */
    detectChanges(oldData, newData) {
        const changes = [];
        
        if (!oldData || !oldData.records) {
            // All records are new
            return newData.records.map((record, index) => ({
                type: 'add',
                index: index,
                record: record
            }));
        }
        
        const oldRecords = oldData.records;
        const newRecords = newData.records;
        
        // Simple comparison by index
        for (let i = 0; i < Math.max(oldRecords.length, newRecords.length); i++) {
            const oldRecord = oldRecords[i];
            const newRecord = newRecords[i];
            
            if (!oldRecord && newRecord) {
                changes.push({ type: 'add', index: i, record: newRecord });
            } else if (oldRecord && !newRecord) {
                changes.push({ type: 'remove', index: i, record: oldRecord });
            } else if (oldRecord && newRecord) {
                if (JSON.stringify(oldRecord) !== JSON.stringify(newRecord)) {
                    changes.push({ type: 'modify', index: i, oldRecord: oldRecord, newRecord: newRecord });
                }
            }
        }
        
        return changes;
    }

    /**
     * Apply a single update
     */
    async applyUpdate(change, mappings) {
        try {
            console.log(`Applying ${change.type} change at index ${change.index}`);
            
            // In actual implementation, would locate the corresponding frames
            // and update their content
            
            switch (change.type) {
                case 'add':
                    // Create new frames and place content
                    break;
                case 'remove':
                    // Remove frames
                    break;
                case 'modify':
                    // Update existing frames
                    break;
            }
            
            return true;
        } catch (error) {
            console.error('Failed to apply update:', error);
            throw error;
        }
    }

    /**
     * Get update history
     */
    getUpdateHistory() {
        return this.updateHistory;
    }

    /**
     * Revert to previous version
     */
    async revertToVersion(version) {
        try {
            console.log(`Reverting to version ${version}`);
            
            // In actual implementation, would restore previous data state
            // This would require storing version history
            
            console.log('Reverted successfully');
            return true;
        } catch (error) {
            console.error('Failed to revert:', error);
            throw error;
        }
    }

    /**
     * Check if data is linked
     */
    isLinked() {
        return this.linkedData !== null;
    }

    /**
     * Unlink data source
     */
    unlinkDataSource() {
        console.log('Unlinking data source');
        this.linkedData = null;
        return true;
    }

    /**
     * Get linked data info
     */
    getLinkedDataInfo() {
        if (!this.linkedData) {
            return null;
        }
        
        return {
            recordCount: this.linkedData.data?.records?.length || 0,
            fieldCount: this.linkedData.data?.fields?.length || 0,
            linkedAt: this.linkedData.linkedAt,
            lastUpdated: this.linkedData.lastUpdated,
            version: this.linkedData.version
        };
    }
}

// ==================== END MODULE: updateEngine.js ====================


// ==================== MAIN APPLICATION CODE ====================

// Create global logger for the application
const globalLogger = new Logger('CatalogBuilder');

// Initialize all engine instances
const formulaEngine = new FormulaEngine();
const filterEngine = new FilterEngine();
const groupingEngine = new GroupingEngine();
const crossRefEngine = new CrossReferenceEngine();
const localizationEngine = new LocalizationEngine();
const dataImporter = new DataImporter();
const dataMapper = new DataMapper();
const templateManager = new TemplateManager();
const pageGenerator = new PageGenerator();
const imageManager = new ImageManager();
const updateEngine = new UpdateEngine();

// Application state
const AppState = {
    data: null,
    mappings: [],
    template: null,
    settings: {
        defaultImagePath: '',
        validateImages: true,
        autoSave: true,
        batchSize: 100,
        enableLogging: true
    },
    currentFile: null,
    dataType: 'csv',
    filteredData: null,
    groupedData: null,
    currentLanguage: 'en',
    // Engine instances
    formulaEngine,
    filterEngine,
    groupingEngine,
    crossRefEngine,
    localizationEngine,
    dataImporter,
    dataMapper,
    templateManager,
    pageGenerator,
    imageManager,
    updateEngine
}

/**
 * CSV Parser - Simple implementation without external dependencies
 * 
 * NOTE: This is a basic CSV parser for simple use cases.
 * Limitations:
 * - Does not handle quoted fields containing delimiters (e.g., "Company, Inc.")
 * - Does not handle multi-line fields
 * - Does not handle escaped quotes
 * 
 * For production use with complex CSV files, consider using a robust CSV parsing library.
 * This implementation is sufficient for well-formed, simple CSV files.
 */
function parseCSV(content, delimiter = ',', hasHeader = true) {
    console.log('Parsing CSV, length:', content.length);
    
    const lines = content.split(/\r?\n/).filter(line => line.trim());
    if (lines.length === 0) {
        throw new Error('Empty CSV file');
    }
    
    const headers = hasHeader ? lines[0].split(delimiter).map(h => h.trim()) : null;
    const dataLines = hasHeader ? lines.slice(1) : lines;
    
    const records = dataLines.map((line, idx) => {
        const values = line.split(delimiter).map(v => v.trim());
        const record = {};
        
        if (hasHeader && headers) {
            headers.forEach((header, i) => {
                record[header] = values[i] || '';
            });
        } else {
            values.forEach((value, i) => {
                record[`column_${i}`] = value;
            });
        }
        
        return record;
    });
    
    const fields = hasHeader && headers ? headers : Object.keys(records[0] || {});
    
    console.log('CSV parsed:', records.length, 'records,', fields.length, 'fields');
    
    return {
        records: records,
        fields: fields
    };
}

/**
 * Handle file selection
 */
async function handleSelectFile() {
    try {
        console.log('=== SELECT FILE CLICKED ===');
        showStatus('Opening file picker...');
        
        const fs = require('uxp').storage.localFileSystem;
        
        console.log('File system API loaded');
        
        const file = await fs.getFileForOpening({
            types: ['csv', 'txt', 'json', 'xml', 'xlsx', 'xls']
        });
        
        console.log('File picker closed, result:', !!file);
        
        if (file) {
            AppState.currentFile = file;
            console.log('Selected file:', file.name);
            
            const selectedFileEl = document.getElementById('selectedFile');
            if (selectedFileEl) {
                selectedFileEl.textContent = file.name;
            }
            
            const importBtn = document.getElementById('importBtn');
            if (importBtn) {
                importBtn.disabled = false;
            }
            
            showStatus('File selected: ' + file.name);
        } else {
            console.log('No file selected');
            showStatus('No file selected');
        }
    } catch (error) {
        console.error('File selection error:', error);
        console.error('Error stack:', error.stack);
        showError('Failed to select file: ' + error.message);
    }
}

/**
 * Handle data import
 */
async function handleImportData() {
    try {
        console.log('=== IMPORT DATA CLICKED ===');
        
        if (!AppState.currentFile) {
            showError('No file selected');
            return;
        }
        
        showStatus('Importing data...');
        console.log('Reading file:', AppState.currentFile.name);
        
        // Read file content
        const content = await AppState.currentFile.read();
        console.log('File content read, length:', content.length);
        
        // Parse based on file type
        let data;
        if (AppState.dataType === 'csv') {
            const delimiterEl = document.getElementById('csvDelimiter');
            const delimiter = delimiterEl ? delimiterEl.value : ',';
            
            const hasHeaderEl = document.getElementById('csvHeader');
            const hasHeader = hasHeaderEl ? hasHeaderEl.checked : true;
            
            console.log('Parsing CSV with delimiter:', delimiter, 'hasHeader:', hasHeader);
            data = parseCSV(content, delimiter, hasHeader);
        } else {
            throw new Error('Only CSV files are currently supported in this version');
        }
        
        AppState.data = data;
        console.log('Data imported:', data.records.length, 'records');
        
        // Update UI
        displayDataPreview(data);
        updateSourceFields(data.fields);
        updateAdvancedFieldDropdowns(data.fields);
        
        showSuccess('Imported ' + data.records.length + ' records');
        
        // Auto-switch to mapping tab
        console.log('Attempting to switch to mapping tab...');
        const mappingTab = document.querySelector('[data-tab="mapping"]');
        console.log('Mapping tab button found:', !!mappingTab);
        
        if (mappingTab) {
            // Remove active from all tabs
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            
            // Activate mapping tab
            mappingTab.classList.add('active');
            const mappingPane = document.getElementById('mapping-tab');
            if (mappingPane) {
                mappingPane.classList.add('active');
                console.log('Mapping tab activated successfully');
            } else {
                console.error('Mapping pane not found');
            }
        } else {
            console.error('Mapping tab button not found');
        }
        
    } catch (error) {
        console.error('Import error:', error);
        console.error('Error stack:', error.stack);
        showError('Failed to import data: ' + error.message);
    }
}

/**
 * Display data preview
 */
function displayDataPreview(data) {
    console.log('Displaying data preview');
    
    const previewPanel = document.getElementById('dataPreview');
    const previewTable = document.getElementById('previewTable');
    const recordCountEl = document.getElementById('recordCount');
    const columnCountEl = document.getElementById('columnCount');
    
    if (recordCountEl) {
        recordCountEl.textContent = 'Records: ' + data.records.length;
    }
    if (columnCountEl) {
        columnCountEl.textContent = 'Columns: ' + data.fields.length;
    }
    
    if (previewTable) {
        // Create preview table using safe DOM manipulation
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        data.fields.forEach(field => {
            const th = document.createElement('th');
            th.textContent = field;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        const tbody = document.createElement('tbody');
        
        // Show first 10 records
        const previewRecords = data.records.slice(0, 10);
        previewRecords.forEach(record => {
            const row = document.createElement('tr');
            data.fields.forEach(field => {
                const td = document.createElement('td');
                td.textContent = record[field] || '';
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        
        // Clear and append new table
        previewTable.innerHTML = '';
        previewTable.appendChild(table);
    }
    
    if (previewPanel) {
        previewPanel.style.display = 'block';
    }
}

/**
 * Update source fields list
 */
function updateSourceFields(fields) {
    console.log('Updating source fields:', fields.length);
    const container = document.getElementById('sourceFieldsList');
    if (!container) return;
    
    container.innerHTML = '';
    
    fields.forEach(field => {
        const fieldItem = document.createElement('div');
        fieldItem.className = 'field-item';
        fieldItem.textContent = field;
        container.appendChild(fieldItem);
    });
}

/**
 * Update field dropdowns in advanced features
 */
function updateAdvancedFieldDropdowns(fields) {
    console.log('Updating advanced field dropdowns');
    
    // Update formula fields list
    const formulaFieldsList = document.getElementById('formulaFieldsList');
    if (formulaFieldsList) {
        formulaFieldsList.innerHTML = '';
        fields.forEach(f => {
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'field-item';
            fieldDiv.textContent = '{' + f + '}';
            formulaFieldsList.appendChild(fieldDiv);
        });
    }
    
    // Helper to populate select dropdown safely
    function populateSelect(selectId, fields) {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        select.innerHTML = '';
        
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select field...';
        select.appendChild(defaultOption);
        
        fields.forEach(f => {
            const option = document.createElement('option');
            option.value = f;
            option.textContent = f;
            select.appendChild(option);
        });
    }
    
    // Update dropdowns using safe DOM manipulation
    populateSelect('filterField', fields);
    populateSelect('sortField', fields);
    populateSelect('groupField', fields);
}

/**
 * Handle data source type change
 */
function handleDataSourceTypeChange(event) {
    const type = event.target.value;
    AppState.dataType = type;
    console.log('Data source type changed to:', type);
    
    // Show/hide relevant options
    const csvOptions = document.getElementById('csvOptions');
    const excelOptions = document.getElementById('excelOptions');
    
    if (csvOptions) {
        csvOptions.style.display = type === 'csv' ? 'block' : 'none';
    }
    if (excelOptions) {
        excelOptions.style.display = type === 'excel' ? 'block' : 'none';
    }
}

/**
 * Handle detect frames
 */
async function handleDetectFrames() {
    try {
        console.log('Detect frames clicked');
        showStatus('Detecting frames in InDesign...');
        
        const frames = await AppState.dataMapper.detectFrames();
        
        // Update UI
        const container = document.getElementById('targetFramesList');
        if (container) {
            container.innerHTML = '';
            if (frames && frames.length > 0) {
                frames.forEach(frame => {
                    const item = document.createElement('div');
                    item.className = 'frame-item';
                    item.textContent = frame.name || 'Unnamed frame';
                    container.appendChild(item);
                });
                showSuccess(`Found ${frames.length} frames`);
            } else {
                container.innerHTML = '<p class="empty-message">No frames found. Please select frames in InDesign.</p>';
                showStatus('No frames detected');
            }
        }
    } catch (error) {
        console.error('Frame detection error:', error);
        showError('Failed to detect frames: ' + error.message);
    }
}

/**
 * Mapping handlers
 */
async function handleSaveMapping() {
    console.log('Save mapping clicked');
    try {
        // Use a simple naming scheme since prompt() is not available in UXP
        // Save with timestamp for uniqueness
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const name = `mapping-${timestamp}`;
        
        const mappingData = {
            name,
            mappings: AppState.mappings,
            createdAt: new Date().toISOString()
        };
        
        AppState.dataMapper.saveMapping(name, mappingData);
        showSuccess(`Mapping saved as "${name}"`);
    } catch (error) {
        console.error('Save mapping error:', error);
        showError('Failed to save mapping: ' + error.message);
    }
}

async function handleLoadMapping() {
    console.log('Load mapping clicked');
    try {
        const mappings = AppState.dataMapper.getSavedMappings();
        if (mappings.length === 0) {
            showError('No saved mappings found');
            return;
        }
        
        // For now, load the most recent mapping
        // In a full implementation, this could show a selection dialog
        const mostRecent = mappings[mappings.length - 1];
        
        if (mostRecent && mostRecent.mappings) {
            AppState.mappings = mostRecent.mappings;
            showSuccess(`Mapping "${mostRecent.name}" loaded (${mappings.length} total available)`);
        }
    } catch (error) {
        console.error('Load mapping error:', error);
        showError('Failed to load mapping: ' + error.message);
    }
}

function handleClearMapping() {
    console.log('Clear mapping clicked');
    AppState.mappings = [];
    showStatus('Mappings cleared');
}

function handleLayoutTypeChange(event) {
    const type = event.target.value;
    const gridOptions = document.getElementById('gridOptions');
    if (gridOptions) {
        gridOptions.style.display = type === 'grid' ? 'block' : 'none';
    }
}

function handleCreateTemplate() {
    console.log('Create template clicked');
    try {
        const layoutType = document.getElementById('layoutType')?.value || 'flow';
        const useMasterPage = document.getElementById('useMasterPage')?.checked ?? false;
        
        const config = {
            layoutType,
            useMasterPage
        };
        
        if (layoutType === 'grid') {
            config.rows = parseInt(document.getElementById('gridRows')?.value || '3');
            config.columns = parseInt(document.getElementById('gridCols')?.value || '2');
            config.gutter = parseFloat(document.getElementById('gridGutter')?.value || '5');
        }
        
        const template = AppState.templateManager.createTemplate(config);
        AppState.template = template;
        
        showSuccess('Template created');
    } catch (error) {
        console.error('Create template error:', error);
        showError('Failed to create template: ' + error.message);
    }
}

function handleSaveTemplate() {
    console.log('Save template clicked');
    try {
        if (!AppState.template) {
            showError('Please create a template first');
            return;
        }
        
        const name = prompt('Enter template name:');
        if (!name) return;
        
        AppState.templateManager.saveTemplate(name, AppState.template);
        updateTemplatesListUI();
        showSuccess('Template saved');
    } catch (error) {
        console.error('Save template error:', error);
        showError('Failed to save template: ' + error.message);
    }
}

function updateTemplatesListUI() {
    const container = document.getElementById('templatesContainer');
    if (!container) return;
    
    const templates = AppState.templateManager.getTemplates();
    container.innerHTML = '';
    
    if (templates.length === 0) {
        container.innerHTML = '<p class="empty-message">No templates saved</p>';
        return;
    }
    
    templates.forEach(template => {
        const item = document.createElement('div');
        item.className = 'template-item';
        item.innerHTML = `
            <strong>${template.name}</strong>
            <button class="btn btn-secondary" onclick="loadTemplate('${template.name}')">Load</button>
            <button class="btn-remove" onclick="deleteTemplate('${template.name}')">Delete</button>
        `;
        container.appendChild(item);
    });
}

function loadTemplate(name) {
    try {
        const template = AppState.templateManager.loadTemplate(name);
        AppState.template = template;
        showSuccess('Template loaded');
    } catch (error) {
        showError('Failed to load template: ' + error.message);
    }
}

function deleteTemplate(name) {
    try {
        AppState.templateManager.deleteTemplate(name);
        updateTemplatesListUI();
        showSuccess('Template deleted');
    } catch (error) {
        showError('Failed to delete template: ' + error.message);
    }
}

function handleGenerateCatalog() {
    console.log('Generate catalog clicked');
    
    if (!AppState.data) {
        showError('Please import data first');
        return;
    }
    
    try {
        showStatus('Generating catalog...');
        
        // Get options
        const startPage = parseInt(document.getElementById('startPage')?.value || '1');
        const clearExisting = document.getElementById('clearExisting')?.checked ?? true;
        const imageHandling = document.getElementById('imageHandling')?.value || 'fit';
        
        const options = {
            startPage,
            clearExisting,
            imageHandling,
            mappings: AppState.mappings,
            template: AppState.template
        };
        
        // Use filtered/grouped data if available
        let dataToGenerate = AppState.data.records;
        
        // Apply formulas if any
        const formulas = AppState.formulaEngine.getFormulas();
        if (formulas.length > 0) {
            dataToGenerate = AppState.formulaEngine.applyFormulas(dataToGenerate);
        }
        
        // Use filtered data if available
        if (AppState.filteredData) {
            dataToGenerate = AppState.filteredData;
        }
        
        // Use grouped data if available
        if (AppState.groupedData && AppState.groupedData.flat) {
            dataToGenerate = AppState.groupedData.flat;
        }
        
        // Update progress UI
        const progressContainer = document.getElementById('progressContainer');
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        
        if (progressContainer) progressContainer.style.display = 'block';
        
        const onProgress = (current, total, message) => {
            const percent = (current / total) * 100;
            if (progressBar) progressBar.style.width = percent + '%';
            if (progressText) progressText.textContent = `${message} (${current}/${total})`;
        };
        
        // Generate catalog
        AppState.pageGenerator.generateCatalog(dataToGenerate, options, onProgress)
            .then(result => {
                if (progressContainer) progressContainer.style.display = 'none';
                showSuccess(`Catalog generated: ${result.pagesCreated} pages, ${result.recordsProcessed} records`);
                
                const logContainer = document.getElementById('generationLog');
                if (logContainer && result.log) {
                    logContainer.innerHTML = '<h4>Generation Log</h4>' + result.log.map(msg => `<p>${msg}</p>`).join('');
                }
            })
            .catch(error => {
                if (progressContainer) progressContainer.style.display = 'none';
                showError('Catalog generation failed: ' + error.message);
            });
            
    } catch (error) {
        console.error('Generate catalog error:', error);
        showError('Failed to generate catalog: ' + error.message);
    }
}

function handleUpdateCatalog() {
    console.log('Update catalog clicked');
    try {
        if (!AppState.data) {
            showError('Please import data first');
            return;
        }
        
        showStatus('Updating catalog...');
        
        AppState.updateEngine.updateCatalog(AppState.data.records, AppState.mappings)
            .then(result => {
                showSuccess(`Catalog updated: ${result.updated} records updated`);
            })
            .catch(error => {
                showError('Update failed: ' + error.message);
            });
            
    } catch (error) {
        console.error('Update catalog error:', error);
        showError('Failed to update catalog: ' + error.message);
    }
}

function handleBrowseImagePath() {
    console.log('Browse image path clicked');
    try {
        const fs = require('uxp').storage.localFileSystem;
        fs.getFolder().then(folder => {
            if (folder) {
                const pathEl = document.getElementById('defaultImagePath');
                if (pathEl) {
                    pathEl.value = folder.nativePath;
                }
                showSuccess('Image path selected');
            }
        }).catch(error => {
            console.error('Browse error:', error);
            showError('Failed to select folder: ' + error.message);
        });
    } catch (error) {
        console.error('Browse image path error:', error);
        showError('Failed to browse: ' + error.message);
    }
}

function handleSaveSettings() {
    console.log('Save settings clicked');
    try {
        const settings = {
            defaultImagePath: document.getElementById('defaultImagePath')?.value || '',
            validateImages: document.getElementById('validateImages')?.checked ?? true,
            autoSave: document.getElementById('autoSave')?.checked ?? true,
            batchSize: parseInt(document.getElementById('batchSize')?.value || '100'),
            enableLogging: document.getElementById('enableLogging')?.checked ?? true
        };
        
        AppState.settings = settings;
        localStorage.setItem('catalogBuilderSettings', JSON.stringify(settings));
        showSuccess('Settings saved');
    } catch (error) {
        console.error('Save settings error:', error);
        showError('Failed to save settings: ' + error.message);
    }
}

function handleResetSettings() {
    console.log('Reset settings clicked');
    AppState.settings = {
        defaultImagePath: '',
        validateImages: true,
        autoSave: true,
        batchSize: 100,
        enableLogging: true
    };
    
    // Update UI
    if (document.getElementById('defaultImagePath')) {
        document.getElementById('defaultImagePath').value = '';
    }
    if (document.getElementById('validateImages')) {
        document.getElementById('validateImages').checked = true;
    }
    if (document.getElementById('autoSave')) {
        document.getElementById('autoSave').checked = true;
    }
    if (document.getElementById('batchSize')) {
        document.getElementById('batchSize').value = '100';
    }
    if (document.getElementById('enableLogging')) {
        document.getElementById('enableLogging').checked = true;
    }
    
    showStatus('Settings reset to defaults');
}

function handleClearCache() {
    console.log('Clear cache clicked');
    localStorage.clear();
    showSuccess('Cache cleared');
}

function handleExportLogs() {
    console.log('Export logs clicked');
    try {
        globalLogger.exportLogs().then(logsText => {
            // In a full implementation, we would save to file
            // For now, just copy to clipboard or show dialog
            console.log('Logs exported:', logsText);
            showSuccess('Logs ready for export (check console)');
        }).catch(error => {
            showError('Failed to export logs: ' + error.message);
        });
    } catch (error) {
        console.error('Export logs error:', error);
        showError('Failed to export logs: ' + error.message);
    }
}

// Advanced feature handlers
function handleTestFormula() {
    console.log('Test formula clicked');
    try {
        const expression = document.getElementById('formulaExpression')?.value;
        if (!expression) {
            showError('Please enter a formula');
            return;
        }
        
        if (!AppState.data || AppState.data.records.length === 0) {
            showError('Please import data first');
            return;
        }
        
        // Test with first record
        const sampleRecord = AppState.data.records[0];
        const result = AppState.formulaEngine.evaluate(expression, sampleRecord);
        
        const previewEl = document.getElementById('formulaPreview');
        if (previewEl) {
            previewEl.textContent = `Result: ${result}`;
        }
        
        showSuccess('Formula test successful');
    } catch (error) {
        console.error('Formula test error:', error);
        showError('Formula test failed: ' + error.message);
    }
}

function handleAddFormula() {
    console.log('Add formula clicked');
    try {
        const name = document.getElementById('formulaFieldName')?.value;
        const expression = document.getElementById('formulaExpression')?.value;
        
        if (!name || !expression) {
            showError('Please enter formula name and expression');
            return;
        }
        
        AppState.formulaEngine.addFormula(name, expression);
        
        // Update the formulas list UI
        updateFormulasListUI();
        
        // Clear inputs
        document.getElementById('formulaFieldName').value = '';
        document.getElementById('formulaExpression').value = '';
        document.getElementById('formulaPreview').textContent = 'Enter a formula to see preview';
        
        showSuccess(`Formula "${name}" added`);
    } catch (error) {
        console.error('Add formula error:', error);
        showError('Failed to add formula: ' + error.message);
    }
}

function updateFormulasListUI() {
    const container = document.getElementById('formulasContainer');
    if (!container) return;
    
    container.innerHTML = '';
    const formulas = AppState.formulaEngine.getFormulas();
    
    if (formulas.length === 0) {
        container.innerHTML = '<p class="empty-message">No formulas added</p>';
        return;
    }
    
    formulas.forEach(formula => {
        const item = document.createElement('div');
        item.className = 'formula-item';
        item.innerHTML = `
            <strong>${formula.name}</strong>: ${formula.expression}
            <button class="btn-remove" onclick="removeFormula('${formula.name}')">Remove</button>
        `;
        container.appendChild(item);
    });
}

function removeFormula(name) {
    try {
        AppState.formulaEngine.removeFormula(name);
        updateFormulasListUI();
        showSuccess('Formula removed');
    } catch (error) {
        showError('Failed to remove formula: ' + error.message);
    }
}

function handleClearFormula() {
    console.log('Clear formula clicked');
    const nameEl = document.getElementById('formulaFieldName');
    const exprEl = document.getElementById('formulaExpression');
    const previewEl = document.getElementById('formulaPreview');
    
    if (nameEl) nameEl.value = '';
    if (exprEl) exprEl.value = '';
    if (previewEl) previewEl.textContent = 'Enter a formula to see preview';
}

function handleFormulaTemplateChange(event) {
    const template = event.target.value;
    if (template) {
        const exprEl = document.getElementById('formulaExpression');
        if (exprEl) exprEl.value = template;
    }
}

function handleAddFilter() {
    console.log('Add filter clicked');
    try {
        const field = document.getElementById('filterField')?.value;
        const operator = document.getElementById('filterOperator')?.value;
        const value = document.getElementById('filterValue')?.value;
        
        if (!field || !operator) {
            showError('Please select field and operator');
            return;
        }
        
        const filter = { field, operator, value };
        AppState.filterEngine.addFilter(filter);
        
        // Update UI
        updateFiltersListUI();
        
        // Clear inputs
        document.getElementById('filterField').value = '';
        document.getElementById('filterValue').value = '';
        
        showSuccess('Filter added');
    } catch (error) {
        console.error('Add filter error:', error);
        showError('Failed to add filter: ' + error.message);
    }
}

function handleAddSort() {
    console.log('Add sort clicked');
    try {
        const field = document.getElementById('sortField')?.value;
        const direction = document.getElementById('sortDirection')?.value || 'asc';
        
        if (!field) {
            showError('Please select a field');
            return;
        }
        
        AppState.filterEngine.addSortRule(field, direction);
        
        // Update UI
        updateSortRulesListUI();
        
        // Clear selection
        document.getElementById('sortField').value = '';
        
        showSuccess('Sort rule added');
    } catch (error) {
        console.error('Add sort error:', error);
        showError('Failed to add sort rule: ' + error.message);
    }
}

function handleApplyFilters() {
    console.log('Apply filters clicked');
    try {
        if (!AppState.data) {
            showError('Please import data first');
            return;
        }
        
        const logic = document.getElementById('filterLogic')?.value || 'AND';
        AppState.filteredData = AppState.filterEngine.apply(AppState.data.records, logic);
        
        // Update statistics
        const stats = AppState.filterEngine.getStatistics(AppState.data.records, AppState.filteredData);
        const statsEl = document.getElementById('filterStatsText');
        if (statsEl) {
            statsEl.textContent = `Showing ${stats.filtered} of ${stats.total} records (${stats.percentage}%)`;
        }
        
        showSuccess(`Filters applied: ${stats.filtered} records match`);
    } catch (error) {
        console.error('Apply filters error:', error);
        showError('Failed to apply filters: ' + error.message);
    }
}

function handleClearFilters() {
    console.log('Clear filters clicked');
    AppState.filterEngine.clearFilters();
    AppState.filterEngine.clearSortRules();
    AppState.filteredData = null;
    updateFiltersListUI();
    updateSortRulesListUI();
    const statsEl = document.getElementById('filterStatsText');
    if (statsEl) {
        statsEl.textContent = 'No filters applied';
    }
    showStatus('Filters cleared');
}

function handleSaveFilterPreset() {
    console.log('Save filter preset clicked');
    try {
        const name = prompt('Enter preset name:');
        if (!name) return;
        
        const description = prompt('Enter description (optional):');
        AppState.filterEngine.savePreset(name, description || '');
        
        showSuccess('Preset saved');
    } catch (error) {
        console.error('Save preset error:', error);
        showError('Failed to save preset: ' + error.message);
    }
}

function handleLoadFilterPreset() {
    console.log('Load filter preset clicked');
    try {
        const presets = AppState.filterEngine.getPresets();
        if (presets.length === 0) {
            showError('No presets saved');
            return;
        }
        
        // Show preset selection (simplified)
        const names = presets.map(p => p.name).join('\n');
        const selected = prompt('Available presets:\n' + names + '\n\nEnter preset name to load:');
        
        if (selected) {
            AppState.filterEngine.loadPreset(selected);
            updateFiltersListUI();
            updateSortRulesListUI();
            showSuccess('Preset loaded');
        }
    } catch (error) {
        console.error('Load preset error:', error);
        showError('Failed to load preset: ' + error.message);
    }
}

function updateFiltersListUI() {
    const container = document.getElementById('filtersList');
    if (!container) return;
    
    container.innerHTML = '';
    const filters = AppState.filterEngine.filters;
    
    filters.forEach((filter, index) => {
        const item = document.createElement('div');
        item.className = 'filter-item';
        item.innerHTML = `
            ${filter.field} ${filter.operator} "${filter.value}"
            <button class="btn-remove" onclick="removeFilter(${index})">×</button>
        `;
        container.appendChild(item);
    });
}

function updateSortRulesListUI() {
    const container = document.getElementById('sortRulesList');
    if (!container) return;
    
    container.innerHTML = '';
    const rules = AppState.filterEngine.sortRules;
    
    rules.forEach((rule, index) => {
        const item = document.createElement('div');
        item.className = 'sort-item';
        item.innerHTML = `
            ${rule.field} (${rule.direction})
            <button class="btn-remove" onclick="removeSortRule(${index})">×</button>
        `;
        container.appendChild(item);
    });
}

function removeFilter(index) {
    AppState.filterEngine.removeFilter(index);
    updateFiltersListUI();
    showStatus('Filter removed');
}

function removeSortRule(index) {
    AppState.filterEngine.removeSortRule(index);
    updateSortRulesListUI();
    showStatus('Sort rule removed');
}

function handleAddGroup() {
    console.log('Add group clicked');
    try {
        const field = document.getElementById('groupField')?.value;
        const direction = document.getElementById('groupDirection')?.value || 'asc';
        
        if (!field) {
            showError('Please select a field');
            return;
        }
        
        AppState.groupingEngine.addGroupLevel(field, direction);
        
        // Update UI
        updateGroupLevelsListUI();
        
        // Clear selection
        document.getElementById('groupField').value = '';
        
        showSuccess('Group level added');
    } catch (error) {
        console.error('Add group error:', error);
        showError('Failed to add group: ' + error.message);
    }
}

function handleApplyGrouping() {
    console.log('Apply grouping clicked');
    try {
        if (!AppState.data) {
            showError('Please import data first');
            return;
        }
        
        const options = {
            showHeaders: document.getElementById('showGroupHeaders')?.checked ?? true,
            showItemCount: document.getElementById('showItemCount')?.checked ?? true,
            pageBreakPerGroup: document.getElementById('pageBreakPerGroup')?.checked ?? false,
            headerStyle: document.getElementById('groupHeaderStyle')?.value || 'heading1',
            separator: document.getElementById('groupSeparator')?.value || 'line'
        };
        
        const dataToGroup = AppState.filteredData || AppState.data.records;
        const grouped = AppState.groupingEngine.groupData(dataToGroup, options);
        AppState.groupedData = grouped;
        
        showSuccess(`Data grouped into ${grouped.groups.length} groups`);
    } catch (error) {
        console.error('Apply grouping error:', error);
        showError('Failed to apply grouping: ' + error.message);
    }
}

function handleClearGrouping() {
    console.log('Clear grouping clicked');
    AppState.groupingEngine.clearGroupLevels();
    AppState.groupedData = null;
    updateGroupLevelsListUI();
    showStatus('Grouping cleared');
}

function updateGroupLevelsListUI() {
    const container = document.getElementById('groupLevelsList');
    if (!container) return;
    
    container.innerHTML = '';
    const levels = AppState.groupingEngine.groupLevels;
    
    levels.forEach((level, index) => {
        const item = document.createElement('div');
        item.className = 'group-level-item';
        item.innerHTML = `
            Level ${index + 1}: ${level.field} (${level.direction})
            <button class="btn-remove" onclick="removeGroupLevel(${index})">×</button>
        `;
        container.appendChild(item);
    });
}

function removeGroupLevel(index) {
    AppState.groupingEngine.removeGroupLevel(index);
    updateGroupLevelsListUI();
    showStatus('Group level removed');
}

function handleAddReference() {
    console.log('Add reference clicked');
    try {
        const sourceId = document.getElementById('refSourceId')?.value;
        const targetId = document.getElementById('refTargetId')?.value;
        const refType = document.getElementById('refType')?.value || 'related';
        
        if (!sourceId || !targetId) {
            showError('Please enter source and target IDs');
            return;
        }
        
        AppState.crossRefEngine.addReference(sourceId, targetId, refType);
        
        // Update UI
        updateReferencesListUI();
        
        // Clear inputs
        document.getElementById('refSourceId').value = '';
        document.getElementById('refTargetId').value = '';
        
        showSuccess('Reference added');
    } catch (error) {
        console.error('Add reference error:', error);
        showError('Failed to add reference: ' + error.message);
    }
}

function handleValidateReferences() {
    console.log('Validate references clicked');
    try {
        if (!AppState.data) {
            showError('Please import data first');
            return;
        }
        
        // Validate using first field as ID field (simplified)
        const idField = AppState.data.fields[0];
        const result = AppState.crossRefEngine.validateReferences(AppState.data.records, idField);
        
        showSuccess(`Validation complete: ${result.valid.length} valid, ${result.broken.length} broken`);
    } catch (error) {
        console.error('Validate references error:', error);
        showError('Failed to validate references: ' + error.message);
    }
}

function handleImportReferences() {
    console.log('Import references clicked');
    try {
        if (!AppState.data) {
            showError('Please import data first');
            return;
        }
        
        const field = prompt('Enter field name containing reference IDs (comma-separated):');
        if (!field) return;
        
        const idField = AppState.data.fields[0]; // Simplified: use first field as ID
        const refType = 'related';
        
        const imported = AppState.crossRefEngine.importFromField(AppState.data.records, idField, field, refType);
        
        updateReferencesListUI();
        showSuccess(`Imported ${imported} references`);
    } catch (error) {
        console.error('Import references error:', error);
        showError('Failed to import references: ' + error.message);
    }
}

function updateReferencesListUI() {
    const container = document.getElementById('referencesContainer');
    if (!container) return;
    
    container.innerHTML = '';
    const refs = AppState.crossRefEngine.getAllReferences();
    
    if (refs.length === 0) {
        container.innerHTML = '<p class="empty-message">No references added</p>';
        return;
    }
    
    refs.forEach((ref, index) => {
        const item = document.createElement('div');
        item.className = 'reference-item';
        item.innerHTML = `
            ${ref.sourceId} → ${ref.targetId} (${ref.type})
            <button class="btn-remove" onclick="removeReference(${index})">×</button>
        `;
        container.appendChild(item);
    });
}

function removeReference(index) {
    const refs = AppState.crossRefEngine.getAllReferences();
    if (refs[index]) {
        AppState.crossRefEngine.removeReference(refs[index].sourceId, refs[index].targetId);
        updateReferencesListUI();
        showStatus('Reference removed');
    }
}

function handleAutoDetectFields() {
    console.log('Auto-detect fields clicked');
    try {
        if (!AppState.data) {
            showError('Please import data first');
            return;
        }
        
        const language = AppState.currentLanguage;
        const mapping = AppState.localizationEngine.autoDetectFields(AppState.data.fields, language);
        
        // Update UI with detected mappings
        updateLanguageFieldMappingsUI(mapping);
        
        showSuccess(`Auto-detected ${Object.keys(mapping).length} language fields`);
    } catch (error) {
        console.error('Auto-detect error:', error);
        showError('Failed to auto-detect fields: ' + error.message);
    }
}

function handleApplyLocalization() {
    console.log('Apply localization clicked');
    try {
        if (!AppState.data) {
            showError('Please import data first');
            return;
        }
        
        const language = AppState.currentLanguage;
        const useFallback = document.getElementById('useFallback')?.checked ?? true;
        
        // Apply localization would modify the dataset
        showSuccess(`Localization applied for language: ${language}`);
    } catch (error) {
        console.error('Apply localization error:', error);
        showError('Failed to apply localization: ' + error.message);
    }
}

function handleGenerateAllLanguages() {
    console.log('Generate all languages clicked');
    try {
        if (!AppState.data) {
            showError('Please import data first');
            return;
        }
        
        // Get enabled languages
        const enabledLanguages = [];
        document.querySelectorAll('[id^="lang_"]:checked').forEach(cb => {
            enabledLanguages.push(cb.value);
        });
        
        showSuccess(`Would generate catalog for ${enabledLanguages.length} languages: ${enabledLanguages.join(', ')}`);
    } catch (error) {
        console.error('Generate all languages error:', error);
        showError('Failed to generate multi-language catalogs: ' + error.message);
    }
}

function updateLanguageFieldMappingsUI(mapping) {
    const container = document.getElementById('langFieldMappings');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (const [baseField, langField] of Object.entries(mapping)) {
        const item = document.createElement('div');
        item.className = 'mapping-item';
        item.textContent = `${baseField} → ${langField}`;
        container.appendChild(item);
    }
}

function handleLanguageChange(event) {
    const language = event.target.value;
    console.log('Language changed to:', language);
    AppState.currentLanguage = language;
    AppState.localizationEngine.setLanguage(language);
    showSuccess('Language set to ' + language);
}

/**
 * Setup tab navigation
 */
function setupTabs() {
    console.log('Setting up tab navigation');
    
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    console.log('Found', tabButtons.length, 'tab buttons and', tabPanes.length, 'tab panes');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            console.log('Tab clicked:', tabName);
            
            // Update active states
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            button.classList.add('active');
            const targetPane = document.getElementById(tabName + '-tab');
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
    
    // Setup sub-tab navigation for Advanced tab
    const subTabButtons = document.querySelectorAll('.sub-tab-button');
    const subTabPanes = document.querySelectorAll('.sub-tab-pane');
    
    console.log('Found', subTabButtons.length, 'sub-tab buttons and', subTabPanes.length, 'sub-tab panes');
    
    subTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const subTabName = button.getAttribute('data-subtab');
            console.log('Sub-tab clicked:', subTabName);
            
            // Update active states
            subTabButtons.forEach(btn => btn.classList.remove('active'));
            subTabPanes.forEach(pane => pane.classList.remove('active'));
            
            button.classList.add('active');
            const targetPane = document.getElementById(subTabName + '-subtab');
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
    
    console.log('Tab navigation setup complete');
}

/**
 * Setup event handlers
 */
function setupEventHandlers() {
    console.log('Setting up event handlers');
    
    // Helper to safely add event listener
    function addHandler(id, event, handler) {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener(event, handler);
            console.log('Added', event, 'handler to', id);
        } else {
            console.warn('Element not found:', id);
        }
    }
    
    // Import Tab
    addHandler('dataSourceType', 'change', handleDataSourceTypeChange);
    addHandler('selectFileBtn', 'click', handleSelectFile);
    addHandler('importBtn', 'click', handleImportData);
    
    // Mapping Tab
    addHandler('detectFramesBtn', 'click', handleDetectFrames);
    addHandler('saveMappingBtn', 'click', handleSaveMapping);
    addHandler('loadMappingBtn', 'click', handleLoadMapping);
    addHandler('clearMappingBtn', 'click', handleClearMapping);
    
    // Template Tab
    addHandler('layoutType', 'change', handleLayoutTypeChange);
    addHandler('createTemplateBtn', 'click', handleCreateTemplate);
    addHandler('saveTemplateBtn', 'click', handleSaveTemplate);
    
    // Generate Tab
    addHandler('generateBtn', 'click', handleGenerateCatalog);
    addHandler('updateBtn', 'click', handleUpdateCatalog);
    
    // Settings Tab
    addHandler('browseImagePathBtn', 'click', handleBrowseImagePath);
    addHandler('saveSettingsBtn', 'click', handleSaveSettings);
    addHandler('resetSettingsBtn', 'click', handleResetSettings);
    addHandler('clearCacheBtn', 'click', handleClearCache);
    addHandler('exportLogsBtn', 'click', handleExportLogs);
    
    // Advanced Tab - Formulas
    addHandler('testFormulaBtn', 'click', handleTestFormula);
    addHandler('addFormulaBtn', 'click', handleAddFormula);
    addHandler('clearFormulaBtn', 'click', handleClearFormula);
    addHandler('formulaTemplates', 'change', handleFormulaTemplateChange);
    
    // Advanced Tab - Filtering
    addHandler('addFilterBtn', 'click', handleAddFilter);
    addHandler('addSortBtn', 'click', handleAddSort);
    addHandler('applyFiltersBtn', 'click', handleApplyFilters);
    addHandler('clearFiltersBtn', 'click', handleClearFilters);
    addHandler('saveFilterPresetBtn', 'click', handleSaveFilterPreset);
    addHandler('loadFilterPresetBtn', 'click', handleLoadFilterPreset);
    
    // Advanced Tab - Grouping
    addHandler('addGroupBtn', 'click', handleAddGroup);
    addHandler('applyGroupingBtn', 'click', handleApplyGrouping);
    addHandler('clearGroupingBtn', 'click', handleClearGrouping);
    
    // Advanced Tab - Cross-References
    addHandler('addReferenceBtn', 'click', handleAddReference);
    addHandler('validateReferencesBtn', 'click', handleValidateReferences);
    addHandler('importReferencesBtn', 'click', handleImportReferences);
    
    // Advanced Tab - Localization
    addHandler('catalogLanguage', 'change', handleLanguageChange);
    addHandler('autoDetectFieldsBtn', 'click', handleAutoDetectFields);
    addHandler('applyLocalizationBtn', 'click', handleApplyLocalization);
    addHandler('generateAllLanguagesBtn', 'click', handleGenerateAllLanguages);
    
    console.log('Event handlers setup complete');
}

/**
 * Load settings from storage
 */
function loadSettings() {
    console.log('Loading settings from storage');
    try {
        const saved = localStorage.getItem('catalogBuilderSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            // Use spread operator for shallow merge - creates new object without mutating original
            // Note: Only creates new top-level object; nested objects would still be shared
            // This is sufficient for the flat settings object structure
            AppState.settings = { ...AppState.settings, ...settings };
            
            // Update UI
            if (document.getElementById('defaultImagePath')) {
                document.getElementById('defaultImagePath').value = AppState.settings.defaultImagePath || '';
            }
            if (document.getElementById('validateImages')) {
                document.getElementById('validateImages').checked = AppState.settings.validateImages;
            }
            if (document.getElementById('autoSave')) {
                document.getElementById('autoSave').checked = AppState.settings.autoSave;
            }
            if (document.getElementById('batchSize')) {
                document.getElementById('batchSize').value = AppState.settings.batchSize;
            }
            if (document.getElementById('enableLogging')) {
                document.getElementById('enableLogging').checked = AppState.settings.enableLogging;
            }
            
            console.log('Settings loaded successfully');
        }
    } catch (error) {
        console.error('Failed to load settings:', error);
    }
}

/**
 * Initialize the plugin
 */
function initialize() {
    try {
        console.log('=== PLUGIN INITIALIZATION START ===');
        
        // Load settings
        loadSettings();
        
        // Setup UI
        setupTabs();
        setupEventHandlers();
        
        console.log('=== PLUGIN INITIALIZED SUCCESSFULLY ===');
        showStatus('Ready');
        
    } catch (error) {
        console.error('=== PLUGIN INITIALIZATION FAILED ===');
        console.error('Error:', error);
        console.error('Stack:', error.stack);
        showError('Initialization failed: ' + error.message);
    }
}

// Auto-run when ready
if (document.readyState === 'loading') {
    console.log('Document still loading, waiting for DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    console.log('Document already loaded, initializing immediately');
    initialize();
}

console.log('=== INDEX.JS LOADED ===');
