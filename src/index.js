/**
 * ID Catalog Builder - Main Entry Point (Non-Module Version)
 * Professional Catalog Creation Plugin for Adobe InDesign (UXP)
 * Compatible with InDesign 2026 - NO ES6 MODULES
 */

console.log('=== INDEX.JS LOADING ===');

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
    currentLanguage: 'en'
};

// Utility functions
function showStatus(message) {
    console.log('STATUS:', message);
    const statusEl = document.getElementById('statusMessage');
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.style.color = '#666';
    }
}

function showError(message) {
    console.error('ERROR:', message);
    const statusEl = document.getElementById('statusMessage');
    if (statusEl) {
        statusEl.textContent = '❌ ' + message;
        statusEl.style.color = '#f44336';
    }
}

function showSuccess(message) {
    console.log('SUCCESS:', message);
    const statusEl = document.getElementById('statusMessage');
    if (statusEl) {
        statusEl.textContent = '✓ ' + message;
        statusEl.style.color = '#4caf50';
    }
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
 * Handle detect frames (placeholder)
 */
async function handleDetectFrames() {
    try {
        console.log('Detect frames clicked');
        showStatus('Frame detection not yet implemented');
    } catch (error) {
        console.error('Frame detection error:', error);
        showError('Failed to detect frames: ' + error.message);
    }
}

/**
 * Placeholder handlers for other functionality
 */
function handleSaveMapping() {
    console.log('Save mapping clicked');
    showStatus('Save mapping not yet implemented');
}

function handleLoadMapping() {
    console.log('Load mapping clicked');
    showStatus('Load mapping not yet implemented');
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
    showStatus('Template creation not yet implemented');
}

function handleSaveTemplate() {
    console.log('Save template clicked');
    showStatus('Save template not yet implemented');
}

function handleGenerateCatalog() {
    console.log('Generate catalog clicked');
    
    if (!AppState.data) {
        showError('Please import data first');
        return;
    }
    
    showStatus('Catalog generation not yet implemented');
}

function handleUpdateCatalog() {
    console.log('Update catalog clicked');
    showStatus('Update catalog not yet implemented');
}

function handleBrowseImagePath() {
    console.log('Browse image path clicked');
    showStatus('Browse not yet implemented');
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
    showStatus('Export logs not yet implemented');
}

// Advanced feature placeholder handlers
function handleTestFormula() {
    console.log('Test formula clicked');
    showStatus('Formula testing not yet implemented');
}

function handleAddFormula() {
    console.log('Add formula clicked');
    showStatus('Add formula not yet implemented');
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
    showStatus('Add filter not yet implemented');
}

function handleAddSort() {
    console.log('Add sort clicked');
    showStatus('Add sort not yet implemented');
}

function handleApplyFilters() {
    console.log('Apply filters clicked');
    showStatus('Apply filters not yet implemented');
}

function handleClearFilters() {
    console.log('Clear filters clicked');
    showStatus('Filters cleared');
}

function handleSaveFilterPreset() {
    console.log('Save filter preset clicked');
    showStatus('Save preset not yet implemented');
}

function handleLoadFilterPreset() {
    console.log('Load filter preset clicked');
    showStatus('Load preset not yet implemented');
}

function handleAddGroup() {
    console.log('Add group clicked');
    showStatus('Add group not yet implemented');
}

function handleApplyGrouping() {
    console.log('Apply grouping clicked');
    showStatus('Apply grouping not yet implemented');
}

function handleClearGrouping() {
    console.log('Clear grouping clicked');
    showStatus('Grouping cleared');
}

function handleAddReference() {
    console.log('Add reference clicked');
    showStatus('Add reference not yet implemented');
}

function handleValidateReferences() {
    console.log('Validate references clicked');
    showStatus('Validate references not yet implemented');
}

function handleImportReferences() {
    console.log('Import references clicked');
    showStatus('Import references not yet implemented');
}

function handleLanguageChange(event) {
    const language = event.target.value;
    console.log('Language changed to:', language);
    AppState.currentLanguage = language;
    showSuccess('Language set to ' + language);
}

function handleAutoDetectFields() {
    console.log('Auto-detect fields clicked');
    showStatus('Auto-detect not yet implemented');
}

function handleApplyLocalization() {
    console.log('Apply localization clicked');
    showStatus('Apply localization not yet implemented');
}

function handleGenerateAllLanguages() {
    console.log('Generate all languages clicked');
    showStatus('Multi-language generation not yet implemented');
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
            // Use spread operator for safe shallow merge - prevents mutation of original object
            // and creates a new object with merged properties
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
