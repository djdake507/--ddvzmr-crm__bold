import Contact from '@database/models/Contact';
import Deal from '@database/models/Deal';
import Task from '@database/models/Task';
import logger from '@utils/logger';

export class LeadManagementAgent {
  public async processNewLead(contactId: string, tenantId: string): Promise<any> {
    try {
      const contact = await Contact.findByPk(contactId);
      if (!contact) throw new Error('Contact not found');

      // Qualification
      const qualificationScore = this.calculateQualificationScore(contact);
      
      // Auto-create initial deal
      const deal = await Deal.create({
        contactId,
        title: `Initial Sale - ${contact.firstName} ${contact.lastName}`,
        value: 0,
        stage: 'prospecting',
        probability: qualificationScore,
      });

      // Create first follow-up task
      await Task.create({
        tenantId,
        contactId,
        dealId: deal.id,
        title: `Initial Contact with ${contact.firstName}`,
        priority: qualificationScore > 70 ? 'high' : 'medium',
        status: 'open',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      logger.info(`Lead processed: ${contactId}, Score: ${qualificationScore}`);

      return {
        contactId,
        qualificationScore,
        dealId: deal.id,
        status: 'processed',
      };
    } catch (error) {
      logger.error('Lead processing failed:', error);
      throw error;
    }
  }

  public async nurtureLead(contactId: string, tenantId: string): Promise<any> {
    try {
      const contact = await Contact.findByPk(contactId);
      if (!contact) throw new Error('Contact not found');

      // Create nurture tasks based on lead status
      const tasks = [];
      
      if (contact.status === 'lead') {
        tasks.push({
          tenantId,
          contactId,
          title: 'Send welcome email sequence',
          priority: 'medium',
          status: 'open',
          dueDate: new Date(),
        });

        tasks.push({
          tenantId,
          contactId,
          title: 'Schedule discovery call',
          priority: 'high',
          status: 'open',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        });
      }

      for (const task of tasks) {
        await Task.create(task);
      }

      logger.info(`Lead nurtured: ${contactId}`);
      return {
        contactId,
        tasksCreated: tasks.length,
      };
    } catch (error) {
      logger.error('Lead nurturing failed:', error);
      throw error;
    }
  }

  private calculateQualificationScore(contact: Contact): number {
    let score = 0;
    if (contact.email?.includes('@')) score += 25;
    if (contact.company) score += 25;
    if (contact.phone) score += 25;
    if (contact.firstName && contact.lastName) score += 25;
    return Math.min(score, 100);
  }
}

export default new LeadManagementAgent();
