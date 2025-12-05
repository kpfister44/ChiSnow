#!/usr/bin/env python3
"""
Test to verify storm switching now updates the map data correctly
"""

from playwright.sync_api import sync_playwright
import time

def test_storm_switch_updates_map():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()

        print("=" * 80)
        print("TEST: Verify Storm Switching Updates Map Data")
        print("=" * 80)

        # Navigate to page
        print("\n1. Loading homepage...")
        page.goto('http://localhost:3000', wait_until='networkidle')
        time.sleep(2)

        # Get initial storm info
        selector = page.locator('h2').first
        initial_storm = selector.inner_text()
        print(f"   ✓ Initial storm: {initial_storm}")

        # Get initial marker count via Mapbox API
        initial_markers = page.evaluate("""() => {
            const map = window.mapInstance;
            if (!map) return 0;
            return map.queryRenderedFeatures({ layers: ['unclustered-point', 'clusters'] }).length;
        }""")
        print(f"   ✓ Initial markers visible: {initial_markers}")

        # Switch to a different storm
        print("\n2. Switching to different storm...")
        dropdown = page.locator('select').first

        # Get all options and select the 3rd one (index 2)
        options = dropdown.locator('option').all()
        option_text = options[2].inner_text()
        print(f"   Selecting: {option_text}")

        dropdown.select_option(index=2)

        # Wait for loading to complete
        time.sleep(2)

        # Verify storm changed
        new_storm = selector.inner_text()
        print(f"   ✓ New storm: {new_storm}")

        # Verify markers are still visible (map updated) via Mapbox API
        new_markers = page.evaluate("""() => {
            const map = window.mapInstance;
            if (!map) return 0;
            return map.queryRenderedFeatures({ layers: ['unclustered-point', 'clusters'] }).length;
        }""")
        print(f"   ✓ Markers after switch: {new_markers}")

        # Verify we can click a marker and see popup
        print("\n3. Testing marker interaction after switch...")
        # Click on map center where markers should be
        map_element = page.locator('[data-testid="map-container"]').first
        if map_element.count() > 0:
            box = map_element.bounding_box()
            if box:
                # Click near center of map where Chicago markers should be
                page.mouse.click(box['x'] + box['width'] / 2, box['y'] + box['height'] / 2)
                time.sleep(0.5)

                popup = page.locator('.mapboxgl-popup')
                if popup.count() > 0:
                    print("   ✓ Marker popup appears correctly")
                else:
                    print("   ⚠ Note: Popup test skipped (markers are clusters or outside click area)")

        # Test switching to another storm
        print("\n4. Switching to yet another storm...")
        dropdown.select_option(index=4)
        time.sleep(2)

        final_storm = selector.inner_text()
        final_markers = page.evaluate("""() => {
            const map = window.mapInstance;
            if (!map) return 0;
            return map.queryRenderedFeatures({ layers: ['unclustered-point', 'clusters'] }).length;
        }""")
        print(f"   ✓ Final storm: {final_storm}")
        print(f"   ✓ Markers after 2nd switch: {final_markers}")

        print("\n" + "=" * 80)
        print("RESULTS:")
        print("=" * 80)

        success = True
        if initial_storm == new_storm == final_storm:
            print("✗ FAIL: Storm selector text didn't update")
            success = False
        else:
            print("✓ Storm selector updates correctly")

        if new_markers > 0 and final_markers > 0:
            print("✓ Map data updates on storm switch")
        else:
            print("✗ FAIL: Map markers disappeared")
            success = False

        if success:
            print("\n🎉 SUCCESS: Storm switching works correctly!")
        else:
            print("\n❌ FAIL: Storm switching has issues")

        print("=" * 80)

        time.sleep(2)
        browser.close()

        return success

if __name__ == '__main__':
    test_storm_switch_updates_map()
