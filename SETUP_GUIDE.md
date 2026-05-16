# Setup Guide

This file contains the terminal commands and step-by-step instructions for setting up and running the project locally, plus notes for pushing to the repository.

## Development prerequisites

- Node.js (16+ recommended)
- npm
- PostgreSQL (or a connection string to a hosted DB)
- Optional: `gh` GitHub CLI for creating repos

## Install backend dependencies

From the project root:

```bash
cd /path/to/agentic-crm
npm install --legacy-peer-deps
```

If you encounter permission errors with the npm cache, either run the chown command locally:

```bash
# sudo chown -R $(id -u):$(id -g) ~/.npm
```

or use a temporary cache for the install:

```bash
npm install --legacy-peer-deps --cache /tmp/npm-cache
```

## Start backend

```bash
npm run dev
```

## Client

```bash
cd client
npm install
npm start
```

## Git: add remote and push full project

If you already created a remote (or want to add one), run:

```bash
cd /path/to/agentic-crm
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git branch -M main
# create a sensible .gitignore before adding files (see below)
git add .
git commit -m "chore: add project files"
git push -u origin main
```

If you prefer to use the GitHub CLI and create the repo from the terminal:

```bash
gh auth login
gh repo create YOUR_USERNAME/REPO_NAME --private --source=. --remote=origin --push
```

## .gitignore suggestion (if not present)

Make sure you have a `.gitignore` to avoid committing `node_modules` and build artifacts:

```text
node_modules/
dist/
build/
.env
.env.*
npm-debug.log
yarn-error.log
.DS_Store
coverage/
client/node_modules/
client/build/
.vscode/
.devcontainer/
EOF
```

## Notes

- This project is multi-part (backend, client). Do not commit local secrets.
- If you need help creating the GitHub repo or setting up CI, ask and I can create a minimal workflow.
# Agentic CRM Platform - Complete Setup Guide

## 🚀 Project Overview

A comprehensive, enterprise-grade CRM platform powered by AI agents for multiple use cases. Built with TypeScript, React, Node.js, and PostgreSQL.

**Key Capabilities:**
- Multi-tenant SaaS architecture
- 5 AI agents for different CRM workflows
- Full-stack TypeScript implementation
- JWT-based authentication with RBAC
- Interactive React dashboard
- Real-time analytics

---

## 📦 What's Included

### Backend Features
✅ Node.js/Express API with TypeScript
✅ PostgreSQL with Sequelize ORM
✅ Multi-tenant database schema
✅ JWT authentication & refresh tokens
✅ Role-based access control (Admin, Manager, Agent, Viewer)
✅ 5 AI Agents (Lead Management, Sales Pipeline, Task Automation, Customer Support, Analytics)
✅ Workflow automation engine
✅ Integration layer (Salesforce, Slack, Email)
✅ Comprehensive error handling & logging

### Frontend Features
✅ React 18 with TypeScript
✅ Tailwind CSS for styling
✅ Recharts for analytics dashboards
✅ Zustand for state management
✅ React Router for navigation
✅ Login/authentication pages
✅ Dashboard with KPIs and charts
✅ Contacts management view
✅ Responsive design

### Database Models
✅ Tenant (multi-tenant support)
✅ User (with role-based access)
✅ Contact (CRM contacts)
✅ Deal (sales pipeline)
✅ Activity (activity logging)
✅ Task (task management)
✅ Workflow (automation rules)

---

## 🔧 Installation & Running

### Step 1: Install Backend Dependencies

```bash
cd /Users/dj/agentic-crm
npm install --legacy-peer-deps
```

### Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=agentic_crm
DB_USER=postgres
DB_PASSWORD=your_password
NODE_ENV=development
PORT=3000
JWT_SECRET=your_super_secret_key_change_this
```

### Step 3: Build Backend

```bash
npm run build
```

### Step 4: Start Backend Server

```bash
npm run dev
```

You should see:
```
Server running on http://localhost:3000
Database initialized successfully
```

### Step 5: Install Frontend Dependencies

```bash
cd client
npm install
```

### Step 6: Start Frontend

```bash
npm start
```

Frontend will open at `http://localhost:3000`

---

## 📡 API Usage

### Authentication Endpoints

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "your-tenant-id",
    "email": "user@example.com",
    "password": "secure123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure123"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "role": "agent",
    "tenantId": "uuid",
    "accessToken": "jwt_token",
    "refreshToken": "jwt_token"
  }
}
```

### Protected API Endpoints

Add header to all requests:
```
Authorization: Bearer {accessToken}
```

**Create Contact:**
```bash
curl -X POST http://localhost:3000/api/contacts \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "555-1234",
    "company": "Acme Inc"
  }'
