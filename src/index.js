/**
 * ID Catalog Builder - Main Entry Point
 * Professional Catalog Creation Plugin for Adobe InDesign (UXP)
 */

// Import modules
import DataImporter from './modules/dataImport.js';
import DataMapper from './modules/dataMapping.js';
import PageGenerator from './modules/pageGenerator.js';
import TemplateManager from './modules/templateManager.js';
import ImageManager from './modules/imageManager.js';
import UpdateEngine from './modules/updateEngine.js';
import FormulaEngine from './modules/formulas.js';
import FilterEngine from './modules/filtering.js';
import GroupingEngine from './modules/grouping.js';
import CrossReferenceEngine from './modules/crossReferences.js';
import LocalizationEngine from './modules/localization.js';
import { Logger, showStatus, showError, showSuccess } from './modules/utils.js';

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

// Module instances
let dataImporter;
let dataMapper;
let pageGenerator;
let templateManager;
let imageManager;
let updateEngine;
let formulaEngine;
let filterEngine;
let groupingEngine;
let crossRefEngine;
let localizationEngine;
let logger;

// Fallback: Check if modules loaded
let modulesLoaded = false;

// Test if imports worked
setTimeout(() => {
    if (typeof DataImporter === 'undefined') {
        console.error('ES6 MODULES FAILED TO LOAD!');
        console.error('DataImporter is undefined');
        
        // Show error to user
        document.body.innerHTML = `
            <div style="padding: 20px; background: #f44336; color: white;">
                <h1>Module Loading Error</h1>
                <p>ES6 modules failed to load. This may be a compatibility issue with InDesign 2026.</p>
                <p>Please check the UXP Developer Tool logs.</p>
                <p>Try reloading the plugin or restarting InDesign.</p>
            </div>
        `;
    } else {
        console.log('ES6 modules loaded successfully');
        modulesLoaded = true;
    }
}, 100);

/**
 * Initialize the plugin
 */
async function initialize() {
    try {
        console.log('=== CATALOG BUILDER INITIALIZATION START ===');
        
        // Create a visible error panel if initialization fails
        const errorDisplay = document.createElement('div');
        errorDisplay.id = 'init-error';
        errorDisplay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; background: #f44336; color: white; padding: 20px; z-index: 9999; display: none;';
        document.body.appendChild(errorDisplay);
        
        logger = new Logger('CatalogBuilder');
        logger.info('Initializing Catalog Builder Plugin...');
        console.log('Logger initialized');

        // Initialize modules with detailed logging
        console.log('Initializing DataImporter...');
        dataImporter = new DataImporter();
        
        console.log('Initializing DataMapper...');
        dataMapper = new DataMapper();
        
        console.log('Initializing PageGenerator...');
        pageGenerator = new PageGenerator();
        
        console.log('Initializing TemplateManager...');
        templateManager = new TemplateManager();
        
        console.log('Initializing ImageManager...');
        imageManager = new ImageManager();
        
        console.log('Initializing UpdateEngine...');
        updateEngine = new UpdateEngine();
        
        // Initialize advanced feature modules
        console.log('Initializing FormulaEngine...');
        formulaEngine = new FormulaEngine();
        
        console.log('Initializing FilterEngine...');
        filterEngine = new FilterEngine();
        
        console.log('Initializing GroupingEngine...');
        groupingEngine = new GroupingEngine();
        
        console.log('Initializing CrossReferenceEngine...');
        crossRefEngine = new CrossReferenceEngine();
        
        console.log('Initializing LocalizationEngine...');
        localizationEngine = new LocalizationEngine();

        // Load settings
        console.log('Loading settings...');
        await loadSettings();
        
        // Load saved configurations for advanced features
        console.log('Loading formulas...');
        formulaEngine.loadFormulas();
        
        console.log('Loading filter presets...');
        filterEngine.loadPresetsFromStorage();
        
        console.log('Loading grouping configuration...');
        groupingEngine.loadConfiguration();
        
        console.log('Loading cross-references...');
        crossRefEngine.load();
        
        console.log('Loading localization configuration...');
        localizationEngine.loadConfiguration();

        // Setup UI event handlers
        console.log('Setting up event handlers...');
        setupEventHandlers();

        // Setup tab navigation
        console.log('Setting up tabs...');
        setupTabs();

        console.log('=== PLUGIN INITIALIZED SUCCESSFULLY ===');
        logger.info('Plugin initialized successfully');
        showStatus('Ready');
    } catch (error) {
        console.error('=== PLUGIN INITIALIZATION FAILED ===');
        console.error('Error details:', error);
        console.error('Error stack:', error.stack);
        
        // Show visible error to user
        const errorDisplay = document.getElementById('init-error');
        if (errorDisplay) {
            errorDisplay.style.display = 'block';
            errorDisplay.innerHTML = `
                <h2>Plugin Initialization Failed</h2>
                <p><strong>Error:</strong> ${error.message}</p>
                <p><strong>Stack:</strong> ${error.stack}</p>
                <p>Check UXP Developer Tool logs for more details.</p>
            `;
        }
        
        // Also show in UI if possible
        const statusMessage = document.getElementById('statusMessage');
        if (statusMessage) {
            statusMessage.textContent = '❌ Initialization failed: ' + error.message;
            statusMessage.style.color = '#f44336';
        }
        
        if (logger) {
            logger.error('Failed to initialize plugin:', error);
        }
        
        // Re-throw to ensure it appears in console
        throw error;
    }
}

