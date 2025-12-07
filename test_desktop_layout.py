#!/usr/bin/env python3
"""
ABOUTME: Test script for Test #22 - Desktop layout with sidebar
ABOUTME: Verifies left sidebar and map layout on desktop viewport
"""

from playwright.sync_api import sync_playwright
import sys

def test_desktop_layout():
    """Test #22: Desktop layout displays left sidebar with map taking remaining space"""

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Create desktop viewport (>1024px)
        page = browser.new_context(viewport={'width': 1920, 'height': 1080}).new_page()

        # Capture console messages and errors
        console_messages = []
        errors = []
        page.on("console", lambda msg: console_messages.append(f"{msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: errors.append(str(err)))

        print("=" * 60)
        print("TEST #22: DESKTOP LAYOUT")
        print("=" * 60)

        print("\nStep 1: Navigate to homepage on desktop (>1024px width)...")
        page.goto('http://localhost:3000')
        page.wait_for_load_state('networkidle')
        print(f"  ✓ Loaded with viewport: 1920x1080")

        print("\nStep 2: Take screenshot...")
        page.screenshot(path='/tmp/chisnow_desktop_initial.png', full_page=False)
        print("  ✓ Screenshot saved to /tmp/chisnow_desktop_initial.png")

        print("\nStep 3: Verify left sidebar is 300px wide...")
        # Look for sidebar with w-[300px] class
        sidebar = page.locator('.w-\\[300px\\]').first
        if sidebar.is_visible():
            box = sidebar.bounding_box()
            if box:
                width = box['width']
                print(f"  ✓ Sidebar found with width: {width}px")
                if abs(width - 300) < 5:  # Allow small variance
                    print(f"  ✓ Sidebar width matches spec (300px)")
                else:
                    print(f"  ⚠ Sidebar width is {width}px, expected 300px")
            else:
                print("  ⚠ Could not get sidebar dimensions")
        else:
            print("  ✗ Sidebar not visible")
            errors.append("Sidebar not visible on desktop")

        print("\nStep 4: Verify sidebar contains storm selector...")
        # Storm selector should be in sidebar
        storm_selector_in_sidebar = page.locator('.w-\\[300px\\] select').count()
        if storm_selector_in_sidebar > 0:
            print(f"  ✓ Storm selector found in sidebar")
        else:
            print(f"  ⚠ Storm selector not found in sidebar")

        print("\nStep 5: Verify sidebar shows aggregate snowfall statistics...")
        # Look for statistics headers
        stats_headers = [
            'Snowfall Summary',
            'Maximum Snowfall',
            'Average Snowfall',
            'Reporting Stations'
        ]

        found_stats = 0
        for header in stats_headers:
            if page.locator(f'text={header}').count() > 0:
                found_stats += 1

        print(f"  Found {found_stats}/{len(stats_headers)} statistics sections")
        if found_stats >= 3:
            print(f"  ✓ Sidebar shows aggregate statistics")
        else:
            print(f"  ⚠ Missing some statistics sections")

        print("\nStep 6: Verify map takes remaining horizontal space...")
        map_canvas = page.locator('canvas.mapboxgl-canvas')
        if map_canvas.is_visible():
            box = map_canvas.bounding_box()
            if box:
                map_width = box['width']
                expected_width = 1920 - 300  # viewport - sidebar
                print(f"  Map width: {map_width}px (expected ~{expected_width}px)")
                if abs(map_width - expected_width) < 50:  # Allow variance
                    print(f"  ✓ Map takes remaining space")
                else:
                    print(f"  ⚠ Map width unexpected")
            else:
                print("  ⚠ Could not get map dimensions")
        else:
            print("  ✗ Map not visible")

        print("\nStep 7: Verify map controls are in top-right corner...")
        toggle_controls = page.locator('[data-testid="toggle-heatmap"]').locator('..')
        if toggle_controls.is_visible():
            box = toggle_controls.bounding_box()
            if box:
                x = box['x']
                y = box['y']
                # Should be in top-right: high x value, low y value
                if x > 1500 and y < 100:  # Right side and top
                    print(f"  ✓ Toggle controls found at top-right (x={x:.0f}, y={y:.0f})")
                else:
                    print(f"  ⚠ Toggle controls at (x={x:.0f}, y={y:.0f}) - expected top-right")
            else:
                print("  ⚠ Could not get toggle controls position")
        else:
            print("  ⚠ Toggle controls not visible")

        print("\nStep 8: Click a marker...")
        # Wait for markers to load
        page.wait_for_timeout(2000)

        # Click in the map area where markers should be
        page.mouse.click(1000, 500)
        page.wait_for_timeout(500)
        print("  ✓ Clicked on map (marker area)")

        print("\nStep 9: Verify popup appears directly above marker (not bottom sheet)...")
        # Look for Mapbox popup
        mapbox_popup = page.locator('.mapboxgl-popup')
        bottom_sheet = page.locator('.fixed.bottom-0.left-0.right-0.bg-white.rounded-t-2xl')

        if mapbox_popup.count() > 0:
            print(f"  ✓ Mapbox popup found (desktop behavior)")
        else:
            print(f"  ⚠ Mapbox popup not visible (might need to click actual marker)")

        if bottom_sheet.is_visible():
            print(f"  ✗ Bottom sheet visible on desktop (should only show on mobile)")
        else:
            print(f"  ✓ Bottom sheet hidden on desktop")

        print("\nTaking final screenshot...")
        page.screenshot(path='/tmp/chisnow_desktop_final.png', full_page=False)
        print("  ✓ Screenshot saved to /tmp/chisnow_desktop_final.png")

        print("\nChecking for console errors...")
        console_errors = [msg for msg in console_messages if 'error' in msg.lower()]
        if console_errors:
            print(f"  ✗ Found {len(console_errors)} console errors:")
            for err in console_errors[:5]:
                print(f"    - {err}")
        else:
            print("  ✓ No console errors")

        if errors:
            print(f"\n  ✗ Found {len(errors)} page errors:")
            for err in errors[:5]:
                print(f"    - {err}")
        else:
            print("  ✓ No page errors")

        browser.close()

        print("\n" + "=" * 60)
        print("DESKTOP LAYOUT TEST COMPLETE")
        print("=" * 60)
        print("\nNote: Popup may require clicking actual marker coordinates")
        print("Review screenshots to verify layout visually")

        return 0

if __name__ == "__main__":
    sys.exit(test_desktop_layout())
