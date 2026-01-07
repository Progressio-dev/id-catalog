/**
 * Formulas Module
 * Comprehensive formula engine for calculated fields
 */

import { Logger } from './utils.js';

const logger = new Logger('Formulas');

/**
 * Formula Engine Class
 */
export default class FormulaEngine {
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
            logger.info(`Formula added: ${name} = ${expression}`);
            
            return formula;
        } catch (error) {
            logger.error(`Failed to add formula: ${error.message}`);
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
            logger.info(`Formula removed: ${name}`);
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

            logger.debug(`Formula validated: ${expression}`);
            return true;
        } catch (error) {
            logger.error(`Formula validation failed: ${error.message}`);
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
            
            logger.debug(`Evaluated: ${expression} => ${result}`);
            return result;
        } catch (error) {
            logger.error(`Formula evaluation failed: ${error.message}`);
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
                logger.warn(`Field not found: ${fieldName}`);
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
                    logger.error(`Function ${funcName} failed: ${error.message}`);
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
            logger.error(`Expression evaluation failed: ${error.message}`);
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
                    logger.error(`Failed to apply formula ${formula.name}: ${error.message}`);
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
            logger.info('Formulas saved');
        } catch (error) {
            logger.error('Failed to save formulas:', error);
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
                logger.info(`Loaded ${this.formulas.length} formulas`);
            }
        } catch (error) {
            logger.error('Failed to load formulas:', error);
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
                logger.info(`Imported ${this.formulas.length} formulas`);
            }
        } catch (error) {
            logger.error('Failed to import formulas:', error);
            throw error;
        }
    }
}

/**
 * Common formula templates
 */
export const FormulaTemplates = {
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
