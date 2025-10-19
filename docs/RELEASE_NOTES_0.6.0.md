# Release Notes v0.6.0

## Key Changes

### Mapper Improvements
- **Enhanced stone placement logic**: Updated stone mapping algorithm for more accurate board representation
- **Extended interval support**: Improved handling of interval stone positions (e.g., `B A1-C9`)

### New Test Scenarios
- **Zone-based stone placement**: Added support for placing stones in board zones
- **Interval placement**: Enhanced support for placing stones along lines (e.g., `B B1-B9`)
- **Multiple stone placement**: Added support for placing multiple stones with a single command
- **Single stones**: Improved handling of individual stones

### Test Updates
- Updated baseline images for tests moves-3 through moves-7 (dark and light themes)
- Added new test notes for various stone placement scenarios
- Removed obsolete `simple-game.md` file

### Technical Improvements
- Enhanced diagram rendering stability
- Updated test data for better functionality coverage

## Compatibility
All changes are backward compatible with previous versions.
