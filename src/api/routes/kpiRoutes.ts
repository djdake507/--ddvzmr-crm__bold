import { Router, Request, Response, NextFunction } from 'express';
import KPIMetric from '@database/models/KPIMetric';
import Contact from '@database/models/Contact';
import logger from '@utils/logger';
import { AuthenticatedRequest, authMiddleware } from '@middleware/authMiddleware';
import KPICalculationService from '@utils/kpiCalculationService';

const router = Router();

router.use(authMiddleware);

// Get KPI metrics for a customer
router.get('/customer/:customerId', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { customerId } = req.params;
    const { period } = req.query;

    const where: any = {
      customerId,
      tenantId: req.user!.tenantId,
    };

    if (period && typeof period === 'string') {
      const days = parseInt(period);
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      where.createdAt = { [require('sequelize').Op.gte]: since };
    }

    const metrics = await KPIMetric.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 100,
    });

    res.json({ success: true, data: metrics });
  } catch (error) {
    next(error);
  }
});

// Get KPI metrics for a representative
router.get('/representative/:representativeId', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { representativeId } = req.params;
    const { period } = req.query;

    const where: any = {
      representativeId,
      tenantId: req.user!.tenantId,
    };

    if (period && typeof period === 'string') {
      const days = parseInt(period);
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      where.createdAt = { [require('sequelize').Op.gte]: since };
    }

    const metrics = await KPIMetric.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 100,
    });

    res.json({ success: true, data: metrics });
  } catch (error) {
    next(error);
  }
});

// Get tenant-level aggregated KPIs
router.get('/dashboard/aggregate', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { days = 30 } = req.query;

    const since = new Date(Date.now() - parseInt(days as string) * 24 * 60 * 60 * 1000);

    // Get all customer KPI metrics
    const customerKPIs = await KPIMetric.findAll({
      where: {
        tenantId,
        customerId: { [require('sequelize').Op.ne]: null },
        createdAt: { [require('sequelize').Op.gte]: since },
      },
      attributes: ['metricName', 'value', 'createdAt'],
    });

    // Aggregate by metric name
    const aggregated: Record<string, { avg: number; min: number; max: number }> = {};

    for (const kpi of customerKPIs) {
      if (!aggregated[kpi.metricName]) {
        aggregated[kpi.metricName] = { avg: 0, min: 100, max: 0 };
      }
      aggregated[kpi.metricName].avg += kpi.value;
      aggregated[kpi.metricName].min = Math.min(aggregated[kpi.metricName].min, kpi.value);
      aggregated[kpi.metricName].max = Math.max(aggregated[kpi.metricName].max, kpi.value);
    }

    // Calculate averages
    const uniqueMetrics = new Set(customerKPIs.map((k) => k.metricName));
    for (const metric of uniqueMetrics) {
      const count = customerKPIs.filter((k) => k.metricName === metric).length;
      aggregated[metric].avg = aggregated[metric].avg / count;
    }

    // Get customer count
    const customerCount = await Contact.count({
      where: { tenantId },
    });

    res.json({
      success: true,
      data: {
        aggregated,
        customerCount,
        period: days,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Manually recalculate customer KPIs
router.post('/calculate/customer/:customerId', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { customerId } = req.params;

    await KPICalculationService.updateCustomerKPIs(req.user!.tenantId, customerId);

    res.json({ success: true, message: 'KPIs calculated and updated' });
  } catch (error) {
    next(error);
  }
});

// Get latest KPI snapshot for customer dashboard
router.get('/snapshot/customer/:customerId', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { customerId } = req.params;

    const customer = await Contact.findOne({
      where: { id: customerId, tenantId: req.user!.tenantId },
      attributes: ['kpiMetrics', 'internalProfile'],
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.json({
      success: true,
      data: {
        metrics: customer.kpiMetrics,
        profile: customer.internalProfile,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
