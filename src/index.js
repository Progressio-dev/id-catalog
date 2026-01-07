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
    dataType: 'csv'
};

// Module instances
let dataImporter;
let dataMapper;
let pageGenerator;
let templateManager;
let imageManager;
let updateEngine;
let logger;

/**
 * Initialize the plugin
 */
async function initialize() {
    try {
        logger = new Logger('CatalogBuilder');
        logger.info('Initializing Catalog Builder Plugin...');

        // Initialize modules
        dataImporter = new DataImporter();
        dataMapper = new DataMapper();
        pageGenerator = new PageGenerator();
        templateManager = new TemplateManager();
        imageManager = new ImageManager();
        updateEngine = new UpdateEngine();

        // Load settings
        await loadSettings();

        // Setup UI event handlers
        setupEventHandlers();

        // Setup tab navigation
        setupTabs();

        logger.info('Plugin initialized successfully');
        showStatus('Ready');
    } catch (error) {
        logger.error('Failed to initialize plugin:', error);
        showError('Failed to initialize plugin: ' + error.message);
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

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}