```

**Get Contacts:**
```bash
curl -X GET http://localhost:3000/api/contacts \
  -H "Authorization: Bearer {token}"
```

**Create Deal:**
```bash
curl -X POST http://localhost:3000/api/deals \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": "uuid",
    "title": "Enterprise Deal",
    "value": 50000,
    "stage": "qualification",
    "expectedCloseDate": "2024-06-30"
  }'
```

### Agent Execution

**Execute Lead Management Agent:**
```bash
curl -X POST http://localhost:3000/api/agents/execute \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "lead-management",
    "useCase": "process-new-lead",
    "payload": {
      "contactId": "uuid",
      "tenantId": "uuid"
    }
  }'
```

**Execute Sales Pipeline Analysis:**
```bash
curl -X POST http://localhost:3000/api/agents/execute \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "sales-pipeline",
    "useCase": "analyze-pipeline",
    "payload": { "tenantId": "uuid" }
  }'
```

---

## 🤖 AI Agents Overview

### 1. Lead Management Agent
**Purpose:** Automated lead scoring, qualification, and nurturing

**Capabilities:**
- Calculate lead quality score (0-100)
- Auto-create initial deals for qualified leads
- Generate follow-up tasks
- Suggest nurture sequences

**Use Cases:**
- Process new contacts
- Nurture cold leads
- Auto-advance qualified leads

### 2. Sales Pipeline Agent
**Purpose:** Deal analysis and pipeline management

**Capabilities:**
- Analyze complete pipeline
- Calculate win probability
- Forecast revenue
- Identify bottlenecks
- Suggest next actions

**Use Cases:**
- Pipeline health assessment
- Deal progression recommendations
- Revenue forecasting

### 3. Task Automation Agent
**Purpose:** Smart task management and prioritization

**Capabilities:**
- Create tasks from workflows
- Auto-prioritize based on urgency
- Suggest task dependencies
- Track completion

**Use Cases:**
- Workflow automation
- Task prioritization
- Deadline management

### 4. Customer Support Agent
**Purpose:** Support ticket routing and response generation

**Capabilities:**
- Classify support requests
- Route to appropriate agent
- Generate initial responses
- Track resolution

**Use Cases:**
- Ticket routing
- Quick response generation
- Customer satisfaction

### 5. Analytics Reporting Agent
**Purpose:** Business intelligence and reporting

**Capabilities:**
- Generate comprehensive reports
- Calculate key metrics
- Provide business insights
- Track KPIs

**Use Cases:**
- Executive dashboards
- Performance tracking
- Trend analysis

---

## 🗄️ Database Schema

### Key Relationships

```
Tenant (1) ──→ (∞) User
          ──→ (∞) Contact
          ──→ (∞) Deal
          ──→ (∞) Task
          ──→ (∞) Activity
          ──→ (∞) Workflow

Contact (1) ──→ (∞) Deal
         ──→ (∞) Activity
         ──→ (∞) Task

Deal (1) ──→ (∞) Activity
     ──→ (∞) Task
```

### Important Notes
- All tables include `tenantId` for multi-tenant isolation
- Timestamps (createdAt, updatedAt) on all models
- UUID primary keys for scalability
- Soft delete support for GDPR compliance (optional)

---

## 📊 File Structure Explained

```
src/
├── agents/                    # AI agent implementations
│   ├── LeadManagementAgent.ts       # Lead scoring & qualification
│   ├── SalesPipelineAgent.ts        # Deal analysis
│   ├── TaskAutomationAgent.ts       # Task automation
│   ├── CustomerSupportAgent.ts      # Support ticket handling
│   ├── AnalyticsReportingAgent.ts   # Business intelligence
│   └── orchestrator.ts              # Agent routing & execution
│
├── api/
│   ├── routes/                      # API endpoints
│   │   ├── authRoutes.ts           # Login, register, refresh
│   │   ├── contactRoutes.ts        # Contact CRUD
│   │   ├── dealRoutes.ts           # Deal CRUD
│   │   ├── workflowRoutes.ts       # Workflow management
│   │   └── agentRoutes.ts          # Agent execution
│   └── middleware/
│       ├── authMiddleware.ts        # JWT verification
│       └── errorHandler.ts          # Error handling
│
├── database/
│   ├── init.ts                      # Database connection
│   └── models/                      # Sequelize models
│       ├── Tenant.ts               # Multi-tenant support
│       ├── User.ts                 # User accounts & RBAC
│       ├── Contact.ts              # CRM contacts
│       ├── Deal.ts                 # Sales deals
│       ├── Task.ts                 # Task tracking
│       ├── Activity.ts             # Activity log
│       └── Workflow.ts             # Automation rules
│
├── utils/
│   ├── logger.ts                    # Winston logging
│   └── authService.ts               # Password & token management
│
├── integrations/
│   ├── EmailService.ts              # Email sending
│   ├── SlackIntegration.ts          # Slack notifications
│   └── SalesforceIntegration.ts     # Salesforce sync
│
└── index.ts                          # Express server setup

