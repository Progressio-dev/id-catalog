/**
 * Grouping Module
 * Data grouping and categorization with layout support
 */

import { Logger } from './utils.js';

const logger = new Logger('Grouping');

/**
 * Grouping Engine Class
 */
export default class GroupingEngine {
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
        logger.info(`Group level added: ${field} (${sortDirection})`);
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
            logger.info(`Group level removed at index ${index}`);
            return true;
        }
        return false;
    }

    /**
     * Clear all group levels
     */
    clearGroupLevels() {
        this.groupLevels = [];
        logger.info('All group levels cleared');
    }

    /**
     * Set group options
     */
    setOptions(options) {
        this.groupOptions = { ...this.groupOptions, ...options };
        logger.info('Group options updated');
    }

    /**
     * Group records by configured levels
     * @param {array} records - Data records to group
     */
    groupRecords(records) {
        if (this.groupLevels.length === 0) {
            logger.warn('No group levels defined');
            return { groups: [], flatList: records };
        }

        logger.info(`Grouping ${records.length} records by ${this.groupLevels.length} levels`);

        // Sort records by group fields first
        const sortedRecords = this._sortByGroupLevels(records);

        // Build hierarchical groups
        const groups = this._buildGroups(sortedRecords, 0);

        // Create flat list with group markers
        const flatList = this._flattenGroups(groups);

        logger.info(`Created ${this._countGroups(groups)} groups`);

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
            logger.info('Group configuration saved');
        } catch (error) {
            logger.error('Failed to save configuration:', error);
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
                logger.info('Group configuration loaded');
            }
        } catch (error) {
            logger.error('Failed to load configuration:', error);
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
            logger.info('Group configuration imported');
        } catch (error) {
            logger.error('Failed to import configuration:', error);
            throw error;
        }
    }
}

/**
 * Available aggregation functions
 */
export const AggregationFunctions = [
    { value: 'count', label: 'Count' },
    { value: 'sum', label: 'Sum' },
    { value: 'avg', label: 'Average' },
    { value: 'min', label: 'Minimum' },
    { value: 'max', label: 'Maximum' }
];

/**
 * Header style options
 */
export const HeaderStyles = [
    { value: 'heading1', label: 'Heading 1' },
    { value: 'heading2', label: 'Heading 2' },
    { value: 'heading3', label: 'Heading 3' },
    { value: 'bold', label: 'Bold Text' },
    { value: 'custom', label: 'Custom Style' }
];

/**
 * Separator type options
 */
export const SeparatorTypes = [
    { value: 'none', label: 'None' },
    { value: 'line', label: 'Line' },
    { value: 'space', label: 'Extra Space' },
    { value: 'pageBreak', label: 'Page Break' }
];