/**
 * Setup tab navigation
 */
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            // Update active states
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            button.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
    
    // Setup sub-tab navigation for Advanced tab
    const subTabButtons = document.querySelectorAll('.sub-tab-button');
    const subTabPanes = document.querySelectorAll('.sub-tab-pane');
    
    subTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const subTabName = button.getAttribute('data-subtab');
            
            // Update active states
            subTabButtons.forEach(btn => btn.classList.remove('active'));
            subTabPanes.forEach(pane => pane.classList.remove('active'));
            
            button.classList.add('active');
            document.getElementById(`${subTabName}-subtab`).classList.add('active');
        });
    });
}

/**
 * Setup event handlers for UI elements
 */
function setupEventHandlers() {
    // Import Tab
    document.getElementById('dataSourceType').addEventListener('change', handleDataSourceTypeChange);
    document.getElementById('selectFileBtn').addEventListener('click', handleSelectFile);
    document.getElementById('importBtn').addEventListener('click', handleImportData);

    // Mapping Tab
    document.getElementById('detectFramesBtn').addEventListener('click', handleDetectFrames);
    document.getElementById('saveMappingBtn').addEventListener('click', handleSaveMapping);
    document.getElementById('loadMappingBtn').addEventListener('click', handleLoadMapping);
    document.getElementById('clearMappingBtn').addEventListener('click', handleClearMapping);

    // Template Tab
    document.getElementById('layoutType').addEventListener('change', handleLayoutTypeChange);
    document.getElementById('createTemplateBtn').addEventListener('click', handleCreateTemplate);
    document.getElementById('saveTemplateBtn').addEventListener('click', handleSaveTemplate);

    // Generate Tab
    document.getElementById('generateBtn').addEventListener('click', handleGenerateCatalog);
    document.getElementById('updateBtn').addEventListener('click', handleUpdateCatalog);

    // Settings Tab
    document.getElementById('browseImagePathBtn').addEventListener('click', handleBrowseImagePath);
    document.getElementById('saveSettingsBtn').addEventListener('click', handleSaveSettings);
    document.getElementById('resetSettingsBtn').addEventListener('click', handleResetSettings);
    document.getElementById('clearCacheBtn').addEventListener('click', handleClearCache);
    document.getElementById('exportLogsBtn').addEventListener('click', handleExportLogs);
    
    // Advanced Tab - Formulas
    document.getElementById('testFormulaBtn').addEventListener('click', handleTestFormula);
    document.getElementById('addFormulaBtn').addEventListener('click', handleAddFormula);
    document.getElementById('clearFormulaBtn').addEventListener('click', handleClearFormula);
    document.getElementById('formulaTemplates').addEventListener('change', handleFormulaTemplateChange);
    
    // Advanced Tab - Filtering
    document.getElementById('addFilterBtn').addEventListener('click', handleAddFilter);
    document.getElementById('addSortBtn').addEventListener('click', handleAddSort);
    document.getElementById('applyFiltersBtn').addEventListener('click', handleApplyFilters);
    document.getElementById('clearFiltersBtn').addEventListener('click', handleClearFilters);
    document.getElementById('saveFilterPresetBtn').addEventListener('click', handleSaveFilterPreset);
    document.getElementById('loadFilterPresetBtn').addEventListener('click', handleLoadFilterPreset);
    
    // Advanced Tab - Grouping
    document.getElementById('addGroupBtn').addEventListener('click', handleAddGroup);
    document.getElementById('applyGroupingBtn').addEventListener('click', handleApplyGrouping);
    document.getElementById('clearGroupingBtn').addEventListener('click', handleClearGrouping);
    
    // Advanced Tab - Cross-References
    document.getElementById('addReferenceBtn').addEventListener('click', handleAddReference);
    document.getElementById('validateReferencesBtn').addEventListener('click', handleValidateReferences);
    document.getElementById('importReferencesBtn').addEventListener('click', handleImportReferences);
    
    // Advanced Tab - Localization
    document.getElementById('catalogLanguage').addEventListener('change', handleLanguageChange);
    document.getElementById('autoDetectFieldsBtn').addEventListener('click', handleAutoDetectFields);
    document.getElementById('applyLocalizationBtn').addEventListener('click', handleApplyLocalization);
    document.getElementById('generateAllLanguagesBtn').addEventListener('click', handleGenerateAllLanguages);
}

