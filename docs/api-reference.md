# ID Catalog Builder - API Reference

## DataImporter

### Constructor

```javascript
const importer = new DataImporter();
```

### Methods

#### `async selectFile(type)`

Opens file picker dialog.

**Parameters:**
- `type` (string): File type - 'csv', 'excel', 'json', or 'xml'

**Returns:** Promise<File>

**Example:**
```javascript
const file = await importer.selectFile('csv');
```

#### `async importData(file, options)`

Imports data from a file.

**Parameters:**
- `file` (File): File object from selectFile()
- `options` (Object): Import options
  - `type` (string): File type
  - `delimiter` (string): CSV delimiter (default: ',')
  - `hasHeader` (boolean): First row is header (default: true)
  - `encoding` (string): File encoding (default: 'utf-8')
  - `sheet` (number): Excel sheet index (default: 0)

**Returns:** Promise<DataObject>

**Example:**
```javascript
const data = await importer.importData(file, {
  type: 'csv',
  delimiter: ',',
  hasHeader: true,
  encoding: 'utf-8'
});
```

#### `async importCSV(file, options)`

Import CSV file specifically.

**Parameters:**
- `file` (File): CSV file
- `options` (Object): CSV-specific options

**Returns:** Promise<DataObject>

#### `async importJSON(file, options)`

Import JSON file specifically.

**Parameters:**
- `file` (File): JSON file
- `options` (Object): JSON-specific options

**Returns:** Promise<DataObject>

#### `async importXML(file, options)`

Import XML file specifically.

**Parameters:**
- `file` (File): XML file
- `options` (Object): XML-specific options

**Returns:** Promise<DataObject>

#### `detectFieldTypes(records, fields)`

Detect data types of fields.

**Parameters:**
- `records` (Array): Array of data records
- `fields` (Array): Array of field names

**Returns:** Object - Mapping of field names to types

---

## DataMapper

### Constructor

```javascript
const mapper = new DataMapper();
```

### Methods

#### `async detectFrames()`

Detects frames in the active InDesign document.

**Returns:** Promise<Frame[]>

**Example:**
```javascript
const frames = await mapper.detectFrames();
```

#### `createMapping(field, frameId, options)`

Creates a mapping between a data field and a frame.

**Parameters:**
- `field` (string): Data field name
- `frameId` (string): Frame ID
- `options` (Object): Optional settings
  - `type` (string): Mapping type ('text' or 'image')
  - `formatter` (string|function): Formatter to apply
  - `transform` (string): Transform to apply

**Returns:** Mapping object

**Example:**
```javascript
const mapping = mapper.createMapping('productName', 'frame-1', {
  type: 'text',
  transform: 'uppercase'
});
```

#### `removeMapping(mappingId)`

Removes a mapping.

**Parameters:**
- `mappingId` (string): Mapping ID

**Returns:** boolean

#### `getMappings()`

Gets all current mappings.

**Returns:** Mapping[]

#### `clearMappings()`

Clears all mappings.

**Returns:** void

#### `async saveMapping(mappings)`

Saves mappings to a file.

**Parameters:**
- `mappings` (Array): Array of mapping objects

**Returns:** Promise<boolean>

#### `async loadMapping()`

Loads mappings from a file.

**Returns:** Promise<Mapping[]>

#### `async applyMapping(record, mapping, frame)`

Applies a mapping to a data record and frame.

**Parameters:**
- `record` (Object): Data record
- `mapping` (Mapping): Mapping object
- `frame` (Frame): InDesign frame

**Returns:** Promise<boolean>

---

## PageGenerator

### Constructor

```javascript
const generator = new PageGenerator();
```

### Methods

#### `async generate(options)`

Generates catalog pages.

**Parameters:**
- `options` (Object):
  - `data` (DataObject): Imported data
  - `mappings` (Array): Field mappings
  - `template` (Template): Layout template
  - `startPage` (number): Starting page number
  - `clearExisting` (boolean): Clear existing content
  - `imageHandling` (string): 'fit', 'fill', or 'center'
  - `imagePath` (string): Default image path
  - `batchSize` (number): Batch size for processing
  - `onProgress` (function): Progress callback

**Returns:** Promise<boolean>

