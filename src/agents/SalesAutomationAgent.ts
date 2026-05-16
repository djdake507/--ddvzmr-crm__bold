import Deal from '@database/models/Deal';
import Contact from '@database/models/Contact';
import Activity from '@database/models/Activity';
import logger from '@utils/logger';

export class SalesAutomationAgent {
  public async analyzeDeal(dealId: string): Promise<any> {
    try {
      const deal = await Deal.findByPk(dealId, {
        include: [{ model: Contact }],
      });

      if (!deal) {
        throw new Error('Deal not found');
      }

      // Calculate win probability based on deal factors
      const winProbability = this.calculateWinProbability(deal);

      // Generate recommendations
      const recommendations = this.generateRecommendations(deal, winProbability);

      // Update deal with probability
      await deal.update({ probability: winProbability });

      logger.info(`Deal analyzed: ${dealId}, Win probability: ${winProbability}%`);

      return {
        dealId,
        dealTitle: deal.title,
        winProbability,
        recommendations,
        nextSteps: this.getNextSteps(deal, winProbability),
      };
    } catch (error) {
      logger.error('Deal analysis failed:', error);
      throw error;
    }
  }

  private calculateWinProbability(deal: Deal): number {
    let probability = 0;

    // Stage-based probability
    const stageProb: Record<string, number> = {
      prospecting: 10,
      qualification: 30,
      negotiation: 60,
      closed_won: 100,
      closed_lost: 0,
    };
    probability = stageProb[deal.stage] || 0;

    // Deal value adjustment
    if (deal.value > 50000) probability += 10;
    if (deal.value > 100000) probability += 10;

    return Math.min(probability, 100);
  }

  private generateRecommendations(deal: Deal, winProb: number): string[] {
    const recommendations = [];

    if (winProb < 40) {
      recommendations.push('Schedule discovery call to clarify requirements');
      recommendations.push('Share case studies and success stories');
    }
    if (winProb < 70 && winProb >= 40) {
      recommendations.push('Prepare proposal with custom pricing');
      recommendations.push('Address potential objections');
    }
    if (winProb >= 70) {
      recommendations.push('Schedule final negotiation meeting');
      recommendations.push('Prepare contract for signature');
    }

    return recommendations;
  }

  private getNextSteps(deal: Deal, winProb: number): string {
    if (winProb >= 90) return 'Move to closed negotiation';
    if (winProb >= 70) return 'Send proposal';
    if (winProb >= 40) return 'Schedule qualification meeting';
    return 'Initial outreach and qualification';
  }
}

export default new SalesAutomationAgent();
