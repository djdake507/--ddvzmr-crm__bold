import { Router, Request, Response, NextFunction } from 'express';
import Deal from '@database/models/Deal';
import Contact from '@database/models/Contact';
import logger from '@utils/logger';

const router = Router();

// Get all deals
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { stage, contactId } = req.query;
    const where: any = {};
    
    if (stage) where.stage = stage;
    if (contactId) where.contactId = contactId;

    const deals = await Deal.findAll({
      where,
      include: [{ model: Contact, attributes: ['firstName', 'lastName', 'email'] }],
    });
    res.json({ success: true, data: deals });
  } catch (error) {
    next(error);
  }
});

// Get single deal
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deal = await Deal.findByPk(req.params.id, {
      include: [{ model: Contact, attributes: ['firstName', 'lastName', 'email'] }],
    });
    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }
    res.json({ success: true, data: deal });
  } catch (error) {
    next(error);
  }
});

// Create deal
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contactId, title, value, stage, probability, expectedCloseDate, notes } = req.body;
    
    const deal = await Deal.create({
      contactId,
      title,
      value,
      stage: stage || 'prospecting',
      probability: probability || 0,
      expectedCloseDate,
      notes,
    });

    logger.info(`Deal created: ${deal.id}`);
    res.status(201).json({ success: true, data: deal });
  } catch (error) {
    next(error);
  }
});

// Update deal
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deal = await Deal.findByPk(req.params.id);
    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }

    await deal.update(req.body);
    logger.info(`Deal updated: ${deal.id}`);
    res.json({ success: true, data: deal });
  } catch (error) {
    next(error);
  }
});

// Delete deal
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deal = await Deal.findByPk(req.params.id);
    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }

    await deal.destroy();
    logger.info(`Deal deleted: ${req.params.id}`);
    res.json({ success: true, message: 'Deal deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
