# Agentic CRM

A **Salesforce + Slack competitor** combining enterprise CRM capabilities with intelligent agent-assisted customer profile tracking and real-time collaboration.

![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)

## Vision

This platform differentiates itself through:

1. **Dual-layer customer profiles** — Surface data (vendor/external) + internal CRM-only profiles (redacted, accessible only to admins and agents).
2. **Fluid agent collaboration** — Agents work alongside reps in intelligent, contextual exchanges—not as directive chatbots.
3. **KPI tracking + predictive analytics** — Real-time dashboards for tenant, rep, and customer health metrics.
4. **Profile pipeline management** — Define customer journeys and track progression through stages.

See [ARCHITECTURE.md](ARCHITECTURE.md) for a comprehensive overview of the dual-layer system, agent behavior model, and competitive positioning.

## Key Features

### 🎯 Customer Profile Tracking
- **Dual-layer identification:** `vendorCustomerId` (external/surface) + `crmCustomerId` (internal/redacted)
- **Surface data:** Limited access to vendor-provided customer info
- **Internal profiles:** Admin-rep and agent-accessible enriched customer insights
- **Historical data import:** One-time training data for agent knowledge base
- **Profile pipelines:** Define and manage customer journeys through custom stages

### 🤖 Intelligent Agent Assistance
- **Contextual insights:** Agents surface relevant historical data, patterns, and recommendations during rep conversations
- **Fluid exchange:** Agents assist reps—not a chatbot, but a collaborative partner
- **Knowledge base:** Trained on historical interactions and customer profiles from Layer 2
- **Real-time collaboration:** Agent suggestions appear alongside rep notes in interaction timeline

### 📊 KPI Tracking & Predictive Models
- **Tenant-level KPIs:** Revenue, CAC, churn rate, LTV
- **Rep-level KPIs:** Pipeline value, close rate, customer satisfaction
- **Customer-level KPIs:** Health score, engagement, churn risk, expansion opportunity
- **Predictions:** Churn risk, expansion opportunities, sentiment analysis, pipeline forecasting

### 💬 Real-time Collaboration
- Built-in rep-agent communication
- Shared customer context and notes
- Integration with Slack and email

### 🔧 Multi-Tenant Enterprise Platform
- Tenant isolation and role-based access control
- Audit logging and compliance
- Customizable workflows and pipelines
- REST API-first architecture

## Tech Stack

- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL + Sequelize ORM
- **Frontend:** React 18 + Tailwind CSS + Zustand
- **Auth:** JWT-based with bcrypt hashing
- **Real-time:** (Planned) WebSocket for live collaboration
- **Logging:** Winston

## Quick Start

### Backend

```bash
cd /path/to/agentic-crm
npm install --legacy-peer-deps
npm run dev
```

### Frontend

```bash
cd client
npm install
npm start
```

For detailed setup instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md).

## Environment Setup

Copy `.env.example` to `.env`:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/agentic_crm
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

Optional API keys for integrations:
- SendGrid (email service)
- Slack (webhooks)
- Salesforce (OAuth)

## Architecture & Design

See [ARCHITECTURE.md](ARCHITECTURE.md) for:
- Dual-layer customer profile system details
- Agent collaboration model and behavior
- KPI framework and predictive models
- Profile pipeline management
- Database schema and API design
- Security & multi-tenancy approach
- Development roadmap (Phase 1, 2, 3)

## Contributing

This is an active scaffold. Feel free to open issues or PRs. For local development:

1. Clone the repo
2. Install dependencies (backend + client)
3. Set up `.env` with database and API keys
4. Run backend (`npm run dev`) and client (`npm start`) simultaneously
5. See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed commands

## Roadmap

### Phase 1 (Current)
- [x] Scaffold backend and frontend
- [x] Authentication & RBAC
- [ ] Dual-layer customer profile models and API
- [ ] Basic KPI metric system
- [ ] Initial agent knowledge base setup

### Phase 2
- [ ] Agent collaboration UI (rep + agent exchange)
- [ ] Real-time insights delivery
- [ ] Profile pipeline management (Kanban UI)
- [ ] Predictive models (churn, expansion, sentiment)