/**
 * Handle data source type change
 */
function handleDataSourceTypeChange(event) {
    const type = event.target.value;
    AppState.dataType = type;

    // Show/hide relevant options
    document.getElementById('csvOptions').style.display = type === 'csv' ? 'block' : 'none';
    document.getElementById('excelOptions').style.display = type === 'excel' ? 'block' : 'none';
}

/**
 * Handle file selection
 */
async function handleSelectFile() {
    try {
        const file = await dataImporter.selectFile(AppState.dataType);
        if (file) {
            AppState.currentFile = file;
            document.getElementById('selectedFile').textContent = file.name;
            document.getElementById('importBtn').disabled = false;
            showStatus(`File selected: ${file.name}`);
        }
    } catch (error) {
        logger.error('File selection failed:', error);
        showError('Failed to select file: ' + error.message);
    }
}

/**
 * Handle data import
 */
async function handleImportData() {
    try {
        showStatus('Importing data...');
        
        const options = {
            type: AppState.dataType,
            delimiter: document.getElementById('csvDelimiter')?.value || ',',
            encoding: document.getElementById('csvEncoding')?.value || 'utf-8',
            hasHeader: document.getElementById('csvHeader')?.checked ?? true,
            sheet: parseInt(document.getElementById('excelSheet')?.value || '0')
        };

        const data = await dataImporter.importData(AppState.currentFile, options);
        AppState.data = data;

        // Show preview
        displayDataPreview(data);
        
        // Update source fields in mapping tab
        updateSourceFields(data.fields);
        
        // Update field dropdowns in advanced features
        updateAdvancedFieldDropdowns();

        showSuccess(`Imported ${data.records.length} records`);
        
        // Auto-switch to mapping tab
        document.querySelector('[data-tab="mapping"]').click();
    } catch (error) {
        logger.error('Data import failed:', error);
        showError('Failed to import data: ' + error.message);
    }
}

/**
 * Display data preview
 */
