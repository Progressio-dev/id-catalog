/**
 * Template Manager Module
 * Handles template creation, saving, and loading
 */

import { Logger, getActiveDocument, generateId } from './utils.js';

const logger = new Logger('TemplateManager');

export default class TemplateManager {
    constructor() {
        this.templates = [];
        this.loadSavedTemplates();
    }

    /**
     * Create a new template
     */
    async createTemplate(options) {
        try {
            logger.info('Creating template with options:', options);
            
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
            logger.info('Template created:', template.id);
            
            return template;
        } catch (error) {
            logger.error('Failed to create template:', error);
            throw error;
        }
    }

    /**
     * Save template to file
     */
    async saveTemplate(template) {
        try {
            logger.info('Saving template:', template.id);
            
            const fs = require('uxp').storage.localFileSystem;
            const file = await fs.getFileForSaving(`${template.name}.json`, {
                types: ['.json']
            });
            
            if (file) {
                const data = JSON.stringify(template, null, 2);
                await file.write(data, { format: require('uxp').storage.formats.utf8 });
                logger.info('Template saved successfully');
                return true;
            }
            
            return false;
        } catch (error) {
            logger.error('Failed to save template:', error);
            throw error;
        }
    }

    /**
     * Load template from file
     */
    async loadTemplate() {
        try {
            logger.info('Loading template');
            
            const fs = require('uxp').storage.localFileSystem;
            const file = await fs.getFileForOpening({
                types: ['.json']
            });
            
            if (file) {
                const content = await file.read({ format: require('uxp').storage.formats.utf8 });
                const template = JSON.parse(content);
                
                this.templates.push(template);
                logger.info('Template loaded:', template.id);
                
                return template;
            }
            
            return null;
        } catch (error) {
            logger.error('Failed to load template:', error);
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
            logger.info('Template deleted:', id);
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
                logger.info(`Loaded ${this.templates.length} saved templates`);
            }
        } catch (error) {
            logger.error('Failed to load saved templates:', error);
        }
    }

    /**
     * Save templates to storage
     */
    async saveSavedTemplates() {
        try {
            localStorage.setItem('catalogBuilderTemplates', JSON.stringify(this.templates));
            logger.info('Templates saved to storage');
        } catch (error) {
            logger.error('Failed to save templates to storage:', error);
        }
    }

    /**
     * Apply template to document
     */
    async applyTemplate(template, doc) {
        try {
            logger.info('Applying template:', template.id);
            
            if (!doc) {
                doc = getActiveDocument();
            }
            
            if (!doc) {
                throw new Error('No active document');
            }
            
            // Apply template settings
            // This would involve creating frames, setting up grids, etc.
            logger.info('Template applied successfully');
            
            return true;
        } catch (error) {
            logger.error('Failed to apply template:', error);
            throw error;
        }
    }
}
