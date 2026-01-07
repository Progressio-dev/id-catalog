# ID Catalog Builder - User Guide

## Introduction

ID Catalog Builder is a professional UXP plugin for Adobe InDesign that automates the creation of product catalogs, price lists, and other data-driven publications. It rivals EasyCatalog in functionality while being built on modern Adobe UXP technology.

## Features

- **Multiple Data Sources**: Import from CSV, Excel, JSON, and XML files
- **Visual Field Mapping**: Drag-and-drop interface for mapping data to InDesign frames
- **Template System**: Create and reuse catalog templates
- **Automatic Page Generation**: Generate catalog pages automatically
- **Image Management**: Handle product images with various fitting options
- **Dynamic Updates**: Update your catalog when data changes
- **Batch Processing**: Handle large datasets efficiently

## Installation

1. Download the plugin package
2. In InDesign, go to **Plugins > Manage Plugins**
3. Click **Add Plugin** and select the plugin folder
4. Restart InDesign if prompted
5. Access the plugin from **Window > Extensions > Catalog Builder**

## Quick Start Guide

### Step 1: Import Data

1. Open the **Catalog Builder** panel
2. Click the **Import Data** tab
3. Select your data source type (CSV, Excel, JSON, or XML)
4. Click **Select File** and choose your data file
5. Configure import options if needed
6. Click **Import Data**

The plugin will display a preview of your data showing the first 10 records.

### Step 2: Map Fields to Frames

1. Click the **Field Mapping** tab
2. In your InDesign document, create text and image frames where you want data to appear
3. Click **Detect Frames** to discover available frames
4. Drag data fields from the left panel to InDesign frames on the right
5. Your mappings will appear in the list below

**Tips:**
- Name your frames in InDesign for easier identification
- Create one frame for each type of data (product name, price, description, image)
- The same mapping will be reused for all records

### Step 3: Configure Template

1. Click the **Template** tab
2. Choose a layout type:
   - **Flow Layout**: Items flow from page to page
   - **Grid Layout**: Items arranged in rows and columns
   - **Custom Template**: Use your own template design
3. For Grid Layout, set:
   - Rows per page
   - Columns per page
   - Gutter spacing
4. Click **Create Template**

### Step 4: Generate Catalog

1. Click the **Generate** tab
2. Review the summary of your data and mappings
3. Set options:
   - Start page number
   - Whether to clear existing content
   - Image handling method (fit, fill, or center)
4. Click **Generate Catalog**

The plugin will process your data and create the catalog pages automatically.

## Working with CSV Files

### CSV Options

- **Delimiter**: Choose comma, semicolon, tab, or pipe
- **Encoding**: Select UTF-8, UTF-16, or ISO-8859-1
- **Header Row**: Check if first row contains column names

### CSV Format Example

```csv
Product Name,SKU,Price,Description,Image
Office Chair,CH-001,299.99,Ergonomic chair,images/chair.jpg
Standing Desk,DK-002,599.99,Adjustable desk,images/desk.jpg
```

## Working with Excel Files

- Support for .xlsx and .xls formats
- Select which sheet to import
- First row should contain column headers

## Working with JSON Files

### JSON Format

```json
{
  "records": [
    {
      "productName": "Office Chair",
      "sku": "CH-001",
      "price": 299.99,
      "image": "images/chair.jpg"
    }
  ]
}
```

The JSON file should contain an array of objects, either directly or in a `records` or `data` property.

## Working with XML Files

### XML Format

```xml
<?xml version="1.0" encoding="UTF-8"?>
<catalog>
    <product>
        <productName>Office Chair</productName>
        <sku>CH-001</sku>
        <price>299.99</price>
        <image>images/chair.jpg</image>
    </product>
</catalog>
```

## Field Mapping

### Mapping Types

- **Text Fields**: Map to text frames for product names, descriptions, prices, etc.
- **Image Fields**: Map to image frames for product photos
- **Formatted Fields**: Apply currency or date formatting

### Saving Mappings

Once you've created your mappings, save them for reuse:

1. Click **Save Mapping** in the Mapping tab
2. Choose a location and filename
3. Later, load the mapping with **Load Mapping**

## Template Management

### Creating Templates

Templates define how your catalog pages are laid out:

1. Design a sample page in InDesign
2. Create and map frames as needed
3. Save the template for reuse

### Template Types

**Flow Layout**: Items are placed sequentially, creating new pages as needed.

**Grid Layout**: Items are arranged in a regular grid pattern. Configure:
- Rows: Number of items vertically per page
- Columns: Number of items horizontally per page
- Gutter: Space between items

## Image Management

### Image Paths

Image paths in your data can be:
- **Absolute**: Full path like `/Users/name/images/product.jpg`
- **Relative**: Filename like `product.jpg` (requires setting default image path in Settings)

### Image Fitting Options

- **Fit to Frame**: Scale image to fit entirely within frame
- **Fill Frame**: Scale image to fill frame completely (may crop)
- **Center in Frame**: Place image centered without scaling

### Missing Images

If images are missing:
- Check the default image path in Settings
- Verify image filenames in your data
- Export logs to see which images couldn't be found

## Settings

### General Settings

- **Default Image Path**: Base folder for relative image paths
- **Validate Images**: Check image paths before generation
- **Auto-save**: Save document during generation

### Performance

- **Batch Size**: Number of records to process at once (default: 100)
- Larger batches are faster but use more memory

### Advanced

- **Enable Logging**: Record detailed operation logs
- **Clear Cache**: Remove cached data
- **Export Logs**: Save logs for troubleshooting

## Updating Catalogs

After making changes to your data:

1. Import the updated data file
2. Go to the Generate tab
3. Click **Update Existing**

The plugin will detect changes and update only the modified content.

## Tips and Best Practices

### Performance

- For large catalogs (1000+ items), use batch processing
- Close unnecessary InDesign documents
- Save your document periodically

### Organization

- Use consistent naming for frames
- Organize data fields logically
- Save mappings and templates for reuse

### Data Preparation

- Clean your data before import
- Use consistent image naming
- Verify all image paths are correct
- Include all required fields

### Troubleshooting

**Problem**: Plugin doesn't appear in menu
- **Solution**: Restart InDesign, check plugin installation

**Problem**: Import fails
- **Solution**: Check file format, verify data structure

**Problem**: Images not appearing
- **Solution**: Verify image paths, check default image path setting

**Problem**: Slow generation
- **Solution**: Reduce batch size, optimize images, use fewer mappings

## Keyboard Shortcuts

- **Ctrl/Cmd + R**: Refresh data preview
- **Ctrl/Cmd + G**: Generate catalog
- **Ctrl/Cmd + S**: Save settings

## Support

For issues, questions, or feature requests:
- Check the documentation in the `docs` folder
- Review example files in the `examples` folder
- Contact support at: support@progressio.dev

## Version History

### Version 1.0.0
- Initial release
- CSV, Excel, JSON, XML import
- Field mapping
- Template system
- Page generation
- Image management
- Dynamic updates
