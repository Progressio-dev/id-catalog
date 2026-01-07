/**
 * Filtering and Sorting Module
 * Comprehensive data filtering and sorting capabilities
 */

import { Logger } from './utils.js';

const logger = new Logger('Filtering');

/**
 * Filter and Sort Engine Class
 */
export default class FilterEngine {
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
            logger.info(`Filter added: ${filter.field} ${filter.operator} ${filter.value}`);
            return filter;
        } catch (error) {
            logger.error(`Failed to add filter: ${error.message}`);
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
            logger.info(`Filter removed at index ${index}`);
            return true;
        }
        return false;
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        this.filters = [];
        logger.info('All filters cleared');
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

        logger.info(`Applying ${this.filters.length} filters with ${logic} logic`);

        const filtered = records.filter(record => {
            if (logic === 'AND') {
                return this.filters.every(filter => this._matchesFilter(record, filter));
            } else {
                return this.filters.some(filter => this._matchesFilter(record, filter));
            }
        });

        logger.info(`Filtered ${records.length} records to ${filtered.length} records`);
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
                    logger.error(`Invalid regex: ${filterValue}`);
                    return false;
                }
            
            default:
                logger.warn(`Unknown operator: ${filter.operator}`);
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
        logger.info(`Sort rule added: ${field} ${direction}`);
        return rule;
    }

    /**
     * Remove a sort rule
     */
    removeSortRule(index) {
        if (index >= 0 && index < this.sortRules.length) {
            this.sortRules.splice(index, 1);
            logger.info(`Sort rule removed at index ${index}`);
            return true;
        }
        return false;
    }

    /**
     * Clear all sort rules
     */
    clearSortRules() {
        this.sortRules = [];
        logger.info('All sort rules cleared');
    }

    /**
     * Apply sorting to dataset
     */
    applySort(records) {
        if (this.sortRules.length === 0) {
            return records;
        }

        logger.info(`Applying ${this.sortRules.length} sort rules`);

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
        logger.info(`Preset saved: ${name}`);
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
            logger.info(`Preset loaded: ${name}`);
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
            logger.info(`Preset deleted: ${name}`);
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
            logger.error('Failed to save presets:', error);
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
                logger.info(`Loaded ${this.presets.length} presets`);
            }
        } catch (error) {
            logger.error('Failed to load presets:', error);
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
            logger.info('Configuration imported');
        } catch (error) {
            logger.error('Failed to import configuration:', error);
            throw error;
        }
    }
}

/**
 * Available filter operators
 */
export const FilterOperators = [
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
