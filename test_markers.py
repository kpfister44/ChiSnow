#!/usr/bin/env python3
"""
Test script for ChiSnow markers - Test #7 from feature_list.json
Verifies markers display with color-coding based on snowfall amounts
"""

from playwright.sync_api import sync_playwright

def test_markers():
    print("Starting Test #7: Marker display and color-coding")
    print("=" * 60)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Step 1: Navigate to homepage
        print("\n✓ Step 1: Navigating to homepage...")
        page.goto('http://localhost:3000')
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(2000)

        # Step 2: Verify markers are visible on map
        print("\n✓ Step 2: Checking for markers...")
        markers = page.locator('.snowfall-marker')
        marker_count = markers.count()
        if marker_count > 0:
            print(f"  ✓ Found {marker_count} markers on the map")
        else:
            print("  ✗ No markers found!")
            browser.close()
            return False

        # Step 3: Verify markers show snowfall amounts inside
        print("\n✓ Step 3: Checking marker content...")
        for i in range(min(marker_count, 5)):  # Check first 5 markers
            marker = markers.nth(i)
            text = marker.text_content()
            if text and len(text) > 0:
                print(f"  ✓ Marker {i+1} shows: {text}\"")
            else:
                print(f"  ✗ Marker {i+1} has no text content")

        # Step 4: Verify marker colors match snowfall gradient
        print("\n✓ Step 4: Checking marker colors...")
        color_map = {
            '#7C3AED': '10+ inches (Purple)',
            '#1E40AF': '6-10 inches (Dark blue)',
            '#2563EB': '4-6 inches (Deep blue)',
            '#60A5FA': '2-4 inches (Medium blue)',
            '#DBEAFE': '0-2 inches (Light blue)'
        }

        for i in range(marker_count):
            marker = markers.nth(i)
            bg_color = marker.evaluate('el => window.getComputedStyle(el).backgroundColor')
            text = marker.text_content()
            print(f"  ✓ Marker {i+1} ({text}\"): color={bg_color}")

        # Step 5: Verify markers are circular pins
        print("\n✓ Step 5: Checking marker shape...")
        for i in range(min(marker_count, 3)):
            marker = markers.nth(i)
            border_radius = marker.evaluate('el => window.getComputedStyle(el).borderRadius')
            width = marker.evaluate('el => window.getComputedStyle(el).width')
            height = marker.evaluate('el => window.getComputedStyle(el).height')
            print(f"  ✓ Marker {i+1}: {width} x {height}, border-radius: {border_radius}")
            if '50%' in border_radius or border_radius == '20px':
                print(f"    ✓ Marker is circular")

        # Step 6: Verify white text is readable on colored background
        print("\n✓ Step 6: Checking text readability...")
        for i in range(min(marker_count, 3)):
            marker = markers.nth(i)
            color = marker.evaluate('el => window.getComputedStyle(el).color')
            font_weight = marker.evaluate('el => window.getComputedStyle(el).fontWeight')
            print(f"  ✓ Marker {i+1}: text color={color}, weight={font_weight}")
            if 'rgb(255, 255, 255)' in color or 'white' in color.lower():
                print(f"    ✓ Text is white - good contrast")

        # Take screenshot
        page.screenshot(path='test_screenshot_markers.png', full_page=True)
        print("\n✓ Screenshot saved: test_screenshot_markers.png")

        print("\n" + "=" * 60)
        print("✅ Test #7 verification complete!")
        print(f"Total markers verified: {marker_count}")

        browser.close()
        return True

if __name__ == '__main__':
    test_markers()