**Example:**
```javascript
await generator.generate({
  data: importedData,
  mappings: fieldMappings,
  template: myTemplate,
  startPage: 1,
  clearExisting: true,
  imageHandling: 'fit',
  onProgress: (current, total, msg) => {
    console.log(`${current}/${total}: ${msg}`);
  }
});
```

#### `calculateLayout(doc, options)`

Calculates layout for pages.

**Parameters:**
- `doc` (Document): InDesign document
- `options` (Object): Layout options

**Returns:** Layout object

#### `async placeRecord(doc, record, mappings, layout)`

Places a single record on a page.

**Parameters:**
- `doc` (Document): InDesign document
- `record` (Object): Data record
- `mappings` (Array): Field mappings
- `layout` (Layout): Layout configuration

**Returns:** Promise<boolean>

---

## TemplateManager

### Constructor

```javascript
const templateMgr = new TemplateManager();
```

### Methods

#### `async createTemplate(options)`

Creates a new template.

**Parameters:**
- `options` (Object):
  - `name` (string): Template name
  - `layoutType` (string): 'flow', 'grid', or 'custom'
  - `gridRows` (number): Rows per page (for grid layout)
  - `gridCols` (number): Columns per page (for grid layout)
  - `gridGutter` (number): Gutter size in mm
  - `useMasterPage` (boolean): Use master page

**Returns:** Promise<Template>

**Example:**
```javascript
const template = await templateMgr.createTemplate({
  name: 'Product Grid',
  layoutType: 'grid',
  gridRows: 3,
  gridCols: 2,
  gridGutter: 5
});
```

#### `async saveTemplate(template)`

Saves template to a file.

**Parameters:**
- `template` (Template): Template object

**Returns:** Promise<boolean>

#### `async loadTemplate()`

Loads template from a file.

**Returns:** Promise<Template>

#### `getTemplates()`

Gets all available templates.

**Returns:** Template[]

#### `getTemplate(id)`

Gets a specific template by ID.

**Parameters:**
- `id` (string): Template ID

**Returns:** Template

#### `deleteTemplate(id)`

Deletes a template.

**Parameters:**
- `id` (string): Template ID

**Returns:** boolean

---

## ImageManager

### Constructor

```javascript
const imgMgr = new ImageManager();
```

### Methods

#### `async selectFolder()`

Opens folder picker for images.

**Returns:** Promise<Folder>

#### `async validateImagePath(path)`

Validates an image path.

**Parameters:**
- `path` (string): Image path

**Returns:** Promise<ValidationResult>

**Example:**
```javascript
const result = await imgMgr.validateImagePath('images/product.jpg');
if (result.valid) {
  console.log('Image is valid');
}
```

#### `resolveImagePath(path)`

Resolves relative image paths.

**Parameters:**
- `path` (string): Image path

**Returns:** string - Resolved absolute path

#### `async placeImage(frame, imagePath, options)`

Places an image in a frame.

**Parameters:**
- `frame` (Frame): InDesign frame
- `imagePath` (string): Image path
- `options` (Object):
  - `fitting` (string): 'fit', 'fill', or 'center'

**Returns:** Promise<boolean>

#### `async validateImages(imagePaths)`

Validates multiple image paths.

**Parameters:**
- `imagePaths` (Array): Array of image paths

**Returns:** Promise<ValidationResults>

#### `getMissingImages()`

Gets list of missing images.

**Returns:** Array

#### `clearMissingImages()`

Clears the missing images list.

**Returns:** void

---

## UpdateEngine

### Constructor

```javascript
const updater = new UpdateEngine();
```

### Methods

#### `async linkDataSource(data, mappings)`

Links a data source to the document.

**Parameters:**
- `data` (DataObject): Data to link
- `mappings` (Array): Field mappings

**Returns:** Promise<boolean>

#### `async update(data, mappings)`

Updates catalog with new data.

**Parameters:**
- `data` (DataObject): New data
- `mappings` (Array): Field mappings

**Returns:** Promise<boolean>

#### `detectChanges(oldData, newData)`

Detects changes between datasets.

**Parameters:**
- `oldData` (DataObject): Old data
- `newData` (DataObject): New data

