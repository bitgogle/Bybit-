#!/usr/bin/env python3
"""
BYBIT Investment Platform Backend API Tests
Tests the investment creation flow and related endpoints
"""

import requests
import json
import uuid
from datetime import datetime
import time

# Configuration
BASE_URL = "https://cryptomine-dash-2.preview.emergentagent.com/api"
TEST_USER_EMAIL = f"testuser_{int(time.time())}@example.com"
TEST_USER_PASSWORD = "TestPassword123!"
TEST_USERNAME = f"testuser_{int(time.time())}"

class BackendTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.token = None
        self.admin_token = None
        self.user_id = None
        self.test_results = []
        
    def log_result(self, test_name, success, message, details=None):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def make_request(self, method, endpoint, data=None, headers=None):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}{endpoint}"
        default_headers = {"Content-Type": "application/json"}
        
        if headers:
            default_headers.update(headers)
            
        if self.token and "Authorization" not in default_headers:
            default_headers["Authorization"] = f"Bearer {self.token}"
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=default_headers, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, headers=default_headers, timeout=30)
            elif method.upper() == "PUT":
                response = requests.put(url, json=data, headers=default_headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            return response
        except requests.exceptions.RequestException as e:
            return None, str(e)
    
    def test_user_registration(self):
        """Test user registration"""
        test_name = "User Registration"
        
        user_data = {
            "username": TEST_USERNAME,
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD,
            "full_name": "Test User",
            "phone": "+5511999999999"
        }
        
        response = self.make_request("POST", "/auth/register", user_data)
        
        if response is None:
            self.log_result(test_name, False, "Request failed - connection error")
            return False
            
        if response.status_code == 200:
            data = response.json()
            self.user_id = data.get("user_id")
            self.log_result(test_name, True, f"User registered successfully. Status: {data.get('status')}")
            return True
        else:
            self.log_result(test_name, False, f"Registration failed with status {response.status_code}", response.text)
            return False
    
    def test_user_login(self):
        """Test user login"""
        test_name = "User Login"
        
        login_data = {
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        
        if response is None:
            self.log_result(test_name, False, "Request failed - connection error")
            return False
            
        if response.status_code == 200:
            data = response.json()
            self.token = data.get("token")
            self.log_result(test_name, True, "Login successful, token obtained")
            return True
        elif response.status_code == 403:
            # User needs admin approval
            self.log_result(test_name, True, "Login blocked - user needs admin approval (expected behavior)")
            return True
        else:
            self.log_result(test_name, False, f"Login failed with status {response.status_code}", response.text)
            return False
    
    def test_token_validation(self):
        """Test JWT token validation"""
        test_name = "JWT Token Validation"
        
        if not self.token:
            self.log_result(test_name, False, "No token available for testing")
            return False
            
        response = self.make_request("GET", "/auth/me")
        
        if response is None:
            self.log_result(test_name, False, "Request failed - connection error")
            return False
            
        if response.status_code == 200:
            self.log_result(test_name, True, "Token validation successful")
            return True
        else:
            self.log_result(test_name, False, f"Token validation failed with status {response.status_code}", response.text)
            return False
    
    def test_get_investment_plans(self):
        """Test getting investment plans"""
        test_name = "Get Investment Plans"
        
        response = self.make_request("GET", "/investment-plans")
        
        if response is None:
            self.log_result(test_name, False, "Request failed - connection error")
            return False, None
            
        if response.status_code == 200:
            plans = response.json()
            if isinstance(plans, list) and len(plans) > 0:
                self.log_result(test_name, True, f"Retrieved {len(plans)} investment plans")
                return True, plans
            else:
                self.log_result(test_name, False, "No investment plans found")
                return False, None
        else:
            self.log_result(test_name, False, f"Failed to get plans with status {response.status_code}", response.text)
            return False, None
    
    def test_get_dashboard(self):
        """Test getting user dashboard"""
        test_name = "Get User Dashboard"
        
        if not self.token:
            self.log_result(test_name, False, "No authentication token available")
            return False, None
            
        response = self.make_request("GET", "/users/dashboard")
        
        if response is None:
            self.log_result(test_name, False, "Request failed - connection error")
            return False, None
            
        if response.status_code == 200:
            dashboard = response.json()
            balance = dashboard.get("balance", {})
            available = balance.get("available_for_withdrawal", 0)
            self.log_result(test_name, True, f"Dashboard retrieved. Available balance: R$ {available}")
            return True, dashboard
        else:
            self.log_result(test_name, False, f"Dashboard request failed with status {response.status_code}", response.text)
            return False, None
    
    def test_create_investment_success(self, plans, dashboard):
        """Test successful investment creation"""
        test_name = "Create Investment - Success Case"
        
        if not self.token:
            self.log_result(test_name, False, "No authentication token available")
            return False
            
        if not plans or len(plans) == 0:
            self.log_result(test_name, False, "No investment plans available")
            return False
            
        # Get user's available balance
        balance = dashboard.get("balance", {}) if dashboard else {}
        available_balance = balance.get("available_for_withdrawal", 0)
        
        if available_balance <= 0:
            self.log_result(test_name, False, f"Insufficient balance for testing: R$ {available_balance}")
            return False
            
        # Find a suitable plan
        suitable_plan = None
        for plan in plans:
            min_amount = plan.get("min_amount", 0)
            if min_amount <= available_balance:
                suitable_plan = plan
                break
        
        if not suitable_plan:
            self.log_result(test_name, False, "No suitable investment plan found for available balance")
            return False
            
        # Create investment
        investment_data = {
            "plan_id": suitable_plan["id"],
            "amount": min(suitable_plan["min_amount"], available_balance)
        }
        
        response = self.make_request("POST", "/investments", investment_data)
        
        if response is None:
            self.log_result(test_name, False, "Request failed - connection error")
            return False
            
        if response.status_code == 200:
            result = response.json()
            investment = result.get("investment", {})
            self.log_result(test_name, True, f"Investment created successfully. Amount: R$ {investment.get('amount')}")
            return True
        else:
            self.log_result(test_name, False, f"Investment creation failed with status {response.status_code}", response.text)
            return False
    
    def test_create_investment_insufficient_balance(self, plans):
        """Test investment creation with insufficient balance"""
        test_name = "Create Investment - Insufficient Balance"
        
        if not self.token:
            self.log_result(test_name, False, "No authentication token available")
            return False
            
        if not plans or len(plans) == 0:
            self.log_result(test_name, False, "No investment plans available")
            return False
            
        # Use max amount from plan to trigger insufficient balance (we only have R$800 left after first investment)
        plan = plans[0]
        max_amount = plan.get("max_amount", 5000)
        investment_data = {
            "plan_id": plan["id"],
            "amount": max_amount  # Use max amount which should exceed remaining balance
        }
        
        response = self.make_request("POST", "/investments", investment_data)
        
        if response is None:
            self.log_result(test_name, False, "Request failed - connection error")
            return False
            
        if response.status_code == 400:
            error_msg = response.json().get("detail", "")
            if "saldo insuficiente" in error_msg.lower() or "insufficient" in error_msg.lower():
                self.log_result(test_name, True, "Correctly rejected investment due to insufficient balance")
                return True
            else:
                self.log_result(test_name, False, f"Wrong error message: {error_msg}")
                return False
        else:
            self.log_result(test_name, False, f"Expected 400 status, got {response.status_code}", response.text)
            return False
    
    def test_create_investment_invalid_amount(self, plans):
        """Test investment creation with invalid amounts"""
        test_name = "Create Investment - Invalid Amount Range"
        
        if not self.token:
            self.log_result(test_name, False, "No authentication token available")
            return False
            
        if not plans or len(plans) == 0:
            self.log_result(test_name, False, "No investment plans available")
            return False
            
        plan = plans[0]
        min_amount = plan.get("min_amount", 100)
        max_amount = plan.get("max_amount", 10000)
        
        # Test amount below minimum
        investment_data = {
            "plan_id": plan["id"],
            "amount": min_amount - 1
        }
        
        response = self.make_request("POST", "/investments", investment_data)
        
        if response is None:
            self.log_result(test_name, False, "Request failed - connection error")
            return False
            
        if response.status_code == 400:
            error_msg = response.json().get("detail", "")
            if "valor deve estar entre" in error_msg.lower() or "amount" in error_msg.lower():
                self.log_result(test_name, True, "Correctly rejected investment due to invalid amount range")
                return True
            else:
                self.log_result(test_name, False, f"Wrong error message for invalid amount: {error_msg}")
                return False
        else:
            self.log_result(test_name, False, f"Expected 400 status for invalid amount, got {response.status_code}", response.text)
            return False
    
    def test_create_investment_invalid_plan(self):
        """Test investment creation with invalid plan ID"""
        test_name = "Create Investment - Invalid Plan ID"
        
        if not self.token:
            self.log_result(test_name, False, "No authentication token available")
            return False
            
        investment_data = {
            "plan_id": "invalid-plan-id-12345",
            "amount": 100.0
        }
        
        response = self.make_request("POST", "/investments", investment_data)
        
        if response is None:
            self.log_result(test_name, False, "Request failed - connection error")
            return False
            
        if response.status_code == 404:
            error_msg = response.json().get("detail", "")
            if "plano não encontrado" in error_msg.lower() or "not found" in error_msg.lower():
                self.log_result(test_name, True, "Correctly rejected investment due to invalid plan ID")
                return True
            else:
                self.log_result(test_name, False, f"Wrong error message for invalid plan: {error_msg}")
                return False
        else:
            self.log_result(test_name, False, f"Expected 404 status for invalid plan, got {response.status_code}", response.text)
            return False
    
    def test_get_user_investments(self):
        """Test getting user's investments"""
        test_name = "Get User Investments"
        
        if not self.token:
            self.log_result(test_name, False, "No authentication token available")
            return False
            
        response = self.make_request("GET", "/investments")
        
        if response is None:
            self.log_result(test_name, False, "Request failed - connection error")
            return False
            
        if response.status_code == 200:
            investments = response.json()
            if isinstance(investments, list):
                self.log_result(test_name, True, f"Retrieved {len(investments)} user investments")
                return True
            else:
                self.log_result(test_name, False, "Invalid response format for investments")
                return False
        else:
            self.log_result(test_name, False, f"Failed to get investments with status {response.status_code}", response.text)
            return False
    
    def test_admin_login(self):
        """Test admin login"""
        test_name = "Admin Login"
        
        admin_credentials = {
            "email": "skidolynx@gmail.com",
            "password": "@Mypetname9"
        }
        
        response = self.make_request("POST", "/auth/admin/login", admin_credentials)
        
        if response is None:
            self.log_result(test_name, False, "Request failed - connection error")
            return False
            
        if response.status_code == 200:
            data = response.json()
            self.admin_token = data.get("token")
            self.log_result(test_name, True, "Admin login successful")
            return True
        else:
            self.log_result(test_name, False, f"Admin login failed with status {response.status_code}", response.text)
            return False
    
    def test_approve_user(self):
        """Test approving the test user"""
        test_name = "Approve Test User"
        
        if not self.admin_token or not self.user_id:
            self.log_result(test_name, False, "Admin token or user ID not available")
            return False
            
        # Temporarily store current token and use admin token
        original_token = self.token
        self.token = self.admin_token
        
        response = self.make_request("PUT", f"/admin/users/{self.user_id}/approve")
        
        # Restore original token
        self.token = original_token
        
        if response is None:
            self.log_result(test_name, False, "Request failed - connection error")
            return False
            
        if response.status_code == 200:
            self.log_result(test_name, True, "User approved successfully")
            return True
        else:
            self.log_result(test_name, False, f"User approval failed with status {response.status_code}", response.text)
            return False
    
    def test_add_user_balance(self):
        """Test adding balance to user for testing investments"""
        test_name = "Add User Balance for Testing"
        
        if not self.admin_token or not self.user_id:
            self.log_result(test_name, False, "Admin token or user ID not available")
            return False
            
        # Temporarily store current token and use admin token
        original_token = self.token
        self.token = self.admin_token
        
        balance_data = {
            "user_id": self.user_id,
            "adjustment_type": "add",
            "amount": 1000.0,
            "balance_type": "available_for_withdrawal",
            "notes": "Test balance for investment testing"
        }
        
        response = self.make_request("POST", f"/admin/users/{self.user_id}/balance", balance_data)
        
        # Restore original token
        self.token = original_token
        
        if response is None:
            self.log_result(test_name, False, "Request failed - connection error")
            return False
            
        if response.status_code == 200:
            self.log_result(test_name, True, "Test balance added successfully (R$ 1000.00)")
            return True
        else:
            self.log_result(test_name, False, f"Balance adjustment failed with status {response.status_code}", response.text)
            return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("=" * 60)
        print("BYBIT Investment Platform Backend API Tests")
        print("=" * 60)
        print(f"Testing against: {self.base_url}")
        print(f"Test user: {TEST_USER_EMAIL}")
        print("=" * 60)
        
        # Test 1: User Registration
        registration_success = self.test_user_registration()
        
        # Test 2: User Login (will fail due to pending approval)
        login_success = self.test_user_login()
        
        # Test 3: Admin Login
        admin_login_success = self.test_admin_login()
        
        # Test 4: Approve User (if admin login successful)
        if admin_login_success and self.user_id:
            self.test_approve_user()
            
            # Test 5: Add balance for testing
            self.test_add_user_balance()
            
            # Test 6: User Login (should work now)
            login_success = self.test_user_login()
        
        # Test 7: Token Validation (only if we have a token)
        if self.token:
            self.test_token_validation()
        
        # Test 8: Get Investment Plans
        plans_success, plans = self.test_get_investment_plans()
        
        # Test 9: Get Dashboard (only if authenticated)
        dashboard_success = False
        dashboard = None
        if self.token:
            dashboard_success, dashboard = self.test_get_dashboard()
        
        # Test 10: Investment Creation Tests (only if authenticated and have plans)
        if self.token and plans:
            # Success case (only if we have balance)
            if dashboard:
                self.test_create_investment_success(plans, dashboard)
            
            # Error cases
            self.test_create_investment_insufficient_balance(plans)
            self.test_create_investment_invalid_amount(plans)
            self.test_create_investment_invalid_plan()
            
            # Test 11: Get User Investments
            self.test_get_user_investments()
            
            # Test 12: Verify Balance Deduction
            self.test_balance_deduction_verification()
        
        # Print summary
        print("\n" + "=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%" if total > 0 else "0%")
        
        # Show failed tests
        failed_tests = [result for result in self.test_results if not result["success"]]
        if failed_tests:
            print("\nFAILED TESTS:")
            for result in failed_tests:
                print(f"  ❌ {result['test']}: {result['message']}")
        
        return self.test_results

if __name__ == "__main__":
    tester = BackendTester()
    results = tester.run_all_tests()