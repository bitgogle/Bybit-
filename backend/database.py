from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime
from auth import hash_password
import logging

logger = logging.getLogger(__name__)

async def init_database(db):
    """Initialize database with default data"""
    
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("username", unique=True)
    await db.users.create_index("referral_code", unique=True)
    await db.investments.create_index("user_id")
    await db.transactions.create_index("user_id")
    await db.referrals.create_index("referrer_id")
    await db.referrals.create_index("referred_user_id")
    
    # Seed admin account
    admin_exists = await db.users.find_one({"email": "skidolynx@gmail.com"})
    if not admin_exists:
        admin_user = {
            "id": "admin_001",
            "email": "skidolynx@gmail.com",
            "password": hash_password("@Mypetname9"),
            "full_name": "BYBIT Admin",
            "username": "admin",
            "country": "Brasil",
            "status": "active",
            "is_admin": True,
            "brl_balance": 0.0,
            "available_for_withdrawal": 0.0,
            "total_invested": 0.0,
            "total_returns": 0.0,
            "referral_bonus": 0.0,
            "bonus_balance": 0.0,
            "referral_code": "ADMIN000001",
            "referred_by": None,
            "kyc_verified": True,
            "kyc_percentage": 100,
            "created_at": datetime.utcnow(),
            "approved_at": datetime.utcnow(),
            "member_since": datetime.utcnow()
        }
        await db.users.insert_one(admin_user)
        logger.info("Admin account created successfully")
    
    # Seed investment plans
    plans_exist = await db.investment_plans.count_documents({})
    if plans_exist == 0:
        investment_plans = [
            {
                "id": "plan_48h",
                "name": "Plano 48 Horas",
                "lock_hours": 48,
                "min_amount": 200.0,
                "max_amount": 5000.0,
                "profit_rate": 0.20,  # R$40 per R$200 = 20% per cycle
                "profit_interval_hours": 6,
                "popular": False,
                "active": True,
                "description": "Bloqueio de 48 horas. R$40 de lucro por R$200 a cada 6 horas."
            },
            {
                "id": "plan_5d",
                "name": "Plano 5 Dias",
                "lock_hours": 120,
                "min_amount": 200.0,
                "max_amount": 5000.0,
                "profit_rate": 0.20,
                "profit_interval_hours": 6,
                "popular": True,
                "active": True,
                "description": "Bloqueio de 5 dias. R$40 de lucro por R$200 a cada 6 horas."
            },
            {
                "id": "plan_1w",
                "name": "Plano 1 Semana",
                "lock_hours": 168,
                "min_amount": 200.0,
                "max_amount": 5000.0,
                "profit_rate": 0.20,
                "profit_interval_hours": 6,
                "popular": False,
                "active": True,
                "description": "Bloqueio de 1 semana. R$40 de lucro por R$200 a cada 6 horas."
            },
            {
                "id": "plan_1m",
                "name": "Plano 1 Mês",
                "lock_hours": 720,
                "min_amount": 200.0,
                "max_amount": 5000.0,
                "profit_rate": 0.20,
                "profit_interval_hours": 6,
                "popular": False,
                "active": True,
                "description": "Bloqueio de 1 mês. R$40 de lucro por R$200 a cada 6 horas."
            }
        ]
        await db.investment_plans.insert_many(investment_plans)
        logger.info("Investment plans created successfully")
    
    # Seed platform settings
    settings_exist = await db.platform_settings.find_one({"id": "platform_settings"})
    if not settings_exist:
        platform_settings = {
            "id": "platform_settings",
            "withdrawal_fee": 500.0,
            "withdrawal_fee_method": "require_deposit",
            "min_deposit": 50.0,
            "max_deposit": 10000.0,
            "min_withdrawal": 10.0,
            "payment_methods": {
                "pix_cpf": "778.456.096-68",
                "pix_bank": "Caixa Economica Federal",
                "pix_name": "Elaine Barbosa Gonzaga Oliveira",
                "usdt_wallet_trc20": "TTzxWaMnA54TRzcw8Lg63eBqGRd3FgKZZj",
                "usdt_wallet_bep20": "0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                "bybit_uid": "467135313",
                "whatsapp_support": "+62 838-3942-6007"
            },
            "updated_at": datetime.utcnow()
        }
        await db.platform_settings.insert_one(platform_settings)
        logger.info("Platform settings created successfully")
    
    logger.info("Database initialization completed")