import Contact from '@database/models/Contact';
import Activity from '@database/models/Activity';
import logger from '@utils/logger';

export class CustomerSupportAgent {
  public async handleSupportRequest(contactId: string, request: string): Promise<any> {
    try {
      const contact = await Contact.findByPk(contactId);
      if (!contact) {
        throw new Error('Contact not found');
      }

      // Create support ticket activity
      const activity = await Activity.create({
        contactId,
        type: 'note',
        title: 'Support Request',
        description: request,
        agentId: 'customer-support-agent',
      });

      // Generate response based on request type
      const response = this.generateResponse(request, contact);

      logger.info(`Support request handled for: ${contactId}`);

      return {
        contactId,
        ticketId: activity.id,
        response,
        suggestedActions: this.getSuggestedActions(contact),
      };
    } catch (error) {
      logger.error('Support request handling failed:', error);
      throw error;
    }
  }

  private generateResponse(request: string, contact: Contact): string {
    const keywords = request.toLowerCase();

    if (keywords.includes('invoice') || keywords.includes('billing')) {
      return 'Connecting you with our billing department...';
    }
    if (keywords.includes('technical') || keywords.includes('error')) {
      return 'Let me help you troubleshoot this technical issue...';
    }
    if (keywords.includes('refund') || keywords.includes('return')) {
      return 'I can help you with our return process...';
    }

    return 'Thank you for contacting us. How can I assist you today?';
  }

  private getSuggestedActions(contact: Contact): string[] {
    const actions = [];

    if (contact.status === 'lead') {
      actions.push('Send product demo');
    }
    if (contact.status === 'customer') {
      actions.push('Offer loyalty rewards');
    }

    actions.push('Schedule follow-up call');
    actions.push('Send relevant resources');

    return actions;
  }
}

export default new CustomerSupportAgent();
