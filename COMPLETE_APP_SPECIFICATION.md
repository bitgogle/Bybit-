# BYBIT CRYPTOCURRENCY INVESTMENT PLATFORM - ULTRA-DETAILED SPECIFICATION

## EXECUTIVE SUMMARY
Create a professional cryptocurrency investment platform called "BYBIT" (all capital letters) in Brazilian Portuguese with automated profit distribution every 6 hours, multi-currency support (BRL and USDT), admin approval workflows for user registrations and transactions, and sophisticated administrative controls. The platform features a dark theme (#000000 pure black background) for users with golden-yellow (#F5C842) accents and a distinct blue (#1E3A8A)/white (#FFFFFF)/black (#111827) theme for the admin panel. Every user action requires admin approval before becoming active. The platform includes automated investment profit distribution, multi-step deposit/withdrawal flows with payment proof uploads, referral commission system (5 levels), and comprehensive admin controls.

---

## TECH STACK

### Backend
- **Framework:** FastAPI (Python)
- **Port:** 8001 (internal), exposed via /api prefix
- **Database:** MongoDB with motor (AsyncIOMotorClient)
- **Authentication:** JWT tokens with bcrypt password hashing
- **Scheduler:** APScheduler for automated profit distribution
- **CORS:** Enabled for frontend communication

### Frontend
- **Framework:** React (JavaScript)
- **Port:** 3000
- **Styling:** Tailwind CSS with custom theme
- **State Management:** React Context API for authentication
- **Routing:** React Router v6
- **Notifications:** react-hot-toast
- **Environment:** Create React App

### Database Collections
1. `users` - User accounts (both regular users and admin)
2. `investment_plans` - Investment plan configurations
3. `investments` - Active and completed investments
4. `transactions` - Deposits, withdrawals, profits, bonuses
5. `platform_settings` - System-wide configuration

---

## COLOR SCHEME & THEMING

### User Panel (Dark Theme)
```css
Background: #000000 (pure black)
Card Background: hsl(var(--card)) - Dark gray/charcoal
Primary Color: #F5C842 (Golden Yellow) - For buttons, highlights, branding
Primary Foreground: #000000 (Black text on yellow buttons)
Text Color: #FFFFFF (White)
Muted Text: #9CA3AF (Light gray)
Border Color: #374151 (Dark gray)
Secondary: #1F2937 (Dark charcoal)
Destructive: #EF4444 (Red for errors/delete)
```

### Admin Panel (Blue/White/Black Theme)
```css
Background: #FFFFFF (White)
Sidebar: #1E3A8A (Dark Blue) with 70% opacity
Sidebar Text: #FFFFFF (White)
Primary Buttons: #2563EB (Blue)
Active Menu: #3B82F6 (Lighter blue)
Header: #FFFFFF with border
Text: #111827 (Almost black)
Cards: #FFFFFF with gray borders
Status Badges: Green, Yellow, Red with 10% opacity backgrounds
```

### Common UI Elements
- **Font Family:** Inter (sans-serif)
- **Border Radius:** 8px (lg), 6px (md), 4px (sm)
- **Shadows:** Subtle shadows on cards and modals
- **Transparency:** Sidebars at 70% opacity with backdrop-blur-md
- **Transitions:** All interactive elements have smooth 200-300ms transitions

---

## AUTHENTICATION SYSTEM

### User Registration
**Endpoint:** POST /api/auth/register

**Fields Required:**
- Username (unique, lowercase)
- Email (unique, validated)
- Password (hashed with bcrypt)
- Full Name (required)
- Phone Number (with country code)
- Country (required)
- CPF (Brazilian tax ID, optional)
- PIX Key (optional)

**Process:**
1. User fills registration form
2. Account created with status: "pending"
3. Message: "Cadastro realizado! Aguarde aprovação do administrador."
4. User cannot login until admin approves
5. Generate unique referral code (8 characters)

**Validation:**
- Email format validation
- Password minimum 8 characters
- Duplicate email/username check
- All required fields must be filled

### User Login
**Endpoint:** POST /api/auth/login

**Process:**
1. User enters email and password
2. Backend validates credentials
3. Check user status:
   - "pending" → Error: "Sua conta está aguardando aprovação"
   - "rejected" → Error: "Sua conta foi rejeitada"
   - "suspended" → Error: "Sua conta foi suspensa"
   - "active" → Generate JWT token, allow login
4. Return JWT token and user data
5. Store token in localStorage
6. Redirect to dashboard

**JWT Token Contents:**
- user_id
- email
- is_admin (boolean)
- exp (expiration time)

### Admin Login
**Endpoint:** POST /api/auth/admin/login

**Access:**
- Blue shield button in bottom-left of login page
- Shield icon: Professional SVG (Material Design style)
- Route: /admin/login
- Same form as user login but different endpoint

**Admin Credentials:**
- Email: skidolynx@gmail.com
- Password: @Mypetname9 (or @Skido999 as alternative)

**Process:**
1. Click shield button → Navigate to /admin/login
2. Enter admin credentials
3. Verify is_admin flag in database
4. Generate JWT token with is_admin: true
5. Redirect to /admin dashboard

---

## DATABASE SCHEMA

### Users Collection
```javascript
{
  "id": "uuid",
  "username": "string (unique, lowercase)",
  "email": "string (unique)",
  "password": "string (bcrypt hashed)",
  "full_name": "string",
  "phone": "string",
  "country": "string",
  "cpf": "string (optional)",
  "pix_key": "string (optional)",
  "usdt_wallet": "string (optional)",
  "is_admin": false,
  "status": "pending|active|rejected|suspended",
  "brl_balance": 0.0,
  "usdt_balance": 0.0,
  "available_for_withdrawal": 0.0,
  "total_invested": 0.0,
  "total_profit": 0.0,
  "referral_code": "string (8 chars)",
  "referred_by": "string (referral code, optional)",
  "created_at": "datetime",
  "approved_at": "datetime (optional)",
  "rejected_at": "datetime (optional)",
  "updated_at": "datetime"
}
```

### Investment Plans Collection
```javascript
{
  "id": "uuid",
  "name": "Plano 48 Horas | Plano 5 Dias | Plano 1 Semana | Plano 1 Mês",
  "lock_hours": 48 | 120 | 168 | 720,
  "min_amount": 200 | 500 | 1000 | 2000,
  "max_amount": 1000 | 2000 | 3000 | 5000,
  "profit_interval_hours": 6,
  "description": "string",
  "popular": boolean,
  "created_at": "datetime"
}
```

**4 Investment Plans:**
1. **Plano 48 Horas:** R$ 200-1000, 48h lock, Popular: No
2. **Plano 5 Dias:** R$ 500-2000, 120h lock, Popular: Yes
3. **Plano 1 Semana:** R$ 1000-3000, 168h lock, Popular: No
4. **Plano 1 Mês:** R$ 2000-5000, 720h lock, Popular: No

**Profit Formula:** R$ 40 per R$ 200 every 6 hours
- If user invests R$ 200 → Earns R$ 40 every 6 hours
- If user invests R$ 400 → Earns R$ 80 every 6 hours
- Formula: `profit_per_cycle = (investment_amount / 200) * 40`

### Investments Collection
```javascript
{
  "id": "uuid",
  "user_id": "uuid",
  "plan_id": "uuid",
  "plan_name": "string",
  "amount": float,
  "total_profit": float,
  "profit_per_cycle": float,
  "total_cycles": int,
  "completed_cycles": 0,
  "status": "active|completed",
  "start_date": "datetime",
  "end_date": "datetime",
  "next_profit_at": "datetime",
  "created_at": "datetime"
}
```

### Transactions Collection
```javascript
{
  "id": "uuid",
  "user_id": "uuid",
  "type": "deposit|withdrawal|investment|profit|referral_bonus|admin_adjustment",
  "amount": float,
  "status": "pending|approved|rejected|completed",
  "payment_method": "pix|usdt|bybit_uid|bank_transfer",
  "payment_proof": "string (file path, optional)",
  "notes": "string (optional)",
  "processed_by": "uuid (admin id, optional)",
  "processed_at": "datetime (optional)",
  "created_at": "datetime"
}
```

### Platform Settings Collection
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
  },
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