### Phase 3
- [ ] Voice transcription and agent listening
- [ ] Advanced knowledge base training
- [ ] Integration with Salesforce, HubSpot, Zendesk
- [ ] Slack/Teams bot
- [ ] Advanced analytics and forecasting

## License

MIT License — See [LICENSE](LICENSE) for details.

## Contact & Support

For questions or feedback, open an issue or reach out to the maintainers.
- **Integrations**: Salesforce, Slack, Email services

## Project Structure

```
├── src/
│   ├── agents/
│   │   ├── LeadQualificationAgent.ts
│   │   ├── CustomerSupportAgent.ts
│   │   ├── SalesAutomationAgent.ts
│   │   ├── AnalyticsAgent.ts
│   │   └── orchestrator.ts
│   ├── api/
│   │   └── routes/
│   │       ├── contactRoutes.ts
│   │       ├── dealRoutes.ts
│   │       └── agentRoutes.ts
│   ├── database/
│   │   ├── init.ts
│   │   └── models/
│   │       ├── Contact.ts
│   │       ├── Deal.ts
│   │       └── Activity.ts
│   ├── middleware/
│   │   └── errorHandler.ts
│   ├── integrations/
│   │   ├── EmailService.ts
│   │   ├── SlackIntegration.ts
│   │   └── SalesforceIntegration.ts
│   ├── utils/
│   │   └── logger.ts
│   └── index.ts
├── client/
├── .env.example
├── package.json
└── tsconfig.json
```

## Installation

### Prerequisites
- Node.js v18+
- PostgreSQL 12+
- npm or yarn

### Steps

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Initialize database**
   ```bash
   npm run migration:run
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:3000`

## API Endpoints

### Contacts
- `GET /api/contacts` - List all contacts
- `GET /api/contacts/:id` - Get contact details
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Deals
- `GET /api/deals` - List all deals
- `GET /api/deals/:id` - Get deal details
- `POST /api/deals` - Create new deal
- `PUT /api/deals/:id` - Update deal
- `DELETE /api/deals/:id` - Delete deal

### Agents
- `GET /api/agents` - List available agents
- `POST /api/agents/execute` - Execute agent task
- `GET /api/agents/status/:agentId` - Get agent status

## Agent Usage

### Lead Qualification
```bash
POST /api/agents/execute
{
  "agentType": "lead-qualification",
  "useCase": "qualify-lead",
  "payload": { "contactId": "uuid" }
}
```

### Customer Support
```bash
POST /api/agents/execute
{
  "agentType": "customer-support",
  "useCase": "handle-request",
  "payload": {
    "contactId": "uuid",
    "request": "I have a billing question..."
  }
}
```

### Sales Automation
```bash
POST /api/agents/execute
{
  "agentType": "sales-automation",
  "useCase": "analyze-deal",
  "payload": { "dealId": "uuid" }
}
```

### Analytics
```bash
POST /api/agents/execute
{
  "agentType": "analytics",
  "useCase": "generate-report",
  "payload": {}
}
```

## Integration Setup

### Salesforce
Set environment variables:
```
SALESFORCE_CLIENT_ID=your_client_id
SALESFORCE_CLIENT_SECRET=your_client_secret
```

### Slack
Set webhook URL:
```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/webhook/url
```

### Email Service
Configure SMTP settings:
```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASSWORD=your_password
```

## Development

### Build
```bash
npm run build
```

### Run Tests
```bash
npm test
```

### Lint Code
```bash
npm run lint
```

### Format Code
```bash
npm run format
```

## Database Migrations

### Create Migration
```bash
npm run migration:create -- --name migration_name
```

### Run Migrations
```bash
npm run migration:run
```

### Undo Last Migration
```bash
npm run migration:undo
```

## Logging

Logs are stored in the `logs/` directory:
- `error.log` - Error logs only
- `combined.log` - All logs

Configure log level in `.env`:
```
LOG_LEVEL=info
```

## Next Steps

1. **Frontend Development**: Create React dashboard in `client/` directory
2. **Authentication**: Implement JWT-based authentication
3. **Advanced Agents**: Add more specialized agents for different use cases
4. **Machine Learning**: Integrate ML models for better predictions
5. **Real-time Updates**: Add WebSocket support for real-time notifications
6. **Testing**: Implement comprehensive test suite
7. **Deployment**: Containerize with Docker and deploy to cloud

## License

MIT
