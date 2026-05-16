import Contact from '@database/models/Contact';
import Deal from '@database/models/Deal';
import logger from '@utils/logger';

export class AnalyticsAgent {
  public async generateReport(): Promise<any> {
    try {
      const contactStats = await this.getContactStats();
      const dealStats = await this.getDealStats();
      const trends = await this.analyzeTrends();

      const report = {
        timestamp: new Date(),
        contactStats,
        dealStats,
        trends,
        insights: this.generateInsights(contactStats, dealStats),
      };

      logger.info('Analytics report generated');
      return report;
    } catch (error) {
      logger.error('Analytics report generation failed:', error);
      throw error;
    }
  }

  private async getContactStats(): Promise<any> {
    const total = await Contact.count();
    const leads = await Contact.count({ where: { status: 'lead' } });
    const contacts = await Contact.count({ where: { status: 'contact' } });
    const customers = await Contact.count({ where: { status: 'customer' } });

    return {
      total,
      leads,
      contacts,
      customers,
      conversionRate: total > 0 ? ((customers / total) * 100).toFixed(2) : 0,
    };
  }

  private async getDealStats(): Promise<any> {
    const total = await Deal.count();
    const openDeals = await Deal.count({
      where: { stage: ['prospecting', 'qualification', 'negotiation'] },
    });
    const wonDeals = await Deal.count({ where: { stage: 'closed_won' } });
    const lostDeals = await Deal.count({ where: { stage: 'closed_lost' } });

    const totalValue = await Deal.sum('value');
    const openValue = await Deal.sum('value', {
      where: { stage: ['prospecting', 'qualification', 'negotiation'] },
    });

    return {
      total,
      openDeals,
      wonDeals,
      lostDeals,
      totalValue: totalValue || 0,
      openValue: openValue || 0,
      winRate: total > 0 ? ((wonDeals / (wonDeals + lostDeals)) * 100).toFixed(2) : 0,
    };
  }

  private async analyzeTrends(): Promise<any> {
    // Get last 30 days data
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const newContacts = await Contact.count({
      where: { createdAt: { [Symbol.for('gte')]: thirtyDaysAgo } },
    });

    const newDeals = await Deal.count({
      where: { createdAt: { [Symbol.for('gte')]: thirtyDaysAgo } },
    });

    return {
      newContactsLast30Days: newContacts,
      newDealsLast30Days: newDeals,
      avgContactsPerDay: (newContacts / 30).toFixed(2),
      avgDealsPerDay: (newDeals / 30).toFixed(2),
    };
  }

  private generateInsights(contactStats: any, dealStats: any): string[] {
    const insights = [];

    if (contactStats.conversionRate > 20) {
      insights.push('Excellent lead-to-customer conversion rate. Keep current strategy.');
    }
    if (contactStats.conversionRate < 5) {
      insights.push('Low conversion rate. Consider reviewing qualification criteria.');
    }

    if (dealStats.winRate > 50) {
      insights.push('Strong sales performance. Current approach is working well.');
    }
    if (dealStats.winRate < 30) {
      insights.push('Low win rate. Focus on deal qualification and objection handling.');
    }

    if (dealStats.openValue > 500000) {
      insights.push('Large open pipeline. Prioritize closing high-value deals.');
    }

    return insights;
  }
}

export default new AnalyticsAgent();
