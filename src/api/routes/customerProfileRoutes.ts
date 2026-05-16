import { Router, Request, Response, NextFunction } from 'express';
import Contact from '@database/models/Contact';
import CustomerInteraction from '@database/models/CustomerInteraction';
import KPICalculationService from '@utils/kpiCalculationService';
import logger from '@utils/logger';
import { AuthenticatedRequest, authMiddleware } from '@middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

// Get all customers (both layers visible only to admins)
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const customers = await Contact.findAll({
      where: { tenantId: req.user!.tenantId },
      attributes: [
        'id',
        'vendorCustomerId',
        'firstName',
        'lastName',
        'email',
        'company',
        'status',
        'kpiMetrics',
        ...(req.user!.role === 'admin' ? ['surfaceData', 'internalProfile'] : []),
      ],
    });

    res.json({ success: true, data: customers });
  } catch (error) {
    next(error);
  }
});

// Create customer with dual-layer profile
router.post('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      vendorCustomerId,
      surfaceData,
      internalProfile,
    } = req.body;

    const customer = await Contact.create({
      tenantId: req.user!.tenantId,
      firstName,
      lastName,
      email,
      phone,
      company,
      vendorCustomerId,
      surfaceData: surfaceData || {},
      internalProfile: internalProfile || {},
      status: 'lead',
    });

    // Trigger initial KPI calculation
    await KPICalculationService.updateCustomerKPIs(req.user!.tenantId, customer.id);

    logger.info(`Customer created: ${customer.id}`);
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
});

// Get customer by ID (with access control)
router.get('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const customer = await Contact.findOne({
      where: { id: req.params.id, tenantId: req.user!.tenantId },
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Hide internal profile from non-admin users (but show to agents)
    if (req.user!.role !== 'admin' && req.user!.role !== 'agent') {
      customer.internalProfile = undefined;
    }

    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
});

// Update customer profile
router.put('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const customer = await Contact.findOne({
      where: { id: req.params.id, tenantId: req.user!.tenantId },
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Only admins can update internal profile
    const updates: any = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      company: req.body.company,
      status: req.body.status,
      surfaceData: req.body.surfaceData || customer.surfaceData,
    };

    if (req.user!.role === 'admin') {
      updates.internalProfile = req.body.internalProfile || customer.internalProfile;
      updates.agentAccessibleProfile = req.body.agentAccessibleProfile || customer.agentAccessibleProfile;
    }

    await customer.update(updates);

    // Recalculate KPIs after update
    await KPICalculationService.updateCustomerKPIs(req.user!.tenantId, customer.id);

    logger.info(`Customer updated: ${customer.id}`);
    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
});

// Get customer interactions (with agent insights)
router.get('/:customerId/interactions', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const interactions = await CustomerInteraction.findAll({
      where: {
        customerId: req.params.customerId,
        tenantId: req.user!.tenantId,
      },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    res.json({ success: true, data: interactions });
  } catch (error) {
    next(error);
  }
});

// Log a customer interaction with optional agent insights
router.post('/:customerId/interactions', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { type, transcript, notes, agentInsights, outcome } = req.body;

    const interaction = await CustomerInteraction.create({
      tenantId: req.user!.tenantId,
      customerId: req.params.customerId,
      representativeId: req.user!.id,
      type,
      transcript,
      notes,
      agentInsights: agentInsights || [],
      outcome,
    });

    // Trigger KPI recalculation
    await KPICalculationService.updateCustomerKPIs(req.user!.tenantId, req.params.customerId);

    logger.info(`Interaction logged for customer ${req.params.customerId}`);
    res.status(201).json({ success: true, data: interaction });
  } catch (error) {
    next(error);
  }
});

// Delete customer
router.delete('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const customer = await Contact.findOne({
      where: { id: req.params.id, tenantId: req.user!.tenantId },
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    await customer.destroy();
    logger.info(`Customer deleted: ${req.params.id}`);
    res.json({ success: true, message: 'Customer deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
