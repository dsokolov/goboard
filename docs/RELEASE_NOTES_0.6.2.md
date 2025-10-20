# Release Notes v0.6.2

## Key Changes

### Obsidian Catalog Review Fixes
- **Build compatibility**: Fixed Windows build script by replacing Unix `cp` command with cross-platform Node.js `fs.copyFileSync`
- **Console logging**: Reduced console pollution by gating build logs behind `GOBOARD_BUILD_VERBOSE=1` environment variable
- **Test improvements**: Removed unsafe type casts and console logs from test suite
- **Security**: Enhanced XMLSerializer polyfill with safe serialization and escaping per Obsidian security guidelines

### Technical Improvements
- Improved cross-platform build compatibility
- Enhanced test reliability and security
- Reduced console output during normal operations

## Compatibility
All changes are backward compatible. This is a maintenance release addressing Obsidian plugin review feedback.
