import Contact from '@database/models/Contact';
import Deal from '@database/models/Deal';
import logger from '@utils/logger';

export class LeadQualificationAgent {
  public async qualifyLead(contactId: string): Promise<any> {
    try {
      const contact = await Contact.findByPk(contactId);
      if (!contact) {
        throw new Error('Contact not found');
      }

      // Scoring logic for lead qualification
      const score = this.calculateLeadScore(contact);
      
      // Update contact status based on score
      const status = score > 70 ? 'contact' : 'lead';
      await contact.update({ status, metadata: { ...contact.metadata, qualificationScore: score } });

      logger.info(`Lead qualified: ${contactId}, Score: ${score}`);
      
      return {
        contactId,
        qualificationScore: score,
        status,
        recommendation: this.getRecommendation(score),
      };
    } catch (error) {
      logger.error('Lead qualification failed:', error);
      throw error;
    }
  }

  private calculateLeadScore(contact: Contact): number {
    let score = 0;

    // Email domain scoring
    if (contact.email?.includes('@')) {
      const domain = contact.email.split('@')[1];
      if (!domain.includes('gmail') && !domain.includes('yahoo')) {
        score += 30;
      }
    }

    // Company presence scoring
    if (contact.company) {
      score += 20;
    }

    // Phone presence scoring
    if (contact.phone) {
      score += 20;
    }

    // Name completeness scoring
    if (contact.firstName && contact.lastName) {
      score += 30;
    }

    return Math.min(score, 100);
  }

  private getRecommendation(score: number): string {
    if (score >= 80) return 'Hot lead - prioritize for sales outreach';
    if (score >= 60) return 'Warm lead - schedule follow-up';
    if (score >= 40) return 'Cold lead - nurture with content';
    return 'Low quality - consider re-engagement campaign';
  }
}

export default new LeadQualificationAgent();
