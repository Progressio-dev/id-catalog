# ID Catalog Builder - Developer Guide

## Architecture Overview

ID Catalog Builder is built using modern JavaScript ES6+ and the Adobe UXP (Unified Extensibility Platform) framework. The plugin follows a modular architecture with clear separation of concerns.

### Technology Stack

- **UXP**: Adobe's modern plugin framework for Creative Cloud apps
- **JavaScript ES6+**: Modern JavaScript features including modules, classes, async/await
- **HTML5/CSS3**: For the user interface
- **InDesign DOM API**: For document manipulation

### Project Structure

```
id-catalog/
├── manifest.json           # UXP plugin manifest
├── package.json           # Node dependencies
├── src/
│   ├── index.html        # Main UI
│   ├── index.js          # Entry point and UI controller
│   ├── modules/          # Core modules
│   │   ├── dataImport.js      # Data import handling
│   │   ├── dataMapping.js     # Field mapping engine
│   │   ├── pageGenerator.js   # Page generation
│   │   ├── templateManager.js # Template system
│   │   ├── imageManager.js    # Image handling
│   │   ├── updateEngine.js    # Dynamic updates
│   │   └── utils.js           # Utility functions
│   └── ui/
│       └── styles.css    # UI styling
├── examples/             # Sample data files
└── docs/                # Documentation
```

## Core Modules

### DataImporter (`dataImport.js`)

Handles importing data from various file formats.

**Key Methods:**

```javascript
// Select a file using UXP file picker
async selectFile(type = 'csv'): Promise<File>

// Import data from a file
async importData(file, options): Promise<DataObject>

// Import specific formats
async importCSV(file, options): Promise<DataObject>
async importExcel(file, options): Promise<DataObject>
async importJSON(file, options): Promise<DataObject>
async importXML(file, options): Promise<DataObject>
```

**Data Object Structure:**

```javascript
{
  type: 'csv',        // File type
  fields: [...],      // Array of field names
  fieldTypes: {...},  // Object mapping fields to data types
  records: [...],     // Array of data records
  metadata: {...}     // Import metadata
}
```

### DataMapper (`dataMapping.js`)

Manages mappings between data fields and InDesign frames.

**Key Methods:**

```javascript
// Detect frames in the document
async detectFrames(): Promise<Frame[]>

// Create a mapping
createMapping(field, frameId, options): Mapping

// Save/load mappings
async saveMapping(mappings): Promise<boolean>
async loadMapping(): Promise<Mapping[]>

// Apply mapping to a record
async applyMapping(record, mapping, frame): Promise<boolean>
```

**Mapping Object Structure:**

```javascript
{
  id: 'unique-id',
  field: 'productName',
  frameId: 'frame-id',
  type: 'text',
  formatter: null,    // Optional formatter function
  transform: null     // Optional transform (uppercase, lowercase, etc.)
}
```

### PageGenerator (`pageGenerator.js`)

Handles automatic page generation and content placement.

**Key Methods:**

```javascript
// Generate catalog pages
async generate(options): Promise<boolean>

// Calculate layout for pages
calculateLayout(doc, options): Layout

// Place a single record
async placeRecord(doc, record, mappings, layout): Promise<boolean>
```

**Generation Options:**

```javascript
{
  data: DataObject,          // Imported data
  mappings: Mapping[],       // Field mappings
  template: Template,        // Layout template
  startPage: 1,             // Starting page number
  clearExisting: true,      // Clear existing content
  imageHandling: 'fit',     // Image fitting option
  imagePath: '/path',       // Default image path
  onProgress: function      // Progress callback
}
```

### TemplateManager (`templateManager.js`)

Manages catalog templates.

**Key Methods:**

```javascript
// Create a new template
async createTemplate(options): Promise<Template>

// Save/load templates
async saveTemplate(template): Promise<boolean>
async loadTemplate(): Promise<Template>

// Apply template to document
async applyTemplate(template, doc): Promise<boolean>
```

