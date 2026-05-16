# Agentic CRM Architecture

## Product Vision

This platform is positioned as a **Salesforce + Slack competitor** — combining enterprise CRM capabilities with real-time collaboration and **intelligent agent-assisted customer profile tracking**.

The key differentiator is a **dual-layer customer profile system** where agents work alongside sales/support representatives in a fluid, collaborative exchange — not as directive chatbots, but as intelligent assistants augmenting human decision-making.

## Core Pillars

### 1. Customer Profile Tracking (Tier 1)

**Dual-Layer Identification & Data Model**

Each customer record maintains **two separate identification layers**:

#### Layer 1: Surface Data (Vendor/External)
- **ID:** `vendorCustomerId` (external system identifier)
- **Access:** Software owner has limited or no direct access; data lives in vendor systems
- **Purpose:** Represents the official customer record in the vendor's ecosystem
- **Data:** Contact info, transactions, service history (as exposed by vendor)
- **Update frequency:** Event-driven (webhooks, API polls) or manual sync

#### Layer 2: Internal CRM Profile (Redacted/Camouflaged)
- **ID:** `crmCustomerId` (internal unique identifier)
- **Access:** Only CRM admin representatives and agents can view/edit
- **Purpose:** Securely store enriched, normalized, and sensitive customer insights
- **Data:** Normalized profile, historical context, interaction logs, agent notes, predictive scores, relationship mapping
- **Visibility:** Redacted/camouflaged from non-admin users; displayed to reps and agents only during active sessions

**Example Workflow:**
1. Onboarding: Rep ingests customer surface data into Layer 1 (vendorCustomerId).
2. System creates associated Layer 2 record (crmCustomerId) with initial profile skeleton.
3. Historical data (if available from vendor): One-time import to train agent knowledge base.
4. Rep + Agent collaborate: Rep sees both layers; agent accesses camouflaged profile to assist.
5. Pipeline management: Admin rep uses Layer 2 to establish and track customer pipelines, engagement scores, KPIs.

**Database Model (conceptual):**
```
Customer
  - crmCustomerId (PK, UUID, internal)
  - vendorCustomerId (FK to external system)
  - tenantId (multi-tenant)
  - surfaceData: {...} // Layer 1
  - internalProfile: {...} // Layer 2 (redacted)
  - agent_accessible_profile: {...} // Subset of Layer 2 for agent collaboration
  - kpi_metrics: {...}
  - profile_pipelines: [{...}] // Relationships to pipelines
  - createdAt, updatedAt
```

### 2. Intelligent Agent Collaboration

**Agent Behavior Model**

Agents are **not chatbots or instruction-following automatons**. Instead, they:

- **Engage in fluid verbal exchange** with the representative during customer interactions.
- **Assist rather than direct:** Offer suggestions, surface relevant data, highlight patterns, and adapt responses based on rep feedback.
- **Leverage knowledge base:** Trained on historical customer data (one-time import) and interaction logs from Layer 2.
- **Context-aware:** Access to the redacted/camouflaged customer profile allows agents to understand nuance and provide situationally appropriate assistance.
- **Real-time collaboration:** Agent insights appear alongside rep notes in the interaction timeline, enabling collaborative decision-making.

**Example Interaction:**
```
Rep is on a call with a customer.
Agent observes the conversation (via voice transcription or rep notes).
Agent notices:
  - Similar issue resolved 3 months ago with a specific approach.
  - Customer's KPI indicates they're at churn risk (based on usage patterns).
  - Historical data shows this customer responds well to X approach.
Agent surfaces these insights: "This customer had a similar issue last time; approach X worked. They're also showing churn signals."
Rep evaluates and decides: "Good catch. Let's try approach X but with Y modification based on their current situation."
Agent adapts and continues supporting the conversation.
```

### 3. KPI Tracker & Predictive Analytics

**KPI Framework**

- **Tenant-level KPIs:** Revenue, customer acquisition cost, churn rate, customer lifetime value.
- **Rep-level KPIs:** Pipeline value, close rate, average deal size, customer satisfaction scores.
- **Customer-level KPIs:** Health score, engagement score, churn risk, expansion opportunity score.
- **Real-time dashboards:** KPIs updated continuously; agents alert reps to anomalies or opportunities.

**Predictive Models**

- **Churn prediction:** Based on Layer 2 customer activity, engagement trends, and historical patterns.
- **Expansion prediction:** Identify customers with high likelihood of upsell/cross-sell.
- **Sentiment analysis:** From call transcripts, emails, interaction notes.
- **Deal pipeline forecasting:** Aggregate rep-level pipeline and predict closing probability.

### 4. Profile Pipeline Management

**What are profile pipelines?**

A **pipeline** is a defined customer journey or engagement sequence, visible only to admin reps and agents. Examples:

- Onboarding pipeline: New customer → verification → initial setup → first value realization.
- Expansion pipeline: Existing customer → needs assessment → proposal → expansion.
- Churn recovery pipeline: At-risk customer → re-engagement → success story.

