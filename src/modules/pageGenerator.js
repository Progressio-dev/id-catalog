/**
 * Page Generator Module
 * Handles automatic page generation and content placement
 */

import { Logger, getActiveDocument, ensureDocument, batchProcess, mmToPoints } from './utils.js';

const logger = new Logger('PageGenerator');

export default class PageGenerator {
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
            logger.info('Starting catalog generation');
            
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
            
            logger.info(`Generated catalog with ${data.records.length} items`);
            return true;
        } catch (error) {
            logger.error('Catalog generation failed:', error);
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
            logger.error('Failed to place record:', error);
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
            logger.error('Failed to get/create page:', error);
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
            logger.error('Failed to create frames:', error);
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
            logger.error('Failed to fill frame:', error);
            throw error;
        }
    }

    /**
     * Clear document content
     */
    async clearDocument(doc) {
        try {
            logger.info('Clearing document content');
            
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
            
            logger.info('Document cleared');
            return true;
        } catch (error) {
            logger.error('Failed to clear document:', error);
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
            logger.error('Failed to add page:', error);
            throw error;
        }
    }
}