function displayDataPreview(data) {
    const previewPanel = document.getElementById('dataPreview');
    const previewTable = document.getElementById('previewTable');
    
    document.getElementById('recordCount').textContent = `Records: ${data.records.length}`;
    document.getElementById('columnCount').textContent = `Columns: ${data.fields.length}`;

    // Create preview table
    let html = '<table><thead><tr>';
    data.fields.forEach(field => {
        html += `<th>${field}</th>`;
    });
    html += '</tr></thead><tbody>';

    // Show first 10 records
    const previewRecords = data.records.slice(0, 10);
    previewRecords.forEach(record => {
        html += '<tr>';
        data.fields.forEach(field => {
            html += `<td>${record[field] || ''}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody></table>';

    previewTable.innerHTML = html;
    previewPanel.style.display = 'block';
}

/**
 * Update source fields list
 */
function updateSourceFields(fields) {
    const container = document.getElementById('sourceFieldsList');
    container.innerHTML = '';

    fields.forEach(field => {
        const fieldItem = document.createElement('div');
        fieldItem.className = 'field-item';
        fieldItem.textContent = field;
        fieldItem.draggable = true;
        fieldItem.dataset.field = field;
        
        fieldItem.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('field', field);
        });

        container.appendChild(fieldItem);
    });
}

/**
 * Handle frame detection
 */
async function handleDetectFrames() {
    try {
        showStatus('Detecting frames...');
        const frames = await dataMapper.detectFrames();
        updateTargetFrames(frames);
        showSuccess(`Found ${frames.length} frames`);
    } catch (error) {
        logger.error('Frame detection failed:', error);
        showError('Failed to detect frames: ' + error.message);
    }
}

/**
 * Update target frames list
 */
function updateTargetFrames(frames) {
    const container = document.getElementById('targetFramesList');
    container.innerHTML = '';

    frames.forEach(frame => {
        const frameItem = document.createElement('div');
        frameItem.className = 'frame-item';
        frameItem.textContent = frame.label || `${frame.type} Frame`;
        frameItem.dataset.frameId = frame.id;
        
        frameItem.addEventListener('dragover', (e) => {
            e.preventDefault();
            frameItem.classList.add('drag-over');
        });

        frameItem.addEventListener('dragleave', () => {
            frameItem.classList.remove('drag-over');
        });

        frameItem.addEventListener('drop', (e) => {
            e.preventDefault();
            frameItem.classList.remove('drag-over');
            
            const field = e.dataTransfer.getData('field');
            if (field) {
                createMapping(field, frame);
            }
        });

        container.appendChild(frameItem);
    });
}

/**
 * Create a field mapping
 */
function createMapping(field, frame) {
    const mapping = {
        field: field,
        frameId: frame.id,
        frameLabel: frame.label || `${frame.type} Frame`,
        frameType: frame.type
    };

    AppState.mappings.push(mapping);
    displayMappings();
    showSuccess(`Mapped "${field}" to frame`);
}

/**
 * Display current mappings
 */
function displayMappings() {
    const container = document.getElementById('mappingList');
    container.innerHTML = '<h3>Current Mappings</h3>';

    if (AppState.mappings.length === 0) {
        container.innerHTML += '<p class="empty-message">No mappings created</p>';
        return;
    }

    const list = document.createElement('ul');
    list.className = 'mapping-items';

    AppState.mappings.forEach((mapping, index) => {
        const item = document.createElement('li');
        item.className = 'mapping-item';
        item.innerHTML = `
            <span class="mapping-field">${mapping.field}</span>
            <span class="mapping-arrow">→</span>
            <span class="mapping-frame">${mapping.frameLabel}</span>
            <button class="btn-remove" data-index="${index}">×</button>
        `;

        item.querySelector('.btn-remove').addEventListener('click', () => {
            AppState.mappings.splice(index, 1);
            displayMappings();
        });

        list.appendChild(item);
    });

    container.appendChild(list);
}

/**
 * Handle save mapping
 */
async function handleSaveMapping() {
    try {
        await dataMapper.saveMapping(AppState.mappings);
        showSuccess('Mapping saved successfully');
    } catch (error) {
        logger.error('Failed to save mapping:', error);
        showError('Failed to save mapping: ' + error.message);
    }
}

/**
 * Handle load mapping
 */
async function handleLoadMapping() {
    try {
        const mappings = await dataMapper.loadMapping();
        if (mappings) {
            AppState.mappings = mappings;
            displayMappings();
            showSuccess('Mapping loaded successfully');
        }
    } catch (error) {
        logger.error('Failed to load mapping:', error);
        showError('Failed to load mapping: ' + error.message);
    }
}

/**
 * Handle clear mapping
 */
function handleClearMapping() {
    AppState.mappings = [];
    displayMappings();
    showStatus('Mappings cleared');
}

/**
 * Handle layout type change
 */
function handleLayoutTypeChange(event) {
    const type = event.target.value;
    document.getElementById('gridOptions').style.display = type === 'grid' ? 'block' : 'none';
}

/**
 * Handle create template
 */
async function handleCreateTemplate() {
    try {
        showStatus('Creating template...');
        
        const options = {
            layoutType: document.getElementById('layoutType').value,
            gridRows: parseInt(document.getElementById('gridRows').value),
            gridCols: parseInt(document.getElementById('gridCols').value),
            gridGutter: parseFloat(document.getElementById('gridGutter').value),
            useMasterPage: document.getElementById('useMasterPage').checked
        };

        const template = await templateManager.createTemplate(options);
        AppState.template = template;
        
        showSuccess('Template created successfully');
    } catch (error) {
        logger.error('Failed to create template:', error);
        showError('Failed to create template: ' + error.message);
    }
}

/**
 * Handle save template
 */
async function handleSaveTemplate() {
    try {
        await templateManager.saveTemplate(AppState.template);
        showSuccess('Template saved successfully');
    } catch (error) {
        logger.error('Failed to save template:', error);
        showError('Failed to save template: ' + error.message);
    }
}

/**
 * Handle generate catalog
 */
async function handleGenerateCatalog() {
    try {
        if (!AppState.data) {
            showError('Please import data first');
            return;
        }

        if (AppState.mappings.length === 0) {
            showError('Please create field mappings first');
            return;
        }

        showStatus('Generating catalog...');
        showProgress(true);

        const options = {
            data: AppState.data,
            mappings: AppState.mappings,
            template: AppState.template,
            startPage: parseInt(document.getElementById('startPage').value),
            clearExisting: document.getElementById('clearExisting').checked,
            imageHandling: document.getElementById('imageHandling').value,
            imagePath: AppState.settings.defaultImagePath,
            onProgress: updateProgress
        };

        await pageGenerator.generate(options);

        showProgress(false);
        showSuccess('Catalog generated successfully!');
    } catch (error) {
        logger.error('Catalog generation failed:', error);
        showProgress(false);
        showError('Failed to generate catalog: ' + error.message);
    }
}

/**
 * Handle update catalog
 */
async function handleUpdateCatalog() {
    try {
        showStatus('Updating catalog...');
        await updateEngine.update(AppState.data, AppState.mappings);
        showSuccess('Catalog updated successfully');
    } catch (error) {
        logger.error('Failed to update catalog:', error);
        showError('Failed to update catalog: ' + error.message);
    }
}

/**
 * Show/hide progress indicator
 */
function showProgress(show) {
    document.getElementById('progressContainer').style.display = show ? 'block' : 'none';
    if (!show) {
        document.getElementById('progressBar').style.width = '0%';
        document.getElementById('progressText').textContent = '';
    }
}

/**
 * Update progress
 */
function updateProgress(current, total, message) {
    const percent = (current / total) * 100;
    document.getElementById('progressBar').style.width = `${percent}%`;
    document.getElementById('progressText').textContent = message || `Processing ${current} of ${total}...`;
}

/**
 * Handle browse image path
 */
async function handleBrowseImagePath() {
    try {
        const folder = await imageManager.selectFolder();
        if (folder) {
            document.getElementById('defaultImagePath').value = folder.nativePath;
            AppState.settings.defaultImagePath = folder.nativePath;
        }
    } catch (error) {
        logger.error('Failed to select folder:', error);
        showError('Failed to select folder: ' + error.message);
    }
}

/**
 * Handle save settings
 */
async function handleSaveSettings() {
    try {
        AppState.settings.defaultImagePath = document.getElementById('defaultImagePath').value;
        AppState.settings.validateImages = document.getElementById('validateImages').checked;
        AppState.settings.autoSave = document.getElementById('autoSave').checked;
        AppState.settings.batchSize = parseInt(document.getElementById('batchSize').value);
        AppState.settings.enableLogging = document.getElementById('enableLogging').checked;

        await saveSettings();
        showSuccess('Settings saved successfully');
    } catch (error) {
        logger.error('Failed to save settings:', error);
        showError('Failed to save settings: ' + error.message);
    }
}

/**
 * Handle reset settings
 */
function handleResetSettings() {
    AppState.settings = {
        defaultImagePath: '',
        validateImages: true,
        autoSave: true,
        batchSize: 100,
        enableLogging: true
    };
    
    // Update UI
    document.getElementById('defaultImagePath').value = '';
    document.getElementById('validateImages').checked = true;
    document.getElementById('autoSave').checked = true;
    document.getElementById('batchSize').value = 100;
    document.getElementById('enableLogging').checked = true;
    
    showStatus('Settings reset to defaults');
}

/**
 * Handle clear cache
 */
function handleClearCache() {
    // Clear any cached data
    localStorage.clear();
    showSuccess('Cache cleared');
}

/**
 * Handle export logs
 */
async function handleExportLogs() {
    try {
        await logger.exportLogs();
        showSuccess('Logs exported successfully');
    } catch (error) {
        showError('Failed to export logs: ' + error.message);
    }
}

/**
 * Load settings from storage
 */
async function loadSettings() {
    try {
        const saved = localStorage.getItem('catalogBuilderSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            AppState.settings = { ...AppState.settings, ...settings };
            
            // Update UI
            document.getElementById('defaultImagePath').value = AppState.settings.defaultImagePath || '';
            document.getElementById('validateImages').checked = AppState.settings.validateImages;
            document.getElementById('autoSave').checked = AppState.settings.autoSave;
            document.getElementById('batchSize').value = AppState.settings.batchSize;
            document.getElementById('enableLogging').checked = AppState.settings.enableLogging;
        }
    } catch (error) {
        logger.error('Failed to load settings:', error);
    }
}

/**
 * Save settings to storage
 */
async function saveSettings() {
    try {
        localStorage.setItem('catalogBuilderSettings', JSON.stringify(AppState.settings));
    } catch (error) {
        logger.error('Failed to save settings:', error);
        throw error;
    }
}

/**
 * Advanced Features - Formula Handlers
 */

/**
 * Handle formula template change
 */
function handleFormulaTemplateChange(event) {
    const template = event.target.value;
    if (template) {
        document.getElementById('formulaExpression').value = template;
    }
}

/**
 * Handle test formula
 */
function handleTestFormula() {
    try {
        const expression = document.getElementById('formulaExpression').value;
        if (!expression) {
            showError('Please enter a formula');
            return;
        }
        
        // Use first record as sample
        if (AppState.data && AppState.data.records.length > 0) {
            const result = formulaEngine.preview(expression, AppState.data.records[0]);
            document.getElementById('formulaPreview').textContent = `Result: ${result}`;
            showSuccess('Formula test successful');
        } else {
            showError('Import data first to test formula');
        }
    } catch (error) {
        document.getElementById('formulaPreview').textContent = `Error: ${error.message}`;
        showError('Formula test failed: ' + error.message);
    }
}

/**
 * Handle add formula
 */
function handleAddFormula() {
    try {
        const name = document.getElementById('formulaFieldName').value;
        const expression = document.getElementById('formulaExpression').value;
        
        if (!name || !expression) {
            showError('Please enter field name and formula');
            return;
        }
        
        formulaEngine.addFormula(name, expression);
        formulaEngine.saveFormulas();
        updateFormulasList();
        
        // Clear inputs
        document.getElementById('formulaFieldName').value = '';
        document.getElementById('formulaExpression').value = '';
        document.getElementById('formulaPreview').textContent = 'Enter a formula to see preview';
        
        showSuccess('Formula added');
    } catch (error) {
        showError('Failed to add formula: ' + error.message);
    }
}

/**
 * Handle clear formula
 */
function handleClearFormula() {
    document.getElementById('formulaFieldName').value = '';
    document.getElementById('formulaExpression').value = '';
    document.getElementById('formulaPreview').textContent = 'Enter a formula to see preview';
}

/**
 * Update formulas list display
 */
function updateFormulasList() {
    const container = document.getElementById('formulasContainer');
    const formulas = formulaEngine.getFormulas();
    
    if (formulas.length === 0) {
        container.innerHTML = '<p class="empty-message">No formulas added</p>';
        return;
    }
    
    container.innerHTML = formulas.map((formula, index) => `
        <div class="formula-item">
            <div>
                <div class="formula-name">${formula.name}</div>
                <div class="formula-expression">${formula.expression}</div>
            </div>
            <button class="btn-remove" onclick="removeFormula(${index})">×</button>
        </div>
    `).join('');
}

/**
 * Remove a formula
 */
window.removeFormula = function(index) {
    const formulas = formulaEngine.getFormulas();
    if (formulas[index]) {
        formulaEngine.removeFormula(formulas[index].name);
        formulaEngine.saveFormulas();
        updateFormulasList();
        showSuccess('Formula removed');
    }
};

/**
 * Advanced Features - Filter Handlers
 */

/**
 * Handle add filter
 */
function handleAddFilter() {
    try {
        const field = document.getElementById('filterField').value;
        const operator = document.getElementById('filterOperator').value;
        const value = document.getElementById('filterValue').value;
        
        if (!field || !operator) {
            showError('Please select field and operator');
            return;
        }
        
        filterEngine.addFilter({ field, operator, value });
        updateFiltersList();
        
        // Clear inputs
        document.getElementById('filterValue').value = '';
        
        showSuccess('Filter added');
    } catch (error) {
        showError('Failed to add filter: ' + error.message);
    }
}

/**
 * Handle add sort
 */
function handleAddSort() {
    try {
        const field = document.getElementById('sortField').value;
        const direction = document.getElementById('sortDirection').value;
        
        if (!field) {
            showError('Please select a field');
            return;
        }
        
        filterEngine.addSortRule(field, direction);
        updateSortRulesList();
        showSuccess('Sort rule added');
    } catch (error) {
        showError('Failed to add sort rule: ' + error.message);
    }
}

/**
 * Handle apply filters
 */
function handleApplyFilters() {
    try {
        if (!AppState.data) {
            showError('Import data first');
            return;
        }
        
        const logic = document.getElementById('filterLogic').value;
        AppState.filteredData = filterEngine.apply(AppState.data.records, logic);
        
        const stats = filterEngine.getStatistics(AppState.data.records, AppState.filteredData);
        document.getElementById('filterStatsText').textContent = 
            `Showing ${stats.filtered} of ${stats.total} records (${stats.percentage}%)`;
        
        showSuccess(`Filtered to ${stats.filtered} records`);
    } catch (error) {
        showError('Failed to apply filters: ' + error.message);
    }
}

/**
 * Handle clear filters
 */
function handleClearFilters() {
    filterEngine.clearFilters();
    filterEngine.clearSortRules();
    updateFiltersList();
    updateSortRulesList();
    AppState.filteredData = null;
    document.getElementById('filterStatsText').textContent = 'No filters applied';
    showSuccess('Filters cleared');
}

/**
 * Handle save filter preset
 */
async function handleSaveFilterPreset() {
    try {
        const name = prompt('Enter preset name:');
        if (name) {
            filterEngine.savePreset(name);
            showSuccess('Preset saved');
        }
    } catch (error) {
        showError('Failed to save preset: ' + error.message);
    }
}

/**
 * Handle load filter preset
 */
async function handleLoadFilterPreset() {
    try {
        const presets = filterEngine.getPresets();
        if (presets.length === 0) {
            showError('No presets available');
            return;
        }
        
        // Simple selection - in production, use a proper dialog
        const name = prompt('Enter preset name to load:\n' + presets.map(p => p.name).join('\n'));
        if (name) {
            filterEngine.loadPreset(name);
            updateFiltersList();
            updateSortRulesList();
            showSuccess('Preset loaded');
        }
    } catch (error) {
        showError('Failed to load preset: ' + error.message);
    }
}

/**
 * Update filters list display
 */
function updateFiltersList() {
    const container = document.getElementById('filtersList');
    const filters = filterEngine.filters;
    
    if (filters.length === 0) {
        container.innerHTML = '<p class="empty-message">No filters added</p>';
        return;
    }
    
    container.innerHTML = filters.map((filter, index) => `
        <div class="filter-item">
            <span>${filter.field}</span>
            <span>${filter.operator}</span>
            <span>${filter.value || '-'}</span>
            <button class="btn-remove" onclick="removeFilter(${index})">×</button>
        </div>
    `).join('');
}

/**
 * Update sort rules list display
 */
function updateSortRulesList() {
    const container = document.getElementById('sortRulesList');
    const rules = filterEngine.sortRules;
    
    if (rules.length === 0) {
        container.innerHTML = '<p class="empty-message">No sort rules</p>';
        return;
    }
    
    container.innerHTML = rules.map((rule, index) => `
        <div class="sort-item">
            <span>Level ${index + 1}</span>
            <span>${rule.field}</span>
            <span>${rule.direction}</span>
            <button class="btn-remove" onclick="removeSortRule(${index})">×</button>
        </div>
    `).join('');
}

/**
 * Remove filter
 */
window.removeFilter = function(index) {
    filterEngine.removeFilter(index);
    updateFiltersList();
    showSuccess('Filter removed');
};

/**
 * Remove sort rule
 */
window.removeSortRule = function(index) {
    filterEngine.removeSortRule(index);
    updateSortRulesList();
    showSuccess('Sort rule removed');
};

/**
 * Advanced Features - Grouping Handlers
 */

/**
 * Handle add group
 */
function handleAddGroup() {
    try {
        const field = document.getElementById('groupField').value;
        const direction = document.getElementById('groupDirection').value;
        
        if (!field) {
            showError('Please select a field');
            return;
        }
        
        groupingEngine.addGroupLevel(field, direction);
        updateGroupLevelsList();
        showSuccess('Group level added');
    } catch (error) {
        showError('Failed to add group level: ' + error.message);
    }
}

/**
 * Handle apply grouping
 */
function handleApplyGrouping() {
    try {
        if (!AppState.data) {
            showError('Import data first');
            return;
        }
        
        // Update options
        groupingEngine.setOptions({
            showHeaders: document.getElementById('showGroupHeaders').checked,
            showItemCount: document.getElementById('showItemCount').checked,
            pageBreakPerGroup: document.getElementById('pageBreakPerGroup').checked,
            headerStyle: document.getElementById('groupHeaderStyle').value,
            separatorType: document.getElementById('groupSeparator').value
        });
        
        const records = AppState.filteredData || AppState.data.records;
        AppState.groupedData = groupingEngine.groupRecords(records);
        
        groupingEngine.saveConfiguration();
        showSuccess('Grouping applied');
    } catch (error) {
        showError('Failed to apply grouping: ' + error.message);
    }
}

/**
 * Handle clear grouping
 */
function handleClearGrouping() {
    groupingEngine.clearGroupLevels();
    updateGroupLevelsList();
    AppState.groupedData = null;
    showSuccess('Grouping cleared');
}

/**
 * Update group levels list display
 */
function updateGroupLevelsList() {
    const container = document.getElementById('groupLevelsList');
    const levels = groupingEngine.groupLevels;
    
    if (levels.length === 0) {
        container.innerHTML = '<p class="empty-message">No group levels</p>';
        return;
    }
    
    container.innerHTML = levels.map((level, index) => `
        <div class="group-level-item">
            <div>
                <span class="level-badge">Level ${level.level + 1}</span>
                <span>${level.field} (${level.sortDirection})</span>
            </div>
            <button class="btn-remove" onclick="removeGroupLevel(${index})">×</button>
        </div>
    `).join('');
}

/**
 * Remove group level
 */
window.removeGroupLevel = function(index) {
    groupingEngine.removeGroupLevel(index);
    updateGroupLevelsList();
    showSuccess('Group level removed');
};

/**
 * Advanced Features - Cross-Reference Handlers
 */

/**
 * Handle add reference
 */
function handleAddReference() {
    try {
        const sourceId = document.getElementById('refSourceId').value;
        const targetId = document.getElementById('refTargetId').value;
        const type = document.getElementById('refType').value;
        
        if (!sourceId || !targetId) {
            showError('Please enter source and target IDs');
            return;
        }
        
        crossRefEngine.addReference(sourceId, targetId, type);
        crossRefEngine.save();
        updateReferencesList();
        
        // Clear inputs
        document.getElementById('refSourceId').value = '';
        document.getElementById('refTargetId').value = '';
        
        showSuccess('Reference added');
    } catch (error) {
        showError('Failed to add reference: ' + error.message);
    }
}

/**
 * Handle validate references
 */
function handleValidateReferences() {
    try {
        if (!AppState.data) {
            showError('Import data first');
            return;
        }
        
        const broken = crossRefEngine.validateReferences(AppState.data.records, 'id');
        
        if (broken.length === 0) {
            showSuccess('All references are valid');
        } else {
            showError(`Found ${broken.length} broken references`);
        }
    } catch (error) {
        showError('Validation failed: ' + error.message);
    }
}

/**
 * Handle import references
 */
async function handleImportReferences() {
    try {
        if (!AppState.data) {
            showError('Import data first');
            return;
        }
        
        const fieldName = prompt('Enter field name containing reference IDs (comma-separated):');
        if (fieldName) {
            const count = crossRefEngine.importFromField(AppState.data.records, 'id', fieldName);
            crossRefEngine.save();
            updateReferencesList();
            showSuccess(`Imported ${count} references`);
        }
    } catch (error) {
        showError('Failed to import references: ' + error.message);
    }
}

/**
 * Update references list display
 */
function updateReferencesList() {
    const container = document.getElementById('referencesContainer');
    const stats = crossRefEngine.getStatistics();
    
    if (stats.totalReferences === 0) {
        container.innerHTML = '<p class="empty-message">No references added</p>';
        return;
    }
    
    container.innerHTML = `<p class="info-text">Total References: ${stats.totalReferences}</p>`;
}

/**
 * Advanced Features - Localization Handlers
 */

/**
 * Handle language change
 */
function handleLanguageChange(event) {
    const language = event.target.value;
    localizationEngine.setLanguage(language);
    AppState.currentLanguage = language;
    showSuccess(`Language set to ${language}`);
}

/**
 * Handle auto-detect fields
 */
function handleAutoDetectFields() {
    try {
        if (!AppState.data) {
            showError('Import data first');
            return;
        }
        
        const mappings = localizationEngine.autoDetectFieldMappings(AppState.data.records);
        localizationEngine.saveConfiguration();
        showSuccess(`Auto-detected ${mappings.size} field mappings`);
    } catch (error) {
        showError('Auto-detection failed: ' + error.message);
    }
}

/**
 * Handle apply localization
 */
function handleApplyLocalization() {
    try {
        if (!AppState.data) {
            showError('Import data first');
            return;
        }
        
        const localizedData = localizationEngine.localizeDataset(AppState.data.records);
        AppState.data.records = localizedData;
        
        showSuccess('Localization applied');
    } catch (error) {
        showError('Failed to apply localization: ' + error.message);
    }
}

/**
 * Handle generate all languages
 */
async function handleGenerateAllLanguages() {
    try {
        showError('Multi-language generation will be available in catalog generation');
    } catch (error) {
        showError('Failed to generate catalogs: ' + error.message);
    }
}

/**
 * Update field dropdowns when data is imported
 */
function updateAdvancedFieldDropdowns() {
    if (!AppState.data) return;
    
    const fields = AppState.data.fields;
    
    // Update formula fields list
    const formulaFieldsList = document.getElementById('formulaFieldsList');
    formulaFieldsList.innerHTML = fields.map(f => 
        `<div class="field-item">{${f}}</div>`
    ).join('');
    
    // Update filter field dropdown
    const filterField = document.getElementById('filterField');
    filterField.innerHTML = '<option value="">Select field...</option>' + 
        fields.map(f => `<option value="${f}">${f}</option>`).join('');
    
    // Update sort field dropdown
    const sortField = document.getElementById('sortField');
    sortField.innerHTML = '<option value="">Select field...</option>' + 
        fields.map(f => `<option value="${f}">${f}</option>`).join('');
    
    // Update group field dropdown
    const groupField = document.getElementById('groupField');
    groupField.innerHTML = '<option value="">Select field...</option>' + 
        fields.map(f => `<option value="${f}">${f}</option>`).join('');
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}