**Admin rep tools:**
- Define custom pipelines per business use case.
- Drag-and-drop stage management for customer profiles.
- Automated or manual stage transitions.
- Bottleneck alerts (e.g., "5 customers stuck in proposal stage for >30 days").

**Agent role:**
- Recommend next stage based on customer context.
- Highlight blockers or missing information.
- Suggest actions to move customer to next stage.

---

## System Architecture

### Backend (TypeScript + Express)

**API Layers:**

1. **Customer Profile API**
   - `/api/customers` — CRUD for Layer 1 + Layer 2 profiles
   - `/api/customers/:id/profile-layers` — Manage dual-layer visibility
   - `/api/customers/:id/kpi-metrics` — KPI retrieval and updates

2. **Agent Collaboration API**
   - `/api/interactions` — Store and retrieve agent-assisted interactions
   - `/api/agent-insights` — Endpoint for agents to surface insights during rep conversations
   - `/api/knowledge-base` — Train and query agent knowledge base from historical data

3. **Pipeline API**
   - `/api/pipelines` — Define and manage customer profile pipelines
   - `/api/pipelines/:id/customers` — List customers in a pipeline
   - `/api/pipelines/:id/stages` — Manage pipeline stages and transitions

4. **KPI / Analytics API**
   - `/api/kpi-dashboard` — Real-time KPI summaries
   - `/api/predictions` — Churn/expansion/sentiment predictions

### Database Models

**New/Updated Models:**

```
Customer (enhanced)
  - crmCustomerId (PK)
  - vendorCustomerId
  - tenantId
  - surfaceData (Layer 1)
  - internalProfile (Layer 2, redacted)
  - relationships: [CustomerId]

CustomerInteraction
  - id, customerId, representativeId, agentId
  - type (call, email, meeting, note)
  - transcript or notes
  - agent_insights: [{insight, confidence, recommendation}]
  - outcome
  - createdAt

KPIMetric
  - id, customerId, tenantId
  - metricName (churn_risk, health_score, engagement_score, etc.)
  - value (0-100 or numeric)
  - calculatedAt
  - trend (up, down, stable)

Pipeline
  - id, tenantId, name, description
  - stages: [{name, order, auto_transition?}]
  - createdAt

CustomerProfileState
  - id, customerId, pipelineId
  - currentStage
  - lastTransitionAt
  - blockers: [string]

AgentKnowledgeBase
  - id, agentId, tenantId
  - trainingData: {source, historical_interactions_count, lastTrainedAt}
  - trained_models: {churn_predictor, expansion_predictor, sentiment_model}
```

### Frontend (React)

**Key Views:**

1. **Customer Profile Dashboard**
   - Layer 1 (surface data, visible to all)
   - Layer 2 (redacted/camouflaged, admin + agent only)
   - KPI metrics and trends
   - Profile pipelines and current stage
   - Historical interaction timeline

2. **Agent Collaboration View**
   - Live rep-agent exchange UI
   - Agent insights panel (surfaced alongside rep notes)
   - Knowledge base search (agent can pull related customers, similar issues)
   - Call/email transcript with agent annotations

3. **Pipeline Management**
   - Kanban board: Stages as columns, customers as cards
   - Bulk pipeline management
   - Stage transition workflows

4. **KPI / Analytics Dashboard**
   - Tenant-level health metrics
   - Rep-level performance
   - Predictive alerts (churn, expansion, bottlenecks)

---

## Security & Multi-Tenancy

- **Layer 2 access control:** Only tenantId owner + admin reps + assigned agents can access internal profiles.
- **Redaction rules:** Non-admin users see Layer 1 only; sensitive fields in Layer 2 are masked/hashed.
- **Audit logging:** All Layer 2 access is logged for compliance.
- **Row-level security:** Sequelize hooks or database policies enforce tenant isolation.

---

## Development Roadmap

### Phase 1 (Current)
- [x] Scaffold backend and frontend
- [x] Authentication & RBAC
- [ ] Implement dual-layer customer profile models and API
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
- [ ] Integration with major CRMs (Salesforce, HubSpot)
- [ ] Slack/Teams bot for agent collaboration
- [ ] Advanced analytics and forecasting

---

## Competitive Positioning

| Feature | Salesforce | Slack | This Platform |
|---------|-----------|-------|---------------|
| CRM | ✓ | ✗ | ✓ |
| Real-time Collab | Limited | ✓ | ✓ |
| AI Agent Assist | Basic | ✗ | **✓ (Fluid, collaborative)** |
| Dual-layer Profiles | ✗ | ✗ | ✓ |
| KPI Tracking | ✓ | ✗ | ✓ |
| Predictive Models | Limited | ✗ | ✓ |
| Cost | $$$ | $$$ | $ (open, extensible) |

---

## Next Steps

1. Implement dual-layer customer profile models (`internalProfile`, `surfaceData`).
2. Build KPI metric system and real-time dashboards.
3. Design and develop agent collaboration UI.
4. Integrate voice transcription for live agent listening.
5. Train initial predictive models on historical data.
