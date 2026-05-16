import axios, { AxiosInstance } from 'axios';
import logger from '@utils/logger';

export class SalesforceIntegration {
  private client: AxiosInstance;
  private accessToken?: string;
  private instanceUrl?: string;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://login.salesforce.com',
    });
  }

  public async authenticate(): Promise<void> {
    try {
      const response = await this.client.post('/services/oauth2/token', {
        grant_type: 'client_credentials',
        client_id: process.env.SALESFORCE_CLIENT_ID,
        client_secret: process.env.SALESFORCE_CLIENT_SECRET,
      });

      this.accessToken = response.data.access_token;
      this.instanceUrl = response.data.instance_url;
      logger.info('Salesforce authentication successful');
    } catch (error) {
      logger.error('Salesforce authentication failed:', error);
      throw error;
    }
  }

  public async syncContact(contactData: any): Promise<any> {
    if (!this.accessToken || !this.instanceUrl) {
      await this.authenticate();
    }

    try {
      const response = await axios.post(
        `${this.instanceUrl}/services/data/v59.0/sobjects/Contact`,
        contactData,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      logger.info(`Contact synced to Salesforce: ${response.data.id}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to sync contact to Salesforce:', error);
      throw error;
    }
  }

  public async syncDeal(dealData: any): Promise<any> {
    if (!this.accessToken || !this.instanceUrl) {
      await this.authenticate();
    }

    try {
      const response = await axios.post(
        `${this.instanceUrl}/services/data/v59.0/sobjects/Opportunity`,
        dealData,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      logger.info(`Deal synced to Salesforce: ${response.data.id}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to sync deal to Salesforce:', error);
      throw error;
    }
  }
}

export default new SalesforceIntegration();
