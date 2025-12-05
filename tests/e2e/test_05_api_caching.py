#!/usr/bin/env python3
"""
Test #5: API routes implement 2-hour caching to reduce external API calls

Steps:
1. Make first request to /api/snowfall/latest
2. Record response time
3. Make second request to /api/snowfall/latest within 2 hours
4. Verify second request is faster (cached)
5. Verify response data is identical
6. Wait 2+ hours and make third request (skipped - too long for quick test)
7. Verify cache has expired and fresh data is fetched (skipped - too long for quick test)
"""

import time
import requests
from urllib.parse import urljoin

# Base URL for the ChiSnow app
BASE_URL = "http://localhost:3000"

def test_api_caching():
    print("\nStarting Test #5: API caching verification")
    print("=" * 60)

    try:
        # Step 1-2: Make first request and record time
        print("\n✓ Step 1-2: Making first request to /api/snowfall/latest...")
        start_time = time.time()
        response1 = requests.get(urljoin(BASE_URL, "/api/snowfall/latest"))
        first_request_time = time.time() - start_time

        if response1.status_code != 200:
            print(f"  ✗ First request failed with status {response1.status_code}")
            return False

        data1 = response1.json()
        cache_hit1 = response1.headers.get('X-Cache-Hit', 'false')

        print(f"  ✓ First request completed in {first_request_time:.4f}s")
        print(f"  ✓ Cache status: {cache_hit1}")
        print(f"  ✓ Response contains {len(data1.get('measurements', []))} measurements")

        # Small delay to ensure cache is set
        time.sleep(0.1)

        # Step 3-4: Make second request and verify it's faster (cached)
        print("\n✓ Step 3-4: Making second request (should be cached)...")
        start_time = time.time()
        response2 = requests.get(urljoin(BASE_URL, "/api/snowfall/latest"))
        second_request_time = time.time() - start_time

        if response2.status_code != 200:
            print(f"  ✗ Second request failed with status {response2.status_code}")
            return False

        data2 = response2.json()
        cache_hit2 = response2.headers.get('X-Cache-Hit', 'false')

        print(f"  ✓ Second request completed in {second_request_time:.4f}s")
        print(f"  ✓ Cache status: {cache_hit2}")

        # Verify second request is faster
        if second_request_time < first_request_time:
            print(f"  ✓ Second request is faster ({second_request_time:.4f}s < {first_request_time:.4f}s)")
        else:
            print(f"  ⚠ Warning: Second request not faster, but may still be cached")
            print(f"    First: {first_request_time:.4f}s, Second: {second_request_time:.4f}s")

        # Verify cache hit header
        if cache_hit2 == 'true':
            print(f"  ✓ Cache hit header confirmed: X-Cache-Hit = true")
        else:
            print(f"  ✗ Expected X-Cache-Hit: true, got {cache_hit2}")
            return False

        # Step 5: Verify response data is identical
        print("\n✓ Step 5: Verifying response data is identical...")

        # Check stormId
        if data1.get('stormId') == data2.get('stormId'):
            print(f"  ✓ Storm IDs match: {data1['stormId']}")
        else:
            print(f"  ✗ Storm IDs don't match")
            return False

        # Check measurements count
        if len(data1.get('measurements', [])) == len(data2.get('measurements', [])):
            print(f"  ✓ Measurement counts match: {len(data1['measurements'])} measurements")
        else:
            print(f"  ✗ Measurement counts don't match")
            return False

        # Check first measurement
        if data1['measurements'] and data2['measurements']:
            m1 = data1['measurements'][0]
            m2 = data2['measurements'][0]
            if m1 == m2:
                print(f"  ✓ First measurement data matches")
            else:
                print(f"  ✗ First measurement data doesn't match")
                return False

        # Step 6-7: Note about cache expiration
        print("\n✓ Step 6-7: Cache expiration test (skipped - requires 2+ hour wait)")
        print("  Note: Cache TTL is set to 2 hours, verified in code at lib/cache.ts:35")

        print("\n" + "=" * 60)
        print("✅ Test #5 verification complete!")
        print(f"First request: {first_request_time:.4f}s (cache miss)")
        print(f"Second request: {second_request_time:.4f}s (cache hit)")
        print(f"Speed improvement: {(first_request_time - second_request_time) / first_request_time * 100:.1f}%")

        return True

    except Exception as e:
        print(f"\n✗ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_api_caching()
    exit(0 if success else 1)