**Returns:** Change[] - Array of changes

#### `isLinked()`

Checks if data is linked.

**Returns:** boolean

#### `unlinkDataSource()`

Unlinks the data source.

**Returns:** boolean

#### `getLinkedDataInfo()`

Gets information about linked data.

**Returns:** Object

---

## Utility Functions

### Logger

```javascript
import { Logger } from './modules/utils.js';

const logger = new Logger('ModuleName');

logger.info('Information message');
logger.warn('Warning message');
logger.error('Error message');
logger.debug('Debug message');
```

### Status Messages

```javascript
import { showStatus, showError, showSuccess } from './modules/utils.js';

showStatus('Processing...');
showError('An error occurred');
showSuccess('Operation completed');
```

### Data Type Detection

```javascript
import { detectDataType } from './modules/utils.js';

const type = detectDataType('299.99'); // Returns 'number'
const type = detectDataType('product.jpg'); // Returns 'image'
```

### File Validation

```javascript
import { validateFileExtension, isValidImagePath } from './modules/utils.js';

const isValid = validateFileExtension('data.csv', ['.csv', '.txt']);
const isImage = isValidImagePath('photo.jpg');
```

### Formatting

```javascript
import { formatCurrency, formatDate, formatFileSize } from './modules/utils.js';

const price = formatCurrency(299.99, 'USD', 'en-US'); // "$299.99"
const date = formatDate('2024-01-01', 'long'); // "January 1, 2024"
const size = formatFileSize(1024000); // "1000 KB"
```

### Unit Conversion

```javascript
import { mmToPoints, pointsToMM } from './modules/utils.js';

const points = mmToPoints(10); // Convert 10mm to points
const mm = pointsToMM(28.35); // Convert points to mm
```

### Batch Processing

```javascript
import { batchProcess } from './modules/utils.js';

await batchProcess(
  items,
  batchSize,
  async (item) => processItem(item),
  (current, total) => updateProgress(current, total)
);
```

---

## Data Structures

### DataObject

```javascript
{
  type: 'csv',                    // Source type
  fields: ['name', 'price'],      // Field names
  fieldTypes: {                   // Field types
    name: 'text',
    price: 'number'
  },
  records: [                      // Data records
    { name: 'Product 1', price: 99.99 },
    { name: 'Product 2', price: 149.99 }
  ],
  metadata: {                     // Metadata
    filename: 'data.csv',
    recordCount: 2,
    fieldCount: 2
  }
}
```

### Mapping

```javascript
{
  id: 'mapping-id',
  field: 'productName',
  frameId: 'frame-id',
  type: 'text',
  formatter: 'uppercase',
  transform: null
}
```

### Template

```javascript
{
  id: 'template-id',
  name: 'Grid Layout',
  layoutType: 'grid',
  gridRows: 3,
  gridCols: 2,
  gridGutter: 5,
  useMasterPage: false,
  createdAt: '2024-01-01T00:00:00Z'
}
```

### Frame

```javascript
{
  id: 'frame-id',
  type: 'text',
  label: 'Product Name Frame',
  originalFrame: InDesignFrameObject
}
```

---

## Events and Callbacks

### Progress Callback

```javascript
function onProgress(current, total, message) {
  console.log(`${current}/${total}: ${message}`);
  updateProgressBar(current / total * 100);
}
```

---

## Error Handling

All async methods may throw errors. Use try-catch:

```javascript
try {
  await generator.generate(options);
} catch (error) {
  console.error('Generation failed:', error);
  showError(error.message);
}
```

---

## Constants

### File Types

- `'csv'` - CSV files
- `'excel'` - Excel files (.xlsx, .xls)
- `'json'` - JSON files
- `'xml'` - XML files

### Data Types

- `'text'` - Text data
- `'number'` - Numeric data
- `'date'` - Date data
- `'image'` - Image path
- `'url'` - URL
- `'boolean'` - Boolean
- `'empty'` - Empty/null

### Layout Types

- `'flow'` - Flow layout
- `'grid'` - Grid layout
- `'custom'` - Custom layout

### Image Fitting

- `'fit'` - Fit to frame
- `'fill'` - Fill frame
- `'center'` - Center in frame
