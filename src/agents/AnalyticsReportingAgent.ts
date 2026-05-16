import Contact from '@database/models/Contact';
import Deal from '@database/models/Deal';
import User from '@database/models/User';
import logger from '@utils/logger';

export class AnalyticsReportingAgent {
  public async generateComprehensiveReport(tenantId: string): Promise<any> {
    try {
      const contactStats = await this.getContactAnalytics(tenantId);
      const dealStats = await this.getDealAnalytics(tenantId);
      const pipelineHealth = await this.getPipelineHealth(tenantId);
      const teamPerformance = await this.getTeamPerformance(tenantId);

      const report = {
        generatedAt: new Date(),
        tenantId,
        contacts: contactStats,
        deals: dealStats,
        pipeline: pipelineHealth,
        teamPerformance,
        insights: this.generateInsights(contactStats, dealStats, pipelineHealth),
      };

      logger.info(`Report generated for tenant: ${tenantId}`);
      return report;
    } catch (error) {
      logger.error('Report generation failed:', error);
      throw error;
    }
  }

  private async getContactAnalytics(tenantId: string): Promise<any> {
    const total = await Contact.count();
    const leads = await Contact.count({ where: { status: 'lead' } });
    const contacts = await Contact.count({ where: { status: 'contact' } });
    const customers = await Contact.count({ where: { status: 'customer' } });

    return {
      total,
      byStatus: { leads, contacts, customers },
      conversionRate: total > 0 ? ((customers / total) * 100).toFixed(2) : 0,
      newContactsThisMonth: await Contact.count({
        where: {
          createdAt: {
            [Symbol.for('gte')]: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    };
  }

  private async getDealAnalytics(tenantId: string): Promise<any> {
    const total = await Deal.count();
    const wonDeals = await Deal.count({ where: { stage: 'closed_won' } });
    const lostDeals = await Deal.count({ where: { stage: 'closed_lost' } });
    const totalValue = await Deal.sum('value') || 0;

    return {
      total,
      wonDeals,
      lostDeals,
      totalValue,
      winRate: total > 0 ? ((wonDeals / (wonDeals + lostDeals || 1)) * 100).toFixed(2) : 0,
      avgDealValue: total > 0 ? (totalValue / total).toFixed(2) : 0,
    };
  }

  private async getPipelineHealth(tenantId: string): Promise<any> {
    const deals = await Deal.findAll();
    const byStage = {
      prospecting: deals.filter(d => d.stage === 'prospecting').length,
      qualification: deals.filter(d => d.stage === 'qualification').length,
      negotiation: deals.filter(d => d.stage === 'negotiation').length,
      closedWon: deals.filter(d => d.stage === 'closed_won').length,
      closedLost: deals.filter(d => d.stage === 'closed_lost').length,
    };

    return {
      stageDistribution: byStage,
      healthScore: this.calculatePipelineHealthScore(byStage),
    };
  }

  private async getTeamPerformance(tenantId: string): Promise<any> {
    const users = await User.findAll({ where: { tenantId } });
    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      roles: {
        admin: users.filter(u => u.role === 'admin').length,
        manager: users.filter(u => u.role === 'manager').length,
        agent: users.filter(u => u.role === 'agent').length,
      },
    };
  }

  private calculatePipelineHealthScore(byStage: Record<string, number>): number {
    let score = 100;

    // Penalty if too few deals in early stages
    if (byStage.prospecting < 5) score -= 20;
    
    // Penalty if too many deals in negotiation
    if (byStage.negotiation > byStage.prospecting) score -= 15;

    return Math.max(0, score);
  }

  private generateInsights(contactStats: any, dealStats: any, pipelineHealth: any): string[] {
    const insights: string[] = [];

    if (contactStats.conversionRate > 30) {
      insights.push('Excellent lead conversion rate. Continue current strategy.');
    } else if (contactStats.conversionRate < 10) {
      insights.push('Low conversion rate. Review lead qualification process.');
    }

    if (dealStats.winRate > 50) {
      insights.push('Strong sales performance. Deals are closing at good rates.');
    } else if (dealStats.winRate < 25) {
      insights.push('Review deal qualification and sales process for improvements.');
    }

    if (pipelineHealth.healthScore < 70) {
      insights.push('Pipeline health is below optimal. Focus on deal qualification.');
    }

    return insights;
  }
}

export default new AnalyticsReportingAgent();
