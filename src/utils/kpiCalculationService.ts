import logger from '@utils/logger';
import KPIMetric from '@database/models/KPIMetric';
import Contact from '@database/models/Contact';
import CustomerInteraction from '@database/models/CustomerInteraction';

interface KPICalculationInput {
  tenantId: string;
  customerId?: string;
  representativeId?: string;
}

export class KPICalculationService {
  /**
   * Calculate customer-level KPIs based on interactions and profile data
   */
  static async calculateCustomerKPIs(
    tenantId: string,
    customerId: string
  ): Promise<Record<string, number>> {
    try {
      const customer = await Contact.findOne({
        where: { id: customerId, tenantId },
      });

      if (!customer) {
        logger.warn(`Customer ${customerId} not found for KPI calculation`);
        return {};
      }

      const interactions = await CustomerInteraction.findAll({
        where: { customerId, tenantId },
      });

      // Health Score: Based on interaction frequency and recency
      const daysSinceLastInteraction =
        interactions.length > 0
          ? (Date.now() - new Date(interactions[0].createdAt).getTime()) /
            (1000 * 60 * 60 * 24)
          : 999;

      const healthScore = Math.max(
        0,
        100 - Math.min(daysSinceLastInteraction * 2, 100)
      );

      // Engagement Score: Frequency of interactions
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentInteractions = interactions.filter(
        (i) => new Date(i.createdAt) > thirtyDaysAgo
      );
      const engagementScore = Math.min(recentInteractions.length * 20, 100);

      // Churn Risk: Low engagement or declining health
      const churnRisk = 100 - healthScore;

      // Expansion Opportunity: High engagement and health
      const expansionScore =
        healthScore > 60 && engagementScore > 60 ? 80 : 40;

      return {
        health_score: healthScore,
        engagement_score: engagementScore,
        churn_risk: churnRisk,
        expansion_opportunity: expansionScore,
      };
    } catch (error) {
      logger.error('KPI calculation error:', error);
      return {};
    }
  }

  /**
   * Calculate representative-level KPIs
   */
  static async calculateRepresentativeKPIs(
    tenantId: string,
    representativeId: string
  ): Promise<Record<string, number>> {
    try {
      const interactions = await CustomerInteraction.findAll({
        where: { tenantId, representativeId },
      });

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentInteractions = interactions.filter(
        (i) => new Date(i.createdAt) > thirtyDaysAgo
      );

      const activityScore = Math.min(recentInteractions.length * 10, 100);

      return {
        activity_score: activityScore,
        interactions_count: interactions.length,
        recent_interactions: recentInteractions.length,
      };
    } catch (error) {
      logger.error('Rep KPI calculation error:', error);
      return {};
    }
  }

  /**
   * Calculate and store KPI metric
   */
  static async storeKPIMetric(
    tenantId: string,
    metricName: string,
    value: number,
    customerId?: string,
    representativeId?: string
  ): Promise<void> {
    try {
      // Calculate trend by comparing with last value
      const lastMetric = await KPIMetric.findOne({
        where: { tenantId, metricName, customerId, representativeId },
        order: [['createdAt', 'DESC']],
      });

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (lastMetric) {
        if (value > lastMetric.value * 1.05) trend = 'up';
        else if (value < lastMetric.value * 0.95) trend = 'down';
      }

      await KPIMetric.create({
        tenantId,
        metricName,
        value,
        customerId,
        representativeId,
        trend,
        calculatedAt: new Date(),
        period: 'daily',
      });

      logger.info(`KPI ${metricName} stored for ${customerId || representativeId}`);
    } catch (error) {
      logger.error('Error storing KPI metric:', error);
    }
  }

  /**
   * Calculate all customer KPIs and update their records
   */
  static async updateCustomerKPIs(
    tenantId: string,
    customerId: string
  ): Promise<void> {
    try {
      const kpis = await this.calculateCustomerKPIs(tenantId, customerId);

      // Store each KPI metric
      for (const [metricName, value] of Object.entries(kpis)) {
        await this.storeKPIMetric(tenantId, metricName, value, customerId);
      }

      // Update customer cache
      await Contact.update(
        { kpiMetrics: kpis },
        { where: { id: customerId, tenantId } }
      );

      logger.info(`Updated KPIs for customer ${customerId}`);
    } catch (error) {
      logger.error('Error updating customer KPIs:', error);
    }
  }
}

export default KPICalculationService;
