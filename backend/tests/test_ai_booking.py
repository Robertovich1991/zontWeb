"""
Test AI Booking Parse API - Tests for POST /api/booking/ai-parse endpoint
Uses Gemini Flash via emergentintegrations to parse natural language booking text
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestAIBookingParse:
    """Tests for AI-assisted booking text parser endpoint"""

    def test_health_check(self):
        """Verify API is accessible"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        print("✓ API health check passed")

    def test_normal_booking_text_french(self):
        """Test parsing a complete French booking request"""
        payload = {
            "text": "CDG demain 14h vers Hilton Opera 2 personnes",
            "locale": "fr",
            "source": "homepage_ai"
        }
        response = requests.post(
            f"{BASE_URL}/api/booking/ai-parse",
            json=payload,
            timeout=30  # LLM can take 1-3 seconds
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Verify response structure
        assert "success" in data, "Response missing 'success' field"
        assert "confidence" in data, "Response missing 'confidence' field"
        assert "data" in data, "Response missing 'data' field"
        assert "missing_fields" in data, "Response missing 'missing_fields' field"
        
        # Verify data structure
        assert "pickup" in data["data"], "Data missing 'pickup' field"
        assert "dropoff" in data["data"], "Data missing 'dropoff' field"
        assert "date" in data["data"], "Data missing 'date' field"
        assert "time" in data["data"], "Data missing 'time' field"
        assert "passengers" in data["data"], "Data missing 'passengers' field"
        
        # For a complete request, confidence should be high
        assert data["confidence"] >= 0.5, f"Expected confidence >= 0.5, got {data['confidence']}"
        
        # Verify pickup contains CDG reference
        if data["data"]["pickup"]:
            assert "CDG" in data["data"]["pickup"].upper() or "CHARLES DE GAULLE" in data["data"]["pickup"].upper(), \
                f"Pickup should reference CDG, got: {data['data']['pickup']}"
        
        # Verify dropoff contains Hilton reference
        if data["data"]["dropoff"]:
            assert "HILTON" in data["data"]["dropoff"].upper() or "OPERA" in data["data"]["dropoff"].upper(), \
                f"Dropoff should reference Hilton Opera, got: {data['data']['dropoff']}"
        
        print(f"✓ Normal French booking parsed - confidence: {data['confidence']}")
        print(f"  Pickup: {data['data']['pickup']}")
        print(f"  Dropoff: {data['data']['dropoff']}")
        print(f"  Date: {data['data']['date']}")
        print(f"  Time: {data['data']['time']}")
        print(f"  Passengers: {data['data']['passengers']}")

    def test_normal_booking_text_english(self):
        """Test parsing a complete English booking request"""
        payload = {
            "text": "Paris CDG tomorrow 3pm to Eiffel Tower 4 passengers",
            "locale": "en",
            "source": "homepage_ai"
        }
        response = requests.post(
            f"{BASE_URL}/api/booking/ai-parse",
            json=payload,
            timeout=30
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "success" in data
        assert "confidence" in data
        assert data["confidence"] >= 0.5, f"Expected confidence >= 0.5, got {data['confidence']}"
        
        print(f"✓ Normal English booking parsed - confidence: {data['confidence']}")
        print(f"  Pickup: {data['data']['pickup']}")
        print(f"  Dropoff: {data['data']['dropoff']}")

    def test_empty_text(self):
        """Test handling of empty text - should return success:false"""
        payload = {
            "text": "",
            "locale": "fr",
            "source": "homepage_ai"
        }
        response = requests.post(
            f"{BASE_URL}/api/booking/ai-parse",
            json=payload,
            timeout=10
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] == False, "Empty text should return success:false"
        assert data["confidence"] == 0, "Empty text should have 0 confidence"
        
        print("✓ Empty text handled correctly - success:false")

    def test_short_text(self):
        """Test handling of very short text (< 3 chars) - should return success:false"""
        payload = {
            "text": "ab",
            "locale": "fr",
            "source": "homepage_ai"
        }
        response = requests.post(
            f"{BASE_URL}/api/booking/ai-parse",
            json=payload,
            timeout=10
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] == False, "Short text should return success:false"
        assert "text too short" in data["missing_fields"], "Should indicate text too short"
        
        print("✓ Short text handled correctly - success:false")

    def test_ambiguous_text(self):
        """Test handling of ambiguous text with only pickup - should return lower confidence"""
        payload = {
            "text": "juste CDG",
            "locale": "fr",
            "source": "homepage_ai"
        }
        response = requests.post(
            f"{BASE_URL}/api/booking/ai-parse",
            json=payload,
            timeout=30
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Ambiguous text should have missing fields
        assert len(data["missing_fields"]) > 0, "Ambiguous text should have missing fields"
        
        print(f"✓ Ambiguous text handled - confidence: {data['confidence']}")
        print(f"  Missing fields: {data['missing_fields']}")

    def test_non_transfer_text(self):
        """Test handling of non-transfer related text"""
        payload = {
            "text": "bonjour comment allez-vous",
            "locale": "fr",
            "source": "homepage_ai"
        }
        response = requests.post(
            f"{BASE_URL}/api/booking/ai-parse",
            json=payload,
            timeout=30
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Non-transfer text should have low confidence or missing fields
        # The LLM should recognize this isn't a booking request
        print(f"✓ Non-transfer text handled - confidence: {data['confidence']}")
        print(f"  Success: {data['success']}")
        print(f"  Missing fields: {data['missing_fields']}")

    def test_response_structure_complete(self):
        """Verify complete response structure matches AIParseResponse model"""
        payload = {
            "text": "Nice airport to Monaco tomorrow 10am",
            "locale": "en",
            "source": "homepage_ai"
        }
        response = requests.post(
            f"{BASE_URL}/api/booking/ai-parse",
            json=payload,
            timeout=30
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify all required fields exist
        required_fields = ["success", "confidence", "data", "missing_fields"]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        
        # Verify data sub-fields
        data_fields = ["pickup", "dropoff", "date", "time", "passengers"]
        for field in data_fields:
            assert field in data["data"], f"Missing data field: {field}"
        
        # Verify types
        assert isinstance(data["success"], bool), "success should be boolean"
        assert isinstance(data["confidence"], (int, float)), "confidence should be numeric"
        assert isinstance(data["missing_fields"], list), "missing_fields should be list"
        
        print("✓ Response structure is complete and valid")

    def test_airport_code_expansion(self):
        """Test that airport codes are expanded to full names"""
        payload = {
            "text": "ORY vers centre ville Paris demain 9h",
            "locale": "fr",
            "source": "homepage_ai"
        }
        response = requests.post(
            f"{BASE_URL}/api/booking/ai-parse",
            json=payload,
            timeout=30
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # ORY should be expanded to Orly
        if data["data"]["pickup"]:
            pickup_upper = data["data"]["pickup"].upper()
            assert "ORLY" in pickup_upper or "ORY" in pickup_upper, \
                f"Pickup should reference Orly, got: {data['data']['pickup']}"
        
        print(f"✓ Airport code expansion - pickup: {data['data']['pickup']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
