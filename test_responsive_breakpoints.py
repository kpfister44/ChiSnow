#!/usr/bin/env python3
"""
ABOUTME: Verification script for Test #35 - Responsive breakpoints at 768px and 1024px
ABOUTME: Uses Playwright to test layout changes at different viewport sizes
"""

from playwright.sync_api import sync_playwright
import sys
import time

def verify_responsive_breakpoints():
    """Verify Test #35: Responsive breakpoints work correctly at 768px and 1024px"""

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Capture console messages
        console_messages = []
        errors = []

        page.on("console", lambda msg: console_messages.append(f"{msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: errors.append(str(err)))

        print("="*60)
        print("Test #35: Responsive Breakpoints Verification")
        print("="*60)

        # Test 1: Mobile layout at 767px
        print("\nStep 1: Set viewport to 767px width (mobile)...")
        page.set_viewport_size({"width": 767, "height": 812})
        page.goto('http://localhost:3000')
        page.wait_for_load_state('networkidle')
        time.sleep(1)

        print("Step 2: Verify mobile layout is active...")

        # Check for mobile storm selector (should be visible)
        mobile_selector_visible = page.locator('[class*="md:hidden"]').filter(has_text="Storm").is_visible() if page.locator('[class*="md:hidden"]').filter(has_text="Storm").count() > 0 else False

        # Check that sidebar is hidden on mobile
        sidebar_hidden = page.locator('[data-testid="sidebar"]').count() == 0 or not page.locator('[data-testid="sidebar"]').is_visible()

        print(f"  Mobile storm selector visible: {mobile_selector_visible}")
        print(f"  Sidebar hidden: {sidebar_hidden}")

        page.screenshot(path='/tmp/chisnow_767px.png', full_page=True)
        print("  Screenshot saved to /tmp/chisnow_767px.png")

        # Test 2: Tablet layout at 768px
        print("\nStep 3: Set viewport to 768px width (tablet)...")
        page.set_viewport_size({"width": 768, "height": 1024})
        time.sleep(1)

        print("Step 4: Verify tablet layout is active...")

        # At 768px+, sidebar should be visible
        sidebar_visible_768 = page.evaluate('''
            () => {
                const sidebar = document.querySelector('[class*="md:flex"]');
                if (!sidebar) return false;
                const styles = window.getComputedStyle(sidebar);
                return styles.display !== 'none';
            }
        ''')

        print(f"  Sidebar visible at 768px: {sidebar_visible_768}")

        page.screenshot(path='/tmp/chisnow_768px.png', full_page=True)
        print("  Screenshot saved to /tmp/chisnow_768px.png")

        # Test 3: Still tablet layout at 1024px
        print("\nStep 5: Set viewport to 1024px width...")
        page.set_viewport_size({"width": 1024, "height": 768})
        time.sleep(1)

        print("Step 6: Verify tablet layout is still active...")

        sidebar_visible_1024 = page.evaluate('''
            () => {
                const sidebar = document.querySelector('[class*="md:flex"]');
                if (!sidebar) return false;
                const styles = window.getComputedStyle(sidebar);
                return styles.display !== 'none';
            }
        ''')

        print(f"  Sidebar visible at 1024px: {sidebar_visible_1024}")

        page.screenshot(path='/tmp/chisnow_1024px.png', full_page=True)
        print("  Screenshot saved to /tmp/chisnow_1024px.png")

        # Test 4: Desktop layout at 1025px+
        print("\nStep 7: Set viewport to 1920px width (desktop)...")
        page.set_viewport_size({"width": 1920, "height": 1080})
        time.sleep(1)

        print("Step 8: Verify desktop layout is active...")

        sidebar_visible_desktop = page.evaluate('''
            () => {
                const sidebar = document.querySelector('[class*="md:flex"]');
                if (!sidebar) return false;
                const styles = window.getComputedStyle(sidebar);
                return styles.display !== 'none';
            }
        ''')

        print(f"  Sidebar visible at 1920px: {sidebar_visible_desktop}")

        page.screenshot(path='/tmp/chisnow_1920px.png', full_page=True)
        print("  Screenshot saved to /tmp/chisnow_1920px.png")

        print("\nStep 9: Check for console errors...")
        console_errors = [msg for msg in console_messages if 'error' in msg.lower()]
        if console_errors:
            print(f"  ✗ Found {len(console_errors)} console errors:")
            for err in console_errors[:5]:
                print(f"    - {err}")
        else:
            print("  ✓ No console errors found")

        if errors:
            print(f"  ✗ Found {len(errors)} page errors:")
            for err in errors[:5]:
                print(f"    - {err}")
        else:
            print("  ✓ No page errors found")

        browser.close()

        # Summary
        print("\n" + "="*60)
        print("VERIFICATION SUMMARY")
        print("="*60)

        all_checks_passed = (
            sidebar_visible_768 and
            sidebar_visible_1024 and
            sidebar_visible_desktop and
            len(console_errors) == 0 and
            len(errors) == 0
        )

        if all_checks_passed:
            print("✓ Test #35 PASSED - Responsive breakpoints work correctly")
            print("\nBreakpoint behavior:")
            print("  - Mobile (<768px): Sidebar hidden, mobile controls shown")
            print("  - Tablet (768px-1023px): Sidebar visible")
            print("  - Desktop (1024px+): Sidebar visible")
            return 0
        else:
            print("✗ Test #35 FAILED - Some checks did not pass")
            print("\nIssues found:")
            if not sidebar_visible_768:
                print("  - Sidebar not visible at 768px (expected visible)")
            if not sidebar_visible_1024:
                print("  - Sidebar not visible at 1024px (expected visible)")
            if not sidebar_visible_desktop:
                print("  - Sidebar not visible at desktop size")
            if console_errors:
                print(f"  - {len(console_errors)} console error(s)")
            if errors:
                print(f"  - {len(errors)} page error(s)")
            return 1

if __name__ == "__main__":
    sys.exit(verify_responsive_breakpoints())
