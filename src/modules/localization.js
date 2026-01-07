/**
 * Localization Module
 * Multi-language support and internationalization
 */

import { Logger } from './utils.js';

const logger = new Logger('Localization');

/**
 * Supported Languages
 */
export const SupportedLanguages = [
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
export default class LocalizationEngine {
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
            logger.info(`Language set to: ${languageCode}`);
            return true;
        }
        
        logger.warn(`Unsupported language: ${languageCode}`);
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
        logger.info(`Default language set to: ${languageCode}`);
    }

    /**
     * Enable a language
     */
    enableLanguage(languageCode) {
        if (this.isLanguageSupported(languageCode) && !this.enabledLanguages.includes(languageCode)) {
            this.enabledLanguages.push(languageCode);
            logger.info(`Language enabled: ${languageCode}`);
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
            logger.info(`Language disabled: ${languageCode}`);
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
        logger.info(`Field mapping added for: ${baseField}`);
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
            logger.debug(`Using fallback for field: ${baseField}`);
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
        logger.info(`Localizing ${records.length} records to ${lang}`);
        
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
        
        logger.info(`Auto-detected ${detectedMappings.size} field mappings`);
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
            logger.error(`Number formatting failed: ${error.message}`);
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
            logger.error(`Currency formatting failed: ${error.message}`);
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
            logger.error(`Date formatting failed: ${error.message}`);
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
            logger.error(`Failed to create collator: ${error.message}`);
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
        logger.info('UI translations loaded');
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
            logger.info('Localization configuration saved');
        } catch (error) {
            logger.error('Failed to save configuration:', error);
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
                logger.info('Localization configuration loaded');
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
            logger.info('Localization configuration imported');
        } catch (error) {
            logger.error('Failed to import configuration:', error);
            throw error;
        }
    }
}

/**
 * Common UI translations
 */
export const CommonTranslations = {
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
