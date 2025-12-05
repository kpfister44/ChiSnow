#!/usr/bin/env python3
"""
Debug test for storm switching with console logging
"""

from playwright.sync_api import sync_playwright
import time

def test_storm_switch_debug():
    print("Testing storm switch with debug logging...")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()

        # Collect console messages
        console_messages = []
        page.on("console", lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))

        try:
            print("\n1. Loading homepage...")
            page.goto("http://localhost:3000", wait_until="networkidle", timeout=15000)
            time.sleep(3)

            print("\n2. Initial console messages:")
            for msg in console_messages:
                print(f"  {msg}")
            console_messages.clear()

            print("\n3. Switching storm...")
            storm_selector = page.locator('select')
            options = storm_selector.locator('option').all()

            if len(options) >= 2:
                second_option = options[1].get_attribute('value')
                print(f"  Switching to: {second_option}")
                storm_selector.select_option(second_option)
                time.sleep(5)  # Wait longer for update

                print("\n4. Console messages after switch:")
                for msg in console_messages:
                    print(f"  {msg}")

                if not console_messages:
                    print("  ⚠ NO console messages - useEffect not triggered!")

                page.screenshot(path="test_storm_switch_debug.png")
                print("\n✓ Screenshot saved")
            else:
                print("  ✗ Not enough storms to test")

        finally:
            browser.close()

if __name__ == "__main__":
    test_storm_switch_debug()
