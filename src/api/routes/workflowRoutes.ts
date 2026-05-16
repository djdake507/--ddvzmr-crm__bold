import { Router, Request, Response, NextFunction } from 'express';
import Workflow from '@database/models/Workflow';
import logger from '@utils/logger';
import { AuthenticatedRequest, authMiddleware } from '@middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

// Get all workflows for tenant
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const workflows = await Workflow.findAll({
      where: { tenantId: req.user!.tenantId },
    });
    res.json({ success: true, data: workflows });
  } catch (error) {
    next(error);
  }
});

// Create workflow
router.post('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, trigger, actions } = req.body;

    const workflow = await Workflow.create({
      tenantId: req.user!.tenantId,
      name,
      description,
      trigger,
      actions,
      isActive: true,
    });

    logger.info(`Workflow created: ${workflow.id}`);
    res.status(201).json({ success: true, data: workflow });
  } catch (error) {
    next(error);
  }
});

// Update workflow
router.put('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const workflow = await Workflow.findOne({
      where: { id: req.params.id, tenantId: req.user!.tenantId },
    });

    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }

    await workflow.update(req.body);
    logger.info(`Workflow updated: ${workflow.id}`);
    res.json({ success: true, data: workflow });
  } catch (error) {
    next(error);
  }
});

// Delete workflow
router.delete('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const workflow = await Workflow.findOne({
      where: { id: req.params.id, tenantId: req.user!.tenantId },
    });

    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }

    await workflow.destroy();
    logger.info(`Workflow deleted: ${req.params.id}`);
    res.json({ success: true, message: 'Workflow deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
