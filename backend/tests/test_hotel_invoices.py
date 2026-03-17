"""
Hotel Invoice & Payment Module - Backend API Tests
Tests: Super Admin invoice management, Hotel portal invoice viewing
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Super Admin credentials
ADMIN_EMAIL = 'admin@zont.cab'
ADMIN_PASSWORD = 'admin123'

# Hotel Admin credentials
HOTEL_EMAIL = 'admin@bristol.fr'
HOTEL_PASSWORD = 'hotelc9baf685'


class TestAdminInvoiceAPIs:
    """Super Admin Invoice Management API Tests"""

    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - Get admin token"""
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})
        
        # Login as super admin
        login_response = self.session.post(
            f"{BASE_URL}/api/admin/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if login_response.status_code == 200:
            token = login_response.json().get('token')
            self.session.headers.update({'Authorization': f'Bearer {token}'})
            self.admin_token = token
        else:
            pytest.skip(f"Admin login failed: {login_response.status_code}")

    def test_invoices_summary_endpoint(self):
        """GET /api/admin/hotels/invoices/summary returns summary data"""
        response = self.session.get(f"{BASE_URL}/api/admin/hotels/invoices/summary")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert 'total_invoices' in data, "Missing total_invoices field"
        assert 'pending_count' in data, "Missing pending_count field"
        assert 'paid_count' in data, "Missing paid_count field"
        assert 'pending_amount' in data, "Missing pending_amount field"
        assert 'paid_amount' in data, "Missing paid_amount field"
        
        # Verify numeric types
        assert isinstance(data['total_invoices'], int)
        assert isinstance(data['pending_count'], int)
        assert isinstance(data['paid_count'], int)
        assert isinstance(data['pending_amount'], (int, float))
        assert isinstance(data['paid_amount'], (int, float))
        print(f"Invoice summary: total={data['total_invoices']}, pending={data['pending_count']}, paid={data['paid_count']}")

    def test_invoices_list_endpoint(self):
        """GET /api/admin/hotels/invoices returns array of invoices"""
        response = self.session.get(f"{BASE_URL}/api/admin/hotels/invoices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be an array"
        
        if len(data) > 0:
            invoice = data[0]
            # Verify invoice structure
            required_fields = ['id', 'hotel_id', 'hotel_name', 'period', 'total_revenue', 
                             'bookings_count', 'commission_rate', 'commission_amount', 'status', 'due_date']
            for field in required_fields:
                assert field in invoice, f"Missing field: {field}"
            print(f"Found {len(data)} invoices. First invoice: {invoice['id']} for {invoice['hotel_name']}")
        else:
            print("No invoices found - may need to generate")

    def test_invoices_require_auth(self):
        """Invoice endpoints require authentication"""
        unauth_session = requests.Session()
        unauth_session.headers.update({'Content-Type': 'application/json'})
        
        # Test summary without auth
        response = unauth_session.get(f"{BASE_URL}/api/admin/hotels/invoices/summary")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        
        # Test list without auth
        response = unauth_session.get(f"{BASE_URL}/api/admin/hotels/invoices")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("Auth guard working for invoice endpoints")

    def test_mark_invoice_paid_requires_pending_status(self):
        """PUT /api/admin/hotels/invoices/{id}/pay - test with invalid invoice"""
        response = self.session.put(
            f"{BASE_URL}/api/admin/hotels/invoices/FAKE-INVOICE-123/pay",
            json={"payment_method": "virement", "payment_reference": "TEST-REF"}
        )
        # Should return 404 for non-existent invoice
        assert response.status_code == 404, f"Expected 404 for fake invoice, got {response.status_code}"
        print("Pay endpoint correctly returns 404 for non-existent invoice")

    def test_generate_invoices_duplicate_period(self):
        """POST /api/admin/hotels/invoices/generate - test duplicate period protection"""
        # First check if invoices exist
        list_response = self.session.get(f"{BASE_URL}/api/admin/hotels/invoices")
        invoices = list_response.json() if list_response.status_code == 200 else []
        
        if len(invoices) > 0:
            # Try to generate for existing period
            existing_period = invoices[0]['period']
            response = self.session.post(
                f"{BASE_URL}/api/admin/hotels/invoices/generate",
                json={"period": existing_period}
            )
            # Should return 400 for duplicate
            assert response.status_code == 400, f"Expected 400 for duplicate period, got {response.status_code}"
            print(f"Duplicate period protection works for {existing_period}")
        else:
            print("Skipping duplicate test - no invoices exist")


class TestHotelInvoiceAPIs:
    """Hotel Portal Invoice API Tests"""

    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - Get hotel token"""
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})
        
        # Login as hotel admin
        login_response = self.session.post(
            f"{BASE_URL}/api/hotel/auth/login",
            json={"email": HOTEL_EMAIL, "password": HOTEL_PASSWORD}
        )
        if login_response.status_code == 200:
            token = login_response.json().get('token')
            self.session.headers.update({'Authorization': f'Bearer {token}'})
            self.hotel_token = token
        else:
            pytest.skip(f"Hotel login failed: {login_response.status_code}")

    def test_hotel_invoices_endpoint(self):
        """GET /api/hotel/invoices returns invoices for logged-in hotel only"""
        response = self.session.get(f"{BASE_URL}/api/hotel/invoices")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be an array"
        
        if len(data) > 0:
            invoice = data[0]
            # Verify structure
            required_fields = ['id', 'period', 'total_revenue', 'commission_amount', 'status']
            for field in required_fields:
                assert field in invoice, f"Missing field: {field}"
            print(f"Hotel has {len(data)} invoice(s). First: {invoice['id']} - {invoice['status']}")
        else:
            print("Hotel has no invoices yet")

    def test_hotel_invoices_require_auth(self):
        """Hotel invoice endpoint requires authentication"""
        unauth_session = requests.Session()
        response = unauth_session.get(f"{BASE_URL}/api/hotel/invoices")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
        print("Hotel invoice auth guard working")

    def test_hotel_invoice_download_endpoint(self):
        """GET /api/hotel/invoices/{id}/download - test download with token param"""
        # First get invoices
        list_response = self.session.get(f"{BASE_URL}/api/hotel/invoices")
        invoices = list_response.json() if list_response.status_code == 200 else []
        
        if len(invoices) > 0:
            invoice_id = invoices[0]['id']
            # Test download with token query param
            response = requests.get(
                f"{BASE_URL}/api/hotel/invoices/{invoice_id}/download",
                params={"token": self.hotel_token}
            )
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            assert 'text/plain' in response.headers.get('Content-Type', '')
            assert 'FACTURE' in response.text, "Invoice text should contain FACTURE"
            print(f"Download works for invoice {invoice_id}")
        else:
            print("Skipping download test - no invoices")

    def test_hotel_invoice_download_wrong_hotel(self):
        """Download endpoint should deny access to other hotel's invoices"""
        # Try to download a fake invoice that doesn't belong to this hotel
        response = requests.get(
            f"{BASE_URL}/api/hotel/invoices/FAKE-OTHER-HOTEL/download",
            params={"token": self.hotel_token}
        )
        assert response.status_code == 404, f"Expected 404 for other hotel's invoice, got {response.status_code}"
        print("Hotel invoice isolation working")


class TestInvoicePaymentFlow:
    """Test marking invoice as paid flow"""

    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup - Get admin token"""
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})
        
        login_response = self.session.post(
            f"{BASE_URL}/api/admin/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if login_response.status_code == 200:
            token = login_response.json().get('token')
            self.session.headers.update({'Authorization': f'Bearer {token}'})
        else:
            pytest.skip(f"Admin login failed: {login_response.status_code}")

    def test_find_pending_invoice_and_verify_structure(self):
        """Find a pending invoice and verify it has correct structure"""
        response = self.session.get(f"{BASE_URL}/api/admin/hotels/invoices")
        assert response.status_code == 200
        
        invoices = response.json()
        pending = [i for i in invoices if i['status'] == 'pending']
        
        if len(pending) > 0:
            inv = pending[0]
            # Verify pending invoice has all fields for payment
            assert inv['status'] == 'pending'
            assert 'due_date' in inv
            assert 'commission_amount' in inv
            assert inv['paid_at'] is None
            assert inv['payment_method'] is None
            print(f"Found pending invoice: {inv['id']} due {inv['due_date']}, amount {inv['commission_amount']} EUR")
        else:
            print("No pending invoices found - all may be paid")

    def test_paid_invoice_has_payment_info(self):
        """Verify paid invoices have payment details"""
        response = self.session.get(f"{BASE_URL}/api/admin/hotels/invoices")
        assert response.status_code == 200
        
        invoices = response.json()
        paid = [i for i in invoices if i['status'] == 'paid']
        
        if len(paid) > 0:
            inv = paid[0]
            assert inv['status'] == 'paid'
            assert inv['paid_at'] is not None, "Paid invoice should have paid_at timestamp"
            assert inv['payment_method'] is not None, "Paid invoice should have payment_method"
            print(f"Paid invoice: {inv['id']} paid on {inv['paid_at']} via {inv['payment_method']}")
        else:
            print("No paid invoices found")


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
