"""
Admin CMS API Tests
Tests for admin authentication, pages, places, trust blocks, FAQs, and homepage endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAdminAuth:
    """Admin Authentication endpoint tests"""
    
    def test_login_success(self):
        """Test admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/auth/login", json={
            "email": "admin@zont.cab",
            "password": "admin123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == "admin@zont.cab"
        assert data["user"]["role"] == "admin"
    
    def test_login_invalid_credentials(self):
        """Test admin login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/auth/login", json={
            "email": "admin@zont.cab",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
    
    def test_me_endpoint_authenticated(self, auth_token):
        """Test /me endpoint with valid token"""
        response = requests.get(f"{BASE_URL}/api/admin/auth/me", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "admin@zont.cab"
    
    def test_me_endpoint_no_token(self):
        """Test /me endpoint without token"""
        response = requests.get(f"{BASE_URL}/api/admin/auth/me")
        assert response.status_code == 401


class TestAdminPages:
    """Admin Pages CRUD tests"""
    created_page_id = None
    
    def test_list_pages(self, auth_token):
        """Test listing pages"""
        response = requests.get(f"{BASE_URL}/api/admin/pages", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_create_page(self, auth_token):
        """Test creating a new page"""
        response = requests.post(f"{BASE_URL}/api/admin/pages", headers={
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"
        }, json={
            "internal_name": "TEST_Page_Pytest",
            "page_type": "city",
            "slug": {"fr": "test-page-pytest", "en": "test-page-pytest-en"},
            "status": "draft"
        })
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["internal_name"] == "TEST_Page_Pytest"
        TestAdminPages.created_page_id = data["id"]
    
    def test_get_page(self, auth_token):
        """Test getting a single page"""
        if not TestAdminPages.created_page_id:
            pytest.skip("No page created")
        response = requests.get(f"{BASE_URL}/api/admin/pages/{TestAdminPages.created_page_id}", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["internal_name"] == "TEST_Page_Pytest"
    
    def test_update_page(self, auth_token):
        """Test updating a page"""
        if not TestAdminPages.created_page_id:
            pytest.skip("No page created")
        response = requests.put(f"{BASE_URL}/api/admin/pages/{TestAdminPages.created_page_id}", headers={
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"
        }, json={
            "internal_name": "TEST_Page_Pytest_Updated",
            "page_type": "city",
            "slug": {"fr": "test-page-pytest-updated"},
            "status": "published"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["internal_name"] == "TEST_Page_Pytest_Updated"
    
    def test_toggle_status(self, auth_token):
        """Test toggling page status"""
        if not TestAdminPages.created_page_id:
            pytest.skip("No page created")
        response = requests.patch(f"{BASE_URL}/api/admin/pages/{TestAdminPages.created_page_id}/status", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        assert "status" in response.json()
    
    def test_delete_page(self, auth_token):
        """Test deleting a page"""
        if not TestAdminPages.created_page_id:
            pytest.skip("No page created")
        response = requests.delete(f"{BASE_URL}/api/admin/pages/{TestAdminPages.created_page_id}", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200


class TestAdminPlaces:
    """Admin Places CRUD tests"""
    created_place_id = None
    
    def test_list_places(self, auth_token):
        """Test listing places"""
        response = requests.get(f"{BASE_URL}/api/admin/places", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_create_place(self, auth_token):
        """Test creating a new place"""
        response = requests.post(f"{BASE_URL}/api/admin/places", headers={
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"
        }, json={
            "name": {"fr": "TEST_Place_Pytest", "en": "TEST Place Pytest EN"},
            "place_type": "city",
            "country": "France",
            "status": "active"
        })
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["name"]["fr"] == "TEST_Place_Pytest"
        TestAdminPlaces.created_place_id = data["id"]
    
    def test_get_place(self, auth_token):
        """Test getting a single place"""
        if not TestAdminPlaces.created_place_id:
            pytest.skip("No place created")
        response = requests.get(f"{BASE_URL}/api/admin/places/{TestAdminPlaces.created_place_id}", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
    
    def test_toggle_place_status(self, auth_token):
        """Test toggling place status"""
        if not TestAdminPlaces.created_place_id:
            pytest.skip("No place created")
        response = requests.patch(f"{BASE_URL}/api/admin/places/{TestAdminPlaces.created_place_id}/status", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        assert "status" in response.json()
    
    def test_delete_place(self, auth_token):
        """Test deleting a place"""
        if not TestAdminPlaces.created_place_id:
            pytest.skip("No place created")
        response = requests.delete(f"{BASE_URL}/api/admin/places/{TestAdminPlaces.created_place_id}", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200


class TestAdminTrustBlocks:
    """Admin Trust Blocks CRUD tests"""
    created_block_id = None
    
    def test_list_trust_blocks(self, auth_token):
        """Test listing trust blocks"""
        response = requests.get(f"{BASE_URL}/api/admin/cms/trust-blocks", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_create_trust_block(self, auth_token):
        """Test creating a trust block"""
        response = requests.post(f"{BASE_URL}/api/admin/cms/trust-blocks", headers={
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"
        }, json={
            "title": {"fr": "TEST_Bloc_Pytest", "en": "TEST Block Pytest"},
            "text": {"fr": "Texte de test", "en": "Test text"},
            "icon": "shield",
            "active": True,
            "order": 99
        })
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        TestAdminTrustBlocks.created_block_id = data["id"]
    
    def test_toggle_trust_block(self, auth_token):
        """Test toggling trust block active state"""
        if not TestAdminTrustBlocks.created_block_id:
            pytest.skip("No block created")
        response = requests.patch(f"{BASE_URL}/api/admin/cms/trust-blocks/{TestAdminTrustBlocks.created_block_id}/toggle", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        assert "active" in response.json()
    
    def test_delete_trust_block(self, auth_token):
        """Test deleting a trust block"""
        if not TestAdminTrustBlocks.created_block_id:
            pytest.skip("No block created")
        response = requests.delete(f"{BASE_URL}/api/admin/cms/trust-blocks/{TestAdminTrustBlocks.created_block_id}", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200


class TestAdminFAQs:
    """Admin FAQs CRUD tests"""
    created_faq_id = None
    
    def test_list_faqs(self, auth_token):
        """Test listing FAQs"""
        response = requests.get(f"{BASE_URL}/api/admin/cms/faqs", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_create_faq(self, auth_token):
        """Test creating a FAQ"""
        response = requests.post(f"{BASE_URL}/api/admin/cms/faqs", headers={
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"
        }, json={
            "question": {"fr": "TEST_Question_Pytest?", "en": "TEST Question Pytest?"},
            "answer": {"fr": "Reponse de test", "en": "Test answer"},
            "active": True,
            "order": 99
        })
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        TestAdminFAQs.created_faq_id = data["id"]
    
    def test_delete_faq(self, auth_token):
        """Test deleting a FAQ"""
        if not TestAdminFAQs.created_faq_id:
            pytest.skip("No FAQ created")
        response = requests.delete(f"{BASE_URL}/api/admin/cms/faqs/{TestAdminFAQs.created_faq_id}", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200


class TestAdminHomepage:
    """Admin Homepage config tests"""
    
    def test_get_homepage_config(self, auth_token):
        """Test getting homepage config"""
        response = requests.get(f"{BASE_URL}/api/admin/cms/homepage", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
    
    def test_update_homepage_config(self, auth_token):
        """Test updating homepage config"""
        response = requests.put(f"{BASE_URL}/api/admin/cms/homepage", headers={
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"
        }, json={
            "title": {"fr": "Test Title FR", "en": "Test Title EN"},
            "subtitle": {"fr": "Test Subtitle FR", "en": "Test Subtitle EN"},
            "stats": [],
            "advantages": [],
            "sections_order": ["hero", "stats"]
        })
        assert response.status_code == 200


class TestAdminDashboard:
    """Admin Dashboard stats tests"""
    
    def test_get_stats(self, auth_token):
        """Test getting dashboard stats"""
        response = requests.get(f"{BASE_URL}/api/admin/cms/stats", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert "pages" in data
        assert "places" in data
        assert "trust_blocks" in data
        assert "faqs" in data
        assert "leads" in data


class TestAdminSEO:
    """Admin SEO Overview tests"""
    
    def test_seo_overview(self, auth_token):
        """Test SEO overview endpoint"""
        response = requests.get(f"{BASE_URL}/api/admin/cms/seo-overview", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        assert isinstance(response.json(), list)


@pytest.fixture(scope="session")
def auth_token():
    """Get authentication token for admin user"""
    response = requests.post(f"{BASE_URL}/api/admin/auth/login", json={
        "email": "admin@zont.cab",
        "password": "admin123"
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Authentication failed - skipping authenticated tests")
