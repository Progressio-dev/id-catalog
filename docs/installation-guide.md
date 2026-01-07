# ID Catalog Builder - Installation Guide

## System Requirements

### Software Requirements

- **Adobe InDesign**: 2022 or later (version 18.0+)
- **Operating System**: 
  - macOS 10.15 (Catalina) or later
  - Windows 10 (64-bit) or later
- **Memory**: 8GB RAM minimum, 16GB recommended
- **Disk Space**: 100MB for plugin and cache

### Supported InDesign Versions

- InDesign 2024 (version 19.x)
- InDesign 2023 (version 18.x)
- InDesign 2022 (version 17.x)

## Installation Methods

### Method 1: Adobe Creative Cloud Desktop App (Recommended)

1. **Open Creative Cloud Desktop**
   - Launch the Creative Cloud Desktop application
   - Sign in with your Adobe ID if prompted

2. **Navigate to Plugins**
   - Click on "Apps" in the left sidebar
   - Select "Manage Plugins" or find the plugins section

3. **Install ID Catalog Builder**
   - Search for "ID Catalog Builder" or "Catalog Builder"
   - Click "Install"
   - Wait for installation to complete

4. **Launch InDesign**
   - Open Adobe InDesign
   - The plugin should be automatically available

### Method 2: Manual Installation

#### macOS Installation

1. **Download the Plugin**
   - Download the `id-catalog-builder.zip` file
   - Extract the archive to get the plugin folder

2. **Locate the Plugins Folder**
   ```
   /Users/[YourUsername]/Library/Application Support/Adobe/UXP/PluginsPanel/IDSN/[Version]/External/
   ```
   
   Or use Finder:
   - Press `Cmd + Shift + G`
   - Paste the path above (replace [YourUsername] and [Version])
   - Click "Go"

3. **Copy Plugin Files**
   - Copy the entire `id-catalog-builder` folder
   - Paste into the External folder

4. **Restart InDesign**
   - Quit InDesign completely
   - Launch InDesign again

#### Windows Installation

1. **Download the Plugin**
   - Download the `id-catalog-builder.zip` file
   - Extract the archive to get the plugin folder

