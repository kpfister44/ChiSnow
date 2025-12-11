#!/usr/bin/env python3
"""
ABOUTME: Verification script for Test #44 - 404 page displays when navigating to non-existent routes
ABOUTME: Uses Playwright to test the ChiSnow 404 error page functionality
"""

from playwright.sync_api import sync_playwright
import sys

def verify_404_page():
    """Verify Test #44: 404 page displays correctly for non-existent routes"""

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Capture console messages and errors
        console_messages = []
        errors = []

        page.on("console", lambda msg: console_messages.append(f"{msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: errors.append(str(err)))

        print("============================================================")
        print("TEST #44: 404 PAGE")
        print("============================================================\n")

        print("Step 1: Navigate to /non-existent-page...")
        response = page.goto('http://localhost:3000/non-existent-page')
        print(f"  Response status: {response.status}")

        print("\nStep 2: Verify 404 page is displayed...")
        # Check for 404 heading
        heading_404 = page.locator('text=404').count()
        if heading_404 > 0:
            print("  ✓ 404 heading found")
        else:
            print("  ✗ 404 heading NOT found")
            errors.append("404 heading not found")

        # Check for "Page Not Found" heading
        page_not_found = page.locator('text=/Page Not Found/i').count()
        if page_not_found > 0:
            print("  ✓ 'Page Not Found' heading found")
        else:
            print("  ✗ 'Page Not Found' heading NOT found")
            errors.append("Page Not Found heading not found")

        print("\nStep 3: Verify friendly error message...")
        error_message = page.locator('text=/couldn\'t find the page/i').count()
        if error_message > 0:
            print("  ✓ Friendly error message found")
        else:
            print("  ✗ Friendly error message NOT found")
            errors.append("Friendly error message not found")

        print("\nStep 4: Verify link to return to homepage...")
        home_link = page.locator('a[href="/"]').filter(has_text="Return to Homepage").count()
        if home_link > 0:
            print("  ✓ Homepage link found")
            # Verify link is visible and clickable
            link_element = page.locator('a[href="/"]').filter(has_text="Return to Homepage")
            if link_element.is_visible():
                print("  ✓ Homepage link is visible")
            else:
                print("  ✗ Homepage link is NOT visible")
                errors.append("Homepage link not visible")
        else:
            print("  ✗ Homepage link NOT found")
            errors.append("Homepage link not found")

        print("\nStep 5: Verify styling is consistent with site design...")
        # Check for Tailwind classes indicating proper styling
        blue_elements = page.locator('.text-blue-600, .bg-blue-600').count()
        if blue_elements > 0:
            print(f"  ✓ Blue accent colors found ({blue_elements} elements)")
        else:
            print("  ⚠ Blue accent colors not found (styling may differ)")

        # Take screenshot
        print("\nTaking screenshot...")
        page.screenshot(path='/tmp/chisnow_404_page.png', full_page=True)
        print("  ✓ Screenshot saved to /tmp/chisnow_404_page.png")

        # Test clicking the return home link
        print("\nStep 6: Test clicking 'Return to Homepage' link...")
        try:
            page.locator('a[href="/"]').filter(has_text="Return to Homepage").click()
            page.wait_for_timeout(2000)  # Wait for navigation
            current_url = page.url
            if current_url == 'http://localhost:3000/' or current_url.endswith('/'):
                print("  ✓ Successfully navigated back to homepage")
            else:
                print(f"  ✗ Navigation failed - current URL: {current_url}")
                errors.append("Homepage link navigation failed")
        except Exception as e:
            print(f"  ✗ Error clicking link: {str(e)}")
            errors.append(f"Link click error: {str(e)}")

        # Check for console errors
        print("\nChecking for console errors...")
        console_errors = [msg for msg in console_messages if 'error' in msg.lower()]
        if console_errors:
            print(f"  ⚠ Found {len(console_errors)} console messages with 'error':")
            for err in console_errors[:3]:  # Show first 3
                print(f"    - {err}")
        else:
            print("  ✓ No console errors found")

        if errors:
            print(f"\n  ✗ Found {len(errors)} page errors:")
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
            heading_404 > 0 and
            page_not_found > 0 and
            error_message > 0 and
            home_link > 0 and
            len(errors) == 0
        )

        if all_checks_passed:
            print("✓ Test #44 PASSED - 404 page works correctly")
            return 0
        else:
            print("✗ Test #44 FAILED - Some checks did not pass")
            print("\nIssues found:")
            if heading_404 == 0:
                print("  - 404 heading not found")
            if page_not_found == 0:
                print("  - 'Page Not Found' heading not found")
            if error_message == 0:
                print("  - Friendly error message not found")
            if home_link == 0:
                print("  - Homepage link not found")
            if errors:
                print(f"  - {len(errors)} page error(s)")
            return 1

if __name__ == "__main__":
    sys.exit(verify_404_page())
