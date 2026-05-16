import axios, { AxiosInstance } from 'axios';
import logger from '@utils/logger';

export class EmailService {
  private client: AxiosInstance;

  constructor() {
    // Email service integration (example: SendGrid or similar)
    this.client = axios.create({
      baseURL: process.env.EMAIL_SERVICE_URL || 'https://api.sendgrid.com',
    });
  }

  public async sendEmail(to: string, subject: string, body: string): Promise<any> {
    try {
      const response = await this.client.post('/mail/send', {
        personalizations: [{ to: [{ email: to }] }],
        from: { email: process.env.SMTP_USER || 'noreply@crm.com' },
        subject,
        content: [{ type: 'text/html', value: body }],
      });

      logger.info(`Email sent to ${to}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }

  public async sendBulkEmails(recipients: string[], subject: string, body: string): Promise<any> {
    const results = [];
    for (const email of recipients) {
      try {
        await this.sendEmail(email, subject, body);
        results.push({ email, status: 'sent' });
      } catch (error) {
        results.push({ email, status: 'failed', error });
      }
    }
    return results;
  }
}

export default new EmailService();
