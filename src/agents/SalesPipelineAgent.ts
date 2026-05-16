import Deal from '@database/models/Deal';
import Contact from '@database/models/Contact';
import Task from '@database/models/Task';
import logger from '@utils/logger';

export class SalesPipelineAgent {
  public async analyzePipeline(tenantId: string): Promise<any> {
    try {
      const deals = await Deal.findAll({
        include: [{ model: Contact }],
      });

      const analysis = {
        totalDeals: deals.length,
        stageDistribution: this.getStageDistribution(deals),
        totalValue: deals.reduce((sum, d) => sum + (d.value || 0), 0),
        avgDealValue: deals.length > 0 ? deals.reduce((sum, d) => sum + (d.value || 0), 0) / deals.length : 0,
        recommendations: this.generateRecommendations(deals),
      };

      logger.info(`Pipeline analyzed for tenant: ${tenantId}`);
      return analysis;
    } catch (error) {
      logger.error('Pipeline analysis failed:', error);
      throw error;
    }
  }

  public async advanceDeal(dealId: string, newStage: string, tenantId: string): Promise<any> {
    try {
      const deal = await Deal.findByPk(dealId);
      if (!deal) throw new Error('Deal not found');

      const oldStage = deal.stage;
      await deal.update({ stage: newStage });

      // Create task for next action
      if (newStage === 'negotiation') {
        await Task.create({
          tenantId,
          dealId,
          contactId: deal.contactId,
          title: 'Prepare and send proposal',
          priority: 'high',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        });
      }

      logger.info(`Deal advanced: ${dealId} from ${oldStage} to ${newStage}`);
      return { dealId, oldStage, newStage };
    } catch (error) {
      logger.error('Deal advancement failed:', error);
      throw error;
    }
  }

  private getStageDistribution(deals: Deal[]): Record<string, number> {
    const distribution: Record<string, number> = {
      prospecting: 0,
      qualification: 0,
      negotiation: 0,
      closed_won: 0,
      closed_lost: 0,
    };

    deals.forEach(deal => {
      distribution[deal.stage]++;
    });

    return distribution;
  }

  private generateRecommendations(deals: Deal[]): string[] {
    const recommendations = [];
    const stageDistribution = this.getStageDistribution(deals);

    if (stageDistribution.prospecting > stageDistribution.negotiation * 2) {
      recommendations.push('High number of early-stage deals. Focus on qualification.');
    }

    const closedWinRate = stageDistribution.closed_won / (stageDistribution.closed_won + stageDistribution.closed_lost || 1);
    if (closedWinRate < 0.3) {
      recommendations.push('Low win rate. Review deal quality and sales process.');
    }

    return recommendations;
  }
}

export default new SalesPipelineAgent();
