#!/usr/bin/env python3
"""
BYBIT Investment Platform - Comprehensive Backend API Tests
Production-ready testing for all core functionalities
"""

import requests
import json
import uuid
from datetime import datetime
import time

# Configuration
BASE_URL = "https://cryptomine-dash-2.preview.emergentagent.com/api"
TEST_USER_EMAIL = f"prodtest_{int(time.time())}@bybit.com"
TEST_USER_PASSWORD = "SecurePassword123!"
TEST_USERNAME = f"produser_{int(time.time())}"

class ComprehensiveBackendTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.token = None
        self.admin_token = None
        self.user_id = None
        self.test_results = []
        self.created_investment_id = None
        self.created_deposit_id = None
        self.created_withdrawal_id = None
        
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

    # ==================== AUTHENTICATION TESTS ====================
    
    def test_user_registration_comprehensive(self):
        """Test user registration with all required fields"""
        test_name = "User Registration - Complete Profile"
        
        user_data = {
            "username": TEST_USERNAME,
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD,
            "full_name": "João Silva Santos",
            "phone": "+5511987654321",
            "country": "Brasil",
            "cpf": "123.456.789-00",
            "pix_key": "joao.silva@email.com"
        }
        
        response = self.make_request("POST", "/auth/register", user_data)
        
        if response is None:
            self.log_result(test_name, False, "Request failed - connection error")
            return False
            
        if response.status_code == 200:
            data = response.json()
            self.user_id = data.get("user_id")
            expected_msg = "Cadastro realizado! Aguarde aprovação do administrador."
            if expected_msg in data.get("message", ""):
                self.log_result(test_name, True, f"User registered with complete profile. Status: {data.get('status')}")
                return True
            else:
                self.log_result(test_name, False, f"Unexpected message: {data.get('message')}")
                return False
        else:
            self.log_result(test_name, False, f"Registration failed with status {response.status_code}", response.text)
            return False

    def test_duplicate_email_registration(self):
        """Test registration with duplicate email"""
        test_name = "User Registration - Duplicate Email Validation"
        
        user_data = {
            "username": f"duplicate_{int(time.time())}",
            "email": TEST_USER_EMAIL,  # Same email as previous test
            "password": "AnotherPassword123!",
            "full_name": "Another User",
            "phone": "+5511999888777"
        }
        
        response = self.make_request("POST", "/auth/register", user_data)
        
        if response is None:
            self.log_result(test_name, False, "Request failed - connection error")
            return False
            
        if response.status_code == 400:
            error_msg = response.json().get("detail", "")
            if "email já cadastrado" in error_msg.lower():
                self.log_result(test_name, True, "Correctly rejected duplicate email registration")
                return True
            else:
                self.log_result(test_name, False, f"Wrong error message: {error_msg}")
                return False
        else:
            self.log_result(test_name, False, f"Expected 400 status, got {response.status_code}", response.text)
            return False

    def test_admin_login(self):
        """Test admin login functionality"""
        test_name = "Admin Authentication"
        
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
            user_data = data.get("user", {})
            if user_data.get("is_admin"):
                self.log_result(test_name, True, "Admin login successful with proper admin privileges")
                return True
            else:
                self.log_result(test_name, False, "Admin login successful but no admin privileges")
                return False
        else:
            self.log_result(test_name, False, f"Admin login failed with status {response.status_code}", response.text)
            return False

    def test_admin_user_approval(self):
        """Test admin approval workflow"""
        test_name = "Admin User Approval Workflow"
        
        if not self.admin_token or not self.user_id:
            self.log_result(test_name, False, "Admin token or user ID not available")
            return False
            
        # Store current token and use admin token
        original_token = self.token
        self.token = self.admin_token
        
        response = self.make_request("PUT", f"/admin/users/{self.user_id}/approve")
        
        # Restore original token
        self.token = original_token
        
        if response is None:
            self.log_result(test_name, False, "Request failed - connection error")
            return False
            
        if response.status_code == 200:
            self.log_result(test_name, True, "User approved successfully by admin")
            return True
        else:
            self.log_result(test_name, False, f"User approval failed with status {response.status_code}", response.text)
            return False

    def test_user_login_after_approval(self):
        """Test user login after admin approval"""
        test_name = "User Login After Approval"
        
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
            user_data = data.get("user", {})
            if self.token and user_data.get("status") == "active":
                self.log_result(test_name, True, "Login successful after admin approval with JWT token")
                return True
            else:
                self.log_result(test_name, False, "Login successful but missing token or wrong status")
                return False
        else:
            self.log_result(test_name, False, f"Login failed with status {response.status_code}", response.text)
            return False

    def test_jwt_token_validation(self):
        """Test JWT token validation on protected routes"""
        test_name = "JWT Token Validation"
        
        if not self.token:
            self.log_result(test_name, False, "No token available for testing")
            return False
            
        response = self.make_request("GET", "/auth/me")
        
        if response is None:
            self.log_result(test_name, False, "Request failed - connection error")
            return False
            
        if response.status_code == 200:
            user_data = response.json()
            if user_data.get("id") == self.user_id:
                self.log_result(test_name, True, "JWT token validation successful with correct user data")
                return True
            else:
                self.log_result(test_name, False, "Token valid but wrong user data returned")
                return False
        else:
            self.log_result(test_name, False, f"Token validation failed with status {response.status_code}", response.text)
            return False

    def test_invalid_token_access(self):
        """Test access with invalid token"""
        test_name = "Invalid Token Access Control"
        
        # Store original token and use invalid one
        original_token = self.token
        self.token = "invalid_token_12345"
        
        response = self.make_request("GET", "/auth/me")
        
        # Restore original token
        self.token = original_token
        
        if response is None:
            self.log_result(test_name, False, "Request failed - connection error")
            return False
            
        if response.status_code == 401:
            self.log_result(test_name, True, "Correctly rejected invalid token access")
            return True
        else:
            self.log_result(test_name, False, f"Expected 401 status, got {response.status_code}", response.text)
            return False

    # ==================== DASHBOARD & BALANCE TESTS ====================
    
    def test_user_dashboard_access(self):
        """Test user dashboard access and data structure"""
        test_name = "User Dashboard Access"
        
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
            stats = dashboard.get("stats", {})
            
            # Verify required balance fields
            required_balance_fields = ["brl_balance", "available_for_withdrawal", "total_invested", "total_returns"]
            missing_fields = [field for field in required_balance_fields if field not in balance]
            
            if not missing_fields:
                self.log_result(test_name, True, f"Dashboard accessed successfully with all balance fields")
                return True, dashboard
            else:
                self.log_result(test_name, False, f"Missing balance fields: {missing_fields}")
                return False, None
        else:
            self.log_result(test_name, False, f"Dashboard request failed with status {response.status_code}", response.text)
            return False, None

    def test_admin_balance_adjustment(self):
        """Test admin balance adjustment functionality"""
        test_name = "Admin Balance Adjustment"
        
        if not self.admin_token or not self.user_id:
            self.log_result(test_name, False, "Admin token or user ID not available")
            return False
            
        # Store current token and use admin token
        original_token = self.token
        self.token = self.admin_token
        
        balance_data = {
            "user_id": self.user_id,
            "adjustment_type": "add",
            "amount": 2000.0,
            "balance_type": "available_for_withdrawal",
            "notes": "Production test balance for comprehensive testing"
        }
        
        response = self.make_request("POST", f"/admin/users/{self.user_id}/balance", balance_data)
        
        # Restore original token
        self.token = original_token
        
        if response is None:
            self.log_result(test_name, False, "Request failed - connection error")
            return False
            
        if response.status_code == 200:
            self.log_result(test_name, True, "Admin balance adjustment successful (R$ 2000.00 added)")
            return True
        else:
            self.log_result(test_name, False, f"Balance adjustment failed with status {response.status_code}", response.text)
            return False

    # ==================== INVESTMENT SYSTEM TESTS ====================
    
    def test_get_investment_plans(self):
        """Test getting all investment plans"""
        test_name = "Get Investment Plans"
        
        response = self.make_request("GET", "/investment-plans")
        
        if response is None:
            self.log_result(test_name, False, "Request failed - connection error")
            return False, None
            
        if response.status_code == 200:
            plans = response.json()
            if isinstance(plans, list) and len(plans) >= 4:
                # Verify plan structure
                required_fields = ["id", "name", "lock_hours", "min_amount", "max_amount", "profit_rate"]
                plan_names = ["Plano 48 Horas", "Plano 5 Dias", "Plano 1 Semana", "Plano 1 Mês"]
                
                all_plans_valid = True
                found_names = []
                
                for plan in plans:
                    found_names.append(plan.get("name"))
                    missing_fields = [field for field in required_fields if field not in plan]
                    if missing_fields:
                        all_plans_valid = False
                        break
                
                if all_plans_valid and all(name in found_names for name in plan_names):
                    self.log_result(test_name, True, f"Retrieved {len(plans)} investment plans with correct structure")
                    return True, plans
                else:
                    self.log_result(test_name, False, f"Plans missing required fields or expected plan names")
                    return False, None
            else:
                self.log_result(test_name, False, f"Expected at least 4 plans, got {len(plans) if isinstance(plans, list) else 'invalid format'}")
                return False, None
        else:
            self.log_result(test_name, False, f"Failed to get plans with status {response.status_code}", response.text)
            return False, None

    def test_create_investment_success(self, plans):
        """Test successful investment creation"""
        test_name = "Create Investment - Success Case"
        
        if not self.token:
            self.log_result(test_name, False, "No authentication token available")
            return False
            
        if not plans or len(plans) == 0:
            self.log_result(test_name, False, "No investment plans available")
            return False
            
        # Use the 48-hour plan with minimum amount
        plan_48h = next((p for p in plans if "48" in p.get("name", "")), plans[0])
        investment_data = {
            "plan_id": plan_48h["id"],
            "amount": plan_48h["min_amount"]  # R$ 200.00
        }
        
        response = self.make_request("POST", "/investments", investment_data)
        
        if response is None:
            self.log_result(test_name, False, "Request failed - connection error")
            return False
            
        if response.status_code == 200:
            result = response.json()
            investment = result.get("investment", {})
            self.created_investment_id = investment.get("id")
            
            # Verify investment structure
            required_fields = ["id", "user_id", "plan_id", "amount", "status", "start_date", "end_date"]
            missing_fields = [field for field in required_fields if field not in investment]
            
            if not missing_fields and investment.get("status") == "active":
                self.log_result(test_name, True, f"Investment created successfully. Amount: R$ {investment.get('amount')}, Status: {investment.get('status')}")
                return True
            else:
                self.log_result(test_name, False, f"Investment created but missing fields: {missing_fields}")
                return False
        else:
            self.log_result(test_name, False, f"Investment creation failed with status {response.status_code}", response.text)
            return False

    def test_investment_validation_errors(self, plans):
        """Test investment validation scenarios"""
        test_name = "Investment Validation - Error Cases"
        
        if not self.token or not plans:
            self.log_result(test_name, False, "No authentication token or plans available")
            return False
            
        plan = plans[0]
        test_cases = [
            {
                "name": "Insufficient Balance",
                "data": {"plan_id": plan["id"], "amount": 50000.0},  # Way more than available
                "expected_status": 400,
                "expected_error": "saldo insuficiente"
            },
            {
                "name": "Amount Below Minimum",
                "data": {"plan_id": plan["id"], "amount": plan["min_amount"] - 1},
                "expected_status": 400,
                "expected_error": "valor deve estar entre"
            },
            {
                "name": "Amount Above Maximum",
                "data": {"plan_id": plan["id"], "amount": plan["max_amount"] + 1},
                "expected_status": 400,
                "expected_error": "valor deve estar entre"
            },
            {
                "name": "Invalid Plan ID",
                "data": {"plan_id": "invalid_plan_id", "amount": 200.0},
                "expected_status": 404,
                "expected_error": "plano não encontrado"
            }
        ]
        
        all_passed = True
        for test_case in test_cases:
            response = self.make_request("POST", "/investments", test_case["data"])
            
            if response is None:
                self.log_result(f"{test_name} - {test_case['name']}", False, "Request failed - connection error")
                all_passed = False
                continue
                
            if response.status_code == test_case["expected_status"]:
                error_msg = response.json().get("detail", "").lower()
                if test_case["expected_error"].lower() in error_msg:
                    self.log_result(f"{test_name} - {test_case['name']}", True, f"Correctly validated: {test_case['expected_error']}")
                else:
                    self.log_result(f"{test_name} - {test_case['name']}", False, f"Wrong error message: {error_msg}")
                    all_passed = False
            else:
                self.log_result(f"{test_name} - {test_case['name']}", False, f"Expected {test_case['expected_status']}, got {response.status_code}")
                all_passed = False
        
        return all_passed

    def test_get_user_investments(self):
        """Test retrieving user investments"""
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
            if isinstance(investments, list) and len(investments) > 0:
                # Verify investment structure
                investment = investments[0]
                required_fields = ["id", "user_id", "plan_id", "amount", "status"]
                missing_fields = [field for field in required_fields if field not in investment]
                
                if not missing_fields:
                    self.log_result(test_name, True, f"Retrieved {len(investments)} user investments with correct structure")
                    return True
                else:
                    self.log_result(test_name, False, f"Investment missing fields: {missing_fields}")
                    return False
            else:
                self.log_result(test_name, False, "No investments found or invalid format")
                return False
        else:
            self.log_result(test_name, False, f"Failed to get investments with status {response.status_code}", response.text)
            return False

    # ==================== DEPOSIT SYSTEM TESTS ====================
    
    def test_create_deposit_request(self):
        """Test creating deposit request"""
        test_name = "Create Deposit Request"
        
        if not self.token:
            self.log_result(test_name, False, "No authentication token available")
            return False
            
        deposit_data = {
            "amount": 500.0,
            "payment_method": "pix",
            "payment_proof": "comprovante_pix_12345.jpg",
            "notes": "Depósito via PIX para teste de produção"
        }
        
        response = self.make_request("POST", "/deposits", deposit_data)
        
        if response is None:
            self.log_result(test_name, False, "Request failed - connection error")
            return False
            
        if response.status_code == 200:
            result = response.json()
            transaction = result.get("transaction", {})
            self.created_deposit_id = transaction.get("id")
            
            if (transaction.get("type") == "deposit" and 
                transaction.get("status") == "pending" and
                transaction.get("amount") == 500.0):
                self.log_result(test_name, True, f"Deposit request created successfully. Amount: R$ {transaction.get('amount')}")
                return True
            else:
                self.log_result(test_name, False, f"Deposit created but with wrong data: {transaction}")
                return False
        else:
            self.log_result(test_name, False, f"Deposit creation failed with status {response.status_code}", response.text)
            return False

    def test_admin_approve_deposit(self):
        """Test admin approval of deposit"""
        test_name = "Admin Approve Deposit"
        
        if not self.admin_token or not self.created_deposit_id:
            self.log_result(test_name, False, "Admin token or deposit ID not available")
            return False
            
        # Store current token and use admin token
        original_token = self.token
        self.token = self.admin_token
        
        response = self.make_request("PUT", f"/admin/transactions/{self.created_deposit_id}/approve")
        
        # Restore original token
        self.token = original_token
        
        if response is None:
            self.log_result(test_name, False, "Request failed - connection error")
            return False
            
        if response.status_code == 200:
            self.log_result(test_name, True, "Deposit approved successfully by admin")
            return True
        else:
            self.log_result(test_name, False, f"Deposit approval failed with status {response.status_code}", response.text)
            return False

    def test_balance_update_after_deposit(self):
        """Test balance update after deposit approval"""
        test_name = "Balance Update After Deposit Approval"
        
        if not self.token:
            self.log_result(test_name, False, "No authentication token available")
            return False
            
        response = self.make_request("GET", "/users/dashboard")
        
        if response is None:
            self.log_result(test_name, False, "Request failed - connection error")
            return False
            
        if response.status_code == 200:
            dashboard = response.json()
            balance = dashboard.get("balance", {})
            available = balance.get("available_for_withdrawal", 0)
            brl_balance = balance.get("brl_balance", 0)
            
            # Should have R$ 2000 (admin adjustment) + R$ 500 (deposit) - R$ 200 (investment) = R$ 2300
            expected_available = 2300.0
            
            if available >= expected_available:
                self.log_result(test_name, True, f"Balance correctly updated after deposit. Available: R$ {available}")
                return True
            else:
                self.log_result(test_name, False, f"Balance not updated correctly. Expected >= R$ {expected_available}, got R$ {available}")
                return False
        else:
            self.log_result(test_name, False, f"Dashboard request failed with status {response.status_code}", response.text)
            return False

    # ==================== WITHDRAWAL SYSTEM TESTS ====================
    
    def test_create_withdrawal_request(self):
        """Test creating withdrawal request"""
        test_name = "Create Withdrawal Request"
        
        if not self.token:
            self.log_result(test_name, False, "No authentication token available")
            return False
            
        withdrawal_data = {
            "amount": 100.0,
            "payment_method": "pix",
            "fee_payment_proof": "comprovante_taxa_saque.jpg"
        }
        
        response = self.make_request("POST", "/withdrawals", withdrawal_data)
        
        if response is None:
            self.log_result(test_name, False, "Request failed - connection error")
            return False
            
        if response.status_code == 200:
            result = response.json()
            transaction = result.get("transaction", {})
            self.created_withdrawal_id = transaction.get("id")
            
            if (transaction.get("type") == "withdrawal" and 
                transaction.get("status") == "processing" and
                transaction.get("amount") == 100.0):
                self.log_result(test_name, True, f"Withdrawal request created successfully. Amount: R$ {transaction.get('amount')}")
                return True
            else:
                self.log_result(test_name, False, f"Withdrawal created but with wrong data: {transaction}")
                return False
        else:
            self.log_result(test_name, False, f"Withdrawal creation failed with status {response.status_code}", response.text)
            return False

    def test_withdrawal_with_active_investment(self):
        """Test withdrawal rejection when user has active investments"""
        test_name = "Withdrawal Validation - Active Investment Check"
        
        if not self.token:
            self.log_result(test_name, False, "No authentication token available")
            return False
            
        withdrawal_data = {
            "amount": 50.0,
            "payment_method": "pix"
        }
        
        response = self.make_request("POST", "/withdrawals", withdrawal_data)
        
        if response is None:
            self.log_result(test_name, False, "Request failed - connection error")
            return False
            
        if response.status_code == 400:
            error_msg = response.json().get("detail", "")
            if "investimentos ativos" in error_msg.lower():
                self.log_result(test_name, True, "Correctly rejected withdrawal due to active investments")
                return True
            else:
                self.log_result(test_name, False, f"Wrong error message: {error_msg}")
                return False
        else:
            # If withdrawal was created, it means there are no active investments
            self.log_result(test_name, True, "Withdrawal created - no active investments blocking it")
            return True

    def test_admin_withdrawal_status_update(self):
        """Test admin updating withdrawal status"""
        test_name = "Admin Update Withdrawal Status"
        
        if not self.admin_token or not self.created_withdrawal_id:
            self.log_result(test_name, False, "Admin token or withdrawal ID not available")
            return False
            
        # Store current token and use admin token
        original_token = self.token
        self.token = self.admin_token
        
        response = self.make_request("PUT", f"/admin/transactions/{self.created_withdrawal_id}/status", {"status": "completed"})
        
        # Restore original token
        self.token = original_token
        
        if response is None:
            self.log_result(test_name, False, "Request failed - connection error")
            return False
            
        if response.status_code == 200:
            self.log_result(test_name, True, "Withdrawal status updated successfully by admin")
            return True
        else:
            self.log_result(test_name, False, f"Withdrawal status update failed with status {response.status_code}", response.text)
            return False

    # ==================== ADMIN FUNCTION TESTS ====================
    
    def test_admin_get_all_users(self):
        """Test admin getting all users"""
        test_name = "Admin Get All Users"
        
        if not self.admin_token:
            self.log_result(test_name, False, "Admin token not available")
            return False
            
        # Store current token and use admin token
        original_token = self.token
        self.token = self.admin_token
        
        response = self.make_request("GET", "/admin/users")
        
        # Restore original token
        self.token = original_token
        
        if response is None:
            self.log_result(test_name, False, "Request failed - connection error")
            return False
            
        if response.status_code == 200:
            users = response.json()
            if isinstance(users, list) and len(users) > 0:
                # Verify no passwords are returned
                has_password = any("password" in user for user in users)
                if not has_password:
                    self.log_result(test_name, True, f"Retrieved {len(users)} users without password fields")
                    return True
                else:
                    self.log_result(test_name, False, "User data contains password fields")
                    return False
            else:
                self.log_result(test_name, False, "No users found or invalid format")
                return False
        else:
            self.log_result(test_name, False, f"Failed to get users with status {response.status_code}", response.text)
            return False

    def test_admin_dashboard(self):
        """Test admin dashboard statistics"""
        test_name = "Admin Dashboard Statistics"
        
        if not self.admin_token:
            self.log_result(test_name, False, "Admin token not available")
            return False
            
        # Store current token and use admin token
        original_token = self.token
        self.token = self.admin_token
        
        response = self.make_request("GET", "/admin/dashboard")
        
        # Restore original token
        self.token = original_token
        
        if response is None:
            self.log_result(test_name, False, "Request failed - connection error")
            return False
            
        if response.status_code == 200:
            dashboard = response.json()
            required_sections = ["users", "investments", "transactions"]
            missing_sections = [section for section in required_sections if section not in dashboard]
            
            if not missing_sections:
                users_stats = dashboard.get("users", {})
                investments_stats = dashboard.get("investments", {})
                
                self.log_result(test_name, True, f"Admin dashboard loaded successfully. Total users: {users_stats.get('total', 0)}, Active investments: {investments_stats.get('active', 0)}")
                return True
            else:
                self.log_result(test_name, False, f"Missing dashboard sections: {missing_sections}")
                return False
        else:
            self.log_result(test_name, False, f"Admin dashboard failed with status {response.status_code}", response.text)
            return False

    def test_platform_settings(self):
        """Test platform settings retrieval"""
        test_name = "Platform Settings Access"
        
        response = self.make_request("GET", "/settings")
        
        if response is None:
            self.log_result(test_name, False, "Request failed - connection error")
            return False
            
        if response.status_code == 200:
            settings = response.json()
            required_fields = ["withdrawal_fee", "min_deposit", "max_deposit", "min_withdrawal"]
            missing_fields = [field for field in required_fields if field not in settings]
            
            if not missing_fields:
                self.log_result(test_name, True, f"Platform settings retrieved successfully. Withdrawal fee: R$ {settings.get('withdrawal_fee')}")
                return True
            else:
                self.log_result(test_name, False, f"Missing settings fields: {missing_fields}")
                return False
        else:
            self.log_result(test_name, False, f"Settings request failed with status {response.status_code}", response.text)
            return False

    # ==================== ERROR HANDLING TESTS ====================
    
    def test_unauthorized_access(self):
        """Test unauthorized access to protected routes"""
        test_name = "Unauthorized Access Control"
        
        # Store original token and remove it
        original_token = self.token
        self.token = None
        
        protected_endpoints = [
            "/users/dashboard",
            "/investments",
            "/auth/me",
            "/transactions"
        ]
        
        all_blocked = True
        for endpoint in protected_endpoints:
            response = self.make_request("GET", endpoint)
            if response is None or response.status_code != 401:
                all_blocked = False
                break
        
        # Restore original token
        self.token = original_token
        
        if all_blocked:
            self.log_result(test_name, True, "All protected routes correctly require authentication")
            return True
        else:
            self.log_result(test_name, False, "Some protected routes allow unauthorized access")
            return False

    def test_non_admin_access_to_admin_routes(self):
        """Test non-admin user access to admin routes"""
        test_name = "Admin Route Access Control"
        
        if not self.token:
            self.log_result(test_name, False, "No user token available")
            return False
            
        admin_endpoints = [
            "/admin/users",
            "/admin/dashboard",
            "/admin/transactions"
        ]
        
        all_blocked = True
        for endpoint in admin_endpoints:
            response = self.make_request("GET", endpoint)
            if response is None or response.status_code != 403:
                all_blocked = False
                break
        
        if all_blocked:
            self.log_result(test_name, True, "All admin routes correctly require admin privileges")
            return True
        else:
            self.log_result(test_name, False, "Some admin routes allow non-admin access")
            return False

    # ==================== MAIN TEST RUNNER ====================
    
    def run_comprehensive_tests(self):
        """Run all comprehensive backend tests"""
        print("=" * 80)
        print("BYBIT INVESTMENT PLATFORM - COMPREHENSIVE BACKEND TESTING")
        print("Production Readiness Verification")
        print("=" * 80)
        print(f"Testing against: {self.base_url}")
        print(f"Test user: {TEST_USER_EMAIL}")
        print("=" * 80)
        
        # Authentication & User Management Tests
        print("\n🔐 AUTHENTICATION & USER MANAGEMENT TESTS")
        print("-" * 50)
        self.test_user_registration_comprehensive()
        self.test_duplicate_email_registration()
        self.test_admin_login()
        if self.admin_token and self.user_id:
            self.test_admin_user_approval()
        self.test_user_login_after_approval()
        if self.token:
            self.test_jwt_token_validation()
            self.test_invalid_token_access()
        
        # Dashboard & Balance Tests
        print("\n💰 DASHBOARD & BALANCE TESTS")
        print("-" * 50)
        if self.token:
            dashboard_success, dashboard = self.test_user_dashboard_access()
            if self.admin_token:
                self.test_admin_balance_adjustment()
        
        # Investment System Tests
        print("\n📈 INVESTMENT SYSTEM TESTS")
        print("-" * 50)
        plans_success, plans = self.test_get_investment_plans()
        if self.token and plans:
            self.test_create_investment_success(plans)
            self.test_investment_validation_errors(plans)
            self.test_get_user_investments()
        
        # Deposit System Tests
        print("\n💳 DEPOSIT SYSTEM TESTS")
        print("-" * 50)
        if self.token:
            self.test_create_deposit_request()
            if self.admin_token and self.created_deposit_id:
                self.test_admin_approve_deposit()
                self.test_balance_update_after_deposit()
        
        # Withdrawal System Tests
        print("\n💸 WITHDRAWAL SYSTEM TESTS")
        print("-" * 50)
        if self.token:
            self.test_create_withdrawal_request()
            self.test_withdrawal_with_active_investment()
            if self.admin_token and self.created_withdrawal_id:
                self.test_admin_withdrawal_status_update()
        
        # Admin Function Tests
        print("\n👑 ADMIN FUNCTION TESTS")
        print("-" * 50)
        if self.admin_token:
            self.test_admin_get_all_users()
            self.test_admin_dashboard()
        self.test_platform_settings()
        
        # Error Handling Tests
        print("\n🛡️ ERROR HANDLING & SECURITY TESTS")
        print("-" * 50)
        self.test_unauthorized_access()
        if self.token:
            self.test_non_admin_access_to_admin_routes()
        
        # Print comprehensive summary
        print("\n" + "=" * 80)
        print("COMPREHENSIVE TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%" if total > 0 else "0%")
        
        # Categorize results
        categories = {
            "Authentication": [],
            "Dashboard": [],
            "Investment": [],
            "Deposit": [],
            "Withdrawal": [],
            "Admin": [],
            "Security": []
        }
        
        for result in self.test_results:
            test_name = result["test"]
            if any(keyword in test_name.lower() for keyword in ["login", "registration", "token", "approval"]):
                categories["Authentication"].append(result)
            elif "dashboard" in test_name.lower() or "balance" in test_name.lower():
                categories["Dashboard"].append(result)
            elif "investment" in test_name.lower():
                categories["Investment"].append(result)
            elif "deposit" in test_name.lower():
                categories["Deposit"].append(result)
            elif "withdrawal" in test_name.lower():
                categories["Withdrawal"].append(result)
            elif "admin" in test_name.lower():
                categories["Admin"].append(result)
            else:
                categories["Security"].append(result)
        
        # Show category summaries
        for category, results in categories.items():
            if results:
                category_passed = sum(1 for r in results if r["success"])
                category_total = len(results)
                print(f"\n{category}: {category_passed}/{category_total} passed ({(category_passed/category_total)*100:.1f}%)")
        
        # Show failed tests
        failed_tests = [result for result in self.test_results if not result["success"]]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for result in failed_tests:
                print(f"  • {result['test']}: {result['message']}")
        else:
            print("\n✅ ALL TESTS PASSED - BACKEND IS PRODUCTION READY!")
        
        return self.test_results

if __name__ == "__main__":
    tester = ComprehensiveBackendTester()
    results = tester.run_comprehensive_tests()