**Template Structure:**

```javascript
{
  id: 'template-id',
  name: 'Grid Layout 2x3',
  layoutType: 'grid',
  gridRows: 3,
  gridCols: 2,
  gridGutter: 5,
  useMasterPage: false,
  createdAt: '2024-01-01T00:00:00Z'
}
```

### ImageManager (`imageManager.js`)

Handles image validation, placement, and management.

**Key Methods:**

```javascript
// Select folder for images
async selectFolder(): Promise<Folder>

// Validate image path
async validateImagePath(path): Promise<ValidationResult>

// Place image in frame
async placeImage(frame, imagePath, options): Promise<boolean>

// Batch validate images
async validateImages(imagePaths): Promise<ValidationResults>
```

### UpdateEngine (`updateEngine.js`)

Manages dynamic updates when data changes.

**Key Methods:**

```javascript
// Link data source to document
async linkDataSource(data, mappings): Promise<boolean>

// Update catalog with new data
async update(data, mappings): Promise<boolean>

// Detect changes between datasets
detectChanges(oldData, newData): Change[]
```

## UXP API Integration

### File System Access

```javascript
const fs = require('uxp').storage.localFileSystem;

// Open file picker
const file = await fs.getFileForOpening({
  types: ['.csv', '.json']
});

// Read file
const content = await file.read({
  format: require('uxp').storage.formats.utf8
});
```

### InDesign DOM Access

```javascript
const { app } = require('indesign');

// Get active document
const doc = app.documents[0];

// Create text frame
const textFrame = doc.textFrames.add();
textFrame.geometricBounds = [0, 0, 100, 200];
textFrame.contents = "Hello World";

// Place image
const imagePath = "/path/to/image.jpg";
const rect = doc.rectangles.add();
rect.place(imagePath);
```

## Extending the Plugin

### Adding a New Data Source

1. Create import method in `DataImporter`:

```javascript
async importMyFormat(file, options) {
  // Read file
  const content = await file.read(...);
  
  // Parse content
  const records = parseMyFormat(content);
  
  // Return standardized data object
  return {
    type: 'myformat',
    fields: extractFields(records),
    records: records,
    metadata: {...}
  };
}
```

2. Add to `supportedFormats` and update UI

### Adding Custom Field Formatters

In `DataMapper`:

```javascript
applyFormatter(value, formatter) {
  switch (formatter) {
    case 'myFormatter':
      return customFormat(value);
    // ... existing formatters
  }
}
```

### Creating Custom Templates

Templates can be programmatically created:

```javascript
const customTemplate = {
  id: generateId(),
  name: 'Custom Layout',
  layoutType: 'custom',
  // Add custom properties
  customLayout: {
    zones: [...],
    rules: {...}
  }
};

templateManager.templates.push(customTemplate);
```

## Error Handling

All modules use the Logger utility for consistent error handling:

```javascript
import { Logger } from './utils.js';

const logger = new Logger('ModuleName');

try {
  // Your code
  logger.info('Operation successful');
} catch (error) {
  logger.error('Operation failed:', error);
  throw error;
}
```

## Testing

### Manual Testing

1. Load the plugin in InDesign
2. Open browser console (Developer Tools)
3. Check console for errors and logs

### Testing Import

```javascript
// Test CSV import
const importer = new DataImporter();
const file = await importer.selectFile('csv');
const data = await importer.importData(file, {
  delimiter: ',',
  hasHeader: true
});
console.log('Imported:', data);
```

### Testing Page Generation

```javascript
// Test generation
const generator = new PageGenerator();
await generator.generate({
  data: testData,
  mappings: testMappings,
  template: testTemplate,
  onProgress: (current, total, msg) => {
    console.log(`${current}/${total}: ${msg}`);
  }
});
```

## Performance Optimization

### Batch Processing

Use the `batchProcess` utility for handling large datasets:

