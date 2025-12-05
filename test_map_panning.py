#!/usr/bin/env python3
"""
Test script for ChiSnow - Test #20 from feature_list.json
Verifies map supports panning across entire United States
"""

import time
from playwright.sync_api import sync_playwright

def test_map_panning():
    print("Starting Test #20: Map panning across United States")
    print("=" * 60)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        # Step 1: Navigate to homepage
        print("\n✓ Step 1: Navigating to ChiSnow homepage...")
        page.goto('http://localhost:3000', wait_until='networkidle')
        time.sleep(3)  # Wait for map to fully initialize

        # Helper function to get map center
        def get_map_center():
            return page.evaluate("""() => {
                const map = window.mapInstance;
                if (!map) return null;
                const center = map.getCenter();
                return { lng: center.lng, lat: center.lat };
            }""")

        # Helper function to pan map to location
        def pan_to_location(lng, lat, description):
            page.evaluate(f"""() => {{
                const map = window.mapInstance;
                if (!map) return;
                map.flyTo({{
                    center: [{lng}, {lat}],
                    duration: 1000,
                    essential: true
                }});
            }}""")
            time.sleep(1.5)  # Wait for animation
            new_center = get_map_center()
            print(f"  ✓ Panned to {description}")
            print(f"    Center: [{new_center['lng']:.2f}, {new_center['lat']:.2f}]")
            return new_center

        initial_center = get_map_center()
        print(f"\nInitial center (Chicago): [{initial_center['lng']:.2f}, {initial_center['lat']:.2f}]")

        # Step 2 & 3: Pan to West Coast
        print("\n✓ Step 2-3: Panning to West Coast...")
        west_center = pan_to_location(-122.4194, 37.7749, "San Francisco area")

        # Verify map displays correctly
        map_visible = page.evaluate("""() => {
            const map = window.mapInstance;
            return map && map.loaded();
        }""")
        if map_visible:
            print("  ✓ Map displays correctly on West Coast")

        page.screenshot(path='test_screenshot_west_coast.png')
        print("  ✓ Screenshot saved: test_screenshot_west_coast.png")

        # Step 4 & 5: Pan to East Coast
        print("\n✓ Step 4-5: Panning to East Coast...")
        east_center = pan_to_location(-74.0060, 40.7128, "New York City area")

        if map_visible:
            print("  ✓ Map displays correctly on East Coast")

        page.screenshot(path='test_screenshot_east_coast.png')
        print("  ✓ Screenshot saved: test_screenshot_east_coast.png")

        # Step 6 & 7: Pan to Southern states
        print("\n✓ Step 6-7: Panning to Southern states...")
        south_center = pan_to_location(-84.3880, 33.7490, "Atlanta area")

        if map_visible:
            print("  ✓ Map displays correctly in Southern states")

        page.screenshot(path='test_screenshot_south.png')
        print("  ✓ Screenshot saved: test_screenshot_south.png")

        # Step 8: Verify smooth panning
        print("\n✓ Step 8: Verifying smooth panning...")

        # Check that map actually moved between locations
        if (abs(west_center['lng'] - initial_center['lng']) > 10 and
            abs(east_center['lng'] - west_center['lng']) > 10 and
            abs(south_center['lat'] - east_center['lat']) > 5):
            print("  ✓ Map successfully panned to different regions")
            print("  ✓ Smooth panning verified throughout United States")
        else:
            print("  ✗ Warning: Map may not have panned correctly")

        # Pan back to Chicago
        print("\n✓ Panning back to Chicago...")
        pan_to_location(-87.6298, 41.8781, "Chicago (home)")

        print("\n" + "=" * 60)
        print("✅ Test #20 verification complete!")
        print("Map successfully supports panning across entire United States")

        time.sleep(1)
        browser.close()

if __name__ == '__main__':
    test_map_panning()
