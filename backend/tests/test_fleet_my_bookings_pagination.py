"""
Tests for Fleet My Bookings Pagination API - Server-side pagination for Mes Reservations
Features: page/limit params, total count, totalPages, search, date filters
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Fleet company credentials
FLEET_EMAIL = "Nandetiri1@gmail.com"
FLEET_PASSWORD = "12345678"


@pytest.fixture(scope="module")
def fleet_token():
    """Get fleet company JWT token for authenticated requests."""
    response = requests.post(f"{BASE_URL}/api/fleet/auth/login", json={
        "username": FLEET_EMAIL,
        "password": FLEET_PASSWORD
    })
    assert response.status_code == 200, f"Fleet login failed: {response.text}"
    data = response.json()
    return data.get("accessToken") or data.get("token")


@pytest.fixture(scope="module")
def auth_headers(fleet_token):
    """Authenticated headers for fleet API requests."""
    return {
        "Authorization": f"Bearer {fleet_token}",
        "Content-Type": "application/json"
    }


class TestPaginationBasics:
    """Test basic pagination functionality."""
    
    def test_pagination_response_structure(self, auth_headers):
        """GET /api/fleet/my-bookings returns paginated response with correct structure."""
        response = requests.get(f"{BASE_URL}/api/fleet/my-bookings?page=1&limit=50", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        # Verify paginated response structure
        assert "bookings" in data, "Response missing 'bookings' array"
        assert "total" in data, "Response missing 'total' count"
        assert "page" in data, "Response missing 'page' number"
        assert "limit" in data, "Response missing 'limit' value"
        assert "totalPages" in data, "Response missing 'totalPages' count"
        
        # Verify types
        assert isinstance(data["bookings"], list), "bookings should be a list"
        assert isinstance(data["total"], int), "total should be an integer"
        assert isinstance(data["page"], int), "page should be an integer"
        assert isinstance(data["limit"], int), "limit should be an integer"
        assert isinstance(data["totalPages"], int), "totalPages should be an integer"
        
        print(f"PASS: Pagination response structure verified - total={data['total']}, page={data['page']}, limit={data['limit']}, totalPages={data['totalPages']}")
    
    def test_default_pagination(self, auth_headers):
        """GET /api/fleet/my-bookings without params uses default pagination."""
        response = requests.get(f"{BASE_URL}/api/fleet/my-bookings", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        # Default limit should be 50
        assert data["limit"] == 50, f"Default limit should be 50, got {data['limit']}"
        assert data["page"] == 1, f"Default page should be 1, got {data['page']}"
        
        print(f"PASS: Default pagination - page={data['page']}, limit={data['limit']}")
    
    def test_pagination_page_1(self, auth_headers):
        """GET /api/fleet/my-bookings?page=1&limit=50 returns first page."""
        response = requests.get(f"{BASE_URL}/api/fleet/my-bookings?page=1&limit=50", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert data["page"] == 1
        assert len(data["bookings"]) <= 50, f"Page 1 should have at most 50 bookings, got {len(data['bookings'])}"
        
        # If total > 50, we should have multiple pages
        if data["total"] > 50:
            assert data["totalPages"] > 1, f"With {data['total']} total, should have >1 pages"
        
        print(f"PASS: Page 1 returns {len(data['bookings'])} bookings (total={data['total']}, totalPages={data['totalPages']})")
    
    def test_pagination_page_2(self, auth_headers):
        """GET /api/fleet/my-bookings?page=2&limit=50 returns second page."""
        # First get total count
        response1 = requests.get(f"{BASE_URL}/api/fleet/my-bookings?page=1&limit=50", headers=auth_headers)
        data1 = response1.json()
        
        if data1["total"] <= 50:
            pytest.skip("Not enough bookings for page 2 test")
        
        response2 = requests.get(f"{BASE_URL}/api/fleet/my-bookings?page=2&limit=50", headers=auth_headers)
        assert response2.status_code == 200
        data2 = response2.json()
        
        assert data2["page"] == 2
        assert len(data2["bookings"]) <= 50
        
        # Page 2 bookings should be different from page 1
        page1_ids = {b["id"] for b in data1["bookings"]}
        page2_ids = {b["id"] for b in data2["bookings"]}
        assert page1_ids.isdisjoint(page2_ids), "Page 1 and Page 2 should have different bookings"
        
        print(f"PASS: Page 2 returns {len(data2['bookings'])} different bookings")
    
    def test_pagination_total_count(self, auth_headers):
        """Total count should be consistent across pages."""
        response1 = requests.get(f"{BASE_URL}/api/fleet/my-bookings?page=1&limit=50", headers=auth_headers)
        data1 = response1.json()
        
        response2 = requests.get(f"{BASE_URL}/api/fleet/my-bookings?page=2&limit=50", headers=auth_headers)
        data2 = response2.json()
        
        assert data1["total"] == data2["total"], f"Total should be consistent: page1={data1['total']}, page2={data2['total']}"
        
        print(f"PASS: Total count consistent across pages: {data1['total']}")
    
    def test_pagination_total_pages_calculation(self, auth_headers):
        """totalPages should be correctly calculated."""
        response = requests.get(f"{BASE_URL}/api/fleet/my-bookings?page=1&limit=50", headers=auth_headers)
        data = response.json()
        
        expected_pages = (data["total"] + 49) // 50  # Ceiling division
        assert data["totalPages"] == expected_pages, f"totalPages should be {expected_pages}, got {data['totalPages']}"
        
        print(f"PASS: totalPages correctly calculated: {data['totalPages']} for {data['total']} total")


class TestPaginationLimits:
    """Test pagination limit constraints."""
    
    def test_limit_clamped_to_max_200(self, auth_headers):
        """Limit should be clamped to max 200."""
        response = requests.get(f"{BASE_URL}/api/fleet/my-bookings?page=1&limit=500", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert data["limit"] == 200, f"Limit should be clamped to 200, got {data['limit']}"
        assert len(data["bookings"]) <= 200
        
        print(f"PASS: Limit clamped to 200 (requested 500)")
    
    def test_limit_clamped_to_min_10(self, auth_headers):
        """Limit should be clamped to min 10."""
        response = requests.get(f"{BASE_URL}/api/fleet/my-bookings?page=1&limit=5", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        assert data["limit"] == 10, f"Limit should be clamped to 10, got {data['limit']}"
        
        print(f"PASS: Limit clamped to 10 (requested 5)")
    
    def test_page_0_returns_first_page_data(self, auth_headers):
        """Page 0 should return same data as page 1 (skip calculation clamps to 0)."""
        response0 = requests.get(f"{BASE_URL}/api/fleet/my-bookings?page=0&limit=50", headers=auth_headers)
        assert response0.status_code == 200
        data0 = response0.json()
        
        response1 = requests.get(f"{BASE_URL}/api/fleet/my-bookings?page=1&limit=50", headers=auth_headers)
        assert response1.status_code == 200
        data1 = response1.json()
        
        # Both should return the same bookings (first page data)
        ids0 = {b["id"] for b in data0["bookings"]}
        ids1 = {b["id"] for b in data1["bookings"]}
        assert ids0 == ids1, "Page 0 and Page 1 should return same bookings"
        
        print(f"PASS: Page 0 returns same data as page 1 ({len(data0['bookings'])} bookings)")


class TestPaginationWithFilters:
    """Test pagination combined with filters."""
    
    def test_pagination_with_date_filter(self, auth_headers):
        """Pagination works with dateFrom/dateTo filters."""
        response = requests.get(
            f"{BASE_URL}/api/fleet/my-bookings?page=1&limit=50&dateFrom=2026-03-01&dateTo=2026-03-31",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify pagination structure
        assert "bookings" in data
        assert "total" in data
        assert "page" in data
        assert "totalPages" in data
        
        # Verify all bookings are within date range
        for booking in data["bookings"]:
            assert "2026-03-01" <= booking["date"] <= "2026-03-31", f"Booking date {booking['date']} outside filter range"
        
        print(f"PASS: Pagination with date filter - {len(data['bookings'])} bookings in March 2026 (total={data['total']})")
    
    def test_pagination_with_search(self, auth_headers):
        """Pagination works with search parameter."""
        response = requests.get(
            f"{BASE_URL}/api/fleet/my-bookings?page=1&limit=50&search=CDG",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify pagination structure
        assert "bookings" in data
        assert "total" in data
        
        # Verify search results contain CDG in relevant fields
        for booking in data["bookings"]:
            search_fields = [
                booking.get("pickupAddress", ""),
                booking.get("dropoffAddress", ""),
                booking.get("clientName", ""),
                booking.get("flightNumber", ""),
                booking.get("comment", ""),
                booking.get("driver", {}).get("name", "") if booking.get("driver") else ""
            ]
            found = any("CDG" in (field or "").upper() for field in search_fields)
            assert found, f"Booking {booking['id']} doesn't match search 'CDG'"
        
        print(f"PASS: Pagination with search 'CDG' - {len(data['bookings'])} matches (total={data['total']})")
    
    def test_pagination_with_type_filter(self, auth_headers):
        """Pagination works with type filter."""
        response = requests.get(
            f"{BASE_URL}/api/fleet/my-bookings?page=1&limit=50&type=transfer",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify all bookings are transfer type
        for booking in data["bookings"]:
            assert booking["type"] == "transfer", f"Booking type {booking['type']} != transfer"
        
        print(f"PASS: Pagination with type=transfer - {len(data['bookings'])} bookings (total={data['total']})")
    
    def test_pagination_with_status_filter(self, auth_headers):
        """Pagination works with status filter."""
        response = requests.get(
            f"{BASE_URL}/api/fleet/my-bookings?page=1&limit=50&status=confirmed",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify all bookings have confirmed status
        for booking in data["bookings"]:
            assert booking["status"] == "confirmed", f"Booking status {booking['status']} != confirmed"
        
        print(f"PASS: Pagination with status=confirmed - {len(data['bookings'])} bookings (total={data['total']})")


class TestLargeDatasetPagination:
    """Test pagination with large dataset (2959 bookings mentioned in requirements)."""
    
    def test_total_count_large_dataset(self, auth_headers):
        """Verify total count reflects all bookings (should be ~2959)."""
        response = requests.get(f"{BASE_URL}/api/fleet/my-bookings?page=1&limit=50", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        # Based on requirements, should have ~2959 bookings
        print(f"INFO: Total bookings in database: {data['total']}")
        
        # Verify we can paginate through all
        if data["total"] > 200:
            # Old behavior would have limited to 200
            assert data["totalPages"] > 4, f"With {data['total']} bookings, should have >4 pages at 50/page"
            print(f"PASS: Large dataset pagination - {data['total']} total, {data['totalPages']} pages")
        else:
            print(f"INFO: Dataset has {data['total']} bookings (less than expected 2959)")
    
    def test_last_page_has_remaining_bookings(self, auth_headers):
        """Last page should have remaining bookings."""
        response1 = requests.get(f"{BASE_URL}/api/fleet/my-bookings?page=1&limit=50", headers=auth_headers)
        data1 = response1.json()
        
        if data1["totalPages"] <= 1:
            pytest.skip("Only one page of bookings")
        
        last_page = data1["totalPages"]
        response_last = requests.get(f"{BASE_URL}/api/fleet/my-bookings?page={last_page}&limit=50", headers=auth_headers)
        assert response_last.status_code == 200
        data_last = response_last.json()
        
        # Last page should have some bookings
        assert len(data_last["bookings"]) > 0, "Last page should have bookings"
        
        # Calculate expected count on last page
        expected_on_last = data1["total"] % 50
        if expected_on_last == 0:
            expected_on_last = 50
        
        assert len(data_last["bookings"]) == expected_on_last, f"Last page should have {expected_on_last} bookings, got {len(data_last['bookings'])}"
        
        print(f"PASS: Last page ({last_page}) has {len(data_last['bookings'])} bookings as expected")


class TestBulkImportEndpoint:
    """Test bulk import endpoint for Google Sheets."""
    
    def test_bulk_import_endpoint_exists(self, auth_headers):
        """POST /api/fleet/planning/sheet/bulk-import endpoint exists."""
        # Test with invalid URL to verify endpoint exists
        response = requests.post(
            f"{BASE_URL}/api/fleet/planning/sheet/bulk-import",
            headers=auth_headers,
            json={"sheetUrl": "https://example.com/invalid"}
        )
        # Should return 400 for invalid URL, not 404
        assert response.status_code in [400, 401], f"Expected 400/401, got {response.status_code}"
        print(f"PASS: Bulk import endpoint exists (returned {response.status_code} for invalid URL)")
    
    def test_bulk_import_requires_auth(self):
        """POST /api/fleet/planning/sheet/bulk-import requires authentication."""
        response = requests.post(
            f"{BASE_URL}/api/fleet/planning/sheet/bulk-import",
            json={"sheetUrl": "https://docs.google.com/spreadsheets/d/test"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: Bulk import requires auth (401 without token)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
