# ID Catalog Builder

Professional Catalog Builder Plugin for Adobe InDesign (UXP)

## Overview

ID Catalog Builder is a powerful, production-ready UXP plugin for Adobe InDesign that automates the creation of product catalogs, price lists, and other data-driven publications. Built with modern web technologies and the Adobe UXP framework, it provides comprehensive catalog creation functionality rivaling commercial solutions like EasyCatalog.

## Features

### 🔄 Multi-Format Data Import
- **CSV Files**: Configurable delimiter, encoding, and header detection
- **Excel Files**: Support for .xlsx and .xls with multi-sheet support
- **JSON**: Structured data with flexible schema
- **XML**: Schema validation and custom tag support
- Data preview before import
- Automatic field type detection

### 🎯 Visual Field Mapping
- Drag-and-drop interface for mapping data to frames
- Support for text and image frames
- Field formatters (currency, dates, numbers)
- Text transforms (uppercase, lowercase, capitalize)
- Save and load mapping configurations

### 📐 Template System
- Multiple layout types (Flow, Grid, Custom)
- Configurable grid layouts with rows, columns, and gutters
- Master page integration
- Template library management
- Export/import templates

### 🖼️ Advanced Image Management
- Automatic image placement from file paths
- Support for relative and absolute paths
- Multiple fitting options (fit, fill, center)
- Missing image detection and validation
- Batch image validation

### ⚡ Automatic Page Generation
- Smart pagination and page creation
- Batch processing for large datasets
- Progress indicators for long operations
- Configurable starting page
- Option to clear existing content

### 🔄 Dynamic Updates
- Link data source to document
- Update catalog when data changes
- Detect and apply only changed records
- Version tracking
- Update history

### ⚙️ Professional Features
- Comprehensive error handling
- Detailed logging system
- Performance optimization for large datasets
- Memory management
- Settings persistence

## Quick Start

### Installation

1. Download the plugin package
2. In InDesign, go to **Plugins > Manage Plugins**
3. Click **Add Plugin** and select the plugin folder
4. Restart InDesign
5. Access from **Window > Extensions > Catalog Builder**

See [Installation Guide](docs/installation-guide.md) for detailed instructions.

### Basic Workflow

1. **Import Data**: Select and import your data file (CSV, Excel, JSON, or XML)
2. **Map Fields**: Drag data fields to InDesign frames
3. **Configure Template**: Choose layout type and configure options
4. **Generate**: Click Generate Catalog to create pages automatically

See [User Guide](docs/user-guide.md) for complete documentation.

## System Requirements

- Adobe InDesign 2022 or later (version 18.0+)
- macOS 10.15+ or Windows 10 64-bit+
- 8GB RAM minimum (16GB recommended)
- 100MB disk space

## Documentation

- **[User Guide](docs/user-guide.md)**: Complete guide for end users
- **[Developer Guide](docs/developer-guide.md)**: Architecture and development documentation
- **[API Reference](docs/api-reference.md)**: Detailed API documentation
- **[Installation Guide](docs/installation-guide.md)**: Installation and setup instructions

## File Structure

```
id-catalog/
├── manifest.json              # UXP plugin manifest
├── package.json              # Dependencies
├── README.md                 # This file
├── src/
│   ├── index.html           # Main UI
│   ├── index.js             # Entry point
│   ├── modules/             # Core modules
│   │   ├── dataImport.js       # Data import
│   │   ├── dataMapping.js      # Field mapping
│   │   ├── pageGenerator.js    # Page generation
│   │   ├── templateManager.js  # Template system
│   │   ├── imageManager.js     # Image handling
│   │   ├── updateEngine.js     # Dynamic updates
│   │   └── utils.js            # Utilities
│   └── ui/
│       └── styles.css       # UI styling
├── examples/                # Sample data files
│   ├── sample-data.csv
│   ├── sample-data.json
│   └── sample-data.xml
└── docs/                   # Documentation
    ├── user-guide.md
    ├── developer-guide.md
    ├── api-reference.md
    └── installation-guide.md
```

## Technology Stack

- **UXP**: Adobe Unified Extensibility Platform
- **JavaScript ES6+**: Modern JavaScript
- **HTML5/CSS3**: User interface
- **InDesign DOM API**: Document manipulation

## Development

### Setup

```bash
# Install dependencies (if any)
npm install

# The plugin can be loaded directly into InDesign
# See Developer Guide for details
```

### Module Architecture

The plugin follows a modular architecture:

- **DataImporter**: Handles all data import functionality
- **DataMapper**: Manages field-to-frame mappings
- **PageGenerator**: Generates catalog pages
- **TemplateManager**: Template creation and management
- **ImageManager**: Image validation and placement
- **UpdateEngine**: Dynamic data updates
- **Utils**: Shared utilities and helpers

See [Developer Guide](docs/developer-guide.md) for architecture details.

## Examples

Sample data files are provided in the `examples/` directory:

- `sample-data.csv`: CSV format with product data
- `sample-data.json`: JSON format with product data
- `sample-data.xml`: XML format with product data

Use these files to test the plugin and learn its features.

## Performance

Optimized for large datasets:
- Handles 10,000+ records efficiently
- Batch processing with configurable size
- Progress indicators for long operations
- Memory management for large images
- Background processing where possible

## Troubleshooting

Common issues and solutions:

- **Plugin not appearing**: Check installation location and InDesign version
- **Import fails**: Verify file format and encoding
- **Images not appearing**: Check image paths and default image folder
- **Slow performance**: Reduce batch size, optimize images

See [User Guide](docs/user-guide.md) for detailed troubleshooting.

## Support

For issues, questions, or feature requests:
- Check the documentation in the `docs/` folder
- Review example files in the `examples/` folder
- Contact: support@progressio.dev

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License

Copyright (c) 2024 Progressio

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Roadmap

Future enhancements planned:
- Advanced filtering and sorting
- Formula support for calculated fields
- Multi-language localization
- Export to package
- Scripts for automation
- External API integration
- Advanced conditional formatting
- Cross-reference support

## Version History

### Version 1.0.0 (Current)
- Initial release
- CSV, Excel, JSON, XML import
- Visual field mapping
- Template system
- Page generation
- Image management
- Dynamic updates
- Comprehensive documentation

## Credits

Developed by Progressio
Built with Adobe UXP for InDesign 2022+ 
