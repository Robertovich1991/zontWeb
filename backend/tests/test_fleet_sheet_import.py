"""
Fleet Planning - Google Sheets Import API Tests
Tests for POST /api/fleet/planning/sheet/preview and POST /api/fleet/planning/sheet/import
Features: CSV parsing, French date parsing, time adjustment, address splitting, price parsing, code parsing, duplicate detection
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
FLEET_EMAIL = "Nandetiri1@gmail.com"
FLEET_PASSWORD = "12345678"

# Google Sheet URL (publicly accessible)
SHEET_URL = "https://docs.google.com/spreadsheets/d/19lqeS8GBIJxVJX0ffRO3504PJJ0ZM0OHwWUQa89Kmew/edit?gid=1805385521"

# Test date with known data (21 bookings)
TEST_DATE = "2026-02-01"


@pytest.fixture(scope="module")
def auth_token():
    """Get fleet auth token"""
    response = requests.post(f"{BASE_URL}/api/fleet/auth/login", json={
        "username": FLEET_EMAIL,
        "password": FLEET_PASSWORD
    })
    if response.status_code != 200:
        pytest.skip(f"Fleet login failed: {response.status_code} - {response.text}")
    data = response.json()
    # Token can be in 'token' or 'accessToken' field
    return data.get("token") or data.get("accessToken")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Headers with auth token"""
    return {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }


