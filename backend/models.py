from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

# Enums
class UserStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    REJECTED = "rejected"

class TransactionType(str, Enum):
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    INVESTMENT = "investment"
    PROFIT = "profit"
    REFERRAL_BONUS = "referral_bonus"
    ADMIN_ADJUSTMENT = "admin_adjustment"

class TransactionStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"

class PaymentMethod(str, Enum):
    PIX = "pix"
    USDT = "usdt"
    BYBIT_UID = "bybit_uid"

class InvestmentStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

# User Models
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    username: str
    country: Optional[str] = "Brasil"
    phone: Optional[str] = None
    cpf: Optional[str] = None
    pix_key: Optional[str] = None
    usdt_wallet: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class User(UserBase):
    id: str
    status: UserStatus = UserStatus.PENDING
    brl_balance: float = 0.0
    available_for_withdrawal: float = 0.0
    total_invested: float = 0.0
    total_returns: float = 0.0
    referral_bonus: float = 0.0
    bonus_balance: float = 0.0
    referral_code: str
    referred_by: Optional[str] = None
    kyc_verified: bool = False
    kyc_percentage: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    approved_at: Optional[datetime] = None
    member_since: datetime = Field(default_factory=datetime.utcnow)

# Investment Models
class InvestmentPlan(BaseModel):
    id: str
    name: str
    lock_hours: int
    min_amount: float
    max_amount: float
    profit_rate: float
    profit_interval_hours: int = 6
    popular: bool = False
    active: bool = True

class InvestmentCreate(BaseModel):
    plan_id: str
    amount: float

class Investment(BaseModel):
    id: str
    user_id: str
    plan_id: str
    plan_name: str
    amount: float
    total_profit: float
    profit_per_cycle: float
    total_cycles: int
    completed_cycles: int
    status: InvestmentStatus
    start_date: datetime
    end_date: datetime
    last_profit_at: Optional[datetime] = None
    next_profit_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Transaction Models
class DepositCreate(BaseModel):
    amount: float
    payment_method: PaymentMethod
    payment_proof: Optional[str] = None
    notes: Optional[str] = None

class WithdrawalCreate(BaseModel):
    amount: float
    payment_method: PaymentMethod
    fee_payment_proof: Optional[str] = None

class Transaction(BaseModel):
    id: str
    user_id: str
    type: TransactionType
    amount: float
    status: TransactionStatus
    payment_method: Optional[PaymentMethod] = None
    payment_proof: Optional[str] = None
    notes: Optional[str] = None
    processed_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    processed_at: Optional[datetime] = None

# Referral Models
class Referral(BaseModel):
    id: str
    referrer_id: str
    referred_user_id: str
    level: int
    status: str = "active"
    total_commission: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Commission(BaseModel):
    id: str
    referral_id: str
    referrer_id: str
    referred_user_id: str
    investment_id: str
    level: int
    rate: float
    amount: float
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Admin Models
class AdminLogin(BaseModel):
    email: str
    password: str

class BalanceAdjustment(BaseModel):
    user_id: str
    adjustment_type: str  # add, subtract, set
    amount: float
    balance_type: str  # brl_balance, available_for_withdrawal, etc.
    notes: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    cpf: Optional[str] = None
    pix_key: Optional[str] = None
    usdt_wallet: Optional[str] = None
    country: Optional[str] = None
    status: Optional[UserStatus] = None

class WithdrawalSettings(BaseModel):
    fee_amount: float
    fee_deduction_method: str  # "require_deposit" or "deduct_from_balance"

# Platform Settings Models
class PaymentMethodSettings(BaseModel):
    pix_cpf: Optional[str] = None
    pix_bank: Optional[str] = None
    pix_name: Optional[str] = None
    usdt_wallet_trc20: Optional[str] = None
    usdt_wallet_bep20: Optional[str] = None
    bybit_uid: Optional[str] = None
    whatsapp_support: Optional[str] = None

class PlatformSettings(BaseModel):
    id: str = "platform_settings"
    withdrawal_fee: float = 500.0
    withdrawal_fee_method: str = "require_deposit"
    min_deposit: float = 50.0
    max_deposit: float = 10000.0
    min_withdrawal: float = 10.0
    payment_methods: PaymentMethodSettings = Field(default_factory=PaymentMethodSettings)
    updated_at: datetime = Field(default_factory=datetime.utcnow)