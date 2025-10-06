#!/usr/bin/env python3
"""
Debug specific issues found in comprehensive testing
"""

import requests
import json
import time

BASE_URL = "https://cryptomine-dash-2.preview.emergentagent.com/api"

def make_request(method, endpoint, data=None, token=None):
    """Make HTTP request with error handling"""
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers, timeout=30)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=30)
        elif method.upper() == "PUT":
            response = requests.put(url, json=data, headers=headers, timeout=30)
        else:
            raise ValueError(f"Unsupported method: {method}")
            
        return response
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return None

def debug_withdrawal_issues():
    """Debug withdrawal system issues"""
    print("=== DEBUGGING WITHDRAWAL ISSUES ===")
    
    # First, let's login as admin and create a test user with no investments
    admin_credentials = {
        "email": "skidolynx@gmail.com",
        "password": "@Mypetname9"
    }
    
    admin_response = make_request("POST", "/auth/admin/login", admin_credentials)
    if not admin_response or admin_response.status_code != 200:
        print("❌ Admin login failed")
        return
    
    admin_token = admin_response.json().get("token")
    print("✅ Admin logged in")
    
    # Create a new test user for withdrawal testing
    test_user_email = f"withdrawal_test_{int(time.time())}@test.com"
    user_data = {
        "username": f"withdrawtest_{int(time.time())}",
        "email": test_user_email,
        "password": "TestPassword123!",
        "full_name": "Withdrawal Test User",
        "phone": "+5511999999999"
    }
    
    reg_response = make_request("POST", "/auth/register", user_data)
    if not reg_response or reg_response.status_code != 200:
        print("❌ User registration failed")
        return
    
    user_id = reg_response.json().get("user_id")
    print(f"✅ Test user created: {user_id}")
    
    # Approve user
    approve_response = make_request("PUT", f"/admin/users/{user_id}/approve", token=admin_token)
    if not approve_response or approve_response.status_code != 200:
        print("❌ User approval failed")
        return
    print("✅ User approved")
    
    # Add balance to user
    balance_data = {
        "user_id": user_id,
        "adjustment_type": "add",
        "amount": 1000.0,
        "balance_type": "available_for_withdrawal",
        "notes": "Test balance for withdrawal testing"
    }
    
    balance_response = make_request("POST", f"/admin/users/{user_id}/balance", balance_data, token=admin_token)
    if not balance_response or balance_response.status_code != 200:
        print("❌ Balance adjustment failed")
        return
    print("✅ Balance added (R$ 1000)")
    
    # Login as test user
    login_response = make_request("POST", "/auth/login", {
        "email": test_user_email,
        "password": "TestPassword123!"
    })
    
    if not login_response or login_response.status_code != 200:
        print("❌ User login failed")
        return
    
    user_token = login_response.json().get("token")
    print("✅ User logged in")
    
    # Check user dashboard
    dashboard_response = make_request("GET", "/users/dashboard", token=user_token)
    if dashboard_response and dashboard_response.status_code == 200:
        dashboard = dashboard_response.json()
        balance = dashboard.get("balance", {})
        available = balance.get("available_for_withdrawal", 0)
        print(f"✅ User balance: R$ {available}")
        
        # Check for active investments
        stats = dashboard.get("stats", {})
        active_investments = stats.get("active_investments", 0)
        print(f"✅ Active investments: {active_investments}")
    
    # Get platform settings to check minimum withdrawal
    settings_response = make_request("GET", "/settings")
    if settings_response and settings_response.status_code == 200:
        settings = settings_response.json()
        min_withdrawal = settings.get("min_withdrawal", 0)
        withdrawal_fee = settings.get("withdrawal_fee", 0)
        print(f"✅ Min withdrawal: R$ {min_withdrawal}, Fee: R$ {withdrawal_fee}")
    
    # Try withdrawal with different amounts
    test_amounts = [50.0, 100.0, 200.0]  # Below min, at min, above min
    
    for amount in test_amounts:
        print(f"\n--- Testing withdrawal of R$ {amount} ---")
        withdrawal_data = {
            "amount": amount,
            "payment_method": "pix",
            "fee_payment_proof": "test_proof.jpg"
        }
        
        withdrawal_response = make_request("POST", "/withdrawals", withdrawal_data, token=user_token)
        
        if withdrawal_response:
            print(f"Status: {withdrawal_response.status_code}")
            response_data = withdrawal_response.json()
            print(f"Response: {response_data}")
            
            if withdrawal_response.status_code == 200:
                print("✅ Withdrawal created successfully")
            else:
                error_detail = response_data.get("detail", "Unknown error")
                print(f"❌ Withdrawal failed: {error_detail}")
        else:
            print("❌ Request failed")

def debug_investment_validation():
    """Debug investment validation order"""
    print("\n=== DEBUGGING INVESTMENT VALIDATION ===")
    
    # Login as existing user with balance
    login_response = make_request("POST", "/auth/login", {
        "email": "prodtest_1759722178@bybit.com",
        "password": "SecurePassword123!"
    })
    
    if not login_response or login_response.status_code != 200:
        print("❌ User login failed")
        return
    
    user_token = login_response.json().get("token")
    print("✅ User logged in")
    
    # Get investment plans
    plans_response = make_request("GET", "/investment-plans")
    if not plans_response or plans_response.status_code != 200:
        print("❌ Failed to get investment plans")
        return
    
    plans = plans_response.json()
    plan = plans[0]  # Use first plan
    print(f"✅ Using plan: {plan['name']} (min: R$ {plan['min_amount']}, max: R$ {plan['max_amount']})")
    
    # Check current balance
    dashboard_response = make_request("GET", "/users/dashboard", token=user_token)
    if dashboard_response and dashboard_response.status_code == 200:
        dashboard = dashboard_response.json()
        balance = dashboard.get("balance", {})
        available = balance.get("available_for_withdrawal", 0)
        print(f"✅ Available balance: R$ {available}")
    
    # Test investment with amount way above balance but within plan limits
    test_amount = min(plan['max_amount'], 4000.0)  # Use max plan amount or 4000, whichever is smaller
    print(f"\n--- Testing investment of R$ {test_amount} (should trigger insufficient balance) ---")
    
    investment_data = {
        "plan_id": plan["id"],
        "amount": test_amount
    }
    
    investment_response = make_request("POST", "/investments", investment_data, token=user_token)
    
    if investment_response:
        print(f"Status: {investment_response.status_code}")
        response_data = investment_response.json()
        print(f"Response: {response_data}")
        
        if investment_response.status_code == 400:
            error_detail = response_data.get("detail", "Unknown error")
            if "saldo insuficiente" in error_detail.lower():
                print("✅ Correctly returned insufficient balance error")
            elif "valor deve estar entre" in error_detail.lower():
                print("❌ Returned amount range error instead of insufficient balance")
            else:
                print(f"❌ Unexpected error: {error_detail}")
        else:
            print(f"❌ Unexpected status code: {investment_response.status_code}")
    else:
        print("❌ Request failed")

if __name__ == "__main__":
    debug_withdrawal_issues()
    debug_investment_validation()