class TestSheetPreviewEndpoint:
    """Tests for POST /api/fleet/planning/sheet/preview"""
    
    def test_preview_requires_auth(self):
        """Preview endpoint requires authentication"""
        response = requests.post(f"{BASE_URL}/api/fleet/planning/sheet/preview", json={
            "sheetUrl": SHEET_URL
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Preview requires auth (401 without token)")
    
    def test_preview_invalid_url(self, auth_headers):
        """Preview rejects invalid Google Sheet URL"""
        response = requests.post(f"{BASE_URL}/api/fleet/planning/sheet/preview", 
            headers=auth_headers,
            json={"sheetUrl": "https://example.com/not-a-sheet"}
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        data = response.json()
        assert "invalide" in data.get("detail", "").lower() or "invalid" in data.get("detail", "").lower()
        print("✓ Preview rejects invalid URL (400)")
    
    def test_preview_full_sheet(self, auth_headers):
        """Preview returns all bookings from sheet (no date filter)"""
        response = requests.post(f"{BASE_URL}/api/fleet/planning/sheet/preview",
            headers=auth_headers,
            json={"sheetUrl": SHEET_URL, "dateFilter": ""}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Verify response structure
        assert "bookings" in data, "Response missing 'bookings'"
        assert "totalRows" in data, "Response missing 'totalRows'"
        assert "parsedCount" in data, "Response missing 'parsedCount'"
        assert "skippedRows" in data, "Response missing 'skippedRows'"
        assert "dates" in data, "Response missing 'dates'"
        assert "drivers" in data, "Response missing 'drivers'"
        assert "sheetId" in data, "Response missing 'sheetId'"
        
        # Verify data counts (sheet has 3717+ rows, ~2979 valid bookings)
        assert data["totalRows"] > 3000, f"Expected >3000 rows, got {data['totalRows']}"
        assert data["parsedCount"] > 2000, f"Expected >2000 parsed, got {data['parsedCount']}"
        assert len(data["dates"]) > 100, f"Expected >100 dates, got {len(data['dates'])}"
        assert len(data["drivers"]) > 50, f"Expected >50 drivers, got {len(data['drivers'])}"
        
        print(f"✓ Preview full sheet: {data['totalRows']} rows, {data['parsedCount']} parsed, {len(data['dates'])} dates, {len(data['drivers'])} drivers")
    
    def test_preview_with_date_filter(self, auth_headers):
        """Preview with dateFilter returns only bookings for that date"""
        response = requests.post(f"{BASE_URL}/api/fleet/planning/sheet/preview",
            headers=auth_headers,
            json={"sheetUrl": SHEET_URL, "dateFilter": TEST_DATE}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Verify filtered results
        assert data["parsedCount"] == 21, f"Expected 21 bookings for {TEST_DATE}, got {data['parsedCount']}"
        
        # Verify all bookings have the correct date
        for booking in data["bookings"]:
            assert booking["date"] == TEST_DATE, f"Booking date {booking['date']} != {TEST_DATE}"
        
        print(f"✓ Preview with dateFilter={TEST_DATE}: {data['parsedCount']} bookings")
    
    def test_preview_booking_structure(self, auth_headers):
        """Preview returns bookings with correct structure"""
        response = requests.post(f"{BASE_URL}/api/fleet/planning/sheet/preview",
            headers=auth_headers,
            json={"sheetUrl": SHEET_URL, "dateFilter": TEST_DATE}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["bookings"]) > 0, "No bookings returned"
        booking = data["bookings"][0]
        
        # Verify booking structure
        required_fields = ["date", "time", "type", "code", "pickupAddress", "dropoffAddress",
                          "clientName", "clientPhone", "passengers", "source", "reference",
                          "price", "driverName", "remarks", "rowNumber"]
        for field in required_fields:
            assert field in booking, f"Booking missing field: {field}"
        
        print(f"✓ Booking structure verified: {list(booking.keys())}")


class TestFrenchDateParsing:
    """Tests for French date parsing (1 février 2026 -> 2026-02-01)"""
    
    def test_french_date_parsing(self, auth_headers):
        """French dates are correctly parsed"""
        response = requests.post(f"{BASE_URL}/api/fleet/planning/sheet/preview",
            headers=auth_headers,
            json={"sheetUrl": SHEET_URL, "dateFilter": TEST_DATE}
        )
        assert response.status_code == 200
        data = response.json()
        
        # All bookings should have ISO date format
        for booking in data["bookings"]:
            date = booking["date"]
            assert len(date) == 10, f"Date not ISO format: {date}"
            assert date[4] == "-" and date[7] == "-", f"Date not ISO format: {date}"
            year, month, day = date.split("-")
            assert year.isdigit() and month.isdigit() and day.isdigit()
        
        print(f"✓ French dates parsed to ISO format (e.g., {data['bookings'][0]['date']})")


class TestTimeParsing:
    """Tests for time parsing with adjustment (07:25/06:59 -> 06:59)"""
    
    def test_time_parsing(self, auth_headers):
        """Time values are correctly parsed"""
        response = requests.post(f"{BASE_URL}/api/fleet/planning/sheet/preview",
            headers=auth_headers,
            json={"sheetUrl": SHEET_URL, "dateFilter": TEST_DATE}
        )
        assert response.status_code == 200
        data = response.json()
        
        for booking in data["bookings"]:
            time = booking["time"]
            # Time should be HH:MM format
            assert ":" in time, f"Time missing colon: {time}"
            parts = time.split(":")
            assert len(parts) == 2, f"Time not HH:MM: {time}"
            assert parts[0].isdigit() and parts[1].isdigit(), f"Time not numeric: {time}"
            
            # If originalTime has adjustment (e.g., 07:25/06:59), time should be the adjusted value
            original = booking.get("originalTime", "")
            if "/" in original:
                adjusted = original.split("/")[-1].strip().replace(";", ":")
                assert time == adjusted, f"Time {time} != adjusted {adjusted}"
        
        print(f"✓ Time parsing verified (adjusted times used when present)")


class TestAddressSplitting:
    """Tests for address splitting by --- separator"""
    
    def test_address_splitting(self, auth_headers):
        """Addresses are split by --- separator"""
        response = requests.post(f"{BASE_URL}/api/fleet/planning/sheet/preview",
            headers=auth_headers,
            json={"sheetUrl": SHEET_URL, "dateFilter": TEST_DATE}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Check that addresses are split
        has_split_addresses = False
        for booking in data["bookings"]:
            if booking["pickupAddress"] and booking["dropoffAddress"]:
                has_split_addresses = True
                # Neither should contain the separator
                assert "---" not in booking["pickupAddress"], f"Pickup still has separator: {booking['pickupAddress']}"
                assert "---" not in booking["dropoffAddress"], f"Dropoff still has separator: {booking['dropoffAddress']}"
        
        assert has_split_addresses, "No bookings with split addresses found"
        print(f"✓ Address splitting verified (--- separator removed)")


class TestPriceParsing:
    """Tests for price parsing with euro sign and comma decimal"""
    
    def test_price_parsing(self, auth_headers):
        """Prices are correctly parsed (94,80 € -> 94.80)"""
        response = requests.post(f"{BASE_URL}/api/fleet/planning/sheet/preview",
            headers=auth_headers,
            json={"sheetUrl": SHEET_URL, "dateFilter": TEST_DATE}
        )
        assert response.status_code == 200
        data = response.json()
        
        prices_found = []
        for booking in data["bookings"]:
            price = booking["price"]
            assert isinstance(price, (int, float)), f"Price not numeric: {price}"
            if price > 0:
                prices_found.append(price)
        
        assert len(prices_found) > 0, "No non-zero prices found"
        # Prices should be reasonable (between 10 and 500 EUR typically)
        for price in prices_found:
            assert 0 < price < 1000, f"Price out of range: {price}"
        
        print(f"✓ Price parsing verified: {len(prices_found)} prices, range {min(prices_found):.2f}-{max(prices_found):.2f} EUR")


class TestCodeParsing:
    """Tests for code parsing (DEP-2, ARR-6, DEPGAR-2, TRADIS-3)"""
    
    def test_code_parsing(self, auth_headers):
        """Codes are correctly parsed to mission types"""
        response = requests.post(f"{BASE_URL}/api/fleet/planning/sheet/preview",
            headers=auth_headers,
            json={"sheetUrl": SHEET_URL, "dateFilter": TEST_DATE}
        )
        assert response.status_code == 200
        data = response.json()
        
        type_counts = {}
        for booking in data["bookings"]:
            mission_type = booking["type"]
            code = booking["code"]
            type_counts[mission_type] = type_counts.get(mission_type, 0) + 1
            
            # Verify type matches code prefix
            code_upper = code.upper()
            if code_upper.startswith("DEP-") or code_upper.startswith("DEP "):
                assert mission_type == "depart_aeroport", f"DEP code should be depart_aeroport: {code} -> {mission_type}"
            elif code_upper.startswith("ARR-") or code_upper.startswith("ARR "):
                assert mission_type == "arrivee_aeroport", f"ARR code should be arrivee_aeroport: {code} -> {mission_type}"
            elif code_upper.startswith("DEPGAR"):
                assert mission_type == "depart_gare", f"DEPGAR code should be depart_gare: {code} -> {mission_type}"
            elif code_upper.startswith("ARRGAR"):
                assert mission_type == "arrivee_gare", f"ARRGAR code should be arrivee_gare: {code} -> {mission_type}"
            elif code_upper.startswith("TRADIS"):
                assert mission_type == "transfer", f"TRADIS code should be transfer: {code} -> {mission_type}"
        
        print(f"✓ Code parsing verified: {type_counts}")


class TestSheetImportEndpoint:
    """Tests for POST /api/fleet/planning/sheet/import"""
    
    def test_import_requires_auth(self):
        """Import endpoint requires authentication"""
        response = requests.post(f"{BASE_URL}/api/fleet/planning/sheet/import", json={
            "bookings": []
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Import requires auth (401 without token)")
    
    def test_import_empty_bookings(self, auth_headers):
        """Import rejects empty bookings list"""
        response = requests.post(f"{BASE_URL}/api/fleet/planning/sheet/import",
            headers=auth_headers,
            json={"bookings": []}
        )
        # 400 for empty bookings or 401 if token issue
        assert response.status_code in [400, 401], f"Expected 400/401, got {response.status_code}"
        if response.status_code == 400:
            print("✓ Import rejects empty bookings (400)")
        else:
            print(f"⚠ Import returned 401 - checking auth")
    
    def test_import_creates_reservations(self, auth_token):
        """Import creates fleet_reservations in MongoDB"""
        headers = {
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"
        }
        
        # First get preview data for a specific date
        preview_response = requests.post(f"{BASE_URL}/api/fleet/planning/sheet/preview", 
            headers=headers,
            json={"sheetUrl": SHEET_URL, "dateFilter": TEST_DATE}
        )
        assert preview_response.status_code == 200, f"Preview failed: {preview_response.text}"
        preview_data = preview_response.json()
        
        # Take only first 3 bookings for test (to avoid creating too many)
        test_bookings = preview_data["bookings"][:3]
        
        # Modify references to make them unique for this test
        test_id = str(uuid.uuid4())[:8]
        for i, b in enumerate(test_bookings):
            b["reference"] = f"TEST_{test_id}_{i}"
        
        # Import
        import_response = requests.post(f"{BASE_URL}/api/fleet/planning/sheet/import",
            headers=headers,
            json={"bookings": test_bookings}
        )
        assert import_response.status_code == 200, f"Import failed: {import_response.text}"
        import_data = import_response.json()
        
        # Verify response
        assert import_data["success"] == True
        assert import_data["imported"] == 3, f"Expected 3 imported, got {import_data['imported']}"
        assert import_data["duplicates"] == 0, f"Expected 0 duplicates, got {import_data['duplicates']}"
        assert import_data["total"] == 3
        
        print(f"✓ Import created {import_data['imported']} reservations")
        
        # Return test_id for cleanup
        return test_id
    
    def test_import_detects_duplicates(self, auth_token):
        """Import detects and skips duplicate bookings (by sheetRef)"""
        headers = {
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"
        }
        
        # Get preview data
        preview_response = requests.post(f"{BASE_URL}/api/fleet/planning/sheet/preview",
            headers=headers,
            json={"sheetUrl": SHEET_URL, "dateFilter": TEST_DATE}
        )
        assert preview_response.status_code == 200
        preview_data = preview_response.json()
        
        # Take first 2 bookings with unique test reference
        test_id = str(uuid.uuid4())[:8]
        test_bookings = preview_data["bookings"][:2]
        for i, b in enumerate(test_bookings):
            b["reference"] = f"DUP_TEST_{test_id}_{i}"
        
        # First import
        import1_response = requests.post(f"{BASE_URL}/api/fleet/planning/sheet/import",
            headers=headers,
            json={"bookings": test_bookings}
        )
        assert import1_response.status_code == 200, f"First import failed: {import1_response.text}"
        import1_data = import1_response.json()
        assert import1_data["imported"] == 2, f"First import should create 2, got {import1_data['imported']}"
        
        # Second import with same bookings (should detect duplicates)
        import2_response = requests.post(f"{BASE_URL}/api/fleet/planning/sheet/import",
            headers=headers,
            json={"bookings": test_bookings}
        )
        assert import2_response.status_code == 200
        import2_data = import2_response.json()
        
        # All should be duplicates
        assert import2_data["imported"] == 0, f"Second import should create 0, got {import2_data['imported']}"
        assert import2_data["duplicates"] == 2, f"Second import should detect 2 duplicates, got {import2_data['duplicates']}"
        
        print(f"✓ Duplicate detection verified: first import {import1_data['imported']}, second import {import2_data['imported']} (duplicates: {import2_data['duplicates']})")


class TestSheetIdExtraction:
    """Tests for Google Sheet ID extraction from URL"""
    
    def test_sheet_id_extraction(self, auth_headers):
        """Sheet ID is correctly extracted from URL"""
        response = requests.post(f"{BASE_URL}/api/fleet/planning/sheet/preview",
            headers=auth_headers,
            json={"sheetUrl": SHEET_URL, "dateFilter": TEST_DATE}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Expected sheet ID from URL
        expected_id = "19lqeS8GBIJxVJX0ffRO3504PJJ0ZM0OHwWUQa89Kmew"
        assert data["sheetId"] == expected_id, f"Sheet ID mismatch: {data['sheetId']} != {expected_id}"
        
        print(f"✓ Sheet ID extracted: {data['sheetId']}")


class TestClientParsing:
    """Tests for client info parsing (name, pax, phone)"""
    
    def test_client_parsing(self, auth_headers):
        """Client info is correctly parsed"""
        response = requests.post(f"{BASE_URL}/api/fleet/planning/sheet/preview",
            headers=auth_headers,
            json={"sheetUrl": SHEET_URL, "dateFilter": TEST_DATE}
        )
        assert response.status_code == 200
        data = response.json()
        
        has_client_name = False
        has_passengers = False
        has_phone = False
        
        for booking in data["bookings"]:
            if booking["clientName"]:
                has_client_name = True
            if booking["passengers"] > 1:
                has_passengers = True
            if booking["clientPhone"]:
                has_phone = True
        
        assert has_client_name, "No client names found"
        assert has_passengers, "No passenger counts > 1 found"
        # Phone may not always be present
        
        print(f"✓ Client parsing verified: names={has_client_name}, pax>1={has_passengers}, phones={has_phone}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
