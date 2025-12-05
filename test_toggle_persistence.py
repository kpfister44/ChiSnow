#!/usr/bin/env python3
"""
Test #15: Toggle state persists when switching between storms
"""

from playwright.sync_api import sync_playwright
import time

def test_toggle_persistence():
    print("Starting Test #15: Toggle state persistence")
    print("=" * 60)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        try:
            # Step 1: Navigate to homepage
            print("\n✓ Step 1: Navigating to homepage...")
            page.goto("http://localhost:3000", wait_until="networkidle", timeout=15000)
            time.sleep(2)

            # Step 2: Set visualization to 'Markers only'
            print("\n✓ Step 2: Setting visualization to 'Markers only'...")
            markers_button = page.locator('button:has-text("Markers")')
            markers_button.click()
            time.sleep(1)

            # Verify button is active
            button_class = markers_button.get_attribute('class')
            assert 'bg-blue-600' in button_class or 'bg-blue-500' in button_class, "Markers button should be active"
            print("  ✓ Markers mode activated")

            # Step 3: Switch to a different storm
            print("\n✓ Step 3: Switching to different storm...")
            storm_selector = page.locator('select')
            options = storm_selector.locator('option').all()

            if len(options) < 2:
                print("  ⚠ Not enough storms to test switching")
                return

            # Get current selection
            current_value = storm_selector.input_value()
            print(f"  Current storm: {current_value}")

            # Select second storm
            second_option = options[1].get_attribute('value')
            storm_selector.select_option(second_option)
            print(f"  Switched to: {second_option}")
            time.sleep(2)

            # Step 4: Verify visualization remains 'Markers only'
            print("\n✓ Step 4: Verifying visualization is still 'Markers only'...")
            markers_button_after = page.locator('button:has-text("Markers")')
            button_class_after = markers_button_after.get_attribute('class')

            if 'bg-blue-600' in button_class_after or 'bg-blue-500' in button_class_after:
                print("  ✓ Markers mode persisted!")
            else:
                print("  ✗ FAIL: Visualization mode was reset")
                print(f"  Button class: {button_class_after}")
                raise AssertionError("Toggle state did not persist when switching storms")

            # Step 5: Switch back to original storm
            print("\n✓ Step 5: Switching back to original storm...")
            storm_selector.select_option(current_value)
            time.sleep(2)

            # Step 6: Verify visualization is still 'Markers only'
            print("\n✓ Step 6: Verifying visualization is still 'Markers only'...")
            markers_button_final = page.locator('button:has-text("Markers")')
            button_class_final = markers_button_final.get_attribute('class')

            if 'bg-blue-600' in button_class_final or 'bg-blue-500' in button_class_final:
                print("  ✓ Markers mode still persisted!")
            else:
                print("  ✗ FAIL: Visualization mode was reset on second switch")
                raise AssertionError("Toggle state did not persist when switching back")

            # Take final screenshot
            page.screenshot(path="test_screenshot_toggle_persistence.png")
            print("\n✓ Screenshot saved: test_screenshot_toggle_persistence.png")

            print("\n" + "=" * 60)
            print("✅ Test #15 verification complete!")
            print("Toggle state persists across storm switches")

        except Exception as e:
            print(f"\n❌ Test failed: {str(e)}")
            page.screenshot(path="test_screenshot_toggle_persistence_fail.png")
            raise
        finally:
            browser.close()

if __name__ == "__main__":
    test_toggle_persistence()
