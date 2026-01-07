/**
 * Data Mapping Module
 * Handles mapping data fields to InDesign frames
 */

import { Logger, getActiveDocument, generateId } from './utils.js';

const logger = new Logger('DataMapper');

export default class DataMapper {
    constructor() {
        this.mappings = [];
    }

    /**
     * Detect frames in the active document
     */
    async detectFrames() {
        try {
            logger.info('Detecting frames in document');
            
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
            
            logger.info(`Detected ${frames.length} frames`);
            return frames;
        } catch (error) {
            logger.error('Frame detection failed:', error);
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
        logger.info(`Created mapping: ${field} -> frame ${frameId}`);
        
        return mapping;
    }

    /**
     * Remove a mapping
     */
    removeMapping(mappingId) {
        const index = this.mappings.findIndex(m => m.id === mappingId);
        if (index !== -1) {
            this.mappings.splice(index, 1);
            logger.info(`Removed mapping: ${mappingId}`);
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
        logger.info('Cleared all mappings');
    }

    /**
     * Save mappings to file
     */
    async saveMapping(mappings) {
        try {
            logger.info('Saving mappings');
            
            const fs = require('uxp').storage.localFileSystem;
            const file = await fs.getFileForSaving('mappings.json', {
                types: ['.json']
            });
            
            if (file) {
                const data = JSON.stringify(mappings, null, 2);
                await file.write(data, { format: require('uxp').storage.formats.utf8 });
                logger.info('Mappings saved successfully');
                return true;
            }
            
            return false;
        } catch (error) {
            logger.error('Failed to save mappings:', error);
            throw error;
        }
    }

    /**
     * Load mappings from file
     */
    async loadMapping() {
        try {
            logger.info('Loading mappings');
            
            const fs = require('uxp').storage.localFileSystem;
            const file = await fs.getFileForOpening({
                types: ['.json']
            });
            
            if (file) {
                const content = await file.read({ format: require('uxp').storage.formats.utf8 });
                const mappings = JSON.parse(content);
                
                logger.info(`Loaded ${mappings.length} mappings`);
                return mappings;
            }
            
            return null;
        } catch (error) {
            logger.error('Failed to load mappings:', error);
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
                    logger.debug(`Placing image: ${transformedValue}`);
                    // Would use frame.place() in actual InDesign
                }
            }
            
            return true;
        } catch (error) {
            logger.error('Failed to apply mapping:', error);
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