2. **Locate the Plugins Folder**
   ```
   C:\Users\[YourUsername]\AppData\Roaming\Adobe\UXP\PluginsPanel\IDSN\[Version]\External\
   ```
   
   Or use File Explorer:
   - Press `Win + R`
   - Type `%appdata%\Adobe\UXP\PluginsPanel\IDSN\`
   - Navigate to your InDesign version folder
   - Open the `External` folder

3. **Copy Plugin Files**
   - Copy the entire `id-catalog-builder` folder
   - Paste into the External folder

4. **Restart InDesign**
   - Close InDesign completely
   - Launch InDesign again

### Method 3: Using InDesign Plugin Manager

1. **Open InDesign**

2. **Access Plugin Manager**
   - Go to **Window > Extensions > Manage Extensions**
   - Or **Plugins > Manage Plugins** (depending on your version)

3. **Add Plugin**
   - Click the "+" or "Add Plugin" button
   - Navigate to the downloaded plugin folder
   - Select the folder and click "Open"

4. **Enable Plugin**
   - The plugin should appear in the list
   - Ensure it's checked/enabled
   - Click "Apply" or "OK"

## Verifying Installation

### Check Plugin Availability

1. **Open InDesign**

2. **Access Plugin Panel**
   - Go to **Window > Extensions > Catalog Builder**
   - Or **Plugins > Catalog Builder**

3. **Plugin Should Appear**
   - The Catalog Builder panel should open
   - You should see the main interface with tabs

### Troubleshooting Installation

#### Plugin Not Appearing

**Check Installation Location:**
- Verify the plugin folder is in the correct location
- Ensure the folder contains `manifest.json`

**Check Permissions:**
- macOS: Ensure InDesign has file system access
  - System Preferences > Security & Privacy > Privacy > Files and Folders
- Windows: Run InDesign as administrator (one time)

**Check InDesign Version:**
- Ensure you're running InDesign 2022 or later
- Go to **InDesign > About InDesign** to check version

#### Plugin Panel Is Empty

**Reload Plugin:**
1. Close the panel
2. Go to **Plugins > Manage Plugins**
3. Find Catalog Builder in the list
4. Click "Reload"

**Check Browser Console:**
1. Open the plugin panel
2. Right-click in the panel
3. Select "Inspect Element" or "Developer Tools"
4. Check the Console tab for errors

#### Permission Errors

**macOS:**
- Go to **System Preferences > Security & Privacy**
- Under Privacy tab, grant InDesign permissions for:
  - Files and Folders
  - Downloads (if importing from Downloads)

**Windows:**
- Run InDesign as Administrator (right-click > Run as administrator)
- Grant permissions when prompted

## Post-Installation Setup

### First Launch

1. **Open the Plugin**
   - Window > Extensions > Catalog Builder

2. **Grant Permissions**
   - If prompted, grant file system access
   - This is required for importing data and images

3. **Configure Settings**
   - Click the "Settings" tab
   - Set default image path if needed
   - Configure preferences

### Sample Data

The plugin includes sample data files in the `examples` folder:

- `sample-data.csv` - CSV format example
- `sample-data.json` - JSON format example
- `sample-data.xml` - XML format example

Use these to test the plugin and learn its features.

## Updating the Plugin

### Automatic Updates (Creative Cloud)

If installed via Creative Cloud Desktop:
- Updates are automatic
- You'll be notified when an update is available
- Click "Update" to install

### Manual Updates

1. **Download New Version**
   - Download the latest version

2. **Remove Old Version**
   - Delete the old plugin folder from the External directory

3. **Install New Version**
   - Follow installation steps above with new version
   - Restart InDesign

4. **Verify Update**
   - Check version number in plugin footer
   - Should show the new version (e.g., v1.1.0)

## Uninstallation

### Complete Removal

1. **Close InDesign**

2. **Delete Plugin Folder**
   - Navigate to the External plugins folder (see installation paths above)
   - Delete the `id-catalog-builder` folder

3. **Clear Plugin Data (Optional)**
   - macOS: `~/Library/Application Support/Adobe/InDesign/[Version]/en_US/Caches/`
   - Windows: `%appdata%\Adobe\InDesign\[Version]\en_US\Caches\`
   - Delete any `catalog-builder` related files

4. **Clear Browser Cache (Optional)**
   - In InDesign, go to **Edit > Preferences > Panels**
   - Click "Clear Panel Cache"

## Common Installation Issues

### Issue: "Plugin Failed to Load"

**Solution:**
1. Check InDesign version compatibility
2. Verify manifest.json exists in plugin folder
3. Check browser console for specific errors
4. Reinstall the plugin

### Issue: "Cannot Read File" Errors

**Solution:**
1. Grant file system permissions
2. Check that plugin files aren't corrupted
3. Re-download and reinstall

### Issue: Panel Opens But Shows Blank Screen

**Solution:**
1. Check browser console for JavaScript errors
2. Verify all plugin files are present:
   - manifest.json
   - src/index.html
   - src/index.js
   - src/ui/styles.css
   - All module files
3. Clear InDesign cache and restart

### Issue: "Module Not Found" Errors

**Solution:**
1. Ensure all files in `src/modules/` are present
2. Check file names match exactly (case-sensitive)
3. Reinstall the plugin

## Getting Help

If you encounter issues not covered here:

1. **Check Documentation**
   - Review the User Guide (`docs/user-guide.md`)
   - Check Developer Guide (`docs/developer-guide.md`)

2. **Check Browser Console**
   - Right-click in plugin panel
   - Select "Inspect" or "Developer Tools"
   - Look for error messages in Console tab

3. **Contact Support**
   - Email: support@progressio.dev
   - Include:
     - InDesign version
     - Operating system
     - Error messages from console
     - Steps to reproduce the issue

## Network and Firewall

The plugin requires network access for:
- Downloading updates (if using Creative Cloud)
- Accessing external resources (if configured)

Ensure your firewall allows:
- Adobe Creative Cloud
- Adobe InDesign
- UXP plugin network access

## System Performance

For optimal performance:

- **Close unnecessary documents**: Keep only one catalog document open
- **Optimize images**: Use appropriately sized images (not huge source files)
- **Batch size**: Adjust batch size in settings based on your system
  - Slower systems: Use smaller batch size (50-100)
  - Faster systems: Use larger batch size (200-500)

## Advanced Configuration

### Developer Mode

For development and debugging:

1. **Enable Developer Mode**
   - InDesign > Preferences > Panels
   - Check "Enable Developer Mode"

2. **Reload Plugin Without Restart**
   - Plugins > Manage Plugins
   - Select Catalog Builder
   - Click "Reload"

3. **View Logs**
   - Check browser console
   - Export logs from Settings tab

## License and Activation

This plugin is released under the MIT License. No activation required.

For commercial use, please review the license terms in the LICENSE file.

---

**Installation Complete!**

You're now ready to use ID Catalog Builder. Start with the Quick Start Guide in the User Guide to create your first catalog.
