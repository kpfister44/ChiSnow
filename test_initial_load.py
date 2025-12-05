#!/usr/bin/env python3
"""
Quick test to check if initial homepage load shows data
"""

from playwright.sync_api import sync_playwright
import time

def test_initial_load():
    print("Testing initial homepage load...")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()

        # Collect console messages
        console_messages = []
        page.on("console", lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))

        try:
            page.goto("http://localhost:3000", wait_until="networkidle", timeout=15000)
            time.sleep(3)

            # Take screenshot
            page.screenshot(path="test_initial_load.png")
            print("✓ Screenshot saved: test_initial_load.png")

            # Print console messages
            if console_messages:
                print("\n=== Console Messages ===")
                for msg in console_messages:
                    print(msg)
            else:
                print("\n✓ No console messages")

            # Check if map container exists
            map_container = page.locator('[data-testid="map-container"]')
            if map_container.count() > 0:
                print("✓ Map container found")
            else:
                print("✗ Map container NOT found")

        finally:
            browser.close()

if __name__ == "__main__":
    test_initial_load()
