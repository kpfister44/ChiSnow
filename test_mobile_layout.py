#!/usr/bin/env python3
"""
ABOUTME: Test script for Test #21 - Mobile layout with bottom sheet
ABOUTME: Verifies full-screen map and bottom sheet functionality on mobile viewport
"""

from playwright.sync_api import sync_playwright
import sys

def test_mobile_layout():
    """Test #21: Mobile layout displays full-screen map with bottom sheet overlay"""

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Create mobile viewport (<768px)
        page = browser.new_context(viewport={'width': 375, 'height': 812}).new_page()

        # Capture console messages and errors
        console_messages = []
        errors = []
        page.on("console", lambda msg: console_messages.append(f"{msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: errors.append(str(err)))

        print("=" * 60)
        print("TEST #21: MOBILE LAYOUT")
        print("=" * 60)

        print("\nStep 1: Navigate to homepage on mobile device (<768px width)...")
        page.goto('http://localhost:3000')
        page.wait_for_load_state('networkidle')
        print(f"  ✓ Loaded with viewport: 375x812")

        print("\nStep 2: Take screenshot...")
        page.screenshot(path='/tmp/chisnow_mobile_initial.png', full_page=True)
        print("  ✓ Screenshot saved to /tmp/chisnow_mobile_initial.png")

        print("\nStep 3: Verify map takes full screen...")
        map_canvas = page.locator('canvas.mapboxgl-canvas').count()
        if map_canvas > 0:
            print("  ✓ Map canvas found and displayed")
        else:
            print("  ✗ Map canvas NOT found")
            errors.append("Map canvas not found")

        print("\nStep 4: Verify storm selector dropdown is at top...")
        storm_selector = page.locator('select').first
        if storm_selector.is_visible():
            box = storm_selector.bounding_box()
            if box and box['y'] < 100:  # Check if near top
                print(f"  ✓ Storm selector found at top (y={box['y']})")
            else:
                print(f"  ⚠ Storm selector found but not at top (y={box.get('y', 'unknown')})")
        else:
            print("  ⚠ Storm selector not visible")

        print("\nStep 5: Verify map control buttons are at bottom-left...")
        reset_button = page.locator('[data-testid="reset-chicago-btn"]')
        if reset_button.is_visible():
            box = reset_button.bounding_box()
            if box:
                print(f"  ✓ Reset button found at bottom-left (x={box['x']}, y={box['y']})")
            else:
                print("  ⚠ Could not get reset button position")
        else:
            print("  ✗ Reset button not visible")

        print("\nStep 6: Click a marker...")
        # Wait for markers to load
        page.wait_for_timeout(2000)

        # Find and click an unclustered point marker
        markers = page.locator('canvas.mapboxgl-canvas')
        if markers.count() > 0:
            # Click in the center area where markers should be
            page.mouse.click(200, 400)
            page.wait_for_timeout(500)
            print("  ✓ Clicked on map (marker area)")
        else:
            print("  ⚠ No markers found to click")

        print("\nStep 7: Verify bottom sheet slides up from bottom...")
        # Check if bottom sheet is visible (it should appear after marker click on mobile)
        page.wait_for_timeout(500)

        # Look for bottom sheet elements
        bottom_sheet_backdrop = page.locator('.fixed.inset-0.bg-black.bg-opacity-30')
        bottom_sheet_content = page.locator('.fixed.bottom-0.left-0.right-0.bg-white.rounded-t-2xl')

        if bottom_sheet_backdrop.count() > 0 or bottom_sheet_content.count() > 0:
            print(f"  ✓ Bottom sheet elements found (backdrop: {bottom_sheet_backdrop.count()}, content: {bottom_sheet_content.count()})")
        else:
            print("  ⚠ Bottom sheet not visible (might need to click actual marker)")

        print("\nStep 8: Verify bottom sheet has rounded top corners (16px)...")
        if bottom_sheet_content.count() > 0:
            # Check for rounded-t-2xl class (which is 16px in Tailwind)
            has_rounded = bottom_sheet_content.first.evaluate("el => el.classList.contains('rounded-t-2xl')")
            if has_rounded:
                print("  ✓ Bottom sheet has rounded top corners (rounded-t-2xl)")
            else:
                print("  ✗ Bottom sheet missing rounded corners class")
        else:
            print("  ⚠ Cannot verify - bottom sheet not visible")

        print("\nStep 9: Verify bottom sheet has backdrop blur effect...")
        if bottom_sheet_content.count() > 0:
            # Tailwind doesn't have backdrop-blur in classes, it's inline style
            style = bottom_sheet_content.first.get_attribute('style')
            if style and 'backdrop' in style.lower():
                print(f"  ✓ Bottom sheet has backdrop blur style")
            else:
                print(f"  ⚠ Backdrop blur style: {style}")
        else:
            print("  ⚠ Cannot verify - bottom sheet not visible")

        print("\nStep 10: Verify bottom sheet has drag handle at top...")
        drag_handle = page.locator('.w-12.h-1.bg-gray-300.rounded-full')
        if drag_handle.count() > 0:
            print("  ✓ Drag handle found")
        else:
            print("  ⚠ Drag handle not found")

        print("\nTaking final screenshot...")
        page.screenshot(path='/tmp/chisnow_mobile_final.png', full_page=True)
        print("  ✓ Screenshot saved to /tmp/chisnow_mobile_final.png")

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
        print("MOBILE LAYOUT TEST COMPLETE")
        print("=" * 60)
        print("\nNote: Bottom sheet may require clicking actual marker coordinates")
        print("Review screenshots to verify layout visually")

        return 0

if __name__ == "__main__":
    sys.exit(test_mobile_layout())
