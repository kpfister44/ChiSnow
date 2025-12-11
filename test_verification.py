#!/usr/bin/env python3
"""
ABOUTME: Verification script for Test #1 - Initial page load with map and snowfall data
ABOUTME: Uses Playwright to test the ChiSnow homepage functionality
"""

from playwright.sync_api import sync_playwright
import sys

def verify_initial_page_load():
    """Verify Test #1: Initial page load displays map with snowfall data"""

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Capture console messages
        console_messages = []
        errors = []

        page.on("console", lambda msg: console_messages.append(f"{msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: errors.append(str(err)))

        print("Step 1: Navigate to ChiSnow homepage...")
        page.goto('http://localhost:3001', wait_until='load')

        print("Step 2: Wait for page to load...")
        page.wait_for_timeout(3000)  # Give map time to initialize

        print("Step 3: Take screenshot of initial load...")
        page.screenshot(path='/tmp/chisnow_initial_load.png', full_page=True)
        print("  Screenshot saved to /tmp/chisnow_initial_load.png")

        # Check for critical elements
        print("\nStep 4: Verify map canvas is present...")
        map_canvas = page.locator('canvas.mapboxgl-canvas').count()
        if map_canvas > 0:
            print(f"  ✓ Map canvas found ({map_canvas} canvas elements)")
        else:
            print("  ✗ Map canvas NOT found")
            errors.append("Map canvas not found")

        print("\nStep 5: Check for error messages on page...")
        error_elements = page.locator('text=/error/i').count()
        if error_elements == 0:
            print("  ✓ No error messages displayed")
        else:
            print(f"  ✗ Found {error_elements} error message(s)")

        print("\nStep 6: Check for loading states...")
        loading_elements = page.locator('text=/loading/i').count()
        print(f"  Loading indicators found: {loading_elements}")

        print("\nStep 7: Inspect page title...")
        title = page.title()
        print(f"  Page title: '{title}'")

        print("\nStep 8: Check console for errors...")
        console_errors = [msg for msg in console_messages if 'error' in msg.lower()]
        if console_errors:
            print(f"  ✗ Found {len(console_errors)} console errors:")
            for err in console_errors[:5]:  # Show first 5
                print(f"    - {err}")
        else:
            print("  ✓ No console errors found")

        if errors:
            print(f"\n  ✗ Found {len(errors)} page errors:")
            for err in errors[:5]:
                print(f"    - {err}")
        else:
            print("  ✓ No page errors found")

        print("\nStep 9: Inspect DOM structure...")
        # Get basic page structure
        body_content = page.locator('body').inner_text()
        print(f"  Body text length: {len(body_content)} characters")

        # Check for Mapbox attribution (indicates map loaded)
        mapbox_attribution = page.locator('.mapboxgl-ctrl-attrib').count()
        if mapbox_attribution > 0:
            print(f"  ✓ Mapbox attribution found (map library loaded)")
        else:
            print(f"  ⚠ Mapbox attribution not found")

        print("\nStep 10: Take final screenshot...")
        page.screenshot(path='/tmp/chisnow_final.png', full_page=True)
        print("  Screenshot saved to /tmp/chisnow_final.png")

        browser.close()

        # Summary
        print("\n" + "="*60)
        print("VERIFICATION SUMMARY")
        print("="*60)

        all_checks_passed = (
            map_canvas > 0 and
            error_elements == 0 and
            len(console_errors) == 0 and
            len(errors) == 0
        )

        if all_checks_passed:
            print("✓ Test #1 PASSED - All critical checks successful")
            return 0
        else:
            print("✗ Test #1 FAILED - Some checks did not pass")
            print("\nIssues found:")
            if map_canvas == 0:
                print("  - Map canvas not found")
            if error_elements > 0:
                print(f"  - {error_elements} error message(s) on page")
            if console_errors:
                print(f"  - {len(console_errors)} console error(s)")
            if errors:
                print(f"  - {len(errors)} page error(s)")
            return 1

if __name__ == "__main__":
    sys.exit(verify_initial_page_load())
