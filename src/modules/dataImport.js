/**
 * Data Import Module
 * Handles importing data from various file formats (CSV, Excel, JSON, XML)
 */

import { Logger, validateFileExtension, parseCSVLine, detectDataType } from './utils.js';

const logger = new Logger('DataImporter');

export default class DataImporter {
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
            logger.info('Opening file picker for type:', type);
            
            // In UXP, we use the file system access API
            const fs = require('uxp').storage.localFileSystem;
            
            const extensions = this.supportedFormats[type] || this.supportedFormats.csv;
            
            const file = await fs.getFileForOpening({
                types: extensions
            });
            
            if (file) {
                logger.info('File selected:', file.name);
                return file;
            }
            
            return null;
        } catch (error) {
            logger.error('File selection failed:', error);
            throw new Error('Failed to select file: ' + error.message);
        }
    }

    /**
     * Import data from file
     */
    async importData(file, options = {}) {
        try {
            logger.info('Importing data from:', file.name);
            
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
            logger.error('Data import failed:', error);
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
            logger.info('Importing CSV file');
            
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
            
            logger.info(`Imported ${records.length} records with ${headers.length} fields`);
            
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
            logger.error('CSV import failed:', error);
            throw new Error('Failed to import CSV: ' + error.message);
        }
    }

    /**
     * Import Excel file
     */
    async importExcel(file, options = {}) {
        try {
            logger.info('Importing Excel file');
            
            // Read file as binary
            const arrayBuffer = await file.read({ format: require('uxp').storage.formats.binary });
            
            // Parse using a library (would need to bundle XLSX library)
            // For now, we'll use a simplified approach
            logger.warn('Excel import requires XLSX library - falling back to CSV-like parsing');
            
            // This is a placeholder - in production, use SheetJS (xlsx) library
            throw new Error('Excel import not fully implemented - please export as CSV');
            
        } catch (error) {
            logger.error('Excel import failed:', error);
            throw error;
        }
    }

    /**
     * Import JSON file
     */
    async importJSON(file, options = {}) {
        try {
            logger.info('Importing JSON file');
            
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
            
            logger.info(`Imported ${records.length} records with ${fields.length} fields`);
            
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
            logger.error('JSON import failed:', error);
            throw new Error('Failed to import JSON: ' + error.message);
        }
    }

    /**
     * Import XML file
     */
    async importXML(file, options = {}) {
        try {
            logger.info('Importing XML file');
            
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
            
            logger.info(`Imported ${records.length} records with ${fields.length} fields`);
            
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
            logger.error('XML import failed:', error);
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