---

## USER INTERFACE - PAGE BY PAGE

### 1. LOGIN PAGE (/)
**Route:** /login

**Layout:**
- Centered card on black background
- BYBIT logo (golden yellow) at top center
- Subtitle: "Plataforma de Investimentos" (gray)
- Login form card with dark border
- Admin shield button (blue) in bottom-left corner

**Form Fields:**
- Email input (placeholder: "seu@email.com")
- Password input (placeholder: "••••••••")
- "Entrar" button (golden yellow, full width)
- Link: "Não tem uma conta? Cadastre-se" (bottom)

**Admin Shield Button:**
- Position: Fixed, bottom-left (32px from edges)
- Background: Blue (#2563EB)
- Icon: SVG shield (Material Design style, not emoji)
- Text: "Admin" (visible on larger screens)
- Hover: Scale 1.1, darker blue
- Click: Navigate to /admin/login

**Mobile Responsive:**
- Mobile viewport: 375x812px (default)
- Form card full width with padding
- Shield button remains visible
- Touch-friendly button sizes (minimum 44px)

### 2. REGISTRATION PAGE (/register)
**Route:** /register

**Layout:**
- Same header as login page
- Registration form card
- Link back to login at bottom

**Form Fields (All Required Unless Noted):**
1. Full Name (Nome Completo)
2. Username (Nome de Usuário) - lowercase, unique
3. Email
4. Password (Senha) - minimum 8 characters
5. Confirm Password (Confirmar Senha)
6. Phone (Telefone) - with country code
7. Country (País) - dropdown or input
8. CPF (optional) - Brazilian format: XXX.XXX.XXX-XX
9. PIX Key (Chave PIX) - optional

**Validation:**
- Real-time validation on blur
- Password strength indicator
- Matching password confirmation
- Duplicate email/username check

**Submit:**
- Button: "Cadastrar" (golden yellow)
- On success: Show message "Cadastro realizado! Aguarde aprovação."
- Auto-redirect to login after 3 seconds

### 3. USER DASHBOARD (/)
**Route:** / (requires authentication)

**Layout:**
- Sidebar on left (dark, 70% opacity, backdrop blur)
- Main content area on right
- Header with balance display and hamburger menu (mobile)

**Sidebar Navigation:**
- BYBIT logo at top (golden yellow)
- Subtitle: "Investimentos"
- Menu items with Material Design icons:
  1. Dashboard (grid icon)
  2. Investimentos (chart icon)
  3. Depositar (shopping cart with plus icon)
  4. Sacar (dollar icon)
  5. Indicações (users icon)
  6. Histórico (clock icon)
  7. Perfil (user icon)
- User info at bottom (avatar, name, email)
- "Sair" button (red)

**Dashboard Content:**
- Welcome message: "Olá, [User Name]!"
- 4 Statistics cards in grid:
  1. **Saldo Total** (Total Balance): R$ [brl_balance]
     - Icon: Wallet
     - Color: Primary yellow
  2. **Disponível para Saque** (Available for Withdrawal): R$ [available_for_withdrawal]
     - Icon: Money
     - Color: Green
  3. **Total Investido** (Total Invested): R$ [total_invested]
     - Icon: Chart up
     - Color: Blue
  4. **Lucro Total** (Total Profit): R$ [total_profit]
     - Icon: Trending up
     - Color: Green

**Recent Transactions Section:**
- Title: "Transações Recentes"
- Table showing last 5 transactions
- Columns: Date, Type, Amount, Status
- Link: "Ver Todas" → Navigate to /history

**Active Investments Section:**
- Title: "Investimentos Ativos"
- Cards showing each active investment:
  - Plan name
  - Amount invested
  - Total profit
  - Progress bar (completed_cycles / total_cycles)
  - Cycles: X/Y
- If no investments: "Você não tem investimentos ativos"

### 4. INVESTMENTS PAGE (/investments)
**Route:** /investments

**Layout:**
- Page title: "Investimentos"
- Subtitle: "Escolha um plano e comece a lucrar"

**Available Plans Section:**
- Grid layout: 1 column (mobile), 2 columns (tablet), 4 columns (desktop)
- Each plan card shows:
  - Plan name (header)
  - "POPULAR" badge (if popular flag is true) - golden yellow
  - Lock period: "Bloqueio: Xh"
  - Minimum: "R$ X"
  - Maximum: "R$ Y"
  - Profit info: "R$40/R$200 (6h)"
  - "Investir Agora" button (golden yellow)

**Click "Investir Agora" → Opens Amount Input Modal**

**Amount Input Modal:**
- Title: "Novo Investimento"
- Selected plan name display
- Available balance display (large, primary color)
- Amount input field with min/max validation
- Range indicator: "(R$ [min] - R$ [max])"
- Error messages (red) for invalid amounts
- Two buttons:
  - "Cancelar" (gray)
  - "Continuar" (golden yellow)

**Click "Continuar" → Opens Confirmation Modal**

**Confirmation Modal:**
- Title: "Confirmar Investimento"
- Summary box showing:
  - Plan name
  - Amount (large, primary color)
  - Duration (lock hours)
- Confirmation message: "Tem certeza que deseja iniciar este investimento?"
- Error display area (if any)
- Two buttons:
  - "Cancelar" (gray) - Shows toast: "Processo de investimento cancelado"
  - "Iniciar" (golden yellow) - Creates investment, shows toast: "Investimento ativado com sucesso!"

**Toast Notifications:**
- Success: Green background, 3 second duration
- Error: Red background, 3 second duration
- Cancel: Red/orange background, 3 second duration

**My Investments Section:**
- Title: "Meus Investimentos"
- If empty: Card with message "Você ainda não tem investimentos ativos"
- If has investments: Cards showing:
  - Plan name and start date
  - Status badge (ATIVO/CONCLUÍDO)
  - 4 stats in grid:
    - Investido (Invested amount)
    - Lucro Total (Total profit) - green
    - Ciclos (Cycles completed/total)
    - Progresso (Progress percentage)
  - Progress bar for active investments

### 5. DEPOSIT PAGE (/deposit)
**Route:** /deposit

**Multi-Step Flow:**

**Step 1: Amount Input**
- Title: "Novo Depósito"
- Subtitle: "Passo 1 de 3 - Valor"
- Input: Amount in BRL (R$)
- Minimum: R$ 200
- USDT conversion display (read-only): Amount / 5.45
- Button: "Converter" - Shows conversion
- Button: "Próximo" → Step 2

**Step 2: Payment Method Selection**
- Title: "Método de Pagamento"
- Subtitle: "Passo 2 de 3"
- 3 Options (radio buttons or cards):
  1. **PIX**
     - Icon: QR code or PIX logo
     - Text: "Pagamento via PIX"
  2. **USDT (TRC20)**
     - Icon: Cryptocurrency
     - Text: "Transfer via USDT"
  3. **Bybit UID**
     - Icon: User ID
     - Text: "Transfer via Bybit ID"
- Button: "Próximo" → Step 3

**Step 3: Payment Details & Proof Upload**
- Title: "Detalhes de Pagamento"
- Subtitle: "Passo 3 de 3"
- Display payment details based on selected method:

**If PIX Selected:**
```
PIX - Copiar Dados:
CPF: 778.456.096-68
Banco: Caixa Economica Federal
Nome: Elaine Barbosa Gonzaga Oliveira
```

**If USDT Selected:**
```
USDT Address (TRC20):
TTzxWaMnA54TRzcw8Lg63eBqGRd3FgKZZj
Network: TRC20
⚠️ Atenção: Envie apenas USDT via rede TRC20
```

**If Bybit UID Selected:**
```
Bybit User ID (UID):
467135313
```

- Copy button for each detail
- File upload area: "Enviar Comprovante de Pagamento"
  - Accepts: images (jpg, png, pdf)
  - Shows preview after selection
- Notes field (optional): "Observações"
- Buttons:
  - "Voltar" (back to step 2)
  - "Enviar Solicitação" (submit) → Create deposit request
- Success: Toast "Solicitação de depósito enviada! Aguarde aprovação."
- Navigate back to dashboard

### 6. WITHDRAWAL PAGE (/withdrawal)
**Route:** /withdrawal

**Multi-Step Flow:**

**Step 1: Withdrawal Option Selection**
- Title: "Novo Saque"
- Subtitle: "Passo 1 de 4"
- Available balance display (large)
- 3 Options (radio buttons or cards):
  1. **PIX** - "Saque via PIX"
  2. **USDT (TRC20)** - "Saque via USDT"
  3. **Bank Transfer** - "Transferência Bancária"
- Button: "Próximo" → Step 2

**Step 2: Enter Details**
- Title based on selection
- Dynamic fields based on method:

**If PIX:**
- CPF field
- PIX Key field
- Full Name field

**If USDT:**
- USDT Wallet Address (TRC20)
- Network confirmation: "TRC20" (read-only)

**If Bank Transfer:**
- Bank Name
- Account Number
- Account Holder Name
- CPF

- Button: "Próximo" → Step 3

**Step 3: Amount & Fee**
- Title: "Valor do Saque"
- Subtitle: "Passo 3 de 4"
- Available balance display
- Amount input field
- Fee display: "Taxa de Saque: R$ 750"
- Total to receive calculation: Amount - Fee
- Warning: "A taxa será deduzida do valor solicitado"
- Button: "Próximo" → Step 4

**Step 4: Fee Payment & Confirmation**
- Title: "Pagamento da Taxa"
- Subtitle: "Passo 4 de 4"
- Fee amount: R$ 750
- Payment instructions (same as deposit - show payment details)
- File upload: "Enviar Comprovante de Pagamento da Taxa"
- Summary box showing:
  - Withdrawal amount
  - Fee amount
  - Method
  - Details entered
- Buttons:
  - "Voltar" (back)
  - "Confirmar Saque" (submit) → Create withdrawal request
- Success: Toast "Solicitação de saque enviada!"
- **Important:** Balance is IMMEDIATELY deducted on request creation
- Navigate to /history

### 7. REFERRALS PAGE (/referrals)
**Route:** /referrals

**Layout:**
- Title: "Programa de Indicações"
- Subtitle: "Ganhe comissões indicando amigos"

**Referral Code Section:**
- Large card showing user's referral code
- Copy button
- Share buttons (WhatsApp, Telegram, Email)
- Referral link generator

**Commission Structure Display:**
- 5 levels shown in cards or list:
  1. Nível 1: 10%
  2. Nível 2: 5%
  3. Nível 3: 3%
  4. Nível 4: 2%
  5. Nível 5: 1%
- Explanation text

**Referral Statistics:**
- Total referrals count
- Total earned from referrals
- Active referrals count

**Referral List:**
- Table showing referred users:
  - Username (or email)
  - Date joined
  - Status
  - Earnings from this referral

### 8. HISTORY PAGE (/history)
**Route:** /history

**Layout:**
- Title: "Histórico de Transações"
- Subtitle: "Todas as suas transações"

**Filters:**
- Type filter: All, Deposits, Withdrawals, Investments, Profits
- Status filter: All, Pending, Approved, Rejected, Completed
- Date range picker (optional)

**Transaction Table:**
- Columns:
  1. Date & Time
  2. Type (icon + label)
  3. Amount (with +/- indicator)
  4. Status (colored badge)
  5. Method (for deposits/withdrawals)
  6. Notes
- Pagination (20 per page)
- Mobile: Cards instead of table

**Transaction Types with Icons:**
- Deposit: Arrow down (green)
- Withdrawal: Arrow up (red)
- Investment: Chart line (blue)
- Profit: Trending up (green)
- Referral Bonus: Users (yellow)
- Admin Adjustment: Settings (gray)

**Status Colors:**
- Pending: Yellow
- Approved: Green
- Rejected: Red
- Completed: Blue

### 9. PROFILE PAGE (/profile)
**Route:** /profile

**Layout:**
- Title: "Meu Perfil"
- Subtitle: "Gerencie suas informações"

**Profile Information Card:**
- Avatar (circle with first letter of name)
- Full name (large)
- Email
- Member since date
- Status badge

**Personal Information Section:**
- Editable fields:
  - Full Name
  - Phone
  - Country
  - CPF
  - PIX Key
  - USDT Wallet
- "Salvar Alterações" button

**Security Section:**
- Change Password button
- Enable 2FA (if implemented)

**Account Statistics:**
- Account created date
- Total deposits made
- Total withdrawals made
- Current active investments
- Lifetime profit earned

---

## ADMIN PANEL - PAGE BY PAGE

### Admin Panel Access
- Route: /admin/login
- Shield button on main login page
- Blue theme throughout admin panel

### Admin Sidebar (Blue Theme)
- Background: Blue (#1E3A8A) with 70% opacity, backdrop blur
- Logo: BYBIT with shield icon (SVG)
- Subtitle: "Painel Admin"
- Menu items with icons:
  1. Dashboard (grid icon)
  2. Usuários (users icon)
  3. Transações (dollar icon)
  4. Configurações (settings icon)
- Admin indicator: "MODO ADMINISTRATIVO" badge (blue)
- Admin info at bottom
- "Sair" button (red)

### 1. ADMIN DASHBOARD (/admin)
**Route:** /admin

**Statistics Cards (4 cards in grid):**
1. **Total de Usuários** (Total Users)
   - Count of all users
   - Icon: Users
   - Color: Blue

2. **Usuários Pendentes** (Pending Users)
   - Count of pending approvals
   - Icon: Clock
   - Color: Yellow
   - Link: "Ver Pendentes" → /admin/users?filter=pending

3. **Investimentos Ativos** (Active Investments)
   - Count of active investments
   - Total amount invested
   - Icon: Chart
   - Color: Green

4. **Transações Pendentes** (Pending Transactions)
   - Count of pending deposits + withdrawals
   - Icon: Pending
   - Color: Yellow
   - Link: "Ver Pendentes" → /admin/transactions?status=pending

**Recent Activity Section:**
- Last 10 actions taken
- Shows: User registrations, deposits, withdrawals, investments
- Real-time updates

**System Health:**
- Backend status
- Database connection status
- Last profit distribution time

### 2. ADMIN USERS PAGE (/admin/users)
**Route:** /admin/users

**Header:**
- Title: "Gerenciar Usuários"
- Subtitle: "Aprovar, editar e gerenciar usuários"

**Filter Buttons:**
- Todos (All)
- Pendentes (Pending) - Yellow badge with count
- Ativos (Active) - Green badge with count
- Suspensos (Suspended) - Red badge with count
- Rejeitados (Rejected) - Gray badge with count

**Search Bar:**
- Placeholder: "Buscar por nome, email ou ID"
- Real-time search

**Users Table/List:**
- Columns:
  1. User Info (avatar, name, email)
  2. Status (badge)
  3. Balance (BRL)
  4. Total Invested
  5. Member Since
  6. Actions

**Actions for Each User:**

**For Pending Users:**
- "Aprovar" button (green)
  - Click → Confirmation dialog
  - On confirm → PUT /api/admin/users/{id}/approve
  - Toast: "Usuário aprovado! Agora ele pode fazer login."
  - User status changes to "active"
  - User can now login

- "Rejeitar" button (red)
  - Click → Confirmation dialog
  - On confirm → PUT /api/admin/users/{id}/reject
  - Toast: "Usuário rejeitado!"
  - User status changes to "rejected"
  - User cannot login, receives error: "Sua conta foi rejeitada"

**For Active Users:**
- "Ajustar Saldo" button (blue)
  - Opens modal with form:
    - Adjustment Type: Add / Subtract (radio)
    - Balance Type: BRL Balance / Available for Withdrawal (dropdown)
    - Amount: Input field
    - Notes: Textarea
  - Submit → POST /api/admin/users/{id}/balance
  - Toast: "Saldo ajustado com sucesso!"
  - Balance updates immediately

- "Suspender" button (orange)
  - Changes status to "suspended"
  - User cannot login

- "Ver Detalhes" button (blue)
  - Opens modal or navigates to detail page
  - Shows complete user information
  - Shows all transactions
  - Shows all investments

**Mobile View:**
- Cards instead of table
- Swipe actions or dropdown menu

### 3. ADMIN TRANSACTIONS PAGE (/admin/transactions)
**Route:** /admin/transactions

**Header:**
- Title: "Gerenciar Transações"
- Subtitle: "Aprovar depósitos e saques"

**Filter Tabs:**
- Type Filters:
  - Todas (All)
  - Depósitos (Deposits)
  - Saques (Withdrawals)

- Status Filters:
  - Pendentes (Pending)
  - Aprovadas (Approved)
  - Rejeitadas (Rejected)
  - Concluídas (Completed)

**Transactions Table:**
- Columns:
  1. Date & Time
  2. User (name + email)
  3. Type (icon + label)
  4. Amount
  5. Method
  6. Status
  7. Proof (view link)
  8. Actions

**Actions for Pending Deposits:**
- "Aprovar" button (green)
  - Click → Confirmation: "Aprovar esta transação?"
  - On confirm → PUT /api/admin/transactions/{id}/approve
  - Backend logic:
    - Updates transaction status to "approved"
    - Adds amount to user's brl_balance
    - Adds amount to user's available_for_withdrawal
    - Logs: "Deposit {id} approved by admin {email} - R$ {amount} added to user {user_id}"
  - Toast: "Depósito aprovado! Saldo adicionado ao usuário."

- "Rejeitar" button (red)
  - Click → Prompt: "Motivo da rejeição:"
  - On submit → PUT /api/admin/transactions/{id}/reject
  - Backend logic:
    - Updates transaction status to "rejected"
    - Saves rejection reason
    - User balance unchanged
    - Logs: "Deposit {id} rejected by admin {email}"
  - Toast: "Transação rejeitada!"

**Actions for Pending Withdrawals:**
- "Aprovar" button (green)
  - Click → Confirmation: "Aprovar esta transação?"
  - On confirm → PUT /api/admin/transactions/{id}/approve
  - Backend logic:
    - Updates transaction status to "completed"
    - Balance already deducted (no change needed)
    - Logs: "Withdrawal {id} approved by admin {email} - R$ {amount} for user {user_id}"
  - Toast: "Saque aprovado e concluído!"

- "Rejeitar" button (red)
  - Click → Prompt: "Motivo da rejeição:"
  - On submit → PUT /api/admin/transactions/{id}/reject
  - Backend logic:
    - Updates transaction status to "rejected"
    - REFUNDS amount to user's brl_balance
    - REFUNDS amount to user's available_for_withdrawal
    - Logs: "Withdrawal {id} rejected by admin {email} - R$ {amount} refunded to user {user_id}"
  - Toast: "Transação rejeitada!"

**Status Change Dropdown (for withdrawals):**
- Options:
  - Processing
  - Completed
  - Rejected
- On change → Update status immediately
- Toast confirmation

**View Proof Button:**
- Opens modal with uploaded image
- Shows payment receipt/screenshot
- Zoom and download options

### 4. ADMIN SETTINGS PAGE (/admin/settings)
**Route:** /admin/settings

**Header:**
- Title: "Configurações da Plataforma"
- Subtitle: "Gerencie configurações do sistema"

**Sections:**

**1. Platform Information:**
- Platform Name (read-only): "BYBIT"
- Current Version
- Last Updated

**2. Fee Configuration:**
- Withdrawal Fee: Input field
  - Default: R$ 750.00
  - Can be modified
- Fee Method: Dropdown
  - "deduct_from_balance" (Deduct from balance)
  - "require_deposit" (Require separate payment)
- Minimum Deposit: Input field
  - Default: R$ 200.00
- Minimum Withdrawal: Input field
  - Default: R$ 10.00

**3. Payment Methods Configuration:**
- **PIX Details:**
  - CPF: 778.456.096-68
  - Bank: Caixa Economica Federal
  - Name: Elaine Barbosa Gonzaga Oliveira
  - All editable

- **USDT Details:**
  - TRC20 Address: TTzxWaMnA54TRzcw8Lg63eBqGRd3FgKZZj
  - BEP20 Address: (optional)
  - Both editable

- **Bybit Details:**
  - UID: 467135313
  - Editable

- **Support Contact:**
  - WhatsApp: +62 838-3942-6007
  - Editable

**4. Investment Plans (View/Edit):**
- Table showing all 4 plans
- Can edit min/max amounts
- Can enable/disable plans
- Cannot delete (for data integrity)

**Save Button:**
- "Salvar Configurações" (blue, large)
- Click → PUT /api/admin/settings
- Toast: "Configurações atualizadas com sucesso!"

**Danger Zone (Optional):**
- Clear all pending users
- Reset system (with confirmation)
- Backup database

---

## API ENDPOINTS - COMPLETE LIST

### Authentication Endpoints

**POST /api/auth/register**
- Public endpoint
- Creates new user with status "pending"
- Returns: user_id, message, status

**POST /api/auth/login**
- Public endpoint
- Validates email and password
- Checks user status (pending/active/rejected/suspended)
- Returns: token, user object, message

**POST /api/auth/admin/login**
- Public endpoint
- Validates admin credentials
- Verifies is_admin flag
- Returns: token, user object (with is_admin: true), message

**GET /api/auth/me**
- Protected endpoint (requires JWT)
- Returns current user data based on token

**POST /api/auth/logout**
- Protected endpoint
- Invalidates token (client-side removal)

### User Endpoints

**GET /api/users/dashboard**
- Protected endpoint
- Returns: balance, investments, recent transactions

**PUT /api/users/profile**
- Protected endpoint
- Updates user profile information
- Fields: full_name, phone, cpf, pix_key, usdt_wallet

**GET /api/users/balance**
- Protected endpoint
- Returns: brl_balance, usdt_balance, available_for_withdrawal

### Investment Endpoints

**GET /api/investment-plans**
- Public endpoint
- Returns all available investment plans

**POST /api/investments**
- Protected endpoint
- Creates new investment
- Validations:
  - Check user balance >= amount
  - Check amount within plan min/max
  - Plan exists and active
- Process:
  - Create investment record
  - Deduct from available_for_withdrawal
  - Increment total_invested
  - Calculate profit schedule
  - Create transaction record
- Returns: investment object

**GET /api/investments**
- Protected endpoint
- Returns user's investments (active and completed)
- Sorted by created_at desc

### Transaction Endpoints (User)

**POST /api/deposits**
- Protected endpoint
- Creates deposit request with status "pending"
- Fields: amount, payment_method, payment_proof, notes
- Returns: transaction object

**POST /api/withdrawals**
- Protected endpoint
- Creates withdrawal request
- Validations:
  - Check available_for_withdrawal >= (amount + fee)
  - Check no active investments (if required)
- Process:
  - Create transaction record
  - IMMEDIATELY deduct (amount + fee) from balances
  - Status: "pending"
- Returns: transaction object

**GET /api/transactions**
- Protected endpoint
- Optional filters: type, status
- Returns user's transactions
- Sorted by created_at desc

### Admin Endpoints

**GET /api/admin/dashboard**
- Protected (admin only)
- Returns: statistics, pending counts, recent activity

**GET /api/admin/users**
- Protected (admin only)
- Optional filter: status (pending/active/suspended/rejected)
- Returns: array of users with full details

**PUT /api/admin/users/{user_id}/approve**
- Protected (admin only)
- Updates user status to "active"
- Sets approved_at timestamp
- Logs: "User {id} approved by admin {email}"
- Returns: message

**PUT /api/admin/users/{user_id}/reject**
- Protected (admin only)
- Updates user status to "rejected"
- Sets rejected_at timestamp
- Logs: "User {id} rejected by admin {email}"
- Returns: message

**POST /api/admin/users/{user_id}/balance**
- Protected (admin only)
- Adjusts user balance
- Body:
  - adjustment_type: "add" | "subtract"
  - balance_type: "brl_balance" | "available_for_withdrawal"
  - amount: float
  - notes: string
- Creates admin_adjustment transaction
- Logs change
- Returns: updated balance

**GET /api/admin/transactions**
- Protected (admin only)
- Optional filters: type, status
- Returns all transactions with user info

**PUT /api/admin/transactions/{transaction_id}/approve**
- Protected (admin only)
- For deposits:
  - Updates status to "approved"
  - Adds amount to user's brl_balance
  - Adds amount to user's available_for_withdrawal
  - Logs: "Deposit {id} approved by admin {email} - R$ {amount} added to user {user_id}"
- For withdrawals:
  - Updates status to "completed"
  - Balance already deducted
  - Logs: "Withdrawal {id} approved by admin {email}"
- Returns: message

**PUT /api/admin/transactions/{transaction_id}/reject**
- Protected (admin only)
- Body: reason (optional)
- For deposits:
  - Updates status to "rejected"
  - No balance change
- For withdrawals:
  - Updates status to "rejected"
  - REFUNDS amount to user's balances
  - Logs: "Withdrawal {id} rejected - R$ {amount} refunded"
- Saves rejection reason
- Returns: message

**GET /api/admin/settings**
- Protected (admin only)
- Returns platform_settings document

**PUT /api/admin/settings**
- Protected (admin only)
- Updates platform settings
- Fields: withdrawal_fee, payment_methods, etc.
- Returns: updated settings

---

## AUTOMATED PROFIT DISTRIBUTION

### APScheduler Configuration
- Runs every 1 minute (configurable to 6 hours in production)
- Function: `distribute_investment_profits()`

### Profit Distribution Logic
```python
async def distribute_investment_profits():
    # Get all active investments where next_profit_at <= now
    investments = await db.investments.find({
        "status": "active",
        "next_profit_at": {"$lte": datetime.utcnow()}
    }).to_list(None)
    
    for investment in investments:
        # Calculate profit for this cycle
        profit = investment["profit_per_cycle"]
        
        # Add to user balance
        await db.users.update_one(
            {"id": investment["user_id"]},
            {
                "$inc": {
                    "brl_balance": profit,
                    "available_for_withdrawal": profit,
                    "total_profit": profit
                }
            }
        )
        
        # Create profit transaction
        await db.transactions.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": investment["user_id"],
            "type": "profit",
            "amount": profit,
            "status": "completed",
            "notes": f"Lucro do investimento {investment['plan_name']}",
            "created_at": datetime.utcnow()
        })
        
        # Update investment
        new_completed = investment["completed_cycles"] + 1
        
        if new_completed >= investment["total_cycles"]:
            # Investment completed
            await db.investments.update_one(
                {"id": investment["id"]},
                {
                    "$set": {
                        "status": "completed",
                        "completed_cycles": new_completed
                    }
                }
            )
        else:
            # Schedule next profit
            next_profit = datetime.utcnow() + timedelta(hours=6)
            await db.investments.update_one(
                {"id": investment["id"]},
                {
                    "$set": {
                        "completed_cycles": new_completed,
                        "next_profit_at": next_profit
                    }
                }
            )
        
        # Log
        logger.info(f"Profit distributed: R$ {profit} to user {investment['user_id']} from investment {investment['id']}")
```

---

## REFERRAL SYSTEM (5-Level Commission)

### Commission Structure
- Level 1 (Direct referrals): 10%
- Level 2 (Referrals of referrals): 5%
- Level 3: 3%
- Level 4: 2%
- Level 5: 1%

### Implementation Logic
When a user makes an investment:
1. Get investment amount
2. Find user's referrer (referred_by field)
3. Calculate Level 1 commission (10%)
4. Add to referrer's balance
5. Find Level 2 referrer (referrer's referrer)
6. Calculate Level 2 commission (5%)
7. Continue up to Level 5

### Code Example
```python
async def distribute_referral_commissions(user_id, investment_amount):
    commission_rates = [0.10, 0.05, 0.03, 0.02, 0.01]  # 10%, 5%, 3%, 2%, 1%
    
    current_user = await db.users.find_one({"id": user_id})
    
    for level, rate in enumerate(commission_rates, start=1):
        if not current_user or not current_user.get("referred_by"):
            break
        
        # Find referrer
        referrer = await db.users.find_one({"referral_code": current_user["referred_by"]})
        
        if not referrer:
            break
        
        # Calculate commission
        commission = investment_amount * rate
        
        # Add to referrer's balance
        await db.users.update_one(
            {"id": referrer["id"]},
            {
                "$inc": {
                    "brl_balance": commission,
                    "available_for_withdrawal": commission
                }
            }
        )
        
        # Create transaction
        await db.transactions.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": referrer["id"],
            "type": "referral_bonus",
            "amount": commission,
            "status": "completed",
            "notes": f"Nível {level} - Comissão de {current_user['full_name']}",
            "created_at": datetime.utcnow()
        })
        
        # Move to next level
        current_user = referrer
```

---

## RESPONSIVE DESIGN SPECIFICATIONS

### Breakpoints (Tailwind Default)
- Mobile: < 640px (default, no prefix)
- Tablet: >= 768px (md:)
- Desktop: >= 1024px (lg:)
- Large Desktop: >= 1280px (xl:)

### Mobile-First Approach
- Default styles for mobile (375x812px)
- Use md: prefix for tablet adjustments
- Use lg: prefix for desktop adjustments

### Key Responsive Elements

**Sidebar:**
- Mobile: Hidden by default, opens with overlay
- Desktop: Always visible, fixed position
- Transparency: 70% opacity (bg-*/70)
- Backdrop blur: backdrop-blur-md

**Navigation:**
- Mobile: Hamburger menu in header
- Desktop: Full sidebar navigation

**Cards/Grids:**
- Mobile: 1 column (grid-cols-1)
- Tablet: 2 columns (md:grid-cols-2)
- Desktop: 4 columns (lg:grid-cols-4)

**Tables:**
- Mobile: Convert to cards
- Desktop: Traditional table layout

**Forms:**
- Mobile: Full width inputs
- Desktop: Fixed max-width with centering

**Modals:**
- Mobile: Full screen or near-full screen
- Desktop: Centered with max-width

**Touch Targets:**
- Minimum 44x44px for all interactive elements
- Adequate spacing between clickable items

---

## ENVIRONMENT VARIABLES

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=bybit_investment
CORS_ORIGINS=*
JWT_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRE_HOURS=720
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=https://your-domain.com
WDS_SOCKET_PORT=443
```

**Critical Rules:**
- NEVER hardcode URLs in code
- Always use environment variables
- Backend binds to 0.0.0.0:8001
- Frontend uses REACT_APP_BACKEND_URL for API calls
- All backend routes must be prefixed with /api

---

## SECURITY REQUIREMENTS

### Password Security
- Minimum 8 characters
- Hashed with bcrypt (salt rounds: 12)
- Never store plain text passwords

### JWT Tokens
- Expire after 30 days (720 hours)
- Include: user_id, email, is_admin
- Signed with HS256 algorithm
- Validated on every protected endpoint

### Authorization
- User endpoints: Check valid JWT
- Admin endpoints: Check valid JWT + is_admin flag
- Return 401 for invalid tokens
- Return 403 for insufficient permissions

### Input Validation
- Validate all user inputs
- Sanitize data before database insertion
- Check data types and formats
- Limit string lengths

### SQL/NoSQL Injection Prevention
- Use parameterized queries (MongoDB operators)
- Never concatenate user input into queries
- Validate UUIDs before database lookups

---

## ERROR HANDLING

### Frontend
- Display toast notifications for errors
- Show validation errors inline on forms
- Handle network errors gracefully
- Provide user-friendly error messages in Portuguese

### Backend
- Return appropriate HTTP status codes:
  - 200: Success
  - 400: Bad Request (validation errors)
  - 401: Unauthorized (invalid/missing token)
  - 403: Forbidden (insufficient permissions)
  - 404: Not Found
  - 500: Internal Server Error
- Always return JSON responses
- Include "detail" field with error message in Portuguese
- Log all errors to console/file

### Error Messages (Portuguese)
- "Email ou senha incorretos"
- "Sua conta está aguardando aprovação"
- "Sua conta foi rejeitada"
- "Saldo insuficiente"
- "Valor deve estar entre R$ X e R$ Y"
- "Usuário não encontrado"
- "Transação não encontrada"
- "Erro ao processar solicitação"

---

## DEPLOYMENT REQUIREMENTS

### Backend Service
- Managed by Supervisor
- Process name: backend
- Command: uvicorn server:app --host 0.0.0.0 --port 8001
- Auto-restart on failure
- Log files: /var/log/supervisor/backend.*.log

### Frontend Service
- Managed by Supervisor
- Process name: frontend
- Command: yarn start or serve build
- Port: 3000
- Auto-restart on failure

### MongoDB Service
- Managed by Supervisor
- Process name: mongodb
- Default port: 27017
- Data directory: /data/db

### Kubernetes Configuration
- Ingress rules: /api → backend:8001
- Routes without /api → frontend:3000
- All backend endpoints MUST have /api prefix

---

## TESTING REQUIREMENTS

### Manual Testing Checklist
1. User registration → Admin approval → User login ✅
2. Create investment → Verify balance deduction ✅
3. Profit distribution → Verify balance increase ✅
4. Deposit request → Admin approval → Verify balance increase ✅
5. Withdrawal request → Verify immediate deduction → Admin approval ✅
6. Withdrawal rejection → Verify balance refund ✅
7. Admin balance adjustment → Verify changes ✅
8. All toast notifications appear correctly ✅
9. Mobile responsive design on all pages ✅
10. Admin panel access and all functions ✅

### Automated Testing (Optional)
- Backend: pytest for API endpoints
- Frontend: Jest + React Testing Library
- E2E: Playwright or Cypress

---

## LOGGING REQUIREMENTS

### Backend Logging
- Log all admin actions with details:
  - User approvals/rejections
  - Transaction approvals/rejections
  - Balance adjustments
  - Settings changes
- Include: timestamp, admin email, action, affected user/transaction
- Log format: ISO datetime, level, message
- Log to both console and file

### Example Logs
```
2025-10-06 04:46:54 - INFO - User abc123 approved by admin skidolynx@gmail.com
2025-10-06 04:47:12 - INFO - Deposit dep456 approved by admin skidolynx@gmail.com - R$ 500.0 added to user xyz789
2025-10-06 04:48:30 - INFO - Withdrawal wth012 rejected by admin skidolynx@gmail.com - R$ 200.0 refunded to user xyz789
```

---

## PERFORMANCE REQUIREMENTS

### Response Times
- API endpoints: < 500ms
- Page loads: < 2 seconds
- Database queries: < 200ms
- Profit distribution: Process all investments in < 1 minute

### Optimization
- Database indexes on:
  - users.email (unique)
  - users.username (unique)
  - users.referral_code (unique)
  - investments.user_id
  - investments.status
  - transactions.user_id
  - transactions.status
- Pagination for large lists (20-50 items per page)
- Lazy loading for images
- Code splitting for frontend

---

## FINAL NOTES

### Brazilian Portuguese
- All UI text in Portuguese
- Date format: DD/MM/YYYY
- Currency format: R$ X.XXX,XX (with thousands separator)
- Phone format: +55 11 99999-9999

### Payment Details (Production)
```
PIX:
CPF: 778.456.096-68
Bank: Caixa Economica Federal
Name: Elaine Barbosa Gonzaga Oliveira

USDT (TRC20):
Address: TTzxWaMnA54TRzcw8Lg63eBqGRd3FgKZZj
Network: TRC20

Bybit UID:
467135313

Support WhatsApp:
+62 838-3942-6007
```

### Admin Access
```
Email: skidolynx@gmail.com
Password: @Mypetname9 (or @Skido999)
```

### Production URL
```
https://cryptomine-dash-2.preview.emergentagent.com
```

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Backend Setup
- [ ] Set up FastAPI project structure
- [ ] Configure MongoDB connection
- [ ] Create all data models (Pydantic)
- [ ] Implement authentication (JWT)
- [ ] Create all API endpoints
- [ ] Set up APScheduler
- [ ] Test all endpoints

### Phase 2: Frontend Setup
- [ ] Create React app with routing
- [ ] Set up Tailwind CSS with custom theme
- [ ] Create AuthContext for state management
- [ ] Build all page components
- [ ] Implement API integration
- [ ] Add toast notifications
- [ ] Test responsive design

### Phase 3: User Features
- [ ] Registration and login
- [ ] Dashboard with statistics
- [ ] Investment system (plans, create, view)
- [ ] Deposit flow (multi-step)
- [ ] Withdrawal flow (multi-step)
- [ ] Transaction history
- [ ] Profile management
- [ ] Referrals page

### Phase 4: Admin Features
- [ ] Admin login and dashboard
- [ ] User management (approve/reject)
- [ ] Transaction management
- [ ] Balance adjustments
- [ ] Platform settings
- [ ] All admin approval/rejection flows

### Phase 5: Testing & Polish
- [ ] Comprehensive backend testing
- [ ] Frontend UI/UX testing
- [ ] Mobile responsiveness
- [ ] Error handling
- [ ] Toast notifications
- [ ] Logging verification
- [ ] Performance optimization

### Phase 6: Deployment
- [ ] Environment configuration
- [ ] Database initialization
- [ ] Service setup (Supervisor)
- [ ] Health checks
- [ ] Production deployment

---

## SUCCESS CRITERIA

The app is considered complete and production-ready when:
1. ✅ All user authentication flows work correctly
2. ✅ Admin can approve/reject users and transactions
3. ✅ Investment creation and profit distribution automated
4. ✅ Deposit and withdrawal flows complete
5. ✅ All balances update correctly
6. ✅ Toast notifications appear for all actions
7. ✅ Mobile responsive on all pages
8. ✅ Admin panel fully functional
9. ✅ Payment details configured correctly
10. ✅ No critical bugs or security issues
11. ✅ Logging captures all admin actions
12. ✅ Database properly indexed
13. ✅ All endpoints return correct HTTP status codes
14. ✅ UI matches color scheme exactly
15. ✅ All text in Brazilian Portuguese

---

END OF SPECIFICATION
