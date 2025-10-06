#!/usr/bin/env python3
"""
BYBIT Investment Platform Admin Approval/Rejection Tests
Tests all admin approval and rejection buttons for user registration, deposits, and withdrawals
"""

import requests
import json
import uuid
from datetime import datetime
import time

# Configuration
BASE_URL = "https://cryptomine-dash-2.preview.emergentagent.com/api"
ADMIN_EMAIL = "skidolynx@gmail.com"
ADMIN_PASSWORD = "@Mypetname9"

class AdminApprovalTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.admin_token = None
        self.test_users = []  # Store test users for cleanup
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
    
    def make_request(self, method, endpoint, data=None, headers=None, token=None):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}{endpoint}"
        default_headers = {"Content-Type": "application/json"}
        
        if headers:
            default_headers.update(headers)
            
        # Use provided token or admin token
        auth_token = token or self.admin_token
        if auth_token and "Authorization" not in default_headers:
            default_headers["Authorization"] = f"Bearer {auth_token}"
        
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
    
    def admin_login(self):
        """Login as admin"""
        test_name = "Admin Login"
        
        admin_credentials = {
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }
        
        response = self.make_request("POST", "/auth/admin/login", admin_credentials, token=None)
        
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
    
    def create_test_user(self, suffix=""):
        """Create a test user for approval testing"""
        timestamp = int(time.time())
        user_data = {
            "username": f"testuser_{timestamp}{suffix}",
            "email": f"testuser_{timestamp}{suffix}@example.com",
            "password": "TestPassword123!",
            "full_name": f"Test User {suffix}",
            "phone": "+5511999999999",
            "country": "Brasil"
        }
        
        response = self.make_request("POST", "/auth/register", user_data, token=None)
        
        if response and response.status_code == 200:
            data = response.json()
            user_id = data.get("user_id")
            user_info = {
                "user_id": user_id,
                "email": user_data["email"],
                "password": user_data["password"],
                "username": user_data["username"]
            }
            self.test_users.append(user_info)
            return user_info
        return None
    
    def test_user_registration_approval(self):
        """Test 1: User Registration Approval"""
        test_name = "User Registration Approval"
        
        # Create test user
        user = self.create_test_user("_approve")
        if not user:
            self.log_result(test_name, False, "Failed to create test user")
            return False
        
        # Approve the user
        response = self.make_request("PUT", f"/admin/users/{user['user_id']}/approve")
        
        if response is None:
            self.log_result(test_name, False, "Request failed - connection error")
            return False
            
        if response.status_code == 200:
            # Verify user can now login
            login_response = self.make_request("POST", "/auth/login", {
                "email": user["email"],
                "password": user["password"]
            }, token=None)
            
            if login_response and login_response.status_code == 200:
                self.log_result(test_name, True, "User approved successfully and can login")
                return True
            else:
                self.log_result(test_name, False, "User approved but cannot login", login_response.text if login_response else "No response")
                return False
        else:
            self.log_result(test_name, False, f"User approval failed with status {response.status_code}", response.text)
            return False
    
    def test_user_registration_rejection(self):
        """Test 2: User Registration Rejection"""
        test_name = "User Registration Rejection"
        
        # Create test user
        user = self.create_test_user("_reject")
        if not user:
            self.log_result(test_name, False, "Failed to create test user")
            return False
        
        # Reject the user
        response = self.make_request("PUT", f"/admin/users/{user['user_id']}/reject")
        
        if response is None:
            self.log_result(test_name, False, "Request failed - connection error")
            return False
            
        if response.status_code == 200:
            # Verify user cannot login (should get rejected status)
            login_response = self.make_request("POST", "/auth/login", {
                "email": user["email"],
                "password": user["password"]
            }, token=None)
            
            if login_response and login_response.status_code == 403:
                error_msg = login_response.json().get("detail", "")
                if "rejeitada" in error_msg.lower() or "rejected" in error_msg.lower():
                    self.log_result(test_name, True, "User rejected successfully and cannot login")
                    return True
                else:
                    self.log_result(test_name, False, f"Wrong rejection message: {error_msg}")
                    return False
            else:
                self.log_result(test_name, False, "User rejected but login response unexpected", login_response.text if login_response else "No response")
                return False
        else:
            self.log_result(test_name, False, f"User rejection failed with status {response.status_code}", response.text)
            return False
    
    def test_deposit_approval(self):
        """Test 3: Deposit Approval"""
        test_name = "Deposit Approval"
        
        # Create and approve a test user first
        user = self.create_test_user("_deposit")
        if not user:
            self.log_result(test_name, False, "Failed to create test user")
            return False
        
        # Approve user
        approve_response = self.make_request("PUT", f"/admin/users/{user['user_id']}/approve")
        if not approve_response or approve_response.status_code != 200:
            self.log_result(test_name, False, "Failed to approve test user")
            return False
        
        # Login as user to get token
        login_response = self.make_request("POST", "/auth/login", {
            "email": user["email"],
            "password": user["password"]
        }, token=None)
        
        if not login_response or login_response.status_code != 200:
            self.log_result(test_name, False, "Failed to login as test user")
            return False
        
        user_token = login_response.json().get("token")
        
        # Create deposit request
        deposit_data = {
            "amount": 500.0,
            "payment_method": "PIX",
            "payment_proof": "test_proof_deposit_approval.jpg",
            "notes": "Test deposit for approval testing"
        }
        
        deposit_response = self.make_request("POST", "/deposits", deposit_data, token=user_token)
        
        if not deposit_response or deposit_response.status_code != 200:
            self.log_result(test_name, False, "Failed to create deposit request", deposit_response.text if deposit_response else "No response")
            return False
        
        transaction_id = deposit_response.json().get("transaction", {}).get("id")
        if not transaction_id:
            self.log_result(test_name, False, "No transaction ID returned from deposit creation")
            return False
        
        # Get user balance before approval
        dashboard_response = self.make_request("GET", "/users/dashboard", token=user_token)
        if not dashboard_response or dashboard_response.status_code != 200:
            self.log_result(test_name, False, "Failed to get user dashboard before approval")
            return False
        
        balance_before = dashboard_response.json().get("balance", {}).get("brl_balance", 0)
        
        # Admin approves the deposit
        approval_response = self.make_request("PUT", f"/admin/transactions/{transaction_id}/approve")
        
        if not approval_response or approval_response.status_code != 200:
            self.log_result(test_name, False, f"Deposit approval failed with status {approval_response.status_code if approval_response else 'No response'}", approval_response.text if approval_response else "No response")
            return False
        
        # Verify balance increased
        dashboard_after = self.make_request("GET", "/users/dashboard", token=user_token)
        if not dashboard_after or dashboard_after.status_code != 200:
            self.log_result(test_name, False, "Failed to get user dashboard after approval")
            return False
        
        balance_after = dashboard_after.json().get("balance", {}).get("brl_balance", 0)
        
        if balance_after == balance_before + 500.0:
            self.log_result(test_name, True, f"Deposit approved successfully. Balance increased from R$ {balance_before} to R$ {balance_after}")
            return True
        else:
            self.log_result(test_name, False, f"Balance not updated correctly. Before: R$ {balance_before}, After: R$ {balance_after}, Expected: R$ {balance_before + 500.0}")
            return False
    
    def test_deposit_rejection(self):
        """Test 4: Deposit Rejection"""
        test_name = "Deposit Rejection"
        
        # Create and approve a test user first
        user = self.create_test_user("_deposit_reject")
        if not user:
            self.log_result(test_name, False, "Failed to create test user")
            return False
        
        # Approve user
        approve_response = self.make_request("PUT", f"/admin/users/{user['user_id']}/approve")
        if not approve_response or approve_response.status_code != 200:
            self.log_result(test_name, False, "Failed to approve test user")
            return False
        
        # Login as user to get token
        login_response = self.make_request("POST", "/auth/login", {
            "email": user["email"],
            "password": user["password"]
        }, token=None)
        
        if not login_response or login_response.status_code != 200:
            self.log_result(test_name, False, "Failed to login as test user")
            return False
        
        user_token = login_response.json().get("token")
        
        # Create deposit request
        deposit_data = {
            "amount": 300.0,
            "payment_method": "PIX",
            "payment_proof": "test_proof_deposit_rejection.jpg",
            "notes": "Test deposit for rejection testing"
        }
        
        deposit_response = self.make_request("POST", "/deposits", deposit_data, token=user_token)
        
        if not deposit_response or deposit_response.status_code != 200:
            self.log_result(test_name, False, "Failed to create deposit request")
            return False
        
        transaction_id = deposit_response.json().get("transaction", {}).get("id")
        if not transaction_id:
            self.log_result(test_name, False, "No transaction ID returned from deposit creation")
            return False
        
        # Get user balance before rejection
        dashboard_response = self.make_request("GET", "/users/dashboard", token=user_token)
        if not dashboard_response or dashboard_response.status_code != 200:
            self.log_result(test_name, False, "Failed to get user dashboard before rejection")
            return False
        
        balance_before = dashboard_response.json().get("balance", {}).get("brl_balance", 0)
        
        # Admin rejects the deposit
        rejection_response = self.make_request("PUT", f"/admin/transactions/{transaction_id}/reject")
        
        if not rejection_response or rejection_response.status_code != 200:
            self.log_result(test_name, False, f"Deposit rejection failed with status {rejection_response.status_code if rejection_response else 'No response'}")
            return False
        
        # Verify balance remains unchanged
        dashboard_after = self.make_request("GET", "/users/dashboard", token=user_token)
        if not dashboard_after or dashboard_after.status_code != 200:
            self.log_result(test_name, False, "Failed to get user dashboard after rejection")
            return False
        
        balance_after = dashboard_after.json().get("balance", {}).get("brl_balance", 0)
        
        if balance_after == balance_before:
            self.log_result(test_name, True, f"Deposit rejected successfully. Balance remained unchanged at R$ {balance_after}")
            return True
        else:
            self.log_result(test_name, False, f"Balance changed unexpectedly. Before: R$ {balance_before}, After: R$ {balance_after}")
            return False
    
    def test_withdrawal_approval(self):
        """Test 5: Withdrawal Approval"""
        test_name = "Withdrawal Approval"
        
        # Create and approve a test user first
        user = self.create_test_user("_withdrawal")
        if not user:
            self.log_result(test_name, False, "Failed to create test user")
            return False
        
        # Approve user
        approve_response = self.make_request("PUT", f"/admin/users/{user['user_id']}/approve")
        if not approve_response or approve_response.status_code != 200:
            self.log_result(test_name, False, "Failed to approve test user")
            return False
        
        # Add balance to user for withdrawal testing
        balance_data = {
            "user_id": user["user_id"],
            "adjustment_type": "add",
            "amount": 1000.0,
            "balance_type": "available_for_withdrawal",
            "notes": "Test balance for withdrawal testing"
        }
        
        balance_response = self.make_request("POST", f"/admin/users/{user['user_id']}/balance", balance_data)
        if not balance_response or balance_response.status_code != 200:
            self.log_result(test_name, False, "Failed to add balance to test user")
            return False
        
        # Also add to brl_balance
        balance_data["balance_type"] = "brl_balance"
        balance_response2 = self.make_request("POST", f"/admin/users/{user['user_id']}/balance", balance_data)
        if not balance_response2 or balance_response2.status_code != 200:
            self.log_result(test_name, False, "Failed to add brl_balance to test user")
            return False
        
        # Login as user to get token
        login_response = self.make_request("POST", "/auth/login", {
            "email": user["email"],
            "password": user["password"]
        }, token=None)
        
        if not login_response or login_response.status_code != 200:
            self.log_result(test_name, False, "Failed to login as test user")
            return False
        
        user_token = login_response.json().get("token")
        
        # Create withdrawal request
        withdrawal_data = {
            "amount": 200.0,
            "payment_method": "PIX",
            "fee_payment_proof": "test_proof_withdrawal_approval.jpg"
        }
        
        withdrawal_response = self.make_request("POST", "/withdrawals", withdrawal_data, token=user_token)
        
        if not withdrawal_response or withdrawal_response.status_code != 200:
            self.log_result(test_name, False, "Failed to create withdrawal request", withdrawal_response.text if withdrawal_response else "No response")
            return False
        
        transaction_id = withdrawal_response.json().get("transaction", {}).get("id")
        if not transaction_id:
            self.log_result(test_name, False, "No transaction ID returned from withdrawal creation")
            return False
        
        # Admin approves/completes the withdrawal
        approval_response = self.make_request("PUT", f"/admin/transactions/{transaction_id}/approve")
        
        if not approval_response or approval_response.status_code != 200:
            self.log_result(test_name, False, f"Withdrawal approval failed with status {approval_response.status_code if approval_response else 'No response'}")
            return False
        
        # Verify transaction status changed to completed
        transactions_response = self.make_request("GET", "/transactions", token=user_token)
        if not transactions_response or transactions_response.status_code != 200:
            self.log_result(test_name, False, "Failed to get user transactions after approval")
            return False
        
        transactions = transactions_response.json()
        withdrawal_txn = next((txn for txn in transactions if txn["id"] == transaction_id), None)
        
        if withdrawal_txn and withdrawal_txn["status"] == "completed":
            self.log_result(test_name, True, f"Withdrawal approved successfully. Status changed to 'completed'")
            return True
        else:
            self.log_result(test_name, False, f"Withdrawal status not updated correctly. Current status: {withdrawal_txn['status'] if withdrawal_txn else 'Transaction not found'}")
            return False
    
    def test_withdrawal_rejection(self):
        """Test 6: Withdrawal Rejection"""
        test_name = "Withdrawal Rejection"
        
        # Create and approve a test user first
        user = self.create_test_user("_withdrawal_reject")
        if not user:
            self.log_result(test_name, False, "Failed to create test user")
            return False
        
        # Approve user
        approve_response = self.make_request("PUT", f"/admin/users/{user['user_id']}/approve")
        if not approve_response or approve_response.status_code != 200:
            self.log_result(test_name, False, "Failed to approve test user")
            return False
        
        # Add balance to user for withdrawal testing
        balance_data = {
            "user_id": user["user_id"],
            "adjustment_type": "add",
            "amount": 500.0,
            "balance_type": "available_for_withdrawal",
            "notes": "Test balance for withdrawal rejection testing"
        }
        
        balance_response = self.make_request("POST", f"/admin/users/{user['user_id']}/balance", balance_data)
        if not balance_response or balance_response.status_code != 200:
            self.log_result(test_name, False, "Failed to add balance to test user")
            return False
        
        # Also add to brl_balance
        balance_data["balance_type"] = "brl_balance"
        balance_response2 = self.make_request("POST", f"/admin/users/{user['user_id']}/balance", balance_data)
        if not balance_response2 or balance_response2.status_code != 200:
            self.log_result(test_name, False, "Failed to add brl_balance to test user")
            return False
        
        # Login as user to get token
        login_response = self.make_request("POST", "/auth/login", {
            "email": user["email"],
            "password": user["password"]
        }, token=None)
        
        if not login_response or login_response.status_code != 200:
            self.log_result(test_name, False, "Failed to login as test user")
            return False
        
        user_token = login_response.json().get("token")
        
        # Get balance before withdrawal
        dashboard_before = self.make_request("GET", "/users/dashboard", token=user_token)
        if not dashboard_before or dashboard_before.status_code != 200:
            self.log_result(test_name, False, "Failed to get user dashboard before withdrawal")
            return False
        
        balance_before = dashboard_before.json().get("balance", {}).get("available_for_withdrawal", 0)
        
        # Create withdrawal request
        withdrawal_data = {
            "amount": 100.0,
            "payment_method": "PIX",
            "fee_payment_proof": "test_proof_withdrawal_rejection.jpg"
        }
        
        withdrawal_response = self.make_request("POST", "/withdrawals", withdrawal_data, token=user_token)
        
        if not withdrawal_response or withdrawal_response.status_code != 200:
            self.log_result(test_name, False, "Failed to create withdrawal request")
            return False
        
        transaction_id = withdrawal_response.json().get("transaction", {}).get("id")
        if not transaction_id:
            self.log_result(test_name, False, "No transaction ID returned from withdrawal creation")
            return False
        
        # Admin rejects the withdrawal
        rejection_response = self.make_request("PUT", f"/admin/transactions/{transaction_id}/reject")
        
        if not rejection_response or rejection_response.status_code != 200:
            self.log_result(test_name, False, f"Withdrawal rejection failed with status {rejection_response.status_code if rejection_response else 'No response'}")
            return False
        
        # Verify balance is refunded
        dashboard_after = self.make_request("GET", "/users/dashboard", token=user_token)
        if not dashboard_after or dashboard_after.status_code != 200:
            self.log_result(test_name, False, "Failed to get user dashboard after rejection")
            return False
        
        balance_after = dashboard_after.json().get("balance", {}).get("available_for_withdrawal", 0)
        
        # Balance should be refunded (back to original amount)
        if balance_after == balance_before:
            self.log_result(test_name, True, f"Withdrawal rejected successfully. Balance refunded to R$ {balance_after}")
            return True
        else:
            self.log_result(test_name, False, f"Balance not refunded correctly. Before: R$ {balance_before}, After: R$ {balance_after}")
            return False
    
    def test_balance_adjustment_add(self):
        """Test 7: Balance Adjustment - Add"""
        test_name = "Balance Adjustment - Add R$ 1000"
        
        # Create and approve a test user first
        user = self.create_test_user("_balance_add")
        if not user:
            self.log_result(test_name, False, "Failed to create test user")
            return False
        
        # Approve user
        approve_response = self.make_request("PUT", f"/admin/users/{user['user_id']}/approve")
        if not approve_response or approve_response.status_code != 200:
            self.log_result(test_name, False, "Failed to approve test user")
            return False
        
        # Login as user to get token and check initial balance
        login_response = self.make_request("POST", "/auth/login", {
            "email": user["email"],
            "password": user["password"]
        }, token=None)
        
        if not login_response or login_response.status_code != 200:
            self.log_result(test_name, False, "Failed to login as test user")
            return False
        
        user_token = login_response.json().get("token")
        
        # Get initial balance
        dashboard_before = self.make_request("GET", "/users/dashboard", token=user_token)
        if not dashboard_before or dashboard_before.status_code != 200:
            self.log_result(test_name, False, "Failed to get user dashboard before adjustment")
            return False
        
        balance_before = dashboard_before.json().get("balance", {}).get("brl_balance", 0)
        
        # Admin adds balance
        balance_data = {
            "user_id": user["user_id"],
            "adjustment_type": "add",
            "amount": 1000.0,
            "balance_type": "brl_balance",
            "notes": "Test balance addition"
        }
        
        adjustment_response = self.make_request("POST", f"/admin/users/{user['user_id']}/balance", balance_data)
        
        if not adjustment_response or adjustment_response.status_code != 200:
            self.log_result(test_name, False, f"Balance adjustment failed with status {adjustment_response.status_code if adjustment_response else 'No response'}")
            return False
        
        # Verify balance increased
        dashboard_after = self.make_request("GET", "/users/dashboard", token=user_token)
        if not dashboard_after or dashboard_after.status_code != 200:
            self.log_result(test_name, False, "Failed to get user dashboard after adjustment")
            return False
        
        balance_after = dashboard_after.json().get("balance", {}).get("brl_balance", 0)
        
        if balance_after == balance_before + 1000.0:
            self.log_result(test_name, True, f"Balance increased correctly from R$ {balance_before} to R$ {balance_after}")
            return True
        else:
            self.log_result(test_name, False, f"Balance not increased correctly. Before: R$ {balance_before}, After: R$ {balance_after}, Expected: R$ {balance_before + 1000.0}")
            return False
    
    def test_balance_adjustment_subtract(self):
        """Test 8: Balance Adjustment - Subtract"""
        test_name = "Balance Adjustment - Subtract R$ 500"
        
        # Create and approve a test user first
        user = self.create_test_user("_balance_subtract")
        if not user:
            self.log_result(test_name, False, "Failed to create test user")
            return False
        
        # Approve user
        approve_response = self.make_request("PUT", f"/admin/users/{user['user_id']}/approve")
        if not approve_response or approve_response.status_code != 200:
            self.log_result(test_name, False, "Failed to approve test user")
            return False
        
        # Add initial balance first
        initial_balance_data = {
            "user_id": user["user_id"],
            "adjustment_type": "add",
            "amount": 1000.0,
            "balance_type": "brl_balance",
            "notes": "Initial balance for subtraction test"
        }
        
        initial_response = self.make_request("POST", f"/admin/users/{user['user_id']}/balance", initial_balance_data)
        if not initial_response or initial_response.status_code != 200:
            self.log_result(test_name, False, "Failed to add initial balance")
            return False
        
        # Login as user to get token and check balance
        login_response = self.make_request("POST", "/auth/login", {
            "email": user["email"],
            "password": user["password"]
        }, token=None)
        
        if not login_response or login_response.status_code != 200:
            self.log_result(test_name, False, "Failed to login as test user")
            return False
        
        user_token = login_response.json().get("token")
        
        # Get balance before subtraction
        dashboard_before = self.make_request("GET", "/users/dashboard", token=user_token)
        if not dashboard_before or dashboard_before.status_code != 200:
            self.log_result(test_name, False, "Failed to get user dashboard before subtraction")
            return False
        
        balance_before = dashboard_before.json().get("balance", {}).get("brl_balance", 0)
        
        # Admin subtracts balance
        balance_data = {
            "user_id": user["user_id"],
            "adjustment_type": "subtract",
            "amount": 500.0,
            "balance_type": "brl_balance",
            "notes": "Test balance subtraction"
        }
        
        adjustment_response = self.make_request("POST", f"/admin/users/{user['user_id']}/balance", balance_data)
        
        if not adjustment_response or adjustment_response.status_code != 200:
            self.log_result(test_name, False, f"Balance adjustment failed with status {adjustment_response.status_code if adjustment_response else 'No response'}")
            return False
        
        # Verify balance decreased
        dashboard_after = self.make_request("GET", "/users/dashboard", token=user_token)
        if not dashboard_after or dashboard_after.status_code != 200:
            self.log_result(test_name, False, "Failed to get user dashboard after adjustment")
            return False
        
        balance_after = dashboard_after.json().get("balance", {}).get("brl_balance", 0)
        
        if balance_after == balance_before - 500.0:
            self.log_result(test_name, True, f"Balance decreased correctly from R$ {balance_before} to R$ {balance_after}")
            return True
        else:
            self.log_result(test_name, False, f"Balance not decreased correctly. Before: R$ {balance_before}, After: R$ {balance_after}, Expected: R$ {balance_before - 500.0}")
            return False
    
    def run_all_tests(self):
        """Run all admin approval/rejection tests"""
        print("=" * 80)
        print("BYBIT Investment Platform Admin Approval/Rejection Tests")
        print("=" * 80)
        print(f"Testing against: {self.base_url}")
        print(f"Admin credentials: {ADMIN_EMAIL}")
        print("=" * 80)
        
        # Login as admin first
        if not self.admin_login():
            print("❌ Cannot proceed without admin access")
            return self.test_results
        
        # Run all test scenarios
        print("\n🔍 Testing User Registration Approval/Rejection...")
        self.test_user_registration_approval()
        self.test_user_registration_rejection()
        
        print("\n🔍 Testing Deposit Approval/Rejection...")
        self.test_deposit_approval()
        self.test_deposit_rejection()
        
        print("\n🔍 Testing Withdrawal Approval/Rejection...")
        self.test_withdrawal_approval()
        self.test_withdrawal_rejection()
        
        print("\n🔍 Testing Balance Adjustments...")
        self.test_balance_adjustment_add()
        self.test_balance_adjustment_subtract()
        
        # Print summary
        print("\n" + "=" * 80)
        print("TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%" if total > 0 else "0%")
        
        # Show failed tests
        failed_tests = [result for result in self.test_results if not result["success"]]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for result in failed_tests:
                print(f"  • {result['test']}: {result['message']}")
        else:
            print("\n✅ ALL TESTS PASSED!")
        
        # Show successful tests
        successful_tests = [result for result in self.test_results if result["success"]]
        if successful_tests:
            print("\n✅ SUCCESSFUL TESTS:")
            for result in successful_tests:
                print(f"  • {result['test']}: {result['message']}")
        
        return self.test_results

if __name__ == "__main__":
    tester = AdminApprovalTester()
    results = tester.run_all_tests()