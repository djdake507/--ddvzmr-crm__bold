import { Router, Request, Response, NextFunction } from 'express';
import Contact from '@database/models/Contact';
import CustomerInteraction from '@database/models/CustomerInteraction';
import logger from '@utils/logger';
import { AuthenticatedRequest, authMiddleware } from '@middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

/**
 * Agent Insights API
 * Handles agent-assisted recommendations during rep conversations
 */

// Get agent insights for customer interaction
router.get('/customer/:customerId/insights', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { customerId } = req.params;

    // Get customer profile
    const customer = await Contact.findOne({
      where: { id: customerId, tenantId: req.user!.tenantId },
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Get recent interactions to identify patterns
    const recentInteractions = await CustomerInteraction.findAll({
      where: {
        customerId,
        tenantId: req.user!.tenantId,
      },
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    // Generate insights based on:
    // 1. Historical interactions
    // 2. KPI metrics
    // 3. Customer profile data
    const insights: any[] = [];

    // Insight 1: Similar issues resolved in past
    if (recentInteractions.length > 1) {
      const previousOutcome = recentInteractions[1].outcome;
      if (previousOutcome) {
        insights.push({
          insight: `Similar issue was resolved ${Math.floor((Date.now() - new Date(recentInteractions[1].createdAt).getTime()) / (1000 * 60 * 60 * 24))} days ago`,
          recommendation: `Try the previous approach: "${previousOutcome}"`,
          confidence: 0.8,
        });
      }
    }

    // Insight 2: Churn risk indicator
    const churnRisk = (customer.kpiMetrics as any)?.churn_risk || 0;
    if (churnRisk > 60) {
      insights.push({
        insight: 'This customer is at high churn risk',
        recommendation: 'Consider offering retention incentives or escalating to account manager',
        confidence: churnRisk / 100,
      });
    }

    // Insight 3: Expansion opportunity
    const expansionScore = (customer.kpiMetrics as any)?.expansion_opportunity || 0;
    if (expansionScore > 70) {
      insights.push({
        insight: 'This customer shows strong engagement and health',
        recommendation: 'Good opportunity for upselling or cross-selling',
        confidence: expansionScore / 100,
      });
    }

    // Insight 4: Interaction pattern
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const frequentInteractions = recentInteractions.filter(
      (i) => new Date(i.createdAt) > thirtyDaysAgo
    ).length;

    if (frequentInteractions > 5) {
      insights.push({
        insight: `High engagement: ${frequentInteractions} interactions in past 30 days`,
        recommendation: 'Customer is actively engaged; prioritize responsiveness',
        confidence: 0.9,
      });
    }

    res.json({
      success: true,
      data: {
        customerId,
        customerProfile: {
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
          company: customer.company,
          kpis: customer.kpiMetrics,
        },
        insights,
        interactionHistory: recentInteractions.slice(0, 5),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Submit agent insight during conversation
router.post('/conversation/insight', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { customerId, interactionId, insight, recommendation, confidence } = req.body;

    // Find or update the interaction with agent insight
    const interaction = await CustomerInteraction.findOne({
      where: {
        id: interactionId,
        customerId,
        tenantId: req.user!.tenantId,
      },
    });

    if (!interaction) {
      return res.status(404).json({ success: false, message: 'Interaction not found' });
    }

    const currentInsights = interaction.agentInsights || [];
    currentInsights.push({
      insight,
      recommendation,
      confidence,
    });

    await interaction.update({ agentInsights: currentInsights });

    logger.info(`Agent insight added to interaction ${interactionId}`);
    res.json({ success: true, data: interaction });
  } catch (error) {
    next(error);
  }
});

// Get knowledge base training status
router.get('/knowledge-base/status/:agentId', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { agentId } = req.params;

    // Count total interactions in tenant for training
    const totalInteractions = await CustomerInteraction.count({
      where: { tenantId: req.user!.tenantId },
    });

    const totalCustomers = await Contact.count({
      where: { tenantId: req.user!.tenantId },
    });

    res.json({
      success: true,
      data: {
        agentId,
        trainingStatus: {
          totalInteractions,
          totalCustomers,
          lastTrainedAt: new Date().toISOString(),
          models: {
            churnPrediction: 'ready',
            expansionPrediction: 'ready',
            sentimentAnalysis: 'ready',
          },
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
