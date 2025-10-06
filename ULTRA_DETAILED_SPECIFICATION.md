# BYBIT INVESTMENT PLATFORM - ULTRA-DETAILED SPECIFICATION
## EVERY SINGLE DETAIL DOCUMENTED FOR EXACT REPLICATION

---

## TABLE OF CONTENTS
1. [Platform Overview](#platform-overview)
2. [Exact Color Specifications](#exact-color-specifications)
3. [Complete Typography System](#complete-typography-system)
4. [Database Schema with All Fields](#database-schema-with-all-fields)
5. [Authentication System - Step by Step](#authentication-system)
6. [User Interface - Every Page Detail](#user-interface-pages)
7. [Admin Panel - Every Function](#admin-panel-functions)
8. [API Endpoints - Complete Reference](#api-endpoints)
9. [Business Logic - All Calculations](#business-logic)
10. [UI Components Library](#ui-components)

---

## PLATFORM OVERVIEW

### Platform Name
**"BYBIT"** - Always displayed in all capital letters, never lowercase

### Platform Tagline
**"Plataforma de Investimentos"** - Always displayed below logo in gray (#9CA3AF)

### Core Purpose
A Brazilian Portuguese cryptocurrency investment platform where:
1. Users register → Admin approves → Users can login
2. Users deposit money → Admin approves → Balance increases
3. Users invest in plans → Automated profits every 6 hours
4. Users request withdrawal → Balance immediately deducted → Admin processes
5. Users earn referral commissions (5 levels: 10%, 5%, 3%, 2%, 1%)

### Platform Flow Summary
```
NEW USER
↓
Register Account (status: pending)
↓
Wait for Admin Approval
↓
Admin Approves (status: active)
↓
User Can Login
↓
User Makes Deposit Request
↓
Admin Approves Deposit
↓
Balance Added to Account
↓
User Creates Investment
↓
Balance Deducted, Investment Active
↓
Automated Profit Distribution Every 6 Hours
↓
Investment Completes After All Cycles
↓
User Requests Withdrawal
↓
Balance Immediately Deducted
↓
Admin Approves/Completes Withdrawal
↓
User Receives Funds
```

---

## EXACT COLOR SPECIFICATIONS

### User Panel Color System (Dark Theme - BYBIT Black & Gold)

#### Primary Colors
| Color Name | Hex Code | RGB | HSL | Usage | Element |
|------------|----------|-----|-----|-------|---------|
| **Pure Black** | `#000000` | rgb(0, 0, 0) | hsl(0, 0%, 0%) | Main background | Body, pages |
| **Honey Gold** | `#F5C842` | rgb(245, 196, 66) | hsl(44, 89%, 61%) | Primary actions | Buttons, logo, highlights |
| **Darker Gold** | `#E6B933` | rgb(230, 185, 51) | hsl(44, 78%, 55%) | Hover state | Button hover |
| **Deep Gold** | `#D4A82E` | rgb(212, 168, 46) | hsl(44, 68%, 51%) | Active state | Button pressed |

#### Background Colors
| Color Name | Hex Code | RGB | HSL | Usage | Element |
|------------|----------|-----|-----|-------|---------|
| **Zinc 900** | `#18181B` | rgb(24, 24, 27) | hsl(240, 6%, 10%) | Cards | Investment cards, forms |
| **Zinc 800** | `#27272A` | rgb(39, 39, 42) | hsl(240, 4%, 16%) | Hover | Card hover state |
| **Gray 800** | `#1F2937` | rgb(31, 41, 55) | hsl(217, 28%, 17%) | Secondary | Secondary buttons |

#### Text Colors
| Color Name | Hex Code | RGB | HSL | Usage | Element |
|------------|----------|-----|-----|-------|---------|
| **White** | `#FFFFFF` | rgb(255, 255, 255) | hsl(0, 0%, 100%) | Primary text | Headings, body text |
| **Cool Gray 400** | `#9CA3AF` | rgb(156, 163, 175) | hsl(220, 11%, 65%) | Secondary text | Subtitles, labels |
| **Zinc 600** | `#52525B` | rgb(82, 82, 91) | hsl(240, 5%, 34%) | Disabled text | Disabled elements |
| **Black** | `#000000` | rgb(0, 0, 0) | hsl(0, 0%, 0%) | Button text | Text on gold buttons |

#### Border & Divider Colors
| Color Name | Hex Code | RGB | HSL | Usage | Element |
|------------|----------|-----|-----|-------|---------|
| **Gray 700** | `#374151` | rgb(55, 65, 81) | hsl(217, 19%, 27%) | Borders | Card borders, dividers |
| **Gray 600** | `#4B5563` | rgb(75, 85, 99) | hsl(215, 14%, 34%) | Input borders | Input field borders |

#### Status Colors
| Color Name | Hex Code | RGB | HSL | Usage | Element |
|------------|----------|-----|-----|-------|---------|
| **Emerald 500** | `#10B981` | rgb(16, 185, 129) | hsl(160, 84%, 39%) | Success | Profit, active status |
| **Emerald 900** | `#064E3B` | rgb(6, 78, 59) | hsl(162, 86%, 16%) | Success BG | Success badge background |
| **Amber 500** | `#F59E0B` | rgb(245, 158, 11) | hsl(38, 92%, 50%) | Warning | Pending status |
| **Amber 900** | `#78350F` | rgb(120, 53, 15) | hsl(22, 78%, 26%) | Warning BG | Pending badge background |
| **Red 500** | `#EF4444` | rgb(239, 68, 68) | hsl(0, 84%, 60%) | Error | Errors, reject actions |
| **Red 900** | `#7F1D1D` | rgb(127, 29, 29) | hsl(0, 63%, 31%) | Error BG | Error badge background |
| **Blue 500** | `#3B82F6` | rgb(59, 130, 246) | hsl(217, 91%, 60%) | Info | Information, completed |
| **Blue 900** | `#1E3A8A` | rgb(30, 58, 138) | hsl(224, 64%, 33%) | Info BG | Info badge background |

#### Sidebar Specific Colors
| Color Name | Hex Code | RGBA | Usage | Element |
|------------|----------|------|-------|---------|
| **Sidebar Background** | `#18181B` | rgba(24, 24, 27, 0.70) | Sidebar BG with 70% opacity | Main sidebar |
| **Sidebar Active** | `#F5C842` | rgb(245, 196, 66) | Active menu item | Selected page |
| **Sidebar Hover** | `#52525B` | rgba(82, 82, 91, 0.5) | Hover state 50% opacity | Menu hover |

### Admin Panel Color System (Blue/White/Black - Professional Business)

#### Primary Colors
| Color Name | Hex Code | RGB | HSL | Usage | Element |
|------------|----------|-----|-----|-------|---------|
| **White** | `#FFFFFF` | rgb(255, 255, 255) | hsl(0, 0%, 100%) | Main background | Body, cards |
| **Blue 600** | `#2563EB` | rgb(37, 99, 235) | hsl(221, 83%, 53%) | Primary actions | Approve buttons |
| **Blue 700** | `#1D4ED8` | rgb(29, 78, 216) | hsl(224, 76%, 48%) | Hover state | Button hover |
| **Blue 500** | `#3B82F6` | rgb(59, 130, 246) | hsl(217, 91%, 60%) | Active menu | Active sidebar item |

#### Sidebar Colors
| Color Name | Hex Code | RGBA | Usage | Element |
|------------|----------|------|-------|---------|
| **Blue 900** | `#1E3A8A` | rgba(30, 58, 138, 0.70) | Sidebar BG with 70% opacity | Admin sidebar |
| **Blue 500** | `#3B82F6` | rgba(59, 130, 246, 0.2) | Hover state 20% opacity | Menu hover |
| **Blue 200** | `#BFDBFE` | rgb(191, 219, 254) | Muted text | Inactive menu items |
| **Blue 800** | `#1E40AF` | rgb(30, 64, 175) | Borders | Sidebar dividers |

#### Text Colors
| Color Name | Hex Code | RGB | HSL | Usage | Element |
|------------|----------|-----|-----|-------|---------|
| **Gray 900** | `#111827` | rgb(17, 24, 39) | hsl(222, 39%, 11%) | Primary text | Headings, content |
| **Gray 500** | `#6B7280` | rgb(107, 114, 128) | hsl(220, 9%, 46%) | Secondary text | Subtitles |
| **Gray 400** | `#9CA3AF` | rgb(156, 163, 175) | hsl(220, 11%, 65%) | Tertiary text | Timestamps |

#### Border Colors
| Color Name | Hex Code | RGB | HSL | Usage | Element |
|------------|----------|-----|-----|-------|---------|
| **Gray 200** | `#E5E7EB` | rgb(229, 231, 235) | hsl(220, 13%, 91%) | Light borders | Card borders |
| **Gray 300** | `#D1D5DB` | rgb(209, 213, 219) | hsl(214, 10%, 84%) | Emphasis borders | Table borders |

#### Action Button Colors
| Color Name | Hex Code | RGB | HSL | Usage | Element |
|------------|----------|-----|-----|-------|---------|
| **Emerald 500** | `#10B981` | rgb(16, 185, 129) | hsl(160, 84%, 39%) | Approve | Approve button |
| **Emerald 600** | `#059669` | rgb(5, 150, 105) | hsl(158, 94%, 30%) | Approve hover | Approve hover state |
| **Red 500** | `#EF4444` | rgb(239, 68, 68) | hsl(0, 84%, 60%) | Reject/Delete | Reject button |
| **Red 600** | `#DC2626` | rgb(220, 38, 38) | hsl(0, 74%, 51%) | Danger hover | Reject hover state |

#### Admin Badge Colors
| Color Name | Hex Code | RGB | HSL | Usage | Element |
|------------|----------|-----|-----|-------|---------|
| **Blue 100** | `#DBEAFE` | rgb(219, 234, 254) | hsl(214, 92%, 93%) | Badge background | "MODO ADMINISTRATIVO" |
| **Blue 900** | `#1E3A8A` | rgb(30, 58, 138) | hsl(224, 64%, 33%) | Badge text | Badge text color |

#### Status Badge Colors (with 10% opacity backgrounds)
| Status | Badge Color | Badge Hex | Background Color | Background Hex |
|--------|-------------|-----------|------------------|----------------|
| **Active/Approved** | Emerald 500 | `#10B981` | Emerald 100 | `#D1FAE5` |
| **Pending** | Amber 500 | `#F59E0B` | Amber 100 | `#FEF3C7` |
| **Rejected** | Red 500 | `#EF4444` | Red 100 | `#FEE2E2` |
| **Completed** | Blue 500 | `#3B82F6` | Blue 100 | `#DBEAFE` |
| **Suspended** | Orange 500 | `#F97316` | Orange 100 | `#FFEDD5` |

---

## COMPLETE TYPOGRAPHY SYSTEM

### Font Stack
**Primary Font Family:**
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
```

**Font Weights Used:**
- **400 (Normal):** Body text, descriptions
- **500 (Medium):** Buttons, form labels
- **600 (Semibold):** Card titles, section headers
- **700 (Bold):** Page titles, logo, important stats

### User Panel Typography

#### Text Styles with Exact Specifications

**1. Logo (BYBIT)**
```css
font-size: 36px;
font-weight: 700;
color: #F5C842; /* Honey Gold */
letter-spacing: 0.02em;
text-transform: uppercase;
line-height: 1;
```

**2. Page Title**
```css
font-size: 30px;
font-weight: 700;
color: #FFFFFF;
line-height: 1.2;
margin-bottom: 8px;
```

**3. Page Subtitle**
```css
font-size: 16px;
font-weight: 400;
color: #9CA3AF; /* Cool Gray 400 */
line-height: 1.5;
```

**4. Section Header**
```css
font-size: 20px;
font-weight: 600;
color: #FFFFFF;
line-height: 1.3;
margin-bottom: 16px;
```

**5. Card Title**
```css
font-size: 18px;
font-weight: 600;
color: #FFFFFF;
line-height: 1.4;
margin-bottom: 8px;
```

**6. Body Text**
```css
font-size: 14px;
font-weight: 400;
color: #FFFFFF;
line-height: 1.6;
```

**7. Label Text**
```css
font-size: 14px;
font-weight: 500;
color: #9CA3AF;
line-height: 1.4;
margin-bottom: 8px;
```

**8. Small Text / Captions**
```css
font-size: 12px;
font-weight: 400;
color: #9CA3AF;
line-height: 1.4;
```

**9. Button Text**
```css
font-size: 14px;
font-weight: 600;
color: #000000; /* On gold buttons */
color: #FFFFFF; /* On other buttons */
letter-spacing: 0.01em;
text-transform: none;
```

**10. Link Text**
```css
font-size: 14px;
font-weight: 500;
color: #F5C842;
text-decoration: none;
transition: color 200ms;

/* Hover State */
color: #E6B933;
text-decoration: underline;
```

**11. Large Number Display (Balance)**
```css
font-size: 24px;
font-weight: 700;
color: #F5C842;
line-height: 1;
font-variant-numeric: tabular-nums;
```

**12. Small Number Display (Stats)**
```css
font-size: 16px;
font-weight: 600;
color: #FFFFFF;
line-height: 1.2;
font-variant-numeric: tabular-nums;
```

### Admin Panel Typography

**1. Page Title (Admin)**
```css
font-size: 30px;
font-weight: 700;
color: #111827; /* Gray 900 */
line-height: 1.2;
```

**2. Section Title (Admin)**
```css
font-size: 20px;
font-weight: 600;
color: #111827;
line-height: 1.3;
```

**3. Table Header**
```css
font-size: 12px;
font-weight: 600;
color: #6B7280; /* Gray 500 */
text-transform: uppercase;
letter-spacing: 0.05em;
line-height: 1.4;
```

**4. Table Content**
```css
font-size: 14px;
font-weight: 400;
color: #111827;
line-height: 1.5;
```

**5. Admin Button Text**
```css
font-size: 14px;
font-weight: 500;
color: #FFFFFF;
letter-spacing: 0;
```

**6. Admin Badge Text (MODO ADMINISTRATIVO)**
```css
font-size: 12px;
font-weight: 700;
color: #1E3A8A; /* Blue 900 */
text-transform: uppercase;
letter-spacing: 0.1em;
```

---

## DATABASE SCHEMA WITH ALL FIELDS

### Collection 1: users
**Purpose:** Store all user accounts (regular users and admin)

**Document Structure:**
```javascript
{
  // Identity Fields
  "_id": ObjectId (MongoDB internal, DO NOT USE),
  "id": "550e8400-e29b-41d4-a716-446655440000", // UUID v4, PRIMARY KEY
  "username": "joaosilva", // Lowercase, unique, alphanumeric + underscore
  "email": "joao@example.com", // Lowercase, unique, validated format
  "password": "$2b$12$KIXxKj9F9j.k5jF9j.KJ9j.k5jF9j.KJ9j.k5jF9j.KJ", // Bcrypt hash
  
  // Personal Information
  "full_name": "João Silva Santos", // UTF-8, max 100 chars
  "phone": "+5511987654321", // E.164 format with country code
  "country": "Brasil", // Country name in Portuguese
  "cpf": "123.456.789-00", // Brazilian tax ID, format: XXX.XXX.XXX-XX (optional)
  "pix_key": "joao@example.com", // PIX payment key (optional)
  "usdt_wallet": "TTzxWaMnA54TRzcw8Lg63eBqGRd3FgKZZj", // USDT TRC20 address (optional)
  
  // Account Status
  "is_admin": false, // Boolean, true for admin accounts
  "status": "pending", // Enum: "pending" | "active" | "rejected" | "suspended"
  
  // Financial Balances (All in BRL - Brazilian Real)
  "brl_balance": 0.0, // Total balance in BRL, Float, default 0.0
  "usdt_balance": 0.0, // USDT balance, Float, default 0.0
  "available_for_withdrawal": 0.0, // Available to withdraw, Float, default 0.0
  "total_invested": 0.0, // Lifetime invested amount, Float, default 0.0
  "total_profit": 0.0, // Lifetime profit earned, Float, default 0.0
  
  // Referral System
  "referral_code": "ABC12345", // 8 characters, unique, uppercase alphanumeric
  "referred_by": "XYZ98765", // Referral code of person who referred this user (optional)
  
  // Timestamps
  "created_at": ISODate("2025-10-05T10:30:00Z"), // Registration date
  "approved_at": ISODate("2025-10-05T12:00:00Z"), // When admin approved (optional)
  "rejected_at": ISODate("2025-10-05T12:00:00Z"), // When admin rejected (optional)
  "updated_at": ISODate("2025-10-06T08:15:00Z"), // Last update timestamp
  "last_login": ISODate("2025-10-06T08:00:00Z") // Last successful login (optional)
}
```

**Indexes:**
```javascript
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "referral_code": 1 }, { unique: true });
db.users.createIndex({ "status": 1 });
db.users.createIndex({ "created_at": -1 });
```

**Validation Rules:**
- `email`: Must be valid email format, max 255 chars
- `username`: 3-30 chars, lowercase, alphanumeric + underscore only
- `password`: Bcrypt hash, always min 60 chars
- `full_name`: 3-100 chars, required
- `phone`: E.164 format, 10-15 digits
- `status`: Must be one of: pending, active, rejected, suspended
- `brl_balance`: >= 0, max 2 decimal places
- `referral_code`: Exactly 8 chars, uppercase alphanumeric

### Collection 2: investment_plans
**Purpose:** Store available investment plans

**Document Structure:**
```javascript
{
  "_id": ObjectId (MongoDB internal, DO NOT USE),
  "id": "plan_48h_001", // UUID v4 or custom ID
  "name": "Plano 48 Horas", // Plan display name in Portuguese
  "lock_hours": 48, // Investment lock period in hours, Integer
  "min_amount": 200.0, // Minimum investment amount in BRL, Float
  "max_amount": 1000.0, // Maximum investment amount in BRL, Float
  "profit_interval_hours": 6, // How often profit is distributed, Integer (always 6)
  "description": "Plano de curto prazo com retornos rápidos", // UTF-8 description
  "popular": false, // Boolean, true to show "POPULAR" badge
  "active": true, // Boolean, false to hide plan from users
  "created_at": ISODate("2025-10-01T00:00:00Z"),
  "updated_at": ISODate("2025-10-01T00:00:00Z")
}
```

**Default Plans (Must be initialized):**
```javascript
[
  {
    "id": "uuid-1",
    "name": "Plano 48 Horas",
    "lock_hours": 48,
    "min_amount": 200.0,
    "max_amount": 1000.0,
    "profit_interval_hours": 6,
    "description": "Plano de curto prazo com retornos rápidos",
    "popular": false,
    "active": true
  },
  {
    "id": "uuid-2",
    "name": "Plano 5 Dias",
    "lock_hours": 120, // 5 days
    "min_amount": 500.0,
    "max_amount": 2000.0,
    "profit_interval_hours": 6,
    "description": "Plano equilibrado para investidores moderados",
    "popular": true, // Shows POPULAR badge
    "active": true
  },
  {
    "id": "uuid-3",
    "name": "Plano 1 Semana",
    "lock_hours": 168, // 7 days
    "min_amount": 1000.0,
    "max_amount": 3000.0,
    "profit_interval_hours": 6,
    "description": "Plano semanal com maiores retornos",
    "popular": false,
    "active": true
  },
  {
    "id": "uuid-4",
    "name": "Plano 1 Mês",
    "lock_hours": 720, // 30 days
    "min_amount": 2000.0,
    "max_amount": 5000.0,
    "profit_interval_hours": 6,
    "description": "Plano premium de longo prazo",
    "popular": false,
    "active": true
  }
]
```

**Profit Calculation Formula:**
```
profit_per_cycle = (investment_amount / 200) * 40

Example:
- Investment: R$ 200 → Profit: R$ 40 per cycle (every 6 hours)
- Investment: R$ 400 → Profit: R$ 80 per cycle
- Investment: R$ 1000 → Profit: R$ 200 per cycle

total_cycles = lock_hours / profit_interval_hours
total_profit = profit_per_cycle * total_cycles

Example for 48h plan:
- lock_hours: 48
- profit_interval_hours: 6
- total_cycles: 48 / 6 = 8 cycles
- Investment R$ 200 → profit_per_cycle: R$ 40 → total_profit: R$ 40 * 8 = R$ 320
```

### Collection 3: investments
**Purpose:** Store user investments

**Document Structure:**
```javascript
{
  "_id": ObjectId (MongoDB internal, DO NOT USE),
  "id": "inv_uuid", // UUID v4, PRIMARY KEY
  "user_id": "user_uuid", // FOREIGN KEY to users.id
  "plan_id": "plan_uuid", // FOREIGN KEY to investment_plans.id
  "plan_name": "Plano 48 Horas", // Denormalized for easy display
  
  // Investment Amounts
  "amount": 200.0, // Amount user invested in BRL, Float
  "total_profit": 320.0, // Total profit to be earned, Float, Calculated
  "profit_per_cycle": 40.0, // Profit per 6-hour cycle, Float, Calculated
  
  // Cycle Tracking
  "total_cycles": 8, // Total number of profit cycles, Integer, Calculated
  "completed_cycles": 0, // Number of completed cycles, Integer, starts at 0
  
  // Status
  "status": "active", // Enum: "active" | "completed"
  
  // Dates
  "start_date": ISODate("2025-10-05T10:00:00Z"), // When investment started
  "end_date": ISODate("2025-10-07T10:00:00Z"), // When investment completes
  "next_profit_at": ISODate("2025-10-05T16:00:00Z"), // Next profit distribution time
  "created_at": ISODate("2025-10-05T10:00:00Z")
}
```

**Status Flow:**
```
active → (profit distributed every 6 hours) → completed (when completed_cycles >= total_cycles)
```

**Indexes:**
```javascript
db.investments.createIndex({ "user_id": 1 });
db.investments.createIndex({ "status": 1 });
db.investments.createIndex({ "next_profit_at": 1 }); // For scheduler
db.investments.createIndex({ "created_at": -1 });
```

### Collection 4: transactions
**Purpose:** Store all financial transactions

**Document Structure:**
```javascript
{
  "_id": ObjectId (MongoDB internal, DO NOT USE),
  "id": "txn_uuid", // UUID v4, PRIMARY KEY
  "user_id": "user_uuid", // FOREIGN KEY to users.id
  
  // Transaction Type
  "type": "deposit", // Enum: "deposit" | "withdrawal" | "investment" | "profit" | "referral_bonus" | "admin_adjustment"
  
  // Amount
  "amount": 500.0, // Transaction amount in BRL, Float
  
  // Status
  "status": "pending", // Enum: "pending" | "approved" | "rejected" | "completed"
  
  // Payment Details (for deposits/withdrawals)
  "payment_method": "pix", // Enum: "pix" | "usdt" | "bybit_uid" | "bank_transfer" (optional)
  "payment_proof": "uploads/proof_abc123.jpg", // File path to uploaded proof (optional)
  "payment_details": { // Object with payment-specific details (optional)
    "pix_key": "user@example.com",
    "usdt_address": "TTzxWa...",
    "bank_name": "Caixa Economica",
    "account_number": "12345-6"
  },
  
  // Notes
  "notes": "Depósito via PIX", // UTF-8 text, max 500 chars (optional)
  
  // Admin Processing
  "processed_by": "admin_uuid", // Admin user_id who processed (optional)
  "processed_at": ISODate("2025-10-05T12:00:00Z"), // When admin processed (optional)
  
  // Timestamps
  "created_at": ISODate("2025-10-05T10:00:00Z"),
  "updated_at": ISODate("2025-10-05T12:00:00Z")
}
```

**Transaction Types Explained:**

1. **deposit**: User requests to add money
   - Initial status: "pending"
   - Admin approves → status: "approved", balance increases
   - Admin rejects → status: "rejected", no balance change

2. **withdrawal**: User requests to withdraw money
   - Initial status: "pending"
   - Balance IMMEDIATELY deducted on creation
   - Admin approves → status: "completed"
   - Admin rejects → status: "rejected", balance refunded

3. **investment**: User creates an investment
   - Status: "completed" (immediate)
   - Balance deducted immediately
   - Links to investments collection

4. **profit**: Automated profit distribution
   - Status: "completed" (immediate)
   - Created by scheduler every 6 hours
   - Balance added immediately

5. **referral_bonus**: Referral commission earned
   - Status: "completed" (immediate)
   - Created when referred user invests
   - Balance added immediately

6. **admin_adjustment**: Admin manually adjusts balance
   - Status: "completed" (immediate)
   - Can be positive or negative
   - Notes should explain reason

**Indexes:**
```javascript
db.transactions.createIndex({ "user_id": 1 });
db.transactions.createIndex({ "type": 1 });
db.transactions.createIndex({ "status": 1 });
db.transactions.createIndex({ "created_at": -1 });
db.transactions.createIndex({ "type": 1, "status": 1 }); // Compound for admin filters
```

### Collection 5: platform_settings
**Purpose:** Store system-wide configuration (single document)

**Document Structure:**
```javascript
{
  "_id": ObjectId (MongoDB internal, DO NOT USE),
  "id": "settings_001", // UUID v4 or fixed ID
  "platform_name": "BYBIT", // Platform display name
  
  // Fee Configuration
  "withdrawal_fee": 750.0, // Fixed withdrawal fee in BRL, Float
  "withdrawal_fee_method": "deduct_from_balance", // Enum: "deduct_from_balance" | "require_deposit"
  "min_deposit": 200.0, // Minimum deposit amount in BRL, Float
  "min_withdrawal": 10.0, // Minimum withdrawal amount in BRL, Float
  
  // Payment Methods Configuration
  "payment_methods": {
    // PIX Details
    "pix_cpf": "778.456.096-68", // CPF for PIX payments
    "pix_bank": "Caixa Economica Federal", // Bank name
    "pix_name": "Elaine Barbosa Gonzaga Oliveira", // Account holder name
    
    // USDT Details
    "usdt_wallet_trc20": "TTzxWaMnA54TRzcw8Lg63eBqGRd3FgKZZj", // USDT TRC20 address
    "usdt_wallet_bep20": "0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // USDT BEP20 address (optional)
    
    // Bybit UID
    "bybit_uid": "467135313", // Bybit user ID
    
    // Support Contact
    "whatsapp_support": "+62 838-3942-6007" // WhatsApp number with country code
  },
  
  // Timestamps
  "created_at": ISODate("2025-10-01T00:00:00Z"),
  "updated_at": ISODate("2025-10-06T00:00:00Z")
}
```

**Initial Values (Must be set on system initialization):**
```javascript
{
  "id": "uuid",
  "platform_name": "BYBIT",
  "withdrawal_fee": 750.0,
  "withdrawal_fee_method": "deduct_from_balance",
  "min_deposit": 200.0,
  "min_withdrawal": 10.0,
  "payment_methods": {
    "pix_cpf": "778.456.096-68",
    "pix_bank": "Caixa Economica Federal",
    "pix_name": "Elaine Barbosa Gonzaga Oliveira",
    "usdt_wallet_trc20": "TTzxWaMnA54TRzcw8Lg63eBqGRd3FgKZZj",
    "usdt_wallet_bep20": "0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "bybit_uid": "467135313",
    "whatsapp_support": "+62 838-3942-6007"
  }
}
```

**Note:** This collection should only ever have ONE document. Always use findOne() and updateOne() with empty filter.

---

## AUTHENTICATION SYSTEM - STEP BY STEP

(Content continues...)