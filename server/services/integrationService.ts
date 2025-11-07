import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import Integration, { IIntegration } from '../models/Integration';
import crypto from 'crypto';

interface SyncResult {
  success: boolean;
  recordsSynced: number;
  errors: string[];
}

class IntegrationService {
  private axiosInstances: Map<string, AxiosInstance> = new Map();

  /**
   * Create an axios instance for a specific integration
   */
  private createAxiosInstance(integration: IIntegration): AxiosInstance {
    const config: AxiosRequestConfig = {
      baseURL: integration.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        ...Object.fromEntries(integration.headers || new Map()),
      },
    };

    // Add authentication based on type
    switch (integration.authType) {
      case 'api-key':
        if (integration.apiKey) {
          config.headers!['X-API-Key'] = integration.apiKey;
        }
        break;
      case 'bearer':
        if (integration.apiKey) {
          config.headers!['Authorization'] = `Bearer ${integration.apiKey}`;
        }
        break;
      case 'basic':
        if (integration.authConfig?.username && integration.authConfig?.password) {
          const token = Buffer.from(
            `${integration.authConfig.username}:${integration.authConfig.password}`
          ).toString('base64');
          config.headers!['Authorization'] = `Basic ${token}`;
        }
        break;
      case 'oauth':
        if (integration.authConfig?.accessToken) {
          config.headers!['Authorization'] = `Bearer ${integration.authConfig.accessToken}`;
        }
        break;
    }