```javascript
import { batchProcess } from './utils.js';

await batchProcess(
  records,           // Array of items
  100,              // Batch size
  async (record) => {
    // Process single record
    return processRecord(record);
  },
  (current, total, msg) => {
    // Progress callback
    updateProgress(current, total, msg);
  }
);
```

### InDesign Performance

- Group InDesign API calls to minimize transactions
- Use `app.doScript()` for batch operations
- Disable screen updates during generation

```javascript
const { app } = require('indesign');

app.doScript(function() {
  // Batch operations here
  // Screen won't update until complete
}, ScriptLanguage.JAVASCRIPT);
```

## Debugging

### Enable Verbose Logging

In settings, enable "Enable detailed logging" and check browser console.

### Common Issues

**Import fails:**
- Check file encoding
- Verify file format
- Check console for parse errors

**Frames not detected:**
- Ensure document is active
- Check frame names/labels
- Verify frames are on active layer

**Generation slow:**
- Reduce batch size
- Optimize images
- Simplify templates

## Building and Deployment

### Development Build

1. Make changes to source files
2. Test in InDesign
3. Check console for errors

### Production Build

1. Review all code for errors
2. Test with sample data
3. Package plugin folder
4. Distribute to users

### Plugin Packaging

The plugin folder should contain:
- `manifest.json`
- `src/` folder with all source files
- `examples/` folder with sample data
- `docs/` folder with documentation

## API Reference

See `api-reference.md` for detailed API documentation.

## Best Practices

### Code Style

- Use ES6+ features (const/let, arrow functions, async/await)
- Follow consistent naming conventions
- Add JSDoc comments for public methods
- Handle errors appropriately

### Module Design

- Keep modules focused and single-purpose
- Use dependency injection where appropriate
- Minimize coupling between modules
- Export clear, documented interfaces

### UI Development

- Follow Adobe Spectrum design guidelines
- Provide clear user feedback
- Handle loading states
- Show progress for long operations

## Advanced Features Architecture

### Formula Engine

The Formula Engine provides a safe, powerful calculation system:

**Architecture:**
- Expression parser with field reference support
- Safe evaluation using limited scope
- Built-in function library (ROUND, IF, MIN, MAX, etc.)
- Validation and error handling

**Implementation:**
```javascript
// Field references are replaced with actual values
{price} * 1.20 → 100 * 1.20 → 120

// Functions are processed before evaluation
ROUND({price} * 1.20, 2) → ROUND(120, 2) → 120.00

// Conditional logic is supported
IF({quantity} > 100, {price} * 0.9, {price})
→ IF(150 > 100, 100 * 0.9, 100)
→ 90
```

**Security:**
- Uses Function constructor with limited scope
- Validates expressions before execution
- Prevents injection attacks
- Error boundaries for failed calculations

### Filter Engine

Multi-condition filtering with flexible operators:

**Architecture:**
- Filter condition chain
- Multiple sort levels
- Preset save/load
- Statistics tracking

**Implementation:**
```javascript
// Filters are applied sequentially
const filtered = records.filter(record => {
  if (logic === 'AND') {
    return filters.every(f => matchesFilter(record, f));
  } else {
    return filters.some(f => matchesFilter(record, f));
  }
});

// Sorting uses multi-level comparison
sorted.sort((a, b) => {
  for (const rule of sortRules) {
    const result = compare(a[rule.field], b[rule.field]);
    if (result !== 0) return result;
  }
  return 0;
});
```

**Operators:**
- String: equals, contains, startsWith, endsWith
- Numeric: greaterThan, lessThan, between
- Boolean: isTrue, isFalse, isEmpty
- Advanced: regex patterns

### Grouping Engine

Hierarchical data grouping system:

**Architecture:**
- Multi-level group hierarchy
- Recursive group building
- Flat list generation for layout
- Group aggregations (sum, count, avg, etc.)