client/
├── src/
│   ├── components/                  # React components
│   │   ├── Dashboard.tsx           # Main dashboard
│   │   ├── ContactsView.tsx        # Contacts management
│   │   └── Layout.tsx              # App layout & navigation
│   │
│   ├── pages/
│   │   └── LoginPage.tsx            # Authentication page
│   │
│   ├── store/
│   │   └── authStore.ts             # Zustand auth state
│   │
│   ├── api/
│   │   └── client.ts                # Axios client with interceptors
│   │
│   ├── App.tsx                      # Main app router
│   └── index.tsx                    # React entry point
│
└── public/
    └── index.html                   # HTML template
```

---

## 🔐 Security Features

1. **Password Security**
   - bcrypt hashing with salt 10
   - Secure password reset flow

2. **API Security**
   - JWT token-based auth
   - Refresh token rotation
   - CORS enabled
   - Helmet.js security headers

3. **Data Protection**
   - Tenant isolation at DB level
   - Role-based access control
   - Data encryption in transit (HTTPS ready)

4. **Token Management**
   - Access tokens: 7 days
   - Refresh tokens: 30 days
   - Automatic token refresh

---

## 🧪 Testing the Application

### 1. Test Backend Health
```bash
curl http://localhost:3000/health
```

### 2. Register a New Tenant
```bash
# First, create a tenant (you'll need to add this endpoint or do via DB)
# For now, use a generated UUID as tenantId
TENANT_ID="550e8400-e29b-41d4-a716-446655440000"

curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"tenantId\": \"$TENANT_ID\",
    \"email\": \"test@example.com\",
    \"password\": \"Test123!\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\"
  }"
```

### 3. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

### 4. Create a Contact
```bash
TOKEN="your_access_token_here"

curl -X POST http://localhost:3000/api/contacts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Alice",
    "lastName": "Johnson",
    "email": "alice@company.com",
    "company": "Tech Corp"
  }'
```

### 5. Qualify the Lead
```bash
CONTACT_ID="contact_uuid_here"
TOKEN="your_access_token_here"

curl -X POST http://localhost:3000/api/agents/execute \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"agentType\": \"lead-management\",
    \"useCase\": \"process-new-lead\",
    \"payload\": {
      \"contactId\": \"$CONTACT_ID\",
      \"tenantId\": \"$TENANT_ID\"
    }
  }"
```

---

## 🚀 Next Steps

### Immediate (This Week)
- [ ] Set up PostgreSQL database
- [ ] Run backend successfully
- [ ] Run frontend successfully
- [ ] Test login flow
- [ ] Test contact creation

### Short Term (2-4 Weeks)
- [ ] Add more agent workflows
- [ ] Implement webhook support
- [ ] Add email notifications
- [ ] Create API documentation
- [ ] Add unit tests

### Medium Term (1-3 Months)
- [ ] Deploy to cloud (AWS/GCP)
- [ ] Add WebSocket for real-time
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] Machine learning features

### Long Term (3+ Months)
- [ ] Multi-language support
- [ ] Advanced customization
- [ ] Marketplace for integrations
- [ ] AI-powered insights
- [ ] Audit logging

---

## 📞 Troubleshooting

### Issue: "Cannot connect to database"
**Solution:**
1. Ensure PostgreSQL is running: `brew services start postgresql` (macOS)
2. Check credentials in `.env`
3. Verify database exists: `createdb agentic_crm`

### Issue: "Port 3000 already in use"
**Solution:**
```bash
lsof -ti :3000 | xargs kill -9
# Or change PORT in .env
```

### Issue: "npm install fails"
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Issue: "Frontend can't connect to API"
**Solution:**
1. Ensure backend is running on http://localhost:3000
2. Check CORS settings in backend
3. Verify `proxy` setting in client/package.json

---

## 📚 Documentation

- Database: See schema in `src/database/models/`
- APIs: See routes in `src/api/routes/`
- Agents: See implementations in `src/agents/`
- Frontend: See components in `client/src/components/`

---

## 📄 License

MIT - Feel free to use for commercial and private projects

---

## ✅ Verification Checklist

- [x] Backend scaffolding complete
- [x] Database models defined
- [x] API routes created
- [x] AI agents implemented
- [x] Authentication system built
- [x] Frontend created
- [x] Multi-tenant support added
- [x] RBAC implemented
- [x] Error handling added
- [x] Logging configured
- [ ] Tests written
- [ ] Production deployment ready
