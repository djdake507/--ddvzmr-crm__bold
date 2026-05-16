import { Router, Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import Contact from '@database/models/Contact';
import logger from '@utils/logger';

const router = Router();

// Get all contacts
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, search } = req.query;
    const where: any = {};
    
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const contacts = await Contact.findAll({ where });
    res.json({ success: true, data: contacts });
  } catch (error) {
    next(error);
  }
});

// Get single contact
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    res.json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
});

// Create contact
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, phone, company } = req.body;
    
    const contact = await Contact.create({
      firstName,
      lastName,
      email,
      phone,
      company,
      status: 'lead',
    });

    logger.info(`Contact created: ${contact.id}`);
    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
});

// Update contact
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    await contact.update(req.body);
    logger.info(`Contact updated: ${contact.id}`);
    res.json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
});

// Delete contact
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    await contact.destroy();
    logger.info(`Contact deleted: ${req.params.id}`);
    res.json({ success: true, message: 'Contact deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
