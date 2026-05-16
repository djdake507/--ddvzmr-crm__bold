import axios, { AxiosInstance } from 'axios';
import logger from '@utils/logger';

export class SlackIntegration {
  private client: AxiosInstance;
  private webhookUrl: string;

  constructor() {
    this.webhookUrl = process.env.SLACK_WEBHOOK_URL || '';
    this.client = axios.create();
  }

  public async sendNotification(channel: string, message: string, metadata?: any): Promise<any> {
    try {
      if (!this.webhookUrl) {
        logger.warn('Slack webhook URL not configured');
        return;
      }

      const payload = {
        channel,
        text: message,
        metadata,
      };

      const response = await this.client.post(this.webhookUrl, payload);
      logger.info(`Slack notification sent to ${channel}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to send Slack notification:`, error);
      throw error;
    }
  }

  public async sendAlert(severity: 'low' | 'medium' | 'high', title: string, details: string): Promise<any> {
    const colorMap = {
      low: '#36a64f',
      medium: '#ff9900',
      high: '#ff0000',
    };

    const payload = {
      attachments: [
        {
          color: colorMap[severity],
          title,
          text: details,
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    try {
      const response = await this.client.post(this.webhookUrl, payload);
      logger.info(`Slack alert sent with severity: ${severity}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to send Slack alert:`, error);
      throw error;
    }
  }
}

export default new SlackIntegration();
