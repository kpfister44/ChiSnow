# End-to-End Browser Automation Tests

This directory contains Playwright-based end-to-end tests that verify ChiSnow features through actual browser automation.

## Test Naming Convention

Tests are numbered to match their corresponding feature in `feature_list.json`:
- `test_01_homepage.py` → Feature #1: Initial page load
- `test_06_heatmap.py` → Feature #6: Heatmap layer
- `test_07_markers.py` → Feature #7: Marker display
- etc.

**Note:** Not all features have e2e tests (some are unit tests or API tests). Gaps in numbering are expected.

## Prerequisites

### Install Playwright

```bash
# Activate virtual environment
source .venv/bin/activate

# Install Playwright (if not already installed)
pip install playwright

# Install browser drivers
playwright install
```

## Running Tests

### Run Individual Test

```bash
# From project root
python tests/e2e/test_01_homepage.py
```

### Run All Tests

```bash
# Run all tests in sequence
for test in tests/e2e/test_*.py; do
    echo "Running $test..."
    python "$test"
    echo ""
done
```

## Test Output

- **Screenshots**: Saved to `tests/screenshots/` (gitignored)
- **Console**: Test results print to stdout
- **Exit codes**: 0 = pass, 1 = fail

## Available Tests

Current e2e tests (21/102 features verified):

| Test File | Feature # | Description |
|-----------|-----------|-------------|
| test_01_homepage.py | #1 | Initial page load |
| test_06_heatmap.py | #6 | Heatmap layer gradient |
| test_07_markers.py | #7 | Marker display |
| test_08_marker_popup.py | #8 | Marker popup details |
| test_09_marker_clustering.py | #9 | Marker clustering |
| test_10_toggle_controls.py | #10 | Visualization toggles |
| test_11_map_controls.py | #11 | Pan and zoom controls |
| test_12_reset_chicago.py | #12 | Reset to Chicago button |
| test_13_storm_selector.py | #13 | Storm selector dropdown |
| test_14_storm_switching.py | #14 | Storm selection updates map |
| test_17_loading_states.py | #17 | Loading indicators |
| test_19_data_normalization.py | #19 | Data source normalization |
| test_20_map_panning.py | #20 | Map panning across US |
| test_27_marker_design.py | #27 | Marker design specification |

## Troubleshooting

### "No module named 'playwright'"
```bash
source .venv/bin/activate
pip install playwright
playwright install
```

### "Failed to connect to localhost:3000"
```bash
# Start the development server first
npm run dev
```

### Screenshots not generating
- Check that `tests/screenshots/` directory exists
- Verify write permissions on the directory
- Screenshots are automatically created by tests

### Headless mode
Most tests run in headless mode by default. To see the browser:
1. Open the test file
2. Change `headless=True` to `headless=False`
3. Run the test

## Debug Scripts

Debug and temporary test scripts are located in `tests/debug/` (gitignored).

## Contributing

When adding new e2e tests:
1. Name the file to match the feature number: `test_XX_description.py`
2. Add screenshot paths to `tests/screenshots/test_XX_*.png`
3. Update this README's test table
4. Mark the feature as passing in `feature_list.json` after verification
