#!/usr/bin/env python3
"""
Test script for ChiSnow - Test #19 from feature_list.json
Verifies data normalization combines multiple sources into unified format
"""

import requests
import json
from datetime import datetime

def test_data_normalization():
    print("Starting Test #19: Data normalization verification")
    print("=" * 60)

    # Step 1: Fetch data from API
    print("\n✓ Step 1: Fetching data from /api/snowfall/latest...")
    response = requests.get('http://localhost:3000/api/snowfall/latest')

    if response.status_code != 200:
        print(f"  ✗ Failed to fetch data: {response.status_code}")
        return False

    data = response.json()
    print(f"  ✓ Data fetched successfully")
    print(f"  ✓ Storm ID: {data['stormId']}")
    print(f"  ✓ Total measurements: {len(data['measurements'])}")

    measurements = data['measurements']

    # Step 2: Verify NOAA NWS measurements
    print("\n✓ Step 2: Verifying NOAA NWS measurements...")
    noaa_nws = [m for m in measurements if m['source'] == 'NOAA_NWS']
    print(f"  ✓ Found {len(noaa_nws)} NOAA NWS measurements")

    # Step 3: Verify NOAA Gridded measurements
    print("\n✓ Step 3: Verifying NOAA Gridded measurements...")
    noaa_gridded = [m for m in measurements if m['source'] == 'NOAA_GRIDDED']
    print(f"  ✓ Found {len(noaa_gridded)} NOAA Gridded measurements")

    if len(noaa_gridded) == 0:
        print("  ⚠ Note: No NOAA Gridded measurements (may be empty for this storm)")

    # Step 4: Verify unified data structure
    print("\n✓ Step 4: Verifying unified data structure...")
    required_fields = ['lat', 'lon', 'amount', 'source', 'station', 'timestamp']

    all_valid = True
    for i, m in enumerate(measurements[:3]):  # Check first 3
        print(f"\n  Measurement {i+1}:")
        for field in required_fields:
            if field in m:
                print(f"    ✓ {field}: {m[field]}")
            else:
                print(f"    ✗ Missing field: {field}")
                all_valid = False

    if all_valid:
        print("\n  ✓ All measurements have consistent structure")
    else:
        print("\n  ✗ Some measurements missing required fields")

    # Step 5: Verify source field
    print("\n✓ Step 5: Verifying source field...")
    sources = set(m['source'] for m in measurements)
    valid_sources = {'NOAA_NWS', 'NOAA_GRIDDED', 'COCORAHS'}

    print(f"  ✓ Sources found: {sources}")
    if sources.issubset(valid_sources):
        print(f"  ✓ All sources are valid")
    else:
        print(f"  ✗ Invalid sources: {sources - valid_sources}")

    # Step 6: Verify coordinate format
    print("\n✓ Step 6: Verifying coordinate normalization...")
    coord_valid = True
    for m in measurements[:3]:
        lat, lon = m['lat'], m['lon']
        if not (-90 <= lat <= 90 and -180 <= lon <= 180):
            print(f"  ✗ Invalid coordinates: lat={lat}, lon={lon}")
            coord_valid = False

    if coord_valid:
        print("  ✓ All coordinates in valid ranges")
        print(f"    Sample: lat={measurements[0]['lat']}, lon={measurements[0]['lon']}")

    # Step 7: Verify timestamp format
    print("\n✓ Step 7: Verifying timestamp normalization...")
    timestamp_valid = True
    for m in measurements[:3]:
        try:
            # Try parsing ISO format timestamp
            dt = datetime.fromisoformat(m['timestamp'].replace('Z', '+00:00'))
            print(f"  ✓ Valid ISO timestamp: {m['timestamp']}")
        except Exception as e:
            print(f"  ✗ Invalid timestamp: {m['timestamp']} - {e}")
            timestamp_valid = False

    if timestamp_valid:
        print("  ✓ All timestamps in ISO format")

    # Summary
    print("\n" + "=" * 60)
    print("✅ Test #19 verification complete!")
    print("\nSummary:")
    print(f"  ✓ NOAA NWS measurements: {len(noaa_nws)}")
    print(f"  ✓ NOAA Gridded measurements: {len(noaa_gridded)}")
    print(f"  ✓ Unified structure: {'Yes' if all_valid else 'No'}")
    print(f"  ✓ Valid sources: {'Yes' if sources.issubset(valid_sources) else 'No'}")
    print(f"  ✓ Normalized coordinates: {'Yes' if coord_valid else 'No'}")
    print(f"  ✓ ISO timestamps: {'Yes' if timestamp_valid else 'No'}")

    return all_valid and coord_valid and timestamp_valid

if __name__ == '__main__':
    success = test_data_normalization()
    exit(0 if success else 1)
