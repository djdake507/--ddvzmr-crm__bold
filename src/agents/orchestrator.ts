import LeadQualificationAgent from './LeadQualificationAgent';
import CustomerSupportAgent from './CustomerSupportAgent';
import SalesAutomationAgent from './SalesAutomationAgent';
import AnalyticsAgent from './AnalyticsAgent';
import logger from '@utils/logger';

type AgentType = 'lead-qualification' | 'customer-support' | 'sales-automation' | 'analytics';

interface AgentStatus {
  agentId: string;
  status: 'idle' | 'processing' | 'error';
  lastExecuted?: Date;
}

export class AgentOrchestrator {
  private agents = {
    'lead-qualification': LeadQualificationAgent,
    'customer-support': CustomerSupportAgent,
    'sales-automation': SalesAutomationAgent,
    'analytics': AnalyticsAgent,
  };

  private agentStatus: Map<string, AgentStatus> = new Map();

  public getAvailableAgents() {
    return [
      {
        id: 'lead-qualification',
        name: 'Lead Qualification Agent',
        description: 'Analyzes and scores leads based on criteria',
        useCases: ['qualify-lead', 'bulk-qualify'],
      },
      {
        id: 'customer-support',
        name: 'Customer Support Agent',
        description: 'Handles customer support requests and tickets',
        useCases: ['handle-request', 'generate-response'],
      },
      {
        id: 'sales-automation',
        name: 'Sales Automation Agent',
        description: 'Analyzes deals and provides sales recommendations',
        useCases: ['analyze-deal', 'forecast-revenue'],
      },
      {
        id: 'analytics',
        name: 'Analytics Agent',
        description: 'Generates CRM analytics and insights',
        useCases: ['generate-report', 'analyze-trends'],
      },
    ];
  }

  public async executeAgent(agentType: AgentType, useCase: string, payload: any): Promise<any> {
    try {
      const agent = this.agents[agentType];
      if (!agent) {
        throw new Error(`Agent type '${agentType}' not found`);
      }

      this.setAgentStatus(agentType, 'processing');
      let result: any;

      switch (agentType) {
        case 'lead-qualification':
          result = useCase === 'qualify-lead'
            ? await agent.qualifyLead(payload.contactId)
            : await this.handleBulkQualify(payload.contactIds);
          break;
        case 'customer-support':
          result = useCase === 'handle-request'
            ? await agent.handleSupportRequest(payload.contactId, payload.request)
            : await this.generateSupportResponse(payload);
          break;
        case 'sales-automation':
          result = await agent.analyzeDeal(payload.dealId);
          break;
        case 'analytics':
          result = await agent.generateReport();
          break;
        default:
          throw new Error(`Use case '${useCase}' not supported`);
      }

      this.setAgentStatus(agentType, 'idle');
      return result;
    } catch (error) {
      logger.error(`Agent execution failed: ${agentType}`, error);
      this.setAgentStatus(agentType, 'error');
      throw error;
    }
  }

  public async getAgentStatus(agentId: string): Promise<AgentStatus> {
    return this.agentStatus.get(agentId) || {
      agentId,
      status: 'idle',
    };
  }

  private async handleBulkQualify(contactIds: string[]): Promise<any> {
    const results = [];
    for (const contactId of contactIds) {
      try {
        const result = await LeadQualificationAgent.qualifyLead(contactId);
        results.push(result);
      } catch (error) {
        logger.error(`Bulk qualify failed for contact ${contactId}:`, error);
      }
    }
    return { processed: results.length, results };
  }

  private async generateSupportResponse(payload: any): Promise<any> {
    return await CustomerSupportAgent.handleSupportRequest(
      payload.contactId,
      payload.request
    );
  }

  private setAgentStatus(agentId: string, status: 'idle' | 'processing' | 'error'): void {
    this.agentStatus.set(agentId, {
      agentId,
      status,
      lastExecuted: new Date(),
    });
  }
}

export default AgentOrchestrator;