**Data Structure:**
```javascript
{
  groups: [
    {
      level: 0,
      field: 'category',
      value: 'Electronics',
      subgroups: [
        {
          level: 1,
          field: 'brand',
          value: 'Sony',
          records: [...]
        }
      ]
    }
  ],
  flatList: [
    { type: 'group-header', level: 0, value: 'Electronics' },
    { type: 'group-header', level: 1, value: 'Sony' },
    { type: 'record', data: {...} },
    { type: 'group-footer', level: 1 },
    { type: 'group-footer', level: 0 }
  ]
}
```

**Implementation:**
- Records are sorted by group fields
- Groups are built recursively
- Flat list enables sequential page generation
- Aggregations calculated per group

### Cross-Reference Engine

Bidirectional reference tracking:

**Architecture:**
- Forward index: sourceId → references
- Reverse index: targetId → referencing sources
- Reference type taxonomy
- Validation and broken link detection

**Data Structure:**
```javascript
// Forward index
references = Map {
  'CAM-001' => [
    { targetId: 'LENS-001', type: 'accessory' },
    { targetId: 'TRIPOD-001', type: 'accessory' }
  ]
}

// Reverse index
reverseIndex = Map {
  'LENS-001' => [
    { sourceId: 'CAM-001', type: 'accessory' }
  ]
}
```

**Features:**
- Bidirectional lookups (O(1) time)
- Bulk import from data fields
- Reference validation
- Statistics and analytics

### Localization Engine

Multi-language catalog support:

**Architecture:**
- Field mapping system (base → language-specific)
- Automatic field detection
- Fallback mechanism
- Locale-aware formatting

**Field Mapping:**
```javascript
fieldMappings = Map {
  'productName' => {
    en: 'productName_en',
    fr: 'productName_fr',
    de: 'productName_de'
  },
  'description' => {
    en: 'description_en',
    fr: 'description_fr',
    de: 'description_de'
  }
}
```

**Localization Process:**
1. Detect language fields (pattern: `field_langCode`)
2. Create field mappings
3. Select target language
4. Map fields to language-specific versions
5. Apply fallback for missing translations
6. Format numbers/dates/currency per locale

**Features:**
- Auto-detection of language fields
- 13 supported languages
- RTL language support (Arabic, Hebrew)
- Locale-aware number/date formatting
- Translation status tracking

## Integration Pattern

Advanced features integrate with the main workflow:

```javascript
// 1. Import data
const data = await dataImporter.importData(file, options);

// 2. Apply formulas
const withFormulas = formulaEngine.applyFormulas(data.records);

// 3. Apply localization
const localized = localizationEngine.localizeDataset(withFormulas);

// 4. Apply filters
const filtered = filterEngine.apply(localized, 'AND');

// 5. Apply grouping
const grouped = groupingEngine.groupRecords(filtered);

// 6. Generate with cross-references
await pageGenerator.generate({
  data: grouped.flatList,
  crossRefs: crossRefEngine,
  ...options
});
```

## Storage and Persistence

Advanced features use localStorage:

**Saved Data:**
- Formulas: `catalogBuilderFormulas`
- Filter presets: `catalogBuilderFilterPresets`
- Grouping config: `catalogBuilderGrouping`
- Cross-references: `catalogBuilderReferences`
- Localization settings: `catalogBuilderLocalization`

**Export/Import:**
- All modules support JSON export
- Configurations can be shared
- Version tagging for compatibility

## Performance Considerations

**Large Datasets:**
- Formulas: Cached evaluation results
- Filters: Early termination for OR logic
- Grouping: Optimized sorting algorithm
- References: O(1) lookups with Map structures
- Localization: Field mapping cache

**Memory Management:**
- Lazy evaluation where possible
- Streaming for large operations
- Garbage collection friendly patterns

## Contributing

To contribute to the plugin:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Resources

- [Adobe UXP Documentation](https://developer.adobe.com/photoshop/uxp/)
- [InDesign Scripting Guide](https://www.adobe.com/devnet/indesign/sdk.html)
- [JavaScript ES6+ Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## License

MIT License - See LICENSE file for details
