from fastapi import FastAPI, APIRouter, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import os
import logging
from typing import Optional, List
from datetime import datetime, timedelta
import uuid

# Import custom modules
from models import *
from auth import hash_password, verify_password, create_access_token, decode_token, generate_referral_code
from database import init_database
from scheduler import start_scheduler

# Setup
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create FastAPI app
app = FastAPI(title="BYBIT Investment Platform API")
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Dependency for authentication
async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token não fornecido")
    
    try:
        token = authorization.replace("Bearer ", "")
        payload = decode_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Token inválido ou expirado")
        
        user_id = payload.get("user_id")
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=401, detail="Usuário não encontrado")
        
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

async def get_admin_user(authorization: Optional[str] = Header(None)):
    user = await get_current_user(authorization)
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas administradores.")
    return user

# ==================== AUTHENTICATION ENDPOINTS ====================

@api_router.post("/auth/register")
async def register_user(user_data: UserCreate):
    """Register a new user (requires admin approval)"""
    try:
        # Check if email exists
        existing_email = await db.users.find_one({"email": user_data.email})
        if existing_email:
            raise HTTPException(status_code=400, detail="Email já cadastrado")
        
        # Check if username exists
        existing_username = await db.users.find_one({"username": user_data.username})
        if existing_username:
            raise HTTPException(status_code=400, detail="Nome de usuário já existe")
        
        # Create user
        user_id = str(uuid.uuid4())
        referral_code = generate_referral_code(user_data.username)
        
        user_dict = user_data.dict()
        user_dict["id"] = user_id
        user_dict["password"] = hash_password(user_data.password)
        user_dict["status"] = UserStatus.PENDING
        user_dict["brl_balance"] = 0.0
        user_dict["available_for_withdrawal"] = 0.0
        user_dict["total_invested"] = 0.0
        user_dict["total_returns"] = 0.0
        user_dict["referral_bonus"] = 0.0
        user_dict["bonus_balance"] = 0.0
        user_dict["referral_code"] = referral_code
        user_dict["kyc_verified"] = False
        user_dict["kyc_percentage"] = 0
        user_dict["is_admin"] = False
        user_dict["created_at"] = datetime.utcnow()
        user_dict["member_since"] = datetime.utcnow()
        
        await db.users.insert_one(user_dict)
        
        return {
            "message": "Cadastro realizado! Aguarde aprovação do administrador.",
            "user_id": user_id,
            "status": "pending"
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao registrar usuário")

@api_router.post("/auth/login")
async def login_user(credentials: UserLogin):
    """User login"""
    try:
        user = await db.users.find_one({"email": credentials.email})
        if not user or not verify_password(credentials.password, user["password"]):
            raise HTTPException(status_code=401, detail="Email ou senha incorretos")
        
        if user["status"] == UserStatus.PENDING:
            raise HTTPException(status_code=403, detail="Sua conta está aguardando aprovação do administrador")
        
        if user["status"] == UserStatus.SUSPENDED:
            raise HTTPException(status_code=403, detail="Sua conta foi suspensa. Entre em contato com o suporte.")
        
        if user["status"] == UserStatus.REJECTED:
            raise HTTPException(status_code=403, detail="Sua conta foi rejeitada")
        
        # Create token
        token = create_access_token({"user_id": user["id"], "email": user["email"]})
        
        # Remove password from response
        user.pop("password", None)
        user.pop("_id", None)
        
        return {
            "token": token,
            "user": user,
            "message": "Login realizado com sucesso"
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao fazer login")

@api_router.post("/auth/admin/login")
async def admin_login(credentials: AdminLogin):
    """Admin login"""
    try:
        user = await db.users.find_one({"email": credentials.email})
        if not user or not verify_password(credentials.password, user["password"]):
            raise HTTPException(status_code=401, detail="Email ou senha incorretos")
        
        if not user.get("is_admin"):
            raise HTTPException(status_code=403, detail="Acesso negado. Não é administrador.")
        
        # Create token
        token = create_access_token({"user_id": user["id"], "email": user["email"], "is_admin": True})
        
        # Remove password from response
        user.pop("password", None)
        user.pop("_id", None)
        
        return {
            "token": token,
            "user": user,
            "message": "Login de administrador realizado"
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Admin login error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao fazer login")

@api_router.get("/auth/me")
async def get_current_user_info(user=Depends(get_current_user)):
    """Get current user information"""
    user.pop("password", None)
    user.pop("_id", None)
    return user

# ==================== USER ENDPOINTS ====================

@api_router.get("/users/dashboard")
async def get_user_dashboard(user=Depends(get_current_user)):
    """Get user dashboard data"""
    try:
        # Get active investments count
        active_investments = await db.investments.count_documents({
            "user_id": user["id"],
            "status": "active"
        })
        
        # Get recent transactions
        transactions = await db.transactions.find({
            "user_id": user["id"]
        }).sort("created_at", -1).limit(5).to_list(5)
        
        for txn in transactions:
            txn.pop("_id", None)
        
        # Get referral stats
        referrals = await db.referrals.count_documents({
            "referrer_id": user["id"]
        })
        
        return {
            "balance": {
                "brl_balance": user.get("brl_balance", 0.0),
                "available_for_withdrawal": user.get("available_for_withdrawal", 0.0),
                "total_invested": user.get("total_invested", 0.0),
                "total_returns": user.get("total_returns", 0.0),
                "referral_bonus": user.get("referral_bonus", 0.0),
                "bonus_balance": user.get("bonus_balance", 0.0)
            },
            "stats": {
                "active_investments": active_investments,
                "total_referrals": referrals
            },
            "recent_transactions": transactions
        }
    except Exception as e:
        logger.error(f"Dashboard error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao carregar dashboard")

@api_router.put("/users/profile")
async def update_user_profile(profile_data: UserUpdate, user=Depends(get_current_user)):
    """Update user profile"""
    try:
        update_data = {k: v for k, v in profile_data.dict().items() if v is not None}
        
        if update_data:
            await db.users.update_one(
                {"id": user["id"]},
                {"$set": update_data}
            )
        
        updated_user = await db.users.find_one({"id": user["id"]})
        updated_user.pop("password", None)
        updated_user.pop("_id", None)
        
        return {"message": "Perfil atualizado com sucesso", "user": updated_user}
    except Exception as e:
        logger.error(f"Profile update error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao atualizar perfil")

# ==================== INVESTMENT ENDPOINTS ====================

@api_router.get("/investment-plans")
async def get_investment_plans():
    """Get all active investment plans"""
    try:
        plans = await db.investment_plans.find({"active": True}).to_list(None)
        for plan in plans:
            plan.pop("_id", None)
        return plans
    except Exception as e:
        logger.error(f"Get plans error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao buscar planos")

@api_router.post("/investments")
async def create_investment(investment_data: InvestmentCreate, user=Depends(get_current_user)):
    """Create a new investment"""
    try:
        # Get plan
        plan = await db.investment_plans.find_one({"id": investment_data.plan_id})
        if not plan:
            raise HTTPException(status_code=404, detail="Plano não encontrado")
        
        # Validate amount
        if investment_data.amount < plan["min_amount"] or investment_data.amount > plan["max_amount"]:
            raise HTTPException(
                status_code=400,
                detail=f"Valor deve estar entre R$ {plan['min_amount']:.2f} e R$ {plan['max_amount']:.2f}"
            )
        
        # Check user balance
        if user["available_for_withdrawal"] < investment_data.amount:
            raise HTTPException(status_code=400, detail="Saldo insuficiente")
        
        # Calculate profit
        profit_per_cycle = (investment_data.amount / 200) * 40  # R$40 per R$200
        total_cycles = plan["lock_hours"] // plan["profit_interval_hours"]
        total_profit = profit_per_cycle * total_cycles
        
        # Create investment
        investment_id = str(uuid.uuid4())
        now = datetime.utcnow()
        end_date = now + timedelta(hours=plan["lock_hours"])
        next_profit = now + timedelta(hours=plan["profit_interval_hours"])
        
        investment = {
            "id": investment_id,
            "user_id": user["id"],
            "plan_id": plan["id"],
            "plan_name": plan["name"],
            "amount": investment_data.amount,
            "total_profit": total_profit,
            "profit_per_cycle": profit_per_cycle,
            "total_cycles": total_cycles,
            "completed_cycles": 0,
            "status": "active",
            "start_date": now,
            "end_date": end_date,
            "next_profit_at": next_profit,
            "created_at": now
        }
        
        await db.investments.insert_one(investment)
        
        # Update user balance
        await db.users.update_one(
            {"id": user["id"]},
            {
                "$inc": {
                    "available_for_withdrawal": -investment_data.amount,
                    "total_invested": investment_data.amount
                }
            }
        )
        
        # Create transaction
        transaction = {
            "id": f"txn_{user['id']}_{int(now.timestamp())}",
            "user_id": user["id"],
            "type": "investment",
            "amount": investment_data.amount,
            "status": "completed",
            "notes": f"Investimento - {plan['name']}",
            "created_at": now,
            "processed_at": now
        }
        await db.transactions.insert_one(transaction)
        
        investment.pop("_id", None)
        return {"message": "Investimento criado com sucesso", "investment": investment}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Create investment error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao criar investimento")

@api_router.get("/investments")
async def get_user_investments(user=Depends(get_current_user)):
    """Get user's investments"""
    try:
        investments = await db.investments.find({"user_id": user["id"]}).sort("created_at", -1).to_list(None)
        for inv in investments:
            inv.pop("_id", None)
        return investments
    except Exception as e:
        logger.error(f"Get investments error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao buscar investimentos")

# ==================== TRANSACTION ENDPOINTS ====================

@api_router.post("/deposits")
async def create_deposit(deposit_data: DepositCreate, user=Depends(get_current_user)):
    """Create a deposit request"""
    try:
        transaction_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        transaction = {
            "id": transaction_id,
            "user_id": user["id"],
            "type": "deposit",
            "amount": deposit_data.amount,
            "status": "pending",
            "payment_method": deposit_data.payment_method,
            "payment_proof": deposit_data.payment_proof,
            "notes": deposit_data.notes,
            "created_at": now
        }
        
        await db.transactions.insert_one(transaction)
        
        transaction.pop("_id", None)
        return {"message": "Solicitação de depósito criada. Aguarde aprovação.", "transaction": transaction}
    except Exception as e:
        logger.error(f"Create deposit error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao criar depósito")

@api_router.post("/withdrawals")
async def create_withdrawal(withdrawal_data: WithdrawalCreate, user=Depends(get_current_user)):
    """Create a withdrawal request"""
    try:
        # Get withdrawal settings
        settings = await db.platform_settings.find_one({"id": "platform_settings"})
        withdrawal_fee = settings.get("withdrawal_fee", 500.0)
        fee_method = settings.get("withdrawal_fee_method", "require_deposit")
        
        # Check minimum
        min_withdrawal = settings.get("min_withdrawal", 10.0)
        if withdrawal_data.amount < min_withdrawal:
            raise HTTPException(status_code=400, detail=f"Valor mínimo de saque: R$ {min_withdrawal:.2f}")
        
        # Check balance
        if user["available_for_withdrawal"] < withdrawal_data.amount:
            raise HTTPException(status_code=400, detail="Saldo insuficiente")
        
        # Check for active investments
        active_investments = await db.investments.count_documents({
            "user_id": user["id"],
            "status": "active"
        })
        if active_investments > 0:
            raise HTTPException(status_code=400, detail="Não é possível sacar com investimentos ativos")
        
        transaction_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        # Deduct amount from user balance immediately (pending status)
        await db.users.update_one(
            {"id": user["id"]},
            {
                "$inc": {
                    "available_for_withdrawal": -withdrawal_data.amount,
                    "brl_balance": -withdrawal_data.amount
                }
            }
        )
        
        transaction = {
            "id": transaction_id,
            "user_id": user["id"],
            "type": "withdrawal",
            "amount": withdrawal_data.amount,
            "status": "processing",
            "payment_method": withdrawal_data.payment_method,
            "payment_proof": withdrawal_data.fee_payment_proof,
            "notes": f"Taxa de saque: R$ {withdrawal_fee:.2f} - Método: {fee_method}",
            "created_at": now
        }
        
        await db.transactions.insert_one(transaction)
        
        transaction.pop("_id", None)
        return {
            "message": "Solicitação de saque criada. Aguarde processamento.",
            "transaction": transaction,
            "withdrawal_fee": withdrawal_fee,
            "fee_method": fee_method
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Create withdrawal error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao criar saque")

@api_router.get("/transactions")
async def get_user_transactions(user=Depends(get_current_user)):
    """Get user's transaction history"""
    try:
        transactions = await db.transactions.find({"user_id": user["id"]}).sort("created_at", -1).to_list(None)
        for txn in transactions:
            txn.pop("_id", None)
        return transactions
    except Exception as e:
        logger.error(f"Get transactions error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao buscar transações")

# ==================== REFERRAL ENDPOINTS ====================

@api_router.get("/referrals")
async def get_user_referrals(user=Depends(get_current_user)):
    """Get user's referral data"""
    try:
        # Get direct referrals
        referrals = await db.referrals.find({"referrer_id": user["id"]}).to_list(None)
        
        # Get commission history
        commissions = await db.commissions.find({"referrer_id": user["id"]}).sort("created_at", -1).to_list(None)
        
        for ref in referrals:
            ref.pop("_id", None)
        for comm in commissions:
            comm.pop("_id", None)
        
        return {
            "referral_code": user.get("referral_code"),
            "total_referrals": len(referrals),
            "total_commission": user.get("referral_bonus", 0.0),
            "referrals": referrals,
            "commissions": commissions
        }
    except Exception as e:
        logger.error(f"Get referrals error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao buscar indicações")

# ==================== PLATFORM SETTINGS ENDPOINTS ====================

@api_router.get("/settings")
async def get_platform_settings():
    """Get public platform settings (payment methods, fees, etc.)"""
    try:
        settings = await db.platform_settings.find_one({"id": "platform_settings"})
        if settings:
            settings.pop("_id", None)
            return settings
        return {}
    except Exception as e:
        logger.error(f"Get settings error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao buscar configurações")

# ==================== ADMIN ENDPOINTS ====================

@api_router.get("/admin/users")
async def get_all_users(status: Optional[str] = None, admin=Depends(get_admin_user)):
    """Get all users (admin only)"""
    try:
        query = {}
        if status:
            query["status"] = status
        
        users = await db.users.find(query).sort("created_at", -1).to_list(None)
        for user in users:
            user.pop("password", None)
            user.pop("_id", None)
        
        return users
    except Exception as e:
        logger.error(f"Get users error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao buscar usuários")

@api_router.put("/admin/users/{user_id}/approve")
async def approve_user(user_id: str, admin=Depends(get_admin_user)):
    """Approve a pending user"""
    try:
        result = await db.users.update_one(
            {"id": user_id},
            {
                "$set": {
                    "status": "active",
                    "approved_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        logger.info(f"User {user_id} approved by admin {admin['email']}")
        return {"message": "Usuário aprovado com sucesso"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Approve user error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao aprovar usuário")

@api_router.put("/admin/users/{user_id}/reject")
async def reject_user(user_id: str, admin=Depends(get_admin_user)):
    """Reject a pending user"""
    try:
        result = await db.users.update_one(
            {"id": user_id},
            {
                "$set": {
                    "status": "rejected",
                    "rejected_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        logger.info(f"User {user_id} rejected by admin {admin['email']}")
        return {"message": "Usuário rejeitado"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Reject user error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao rejeitar usuário")

@api_router.put("/admin/users/{user_id}")
async def update_user(user_id: str, user_data: UserUpdate, admin=Depends(get_admin_user)):
    """Update any user's information (admin only)"""
    try:
        update_data = {k: v for k, v in user_data.dict().items() if v is not None}
        
        if update_data:
            result = await db.users.update_one(
                {"id": user_id},
                {"$set": update_data}
            )
            
            if result.modified_count == 0:
                raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        return {"message": "Usuário atualizado com sucesso"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Update user error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao atualizar usuário")

@api_router.post("/admin/users/{user_id}/balance")
async def adjust_user_balance(user_id: str, adjustment: BalanceAdjustment, admin=Depends(get_admin_user)):
    """Adjust user balance (admin only)"""
    try:
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        update_op = {}
        if adjustment.adjustment_type == "add":
            update_op = {"$inc": {adjustment.balance_type: adjustment.amount}}
        elif adjustment.adjustment_type == "subtract":
            update_op = {"$inc": {adjustment.balance_type: -adjustment.amount}}
        elif adjustment.adjustment_type == "set":
            update_op = {"$set": {adjustment.balance_type: adjustment.amount}}
        else:
            raise HTTPException(status_code=400, detail="Tipo de ajuste inválido")
        
        await db.users.update_one({"id": user_id}, update_op)
        
        # Create audit transaction
        transaction = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "type": "admin_adjustment",
            "amount": adjustment.amount,
            "status": "completed",
            "notes": adjustment.notes or f"Ajuste administrativo - {adjustment.adjustment_type} - {adjustment.balance_type}",
            "processed_by": admin["id"],
            "created_at": datetime.utcnow(),
            "processed_at": datetime.utcnow()
        }
        await db.transactions.insert_one(transaction)
        
        return {"message": "Saldo ajustado com sucesso"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Adjust balance error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao ajustar saldo")

@api_router.get("/admin/transactions")
async def get_all_transactions(
    type: Optional[str] = None,
    status: Optional[str] = None,
    admin=Depends(get_admin_user)
):
    """Get all transactions (admin only)"""
    try:
        query = {}
        if type:
            query["type"] = type
        if status:
            query["status"] = status
        
        transactions = await db.transactions.find(query).sort("created_at", -1).to_list(None)
        for txn in transactions:
            txn.pop("_id", None)
        
        return transactions
    except Exception as e:
        logger.error(f"Get all transactions error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao buscar transações")

@api_router.put("/admin/transactions/{transaction_id}/approve")
async def approve_transaction(transaction_id: str, admin=Depends(get_admin_user)):
    """Approve a pending transaction (deposit/withdrawal)"""
    try:
        transaction = await db.transactions.find_one({"id": transaction_id})
        if not transaction:
            raise HTTPException(status_code=404, detail="Transação não encontrada")
        
        if transaction["status"] in ["approved", "completed"]:
            raise HTTPException(status_code=400, detail="Transação já processada")
        
        # Update transaction
        await db.transactions.update_one(
            {"id": transaction_id},
            {
                "$set": {
                    "status": "approved" if transaction["type"] == "deposit" else "completed",
                    "processed_by": admin["id"],
                    "processed_at": datetime.utcnow()
                }
            }
        )
        
        # Update user balance based on transaction type
        if transaction["type"] == "deposit":
            # Add balance on deposit approval
            await db.users.update_one(
                {"id": transaction["user_id"]},
                {
                    "$inc": {
                        "brl_balance": transaction["amount"],
                        "available_for_withdrawal": transaction["amount"]
                    }
                }
            )
            logger.info(f"Deposit {transaction_id} approved by admin {admin['email']} - R$ {transaction['amount']} added to user {transaction['user_id']}")
        else:
            # Withdrawal balance was already deducted on creation
            logger.info(f"Withdrawal {transaction_id} approved by admin {admin['email']} - R$ {transaction['amount']} for user {transaction['user_id']}")
        
        return {"message": "Transação aprovada com sucesso"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Approve transaction error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao aprovar transação")

@api_router.put("/admin/transactions/{transaction_id}/reject")
async def reject_transaction(transaction_id: str, reason: Optional[str] = None, admin=Depends(get_admin_user)):
    """Reject a pending transaction"""
    try:
        transaction = await db.transactions.find_one({"id": transaction_id})
        if not transaction:
            raise HTTPException(status_code=404, detail="Transação não encontrada")
        
        if transaction["status"] in ["approved", "rejected", "completed"]:
            raise HTTPException(status_code=400, detail="Transação já processada")
        
        # If rejecting a withdrawal, refund the amount
        if transaction["type"] == "withdrawal":
            await db.users.update_one(
                {"id": transaction["user_id"]},
                {
                    "$inc": {
                        "available_for_withdrawal": transaction["amount"],
                        "brl_balance": transaction["amount"]
                    }
                }
            )
            logger.info(f"Withdrawal {transaction_id} rejected by admin {admin['email']} - R$ {transaction['amount']} refunded to user {transaction['user_id']}")
        else:
            logger.info(f"{transaction['type'].capitalize()} {transaction_id} rejected by admin {admin['email']}")
        
        await db.transactions.update_one(
            {"id": transaction_id},
            {
                "$set": {
                    "status": "rejected",
                    "processed_by": admin["id"],
                    "processed_at": datetime.utcnow(),
                    "notes": reason or transaction.get("notes", "")
                }
            }
        )
        
        return {"message": "Transação rejeitada"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Reject transaction error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao rejeitar transação")

@api_router.put("/admin/transactions/{transaction_id}/status")
async def update_withdrawal_status(transaction_id: str, status: str, admin=Depends(get_admin_user)):
    """Update withdrawal status (processing, pending, completed)"""
    try:
        transaction = await db.transactions.find_one({"id": transaction_id})
        if not transaction:
            raise HTTPException(status_code=404, detail="Transação não encontrada")
        
        if transaction["type"] != "withdrawal":
            raise HTTPException(status_code=400, detail="Apenas saques podem ter status alterado")
        
        valid_statuses = ["processing", "pending", "completed"]
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail="Status inválido")
        
        await db.transactions.update_one(
            {"id": transaction_id},
            {
                "$set": {
                    "status": status,
                    "processed_by": admin["id"],
                    "processed_at": datetime.utcnow()
                }
            }
        )
        
        return {"message": f"Status atualizado para {status}"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Update status error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao atualizar status")

@api_router.put("/admin/settings")
async def update_platform_settings(settings_data: PlatformSettings, admin=Depends(get_admin_user)):
    """Update platform settings (admin only)"""
    try:
        settings_dict = settings_data.dict()
        settings_dict["updated_at"] = datetime.utcnow()
        
        await db.platform_settings.update_one(
            {"id": "platform_settings"},
            {"$set": settings_dict},
            upsert=True
        )
        
        return {"message": "Configurações atualizadas com sucesso"}
    except Exception as e:
        logger.error(f"Update settings error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao atualizar configurações")

@api_router.get("/admin/dashboard")
async def get_admin_dashboard(admin=Depends(get_admin_user)):
    """Get admin dashboard statistics"""
    try:
        # User stats
        total_users = await db.users.count_documents({"is_admin": {"$ne": True}})
        pending_users = await db.users.count_documents({"status": "pending"})
        active_users = await db.users.count_documents({"status": "active"})
        
        # Investment stats
        active_investments = await db.investments.count_documents({"status": "active"})
        total_investments = await db.investments.count_documents({})
        
        # Calculate total invested and profits
        pipeline = [
            {"$group": {
                "_id": None,
                "total_invested": {"$sum": "$amount"},
                "total_profit": {"$sum": "$total_profit"}
            }}
        ]
        inv_stats = await db.investments.aggregate(pipeline).to_list(1)
        total_invested = inv_stats[0]["total_invested"] if inv_stats else 0
        total_profit = inv_stats[0]["total_profit"] if inv_stats else 0
        
        # Transaction stats
        pending_deposits = await db.transactions.count_documents({"type": "deposit", "status": "pending"})
        pending_withdrawals = await db.transactions.count_documents({"type": "withdrawal", "status": "pending"})
        
        return {
            "users": {
                "total": total_users,
                "pending": pending_users,
                "active": active_users
            },
            "investments": {
                "active": active_investments,
                "total": total_investments,
                "total_invested": total_invested,
                "total_profit": total_profit
            },
            "transactions": {
                "pending_deposits": pending_deposits,
                "pending_withdrawals": pending_withdrawals
            }
        }
    except Exception as e:
        logger.error(f"Admin dashboard error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao carregar dashboard")

@api_router.get("/admin/investments")
async def get_all_investments(admin=Depends(get_admin_user)):
    """Get all investments (admin only)"""
    try:
        investments = await db.investments.find({}).sort("created_at", -1).to_list(None)
        for inv in investments:
            inv.pop("_id", None)
        return investments
    except Exception as e:
        logger.error(f"Get all investments error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao buscar investimentos")

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize database and start scheduler on startup"""
    await init_database(db)
    start_scheduler(db)
    logger.info("BYBIT Platform API started successfully")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    logger.info("Database connection closed")
