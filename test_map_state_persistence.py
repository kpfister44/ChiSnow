#!/usr/bin/env python3
"""
Test #46: Map maintains state when toggling between visualization modes
Verifies that map position and zoom level are preserved when toggling visualization
"""

from playwright.sync_api import sync_playwright
import sys
import time

def run_test():
    print("Test #46: Map maintains state when toggling between visualization modes")
    print("=" * 60)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        # Step 1: Navigate to homepage
        print("\nStep 1: Navigate to homepage...")
        page.goto("http://localhost:3000", wait_until="load", timeout=30000)
        page.wait_for_timeout(3000)  # Wait for map to load
        print("  ✓ Homepage loaded")

        # Step 2: Pan map to specific location
        print("\nStep 2: Pan map to specific location...")
        canvas = page.locator('canvas').first
        bbox = canvas.bounding_box()

        if not bbox:
            print("  ✗ Map canvas not found")
            browser.close()
            return False

        # Pan the map by dragging
        start_x = bbox['x'] + bbox['width'] / 2
        start_y = bbox['y'] + bbox['height'] / 2
        end_x = start_x - 100  # Pan left
        end_y = start_y - 100  # Pan up

        page.mouse.move(start_x, start_y)
        page.mouse.down()
        page.mouse.move(end_x, end_y)
        page.mouse.up()
        page.wait_for_timeout(1000)
        print("  ✓ Map panned to new location")

        # Step 3: Set zoom level (zoom in)
        print("\nStep 3: Set zoom level...")
        # Double-click to zoom in
        page.mouse.dblclick(end_x, end_y)
        page.wait_for_timeout(1000)
        print("  ✓ Zoom level adjusted")

        # Get map center and zoom before toggle
        # Use JavaScript to access mapbox map instance
        map_state_before = page.evaluate("""
            () => {
                const map = window.mapInstance;
                if (!map) return null;
                const center = map.getCenter();
                const zoom = map.getZoom();
                return {
                    lng: center.lng,
                    lat: center.lat,
                    zoom: zoom
                };
            }
        """)

        if not map_state_before:
            print("  ✗ Could not get map state")
            browser.close()
            return False

        print(f"  ✓ Map state captured: lat={map_state_before['lat']:.4f}, lng={map_state_before['lng']:.4f}, zoom={map_state_before['zoom']:.2f}")

        # Step 4: Toggle visualization mode
        print("\nStep 4: Toggle visualization mode...")
        # Click the "Markers" button
        markers_button = page.get_by_role('button', name='Show markers only')
        markers_button.click()
        page.wait_for_timeout(500)
        print("  ✓ Toggled to 'Markers' mode")

        # Step 5: Verify map position is maintained
        print("\nStep 5: Verify map position is maintained...")
        map_state_after = page.evaluate("""
            () => {
                const map = window.mapInstance;
                if (!map) return null;
                const center = map.getCenter();
                const zoom = map.getZoom();
                return {
                    lng: center.lng,
                    lat: center.lat,
                    zoom: zoom
                };
            }
        """)

        if not map_state_after:
            print("  ✗ Could not get map state after toggle")
            browser.close()
            return False

        # Check if position is maintained (allow small floating point difference)
        lat_diff = abs(map_state_after['lat'] - map_state_before['lat'])
        lng_diff = abs(map_state_after['lng'] - map_state_before['lng'])

        if lat_diff < 0.001 and lng_diff < 0.001:
            print(f"  ✓ Map position maintained: lat={map_state_after['lat']:.4f}, lng={map_state_after['lng']:.4f}")
        else:
            print(f"  ✗ Map position changed! Diff: lat={lat_diff}, lng={lng_diff}")
            browser.close()
            return False

        # Step 6: Verify zoom level is maintained
        print("\nStep 6: Verify zoom level is maintained...")
        zoom_diff = abs(map_state_after['zoom'] - map_state_before['zoom'])

        if zoom_diff < 0.01:
            print(f"  ✓ Zoom level maintained: {map_state_after['zoom']:.2f}")
        else:
            print(f"  ✗ Zoom level changed! Before: {map_state_before['zoom']:.2f}, After: {map_state_after['zoom']:.2f}")
            browser.close()
            return False

        # Step 7: Verify only visualization changes, not map state
        print("\nStep 7: Verify only visualization changes...")
        # Toggle to "Heatmap" mode
        heatmap_button = page.get_by_role('button', name='Show heatmap only')
        heatmap_button.click()
        page.wait_for_timeout(500)

        # Check state again
        map_state_final = page.evaluate("""
            () => {
                const map = window.mapInstance;
                if (!map) return null;
                const center = map.getCenter();
                const zoom = map.getZoom();
                return {
                    lng: center.lng,
                    lat: center.lat,
                    zoom: zoom
                };
            }
        """)

        lat_diff_final = abs(map_state_final['lat'] - map_state_before['lat'])
        lng_diff_final = abs(map_state_final['lng'] - map_state_before['lng'])
        zoom_diff_final = abs(map_state_final['zoom'] - map_state_before['zoom'])

        if lat_diff_final < 0.001 and lng_diff_final < 0.001 and zoom_diff_final < 0.01:
            print("  ✓ Map state preserved across multiple visualization toggles")
        else:
            print("  ✗ Map state changed after multiple toggles")
            browser.close()
            return False

        print("\n" + "=" * 60)
        print("VERIFICATION SUMMARY")
        print("=" * 60)
        print("✓ Test #46 PASSED - Map state is maintained during visualization toggles")
        print("\nAll steps completed successfully:")
        print("  ✓ Map position preserved when toggling modes")
        print("  ✓ Zoom level preserved when toggling modes")
        print("  ✓ Only visualization changes, not map state")
        print("  ✓ State preserved across multiple mode switches")

        browser.close()
        return True

if __name__ == "__main__":
    success = run_test()
    sys.exit(0 if success else 1)
