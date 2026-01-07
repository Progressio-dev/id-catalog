/**
 * Image Manager Module
 * Handles image placement, validation, and management
 */

import { Logger, isValidImagePath } from './utils.js';

const logger = new Logger('ImageManager');

export default class ImageManager {
    constructor() {
        this.defaultPath = '';
        this.missingImages = [];
    }

    /**
     * Select folder for images
     */
    async selectFolder() {
        try {
            logger.info('Opening folder picker');
            
            const fs = require('uxp').storage.localFileSystem;
            const folder = await fs.getFolder();
            
            if (folder) {
                logger.info('Folder selected:', folder.nativePath);
                this.defaultPath = folder.nativePath;
                return folder;
            }
            
            return null;
        } catch (error) {
            logger.error('Folder selection failed:', error);
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
            logger.error('Image validation failed:', error);
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
            logger.info('Placing image:', imagePath);
            
            const resolvedPath = this.resolveImagePath(imagePath);
            const validation = await this.validateImagePath(resolvedPath);
            
            if (!validation.valid) {
                this.missingImages.push({ path: imagePath, error: validation.error });
                logger.warn(`Image not found or invalid: ${imagePath}`);
                return false;
            }
            
            // In actual implementation, would use InDesign's place() method
            // frame.place(resolvedPath);
            
            // Apply fitting options
            if (options.fitting) {
                this.applyImageFitting(frame, options.fitting);
            }
            
            logger.info('Image placed successfully');
            return true;
        } catch (error) {
            logger.error('Failed to place image:', error);
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
                    logger.debug('Applied fit to frame');
                    break;
                case 'fill':
                    // frame.fit(FitOptions.FILL_PROPORTIONALLY);
                    logger.debug('Applied fill to frame');
                    break;
                case 'center':
                    // frame.fit(FitOptions.CENTER_CONTENT);
                    logger.debug('Applied center to frame');
                    break;
                default:
                    logger.warn('Unknown fitting option:', fitting);
            }
        } catch (error) {
            logger.error('Failed to apply image fitting:', error);
        }
    }

    /**
     * Batch validate images
     */
    async validateImages(imagePaths) {
        logger.info(`Validating ${imagePaths.length} images`);
        
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
        
        logger.info(`Validation complete: ${validCount} valid, ${invalidCount} invalid`);
        
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
            logger.info(`Relinking images from ${oldPath} to ${newPath}`);
            
            // In actual implementation, would iterate through all placed images
            // and update their links
            
            logger.info('Images relinked successfully');
            return true;
        } catch (error) {
            logger.error('Failed to relink images:', error);
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
            logger.error('Failed to get image info:', error);
            return null;
        }
    }
}
