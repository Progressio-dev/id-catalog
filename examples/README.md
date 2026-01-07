# Sample Data Files

This directory contains sample data files for testing the ID Catalog Builder plugin.

## Files

### sample-data.csv
CSV format with product catalog data. Includes:
- Product names
- SKUs
- Prices
- Descriptions
- Categories
- Image paths
- Stock levels

**Usage:**
1. Open ID Catalog Builder
2. Select "CSV File" as data source
3. Click "Select File" and choose `sample-data.csv`
4. Use default options (comma delimiter, UTF-8 encoding, headers enabled)
5. Click "Import Data"

### sample-data.json
JSON format with the same product data in structured format.

**Usage:**
1. Open ID Catalog Builder
2. Select "JSON File" as data source
3. Click "Select File" and choose `sample-data.json`
4. Click "Import Data"

### sample-data.xml
XML format with product data in tagged structure.

**Usage:**
1. Open ID Catalog Builder
2. Select "XML File" as data source
3. Click "Select File" and choose `sample-data.xml`
4. Click "Import Data"

## Creating Your Own Data Files

### CSV Format

Create a CSV file with headers in the first row:

```csv
Product Name,SKU,Price,Description,Image
My Product,SKU-001,99.99,Product description,images/product.jpg
```

Tips:
- Use consistent column names
- Quote values that contain commas
- Use UTF-8 encoding
- Save with .csv extension

### JSON Format

Create a JSON file with a "records" array:

```json
{
  "records": [
    {
      "productName": "My Product",
      "sku": "SKU-001",
      "price": 99.99,
      "description": "Product description",
      "image": "images/product.jpg"
    }
  ]
}
```

Tips:
- Use consistent property names
- Ensure valid JSON syntax
- Use arrays for multiple records

### XML Format

Create an XML file with consistent structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<catalog>
    <product>
        <productName>My Product</productName>
        <sku>SKU-001</sku>
        <price>99.99</price>
        <description>Product description</description>
        <image>images/product.jpg</image>
    </product>
</catalog>
```

Tips:
- Use consistent tag names
- Ensure well-formed XML
- Use CDATA for special characters

## Image Paths

The sample data references images in an `images/` folder. When using these files:

1. Create test images or use placeholders
2. Set the default image path in Settings
3. Or update the data files with your actual image paths

Example image paths:
- Absolute: `/Users/username/Desktop/catalog-images/product.jpg`
- Relative: `product.jpg` (requires default image path set)

## Testing Workflow

1. **Test Import**
   - Import each sample file
   - Verify data preview shows correctly
   - Check field types are detected properly

2. **Test Mapping**
   - Create text and image frames in InDesign
   - Map data fields to frames
   - Save the mapping configuration

3. **Test Generation**
   - Choose a template type
   - Configure layout options
   - Generate a small catalog
   - Verify output

4. **Test Updates**
   - Modify the data file
   - Re-import the data
   - Use "Update Existing" feature
   - Verify changes are applied

## Advanced Examples

For more complex scenarios:

- **Large datasets**: Create files with 100+ records to test performance
- **Special characters**: Test with international characters, symbols
- **Missing data**: Include empty fields to test handling
- **Invalid images**: Include non-existent image paths to test validation
- **Mixed types**: Mix numbers, text, dates in various fields

## Custom Data

To use your own data:

1. Prepare your data in one of the supported formats
2. Ensure consistent structure
3. Include all necessary fields
4. Test with a small sample first
5. Verify image paths are correct
6. Import and map fields
7. Generate your catalog

## Support

If you have issues with the sample data:
- Verify file encoding (should be UTF-8)
- Check for syntax errors (especially in JSON/XML)
- Ensure files are not corrupted
- Try re-downloading the samples