    return axios.create(config);
  }

  /**
   * Get or create axios instance for integration
   */
  private getAxiosInstance(integration: IIntegration): AxiosInstance {
    const key = integration._id.toString();
    if (!this.axiosInstances.has(key)) {
      this.axiosInstances.set(key, this.createAxiosInstance(integration));
    }
    return this.axiosInstances.get(key)!;
  }

  /**
   * Test connection to external API
   */
  async testConnection(integrationId: string): Promise<{ success: boolean; message: string }> {
    try {
      const integration = await Integration.findById(integrationId).select('+apiKey +authConfig.password');
      if (!integration) {
        throw new Error('Integration not found');
      }

      const axiosInstance = this.getAxiosInstance(integration);
      
      // Try to hit a test endpoint or the first available endpoint
      const testEndpoint = integration.endpoints.students || 
                          integration.endpoints.attendance || 
                          integration.endpoints.marks ||
                          '/health' ||
                          '/';

      const response = await axiosInstance.get(testEndpoint, {
        params: { limit: 1 }, // Request minimal data
      });

      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          message: 'Connection successful! Integration is working correctly.',
        };
      }

      return {
        success: false,
        message: `Unexpected response status: ${response.status}`,
      };
    } catch (error: any) {
      console.error('Integration test failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Connection failed',
      };
    }
  }

  /**
   * Sync attendance data from external system
   */
  async syncAttendance(integrationId: string): Promise<SyncResult> {
    const result: SyncResult = { success: false, recordsSynced: 0, errors: [] };

    try {
      const integration = await Integration.findById(integrationId).select('+apiKey +authConfig.password');
      if (!integration || !integration.endpoints.attendance) {
        throw new Error('Attendance endpoint not configured');
      }

      const axiosInstance = this.getAxiosInstance(integration);
      const response = await axiosInstance.get(integration.endpoints.attendance);

      // Transform and store data
      const attendanceData = this.transformData(response.data, integration.dataMapping);
      
      // TODO: Store attendance data in your database
      // This would involve mapping the external data to your internal schema
      // and creating/updating attendance records

      result.success = true;
      result.recordsSynced = Array.isArray(attendanceData) ? attendanceData.length : 0;
    } catch (error: any) {
      result.errors.push(error.message);
    }

    return result;
  }

  /**
   * Sync marks data from external system
   */
  async syncMarks(integrationId: string): Promise<SyncResult> {
    const result: SyncResult = { success: false, recordsSynced: 0, errors: [] };

    try {
      const integration = await Integration.findById(integrationId).select('+apiKey +authConfig.password');
      if (!integration || !integration.endpoints.marks) {
        throw new Error('Marks endpoint not configured');
      }

      const axiosInstance = this.getAxiosInstance(integration);
      const response = await axiosInstance.get(integration.endpoints.marks);

      const marksData = this.transformData(response.data, integration.dataMapping);
      
      // TODO: Store marks data in your database

      result.success = true;
      result.recordsSynced = Array.isArray(marksData) ? marksData.length : 0;
    } catch (error: any) {
      result.errors.push(error.message);
    }

    return result;
  }

  /**
   * Sync timetable data from external system
   */
  async syncTimetable(integrationId: string): Promise<SyncResult> {
    const result: SyncResult = { success: false, recordsSynced: 0, errors: [] };

    try {
      const integration = await Integration.findById(integrationId).select('+apiKey +authConfig.password');
      if (!integration || !integration.endpoints.timetable) {
        throw new Error('Timetable endpoint not configured');
      }

      const axiosInstance = this.getAxiosInstance(integration);
      const response = await axiosInstance.get(integration.endpoints.timetable);

      const timetableData = this.transformData(response.data, integration.dataMapping);
      
      // TODO: Store timetable data in your database

      result.success = true;
      result.recordsSynced = Array.isArray(timetableData) ? timetableData.length : 0;
    } catch (error: any) {
      result.errors.push(error.message);
    }

    return result;
  }

  /**
   * Sync students data from external system
   */
  async syncStudents(integrationId: string): Promise<SyncResult> {
    const result: SyncResult = { success: false, recordsSynced: 0, errors: [] };

    try {
      const integration = await Integration.findById(integrationId).select('+apiKey +authConfig.password');
      if (!integration || !integration.endpoints.students) {
        throw new Error('Students endpoint not configured');
      }

      const axiosInstance = this.getAxiosInstance(integration);
      const response = await axiosInstance.get(integration.endpoints.students);

      const studentsData = this.transformData(response.data, integration.dataMapping);
      
      // TODO: Store students data in your database

      result.success = true;
      result.recordsSynced = Array.isArray(studentsData) ? studentsData.length : 0;
    } catch (error: any) {
      result.errors.push(error.message);
    }

    return result;
  }

  /**
   * Sync all data types for an integration
   */
  async syncAll(integrationId: string): Promise<SyncResult> {
    const integration = await Integration.findById(integrationId);
    if (!integration) {
      throw new Error('Integration not found');
    }

    const results: SyncResult[] = [];
    const allErrors: string[] = [];
    let totalSynced = 0;

    // Sync each configured endpoint
    if (integration.endpoints.attendance) {
      const result = await this.syncAttendance(integrationId);
      results.push(result);
      totalSynced += result.recordsSynced;
      allErrors.push(...result.errors);
    }

    if (integration.endpoints.marks) {
      const result = await this.syncMarks(integrationId);
      results.push(result);
      totalSynced += result.recordsSynced;
      allErrors.push(...result.errors);
    }

    if (integration.endpoints.timetable) {
      const result = await this.syncTimetable(integrationId);
      results.push(result);
      totalSynced += result.recordsSynced;
      allErrors.push(...result.errors);
    }

    if (integration.endpoints.students) {
      const result = await this.syncStudents(integrationId);
      results.push(result);
      totalSynced += result.recordsSynced;
      allErrors.push(...result.errors);
    }

    // Update integration sync status
    const allSuccess = results.every(r => r.success);
    const someSuccess = results.some(r => r.success);
    const status = allSuccess ? 'success' : someSuccess ? 'partial' : 'failed';

    await integration.updateSyncStatus(status, totalSynced, allErrors);

    return {
      success: allSuccess,
      recordsSynced: totalSynced,
      errors: allErrors,
    };
  }

  /**
   * Transform external data based on field mappings
   */
  private transformData(data: any, dataMapping?: IIntegration['dataMapping']): any {
    if (!dataMapping || !dataMapping.fieldMappings) {
      return data;
    }

    const mappings = Object.fromEntries(dataMapping.fieldMappings);

    if (Array.isArray(data)) {
      return data.map(item => this.transformObject(item, mappings));
    } else if (typeof data === 'object' && data !== null) {
      return this.transformObject(data, mappings);
    }

    return data;
  }

  /**
   * Transform a single object based on field mappings
   */
  private transformObject(obj: any, mappings: Record<string, string>): any {
    const transformed: any = {};

    for (const [externalField, internalField] of Object.entries(mappings)) {
      if (obj.hasOwnProperty(externalField)) {
        transformed[internalField] = obj[externalField];
      }
    }

    // Include unmapped fields
    for (const key of Object.keys(obj)) {
      if (!mappings.hasOwnProperty(key) && !transformed.hasOwnProperty(key)) {
        transformed[key] = obj[key];
      }
    }

    return transformed;
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  }

  /**
   * Generate webhook secret
   */
  generateWebhookSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Handle incoming webhook data
   */
  async handleWebhook(integrationId: string, data: any, signature?: string): Promise<void> {
    const integration = await Integration.findById(integrationId);
    if (!integration) {
      throw new Error('Integration not found');
    }

    // Verify signature if provided
    if (signature && integration.webhookSecret) {
      const isValid = this.verifyWebhookSignature(
        JSON.stringify(data),
        signature,
        integration.webhookSecret
      );
      if (!isValid) {
        throw new Error('Invalid webhook signature');
      }
    }

    // Process webhook data based on type
    const transformedData = this.transformData(data, integration.dataMapping);
    
    // TODO: Store the webhook data in your database
    // This would involve determining the data type and storing it appropriately

    console.log('Webhook data received and processed:', transformedData);
  }

  /**
   * Schedule automatic syncs for all enabled integrations
   */
  async scheduleAutoSync(): Promise<void> {
    const integrations = await Integration.find({ enabled: true, status: { $ne: 'error' } });

    for (const integration of integrations) {
      const now = new Date();
      const lastSync = integration.lastSync || new Date(0);
      const minutesSinceLastSync = (now.getTime() - lastSync.getTime()) / (1000 * 60);

      if (minutesSinceLastSync >= integration.syncInterval) {
        console.log(`Auto-syncing integration: ${integration.name}`);
        try {
          await this.syncAll(integration._id.toString());
        } catch (error) {
          console.error(`Auto-sync failed for ${integration.name}:`, error);
        }
      }
    }
  }

  /**
   * Clear cached axios instance
   */
  clearCache(integrationId: string): void {
    this.axiosInstances.delete(integrationId);
  }
}

export default new IntegrationService();
