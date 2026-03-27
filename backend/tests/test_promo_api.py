"""
Test suite for Promo API endpoints
- POST /api/promo/generate - Generate promo code with email
- POST /api/promo/validate - Validate promo code
- POST /api/promo/mark-used - Mark promo code as used
- GET /api/promo/admin/emails - Admin endpoint to list collected emails
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestPromoGenerate:
    """Tests for POST /api/promo/generate endpoint"""
    
    def test_generate_promo_with_valid_email(self):
        """Generate promo code with valid email returns code, discount, expires_at"""
        test_email = f"test_promo_{int(time.time())}@example.com"
        response = requests.post(
            f"{BASE_URL}/api/promo/generate",
            json={"email": test_email},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "code" in data
        assert "discount" in data
        assert "expires_at" in data
        
        # Verify code format WELCOME-XXXXX
        assert data["code"].startswith("WELCOME-")
        assert len(data["code"]) == 13  # WELCOME- (8) + 5 chars
        
        # Verify discount is 10%
        assert data["discount"] == 10
        
        # Verify expires_at is a valid ISO timestamp
        assert "T" in data["expires_at"]
        
        # Store for cleanup
        self.generated_code = data["code"]
        print(f"Generated promo code: {data['code']} for {test_email}")
    
    def test_generate_promo_same_email_returns_existing(self):
        """Same email returns existing active code"""
        test_email = f"test_same_email_{int(time.time())}@example.com"
        
        # First request
        response1 = requests.post(
            f"{BASE_URL}/api/promo/generate",
            json={"email": test_email},
            headers={"Content-Type": "application/json"}
        )
        assert response1.status_code == 200
        data1 = response1.json()
        assert data1.get("already_exists") == False
        
        # Second request with same email
        response2 = requests.post(
            f"{BASE_URL}/api/promo/generate",
            json={"email": test_email},
            headers={"Content-Type": "application/json"}
        )
        assert response2.status_code == 200
        data2 = response2.json()
        
        # Should return same code with already_exists flag
        assert data2["code"] == data1["code"]
        assert data2.get("already_exists") == True
        print(f"Same email returned existing code: {data2['code']}")
    
    def test_generate_promo_invalid_email(self):
        """Invalid email returns error"""
        response = requests.post(
            f"{BASE_URL}/api/promo/generate",
            json={"email": "invalid-email"},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200  # API returns 200 with error in body
        data = response.json()
        assert "error" in data
        print(f"Invalid email error: {data['error']}")
    
    def test_generate_promo_empty_email(self):
        """Empty email returns error"""
        response = requests.post(
            f"{BASE_URL}/api/promo/generate",
            json={"email": ""},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "error" in data
        print(f"Empty email error: {data['error']}")


class TestPromoValidate:
    """Tests for POST /api/promo/validate endpoint"""
    
    def test_validate_valid_code(self):
        """Valid code returns valid:true with discount info"""
        # First generate a code
        test_email = f"test_validate_{int(time.time())}@example.com"
        gen_response = requests.post(
            f"{BASE_URL}/api/promo/generate",
            json={"email": test_email},
            headers={"Content-Type": "application/json"}
        )
        code = gen_response.json()["code"]
        
        # Validate the code
        response = requests.post(
            f"{BASE_URL}/api/promo/validate",
            json={"code": code},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["valid"] == True
        assert data["discount"] == 10
        assert data["code"] == code
        assert "expires_at" in data
        print(f"Validated code {code}: valid={data['valid']}, discount={data['discount']}%")
    
    def test_validate_invalid_code(self):
        """Invalid code returns valid:false"""
        response = requests.post(
            f"{BASE_URL}/api/promo/validate",
            json={"code": "INVALID-CODE"},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["valid"] == False
        assert "reason" in data
        print(f"Invalid code validation: valid={data['valid']}, reason={data['reason']}")
    
    def test_validate_code_case_insensitive(self):
        """Code validation is case insensitive"""
        # Generate a code
        test_email = f"test_case_{int(time.time())}@example.com"
        gen_response = requests.post(
            f"{BASE_URL}/api/promo/generate",
            json={"email": test_email},
            headers={"Content-Type": "application/json"}
        )
        code = gen_response.json()["code"]
        
        # Validate with lowercase
        response = requests.post(
            f"{BASE_URL}/api/promo/validate",
            json={"code": code.lower()},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] == True
        print(f"Case insensitive validation passed for {code.lower()}")


class TestPromoMarkUsed:
    """Tests for POST /api/promo/mark-used endpoint"""
    
    def test_mark_code_as_used(self):
        """Mark code as used returns ok:true"""
        # Generate a code
        test_email = f"test_markused_{int(time.time())}@example.com"
        gen_response = requests.post(
            f"{BASE_URL}/api/promo/generate",
            json={"email": test_email},
            headers={"Content-Type": "application/json"}
        )
        code = gen_response.json()["code"]
        
        # Mark as used
        response = requests.post(
            f"{BASE_URL}/api/promo/mark-used",
            json={"code": code},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["ok"] == True
        print(f"Marked code {code} as used: ok={data['ok']}")
        
        # Verify code is now invalid (used)
        validate_response = requests.post(
            f"{BASE_URL}/api/promo/validate",
            json={"code": code},
            headers={"Content-Type": "application/json"}
        )
        validate_data = validate_response.json()
        assert validate_data["valid"] == False
        assert "utilise" in validate_data.get("reason", "").lower() or "used" in validate_data.get("reason", "").lower()
        print(f"Used code validation: valid={validate_data['valid']}, reason={validate_data['reason']}")
    
    def test_mark_nonexistent_code(self):
        """Mark nonexistent code returns ok:false"""
        response = requests.post(
            f"{BASE_URL}/api/promo/mark-used",
            json={"code": "NONEXISTENT-CODE"},
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["ok"] == False
        print(f"Nonexistent code mark-used: ok={data['ok']}")


class TestPromoAdminEmails:
    """Tests for GET /api/promo/admin/emails endpoint"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/admin/auth/login",
            json={"email": "admin@zont.cab", "password": "admin123"},
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Admin authentication failed")
    
    def test_admin_emails_with_auth(self, admin_token):
        """Admin can list collected emails with valid token"""
        response = requests.get(
            f"{BASE_URL}/api/promo/admin/emails",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "emails" in data
        assert isinstance(data["emails"], list)
        print(f"Admin emails endpoint returned {len(data['emails'])} records")
        
        # If there are records, verify structure
        if len(data["emails"]) > 0:
            record = data["emails"][0]
            assert "email" in record
            assert "code" in record
            assert "discount" in record
            assert "created_at" in record
            assert "expires_at" in record
            print(f"Sample record: email={record['email']}, code={record['code']}")
    
    def test_admin_emails_without_auth(self):
        """Admin endpoint returns error without auth"""
        response = requests.get(f"{BASE_URL}/api/promo/admin/emails")
        assert response.status_code == 200  # API returns 200 with error in body
        data = response.json()
        assert "error" in data
        print(f"No auth error: {data['error']}")
    
    def test_admin_emails_invalid_token(self):
        """Admin endpoint returns error with invalid token"""
        response = requests.get(
            f"{BASE_URL}/api/promo/admin/emails",
            headers={"Authorization": "Bearer invalid-token"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "error" in data
        print(f"Invalid token error: {data['error']}")


class TestPromoIntegration:
    """Integration tests for full promo flow"""
    
    def test_full_promo_flow(self):
        """Test complete promo flow: generate -> validate -> mark-used"""
        test_email = f"test_flow_{int(time.time())}@example.com"
        
        # Step 1: Generate code
        gen_response = requests.post(
            f"{BASE_URL}/api/promo/generate",
            json={"email": test_email},
            headers={"Content-Type": "application/json"}
        )
        assert gen_response.status_code == 200
        gen_data = gen_response.json()
        code = gen_data["code"]
        print(f"Step 1 - Generated: {code}")
        
        # Step 2: Validate code (should be valid)
        val_response = requests.post(
            f"{BASE_URL}/api/promo/validate",
            json={"code": code},
            headers={"Content-Type": "application/json"}
        )
        assert val_response.status_code == 200
        val_data = val_response.json()
        assert val_data["valid"] == True
        print(f"Step 2 - Validated: valid={val_data['valid']}")
        
        # Step 3: Mark as used
        used_response = requests.post(
            f"{BASE_URL}/api/promo/mark-used",
            json={"code": code},
            headers={"Content-Type": "application/json"}
        )
        assert used_response.status_code == 200
        used_data = used_response.json()
        assert used_data["ok"] == True
        print(f"Step 3 - Marked used: ok={used_data['ok']}")
        
        # Step 4: Validate again (should be invalid - used)
        val2_response = requests.post(
            f"{BASE_URL}/api/promo/validate",
            json={"code": code},
            headers={"Content-Type": "application/json"}
        )
        assert val2_response.status_code == 200
        val2_data = val2_response.json()
        assert val2_data["valid"] == False
        print(f"Step 4 - Re-validated: valid={val2_data['valid']}, reason={val2_data.get('reason')}")
        
        print("Full promo flow completed successfully!")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
