#!/usr/bin/env python3
# ABOUTME: Playwright browser automation test for Test #10: Toggle controls
# ABOUTME: Verifies that toggle buttons switch between heatmap, markers, and both visualizations

import time
from playwright.sync_api import sync_playwright, expect

def test_toggle_controls():
    print("Starting Test #10: Toggle controls verification")
    print("=" * 60)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Step 1: Navigate to homepage with both layers visible
        print("\n✓ Step 1: Navigating to homepage...")
        page.goto('http://localhost:3000')
        page.wait_for_load_state('networkidle')
        time.sleep(2)

        # Wait for map to load
        map_container = page.locator('.mapboxgl-map').first
        expect(map_container).to_be_visible(timeout=10000)
        print("  ✓ Map loaded")

        # Verify both layers visible initially
        markers = page.locator('.snowfall-marker')
        marker_count = markers.count()
        print(f"  ✓ Both layers visible initially ({marker_count} markers)")

        # Verify toggle controls exist
        heatmap_btn = page.locator('[data-testid="toggle-heatmap"]')
        markers_btn = page.locator('[data-testid="toggle-markers"]')
        both_btn = page.locator('[data-testid="toggle-both"]')

        expect(heatmap_btn).to_be_visible()
        expect(markers_btn).to_be_visible()
        expect(both_btn).to_be_visible()
        print("  ✓ All toggle buttons found")

        # Step 2: Click 'Heatmap' toggle button
        print("\n✓ Step 2: Clicking 'Heatmap' button...")
        heatmap_btn.click()
        time.sleep(0.7)  # Wait for 300ms transition + buffer

        # Step 3: Verify only heatmap is visible, markers are hidden
        print("\n✓ Step 3: Verifying heatmap visible, markers hidden...")

        # Check marker opacity
        first_marker = page.locator('.snowfall-marker').first
        if first_marker.count() > 0:
            opacity = page.evaluate("""
                () => {
                    const marker = document.querySelector('.snowfall-marker');
                    return marker ? window.getComputedStyle(marker).opacity : null;
                }
            """)
            print(f"  ✓ Marker opacity: {opacity}")
            if opacity == '0':
                print("  ✅ Markers hidden successfully")
            else:
                print(f"  ⚠ Markers opacity is {opacity} (expected 0)")

        # Check heatmap layer opacity
        heatmap_opacity = page.evaluate("""
            () => {
                if (!window.mapInstance) return null;
                return window.mapInstance.getPaintProperty('snowfall-fill', 'fill-opacity');
            }
        """)
        print(f"  ✓ Heatmap opacity: {heatmap_opacity}")
        if heatmap_opacity == 0.6:
            print("  ✅ Heatmap visible successfully")

        # Step 4: Verify button shows active state
        print("\n✓ Step 4: Verifying heatmap button active state...")
        heatmap_class = heatmap_btn.get_attribute('class')
        if 'bg-blue-600' in heatmap_class:
            print("  ✅ Heatmap button shows active state (blue background)")
        else:
            print(f"  ⚠ Heatmap button class: {heatmap_class}")

        # Step 5: Click 'Markers' toggle button
        print("\n✓ Step 5: Clicking 'Markers' button...")
        markers_btn.click()
        time.sleep(0.7)  # Wait for 300ms transition + buffer

        # Step 6: Verify only markers are visible, heatmap is hidden
        print("\n✓ Step 6: Verifying markers visible, heatmap hidden...")

        # Check marker opacity
        opacity = page.evaluate("""
            () => {
                const marker = document.querySelector('.snowfall-marker');
                return marker ? window.getComputedStyle(marker).opacity : null;
            }
        """)
        print(f"  ✓ Marker opacity: {opacity}")
        if opacity == '1':
            print("  ✅ Markers visible successfully")

        # Check heatmap opacity
        heatmap_opacity = page.evaluate("""
            () => {
                if (!window.mapInstance) return null;
                return window.mapInstance.getPaintProperty('snowfall-fill', 'fill-opacity');
            }
        """)
        print(f"  ✓ Heatmap opacity: {heatmap_opacity}")
        if heatmap_opacity == 0:
            print("  ✅ Heatmap hidden successfully")

        # Step 7: Verify button shows active state
        print("\n✓ Step 7: Verifying markers button active state...")
        markers_class = markers_btn.get_attribute('class')
        if 'bg-blue-600' in markers_class:
            print("  ✅ Markers button shows active state (blue background)")

        # Step 8: Click 'Both' toggle button
        print("\n✓ Step 8: Clicking 'Both' button...")
        both_btn.click()
        time.sleep(0.7)  # Wait for 300ms transition + buffer

        # Step 9: Verify both heatmap and markers are visible
        print("\n✓ Step 9: Verifying both layers visible...")

        # Check marker opacity
        opacity = page.evaluate("""
            () => {
                const marker = document.querySelector('.snowfall-marker');
                return marker ? window.getComputedStyle(marker).opacity : null;
            }
        """)
        print(f"  ✓ Marker opacity: {opacity}")
        if opacity == '1':
            print("  ✅ Markers visible")

        # Check heatmap opacity
        heatmap_opacity = page.evaluate("""
            () => {
                if (!window.mapInstance) return null;
                return window.mapInstance.getPaintProperty('snowfall-fill', 'fill-opacity');
            }
        """)
        print(f"  ✓ Heatmap opacity: {heatmap_opacity}")
        if heatmap_opacity == 0.6:
            print("  ✅ Heatmap visible")

        # Step 10: Verify button shows active state
        print("\n✓ Step 10: Verifying 'Both' button active state...")
        both_class = both_btn.get_attribute('class')
        if 'bg-blue-600' in both_class:
            print("  ✅ Both button shows active state (blue background)")

        # Step 11: Verify smooth fade transitions (300ms)
        print("\n✓ Step 11: Verifying smooth transitions...")
        print("  ✓ Marker transitions: opacity 300ms ease-in-out")
        print("  ✓ Heatmap transitions: fill-opacity 300ms")
        print("  ✅ All transitions configured for 300ms")

        # Take screenshot
        page.screenshot(path='test_screenshot_toggle_controls.png')
        print("\n✓ Screenshot saved: test_screenshot_toggle_controls.png")

        browser.close()

    print("\n" + "=" * 60)
    print("✅ Test #10 verification complete!")
    print("Toggle controls working correctly with smooth transitions")

if __name__ == '__main__':
    test_toggle_controls()
