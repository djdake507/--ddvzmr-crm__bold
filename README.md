# Agentic CRM

A scaffold for an agentic, multi-tenant CRM platform (backend TypeScript + Express, AI agents, PostgreSQL, and a React frontend).

## Summary

This repository contains a prototype/full scaffold for an agent-driven CRM supporting tenant isolation, agent workflows, integrations, and a React client.


## Setup Guide

Detailed terminal instructions and step-by-step setup were moved to `SETUP_GUIDE.md` to keep this `README.md` concise. See the full development and git push instructions there.

## Environment (short)

Copy `.env.example` to `.env` and set values for `DATABASE_URL`, `JWT_SECRET`, and any provider/API keys you need (SendGrid, Slack, Salesforce, etc.).

## Contributing

This is an active scaffold. Feel free to open issues or PRs. For local development, run the backend and client simultaneously; see `SETUP_GUIDE.md` for exact commands.

## License

TBD
# Agentic CRM Platform

A comprehensive CRM platform powered by AI agents for multiple use cases including lead qualification, customer support, sales automation, and analytics.

## Features

### 🤖 Agentic Framework
- **Lead Qualification Agent**: Automatically scores and qualifies leads
- **Customer Support Agent**: Handles support requests and generates responses
- **Sales Automation Agent**: Analyzes deals and provides sales recommendations
- **Analytics Agent**: Generates CRM reports and insights

### 📊 Core CRM Features
- Contact management with segmentation
- Deal pipeline tracking
- Activity logging and task management
- Real-time analytics and reporting
- Integration with third-party services

### 🔧 Technical Stack
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Sequelize ORM
- **AI Framework**: Custom agent orchestration system
- **API**: REST API with comprehensive endpoints
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
