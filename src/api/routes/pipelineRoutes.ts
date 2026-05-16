import { Router, Request, Response, NextFunction } from 'express';
import Pipeline from '@database/models/Pipeline';
import CustomerProfileState from '@database/models/CustomerProfileState';
import Contact from '@database/models/Contact';
import logger from '@utils/logger';
import { AuthenticatedRequest, authMiddleware } from '@middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

// Get all pipelines for tenant
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const pipelines = await Pipeline.findAll({
      where: { tenantId: req.user!.tenantId },
    });

    res.json({ success: true, data: pipelines });
  } catch (error) {
    next(error);
  }
});

// Create pipeline
router.post('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, stages } = req.body;

    const pipeline = await Pipeline.create({
      tenantId: req.user!.tenantId,
      name,
      description,
      stages: stages || [],
      isActive: true,
    });

    logger.info(`Pipeline created: ${pipeline.id}`);
    res.status(201).json({ success: true, data: pipeline });
  } catch (error) {
    next(error);
  }
});

// Get pipeline by ID with customers in each stage
router.get('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const pipeline = await Pipeline.findOne({
      where: { id: req.params.id, tenantId: req.user!.tenantId },
    });

    if (!pipeline) {
      return res.status(404).json({ success: false, message: 'Pipeline not found' });
    }

    // Get customer states for this pipeline
    const customerStates = await CustomerProfileState.findAll({
      where: { pipelineId: req.params.id },
      include: [{ model: Contact, attributes: ['id', 'firstName', 'lastName', 'email'] }],
    });

    // Group by stage
    const stages: Record<string, any[]> = {};
    (pipeline.stages as any).forEach((stage: any) => {
      stages[stage.name] = customerStates.filter(
        (cs) => cs.currentStage === stage.name
      );
    });

    res.json({ success: true, data: { pipeline, stages } });
  } catch (error) {
    next(error);
  }
});

// Update pipeline
router.put('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const pipeline = await Pipeline.findOne({
      where: { id: req.params.id, tenantId: req.user!.tenantId },
    });

    if (!pipeline) {
      return res.status(404).json({ success: false, message: 'Pipeline not found' });
    }

    await pipeline.update(req.body);
    logger.info(`Pipeline updated: ${pipeline.id}`);
    res.json({ success: true, data: pipeline });
  } catch (error) {
    next(error);
  }
});

// Add customer to pipeline (creates profile state)
router.post('/:pipelineId/customers/:customerId', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { pipelineId, customerId } = req.params;
    const { initialStage } = req.body;

    const pipeline = await Pipeline.findOne({
      where: { id: pipelineId, tenantId: req.user!.tenantId },
    });

    if (!pipeline) {
      return res.status(404).json({ success: false, message: 'Pipeline not found' });
    }

    // Get first stage if not specified
    const stages = pipeline.stages as any;
    const stage = initialStage || (stages.length > 0 ? stages[0].name : 'new');

    const profileState = await CustomerProfileState.create({
      tenantId: req.user!.tenantId,
      customerId,
      pipelineId,
      currentStage: stage,
    });

    // Add pipeline to customer's profilePipelines list
    const customer = await Contact.findOne({ where: { id: customerId } });
    if (customer) {
      const pipelines = (customer.profilePipelines as string[]) || [];
      if (!pipelines.includes(pipelineId)) {
        pipelines.push(pipelineId);
        await customer.update({ profilePipelines: pipelines });
      }
    }

    logger.info(`Customer ${customerId} added to pipeline ${pipelineId}`);
    res.status(201).json({ success: true, data: profileState });
  } catch (error) {
    next(error);
  }
});

// Move customer to next stage in pipeline
router.post('/:pipelineId/customers/:customerId/advance', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { pipelineId, customerId } = req.params;

    const pipeline = await Pipeline.findOne({
      where: { id: pipelineId, tenantId: req.user!.tenantId },
    });

    if (!pipeline) {
      return res.status(404).json({ success: false, message: 'Pipeline not found' });
    }

    const profileState = await CustomerProfileState.findOne({
      where: { customerId, pipelineId },
    });

    if (!profileState) {
      return res.status(404).json({ success: false, message: 'Customer not in pipeline' });
    }

    const stages = pipeline.stages as any;
    const currentStageIndex = stages.findIndex(
      (s: any) => s.name === profileState.currentStage
    );

    if (currentStageIndex === -1 || currentStageIndex >= stages.length - 1) {
      return res.status(400).json({ success: false, message: 'Cannot advance further' });
    }

    const nextStageName = stages[currentStageIndex + 1].name;
    await profileState.update({
      currentStage: nextStageName,
      lastTransitionAt: new Date(),
      blockers: [],
    });

    logger.info(`Customer ${customerId} advanced to stage ${nextStageName}`);
    res.json({ success: true, data: profileState });
  } catch (error) {
    next(error);
  }
});

// Set pipeline blockers for customer
router.post('/:pipelineId/customers/:customerId/blockers', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { pipelineId, customerId } = req.params;
    const { blockers } = req.body;

    const profileState = await CustomerProfileState.findOne({
      where: { customerId, pipelineId },
    });

    if (!profileState) {
      return res.status(404).json({ success: false, message: 'Customer not in pipeline' });
    }

    await profileState.update({ blockers: blockers || [] });
    logger.info(`Blockers updated for customer ${customerId}`);
    res.json({ success: true, data: profileState });
  } catch (error) {
    next(error);
  }
});

export default router;
