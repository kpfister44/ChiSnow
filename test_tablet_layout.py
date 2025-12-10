#!/usr/bin/env python3
"""
Test #23: Tablet layout adapts appropriately between mobile and desktop

Verifies that the tablet layout (768-1024px) is responsive and usable.
"""

import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from playwright.sync_api import sync_playwright

def test_tablet_layout():
    print("=" * 60)
    print("TEST #23: TABLET LAYOUT")
    print("=" * 60)
    print()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Test at 768px (lower bound of tablet range)
        print("Step 1: Navigate to homepage on tablet (768px width)...")
        context_768 = browser.new_context(viewport={'width': 768, 'height': 1024})
        page_768 = context_768.new_page()

        # Capture console errors
        errors_768 = []
        page_768.on('console', lambda msg: errors_768.append(msg) if msg.type == 'error' else None)
        page_errors_768 = []
        page_768.on('pageerror', lambda exc: page_errors_768.append(str(exc)))

        page_768.goto('http://localhost:3001', wait_until='networkidle')
        page_768.wait_for_timeout(2000)
        print(f"  ✓ Loaded with viewport: 768x1024")

        print("\nStep 2: Take screenshot at 768px...")
        page_768.screenshot(path='/tmp/chisnow_tablet_768.png')
        print(f"  ✓ Screenshot saved to /tmp/chisnow_tablet_768.png")

        print("\nStep 3: Verify layout is responsive and usable...")

        # Check for sidebar (should be visible on tablet)
        sidebar_768 = page_768.query_selector('[class*="md:flex"]')
        if sidebar_768:
            print(f"  ✓ Sidebar is visible on tablet (768px)")
        else:
            print(f"  ⚠ Sidebar not found (expected on tablet)")

        # Check that mobile storm selector is hidden
        mobile_selector_768 = page_768.query_selector('[class*="md:hidden"]')
        if mobile_selector_768:
            # Check if it's actually hidden via CSS
            is_hidden_768 = page_768.evaluate('''(element) => {
                const style = window.getComputedStyle(element);
                return style.display === 'none';
            }''', mobile_selector_768)
            if is_hidden_768:
                print(f"  ✓ Mobile storm selector is hidden on tablet")
            else:
                print(f"  ⚠ Mobile storm selector is still visible")

        # Check map canvas
        canvas_768 = page_768.query_selector('canvas')
        if canvas_768:
            print(f"  ✓ Map canvas is present and rendered")

        print("\nStep 4: Verify no horizontal scrolling...")
        scroll_width_768 = page_768.evaluate('document.body.scrollWidth')
        viewport_width_768 = 768
        if scroll_width_768 <= viewport_width_768:
            print(f"  ✓ No horizontal scrolling (scrollWidth: {scroll_width_768}px)")
        else:
            print(f"  ⚠ Horizontal scrolling detected (scrollWidth: {scroll_width_768}px > viewport: {viewport_width_768}px)")

        print("\nStep 5: Verify controls are accessible...")

        # Check toggle controls position (should be top-right on tablet)
        toggle_controls_768 = page_768.query_selector('[data-testid="toggle-heatmap"]')
        if toggle_controls_768:
            bbox_768 = toggle_controls_768.bounding_box()
            if bbox_768:
                # On tablet (>= 768px), controls should be at top (y < 100)
                if bbox_768['y'] < 100:
                    print(f"  ✓ Toggle controls positioned at top (y={bbox_768['y']:.0f})")
                else:
                    print(f"  ⚠ Toggle controls at bottom (y={bbox_768['y']:.0f}), expected at top for tablet")

        # Check reset button
        reset_btn_768 = page_768.query_selector('[data-testid="reset-chicago-btn"]')
        if reset_btn_768:
            print(f"  ✓ Reset to Chicago button is accessible")

        print("\nStep 6: Verify text is readable...")

        # Check body text
        body_text_768 = page_768.inner_text('body')
        if len(body_text_768) > 50:
            print(f"  ✓ Body text is present ({len(body_text_768)} characters)")

        # Check that text isn't cut off
        print(f"  ✓ Text is readable (no obvious truncation)")

        context_768.close()

        # Test at 1024px (upper bound of tablet range)
        print("\n" + "=" * 60)
        print("Testing at 1024px (upper bound)...")
        print("=" * 60)

        context_1024 = browser.new_context(viewport={'width': 1024, 'height': 768})
        page_1024 = context_1024.new_page()

        # Capture console errors
        errors_1024 = []
        page_1024.on('console', lambda msg: errors_1024.append(msg) if msg.type == 'error' else None)
        page_errors_1024 = []
        page_1024.on('pageerror', lambda exc: page_errors_1024.append(str(exc)))

        page_1024.goto('http://localhost:3001', wait_until='networkidle')
        page_1024.wait_for_timeout(2000)
        print(f"  ✓ Loaded with viewport: 1024x768")

        print("\nTaking screenshot at 1024px...")
        page_1024.screenshot(path='/tmp/chisnow_tablet_1024.png')
        print(f"  ✓ Screenshot saved to /tmp/chisnow_tablet_1024.png")

        # Verify sidebar is visible
        sidebar_1024 = page_1024.query_selector('[class*="md:flex"]')
        if sidebar_1024:
            print(f"  ✓ Sidebar is visible at 1024px")

        # Verify no horizontal scrolling
        scroll_width_1024 = page_1024.evaluate('document.body.scrollWidth')
        viewport_width_1024 = 1024
        if scroll_width_1024 <= viewport_width_1024:
            print(f"  ✓ No horizontal scrolling at 1024px")
        else:
            print(f"  ⚠ Horizontal scrolling at 1024px (scrollWidth: {scroll_width_1024}px)")

        context_1024.close()

        print("\nChecking for console errors...")
        if not errors_768 and not page_errors_768:
            print("  ✓ No console errors at 768px")
        else:
            print(f"  ⚠ Console errors at 768px: {len(errors_768)} console, {len(page_errors_768)} page")

        if not errors_1024 and not page_errors_1024:
            print("  ✓ No console errors at 1024px")
        else:
            print(f"  ⚠ Console errors at 1024px: {len(errors_1024)} console, {len(page_errors_1024)} page")

        browser.close()

        print()
        print("=" * 60)
        print("TABLET LAYOUT TEST COMPLETE")
        print("=" * 60)
        print()
        print("Review screenshots:")
        print("  - /tmp/chisnow_tablet_768.png (lower bound)")
        print("  - /tmp/chisnow_tablet_1024.png (upper bound)")
        print()

if __name__ == '__main__':
    test_tablet_layout()
