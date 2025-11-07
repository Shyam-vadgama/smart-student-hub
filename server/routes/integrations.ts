import express, { Request, Response } from 'express';
import Integration from '../models/Integration';
import integrationService from '../services/integrationService';
import { isAuthenticated, hasRole } from '../middleware/auth';

const router = express.Router();

// Helper function to check if user has access to integration
const hasAccessToIntegration = (integration: any, user: any): boolean => {
  // Shiksan Mantri (admin) has access to all
  if (user.role === 'shiksan_mantri') {
    return true;
  }
  
  // If integration has college, check college match
  if (integration.college) {
    return integration.college.toString() === user.college?.toString();
  }
  
  // If no college, check if user created it
  return integration.createdBy.toString() === user._id.toString();
};

/**
 * @route   GET /api/integrations
 * @desc    Get all integrations for a college
 * @access  Principal, Admin
 */
router.get('/', isAuthenticated, hasRole(['principal', 'shiksan_mantri']), async (req, res) => {
  try {
    const collegeId = req.user!.college;
    
    // If user has college, filter by college; otherwise filter by createdBy
    const query = collegeId 
      ? { college: collegeId }
      : { createdBy: req.user!._id };
    
    const integrations = await Integration.find(query)
      .sort({ createdAt: -1 })
      .select('-apiKey -authConfig.password -authConfig.clientSecret -authConfig.accessToken -authConfig.refreshToken');

    res.json(integrations);
  } catch (error: any) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/integrations/:id
 * @desc    Get a specific integration
 * @access  Principal, Admin
 */
router.get('/:id', isAuthenticated, hasRole(['principal', 'shiksan_mantri']), async (req, res) => {
  try {
    const integration = await Integration.findById(req.params.id)
      .select('-apiKey -authConfig.password -authConfig.clientSecret -authConfig.accessToken -authConfig.refreshToken');

    if (!integration) {
      return res.status(404).json({ message: 'Integration not found' });
    }

    // Check if user has access to this integration
    if (!hasAccessToIntegration(integration, req.user!)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(integration);
  } catch (error: any) {
    console.error('Error fetching integration:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/integrations
 * @desc    Create a new integration
 * @access  Principal, Admin
 */
router.post('/', isAuthenticated, hasRole(['principal', 'shiksan_mantri']), async (req, res) => {
  try {
    const {
      name,
      type,
      baseUrl,
      apiKey,
      authType,
      authConfig,
      headers,
      endpoints,
      enabled,
      syncInterval,
      dataMapping,
    } = req.body;

    // Validate required fields
    if (!name || !type || !baseUrl) {
      return res.status(400).json({ message: 'Name, type, and baseUrl are required' });
    }

    // Generate webhook secret
    const webhookSecret = integrationService.generateWebhookSecret();

    const integration = new Integration({
      college: req.user!.college || undefined, // Optional - use if available
      name,
      type,
      baseUrl,
      apiKey,
      authType: authType || 'api-key',
      authConfig,
      headers,
      endpoints,
      enabled: enabled !== undefined ? enabled : true,
      syncInterval: syncInterval || 60,
      dataMapping,
      webhookSecret,
      createdBy: req.user!._id,
    });

    await integration.save();

    // Return integration without sensitive data
    const safeIntegration = await Integration.findById(integration._id)
      .select('-apiKey -authConfig.password -authConfig.clientSecret -authConfig.accessToken -authConfig.refreshToken');

    res.status(201).json(safeIntegration);
  } catch (error: any) {
    console.error('Error creating integration:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PUT /api/integrations/:id
 * @desc    Update an integration
 * @access  Principal, Admin
 */
router.put('/:id', isAuthenticated, hasRole(['principal', 'shiksan_mantri']), async (req, res) => {
  try {
    const integration = await Integration.findById(req.params.id);

    if (!integration) {
      return res.status(404).json({ message: 'Integration not found' });
    }

    // Check access
    if (!hasAccessToIntegration(integration, req.user!)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const {
      name,
      type,
      baseUrl,
      apiKey,
      authType,
      authConfig,
      headers,
      endpoints,
      enabled,
      syncInterval,
      dataMapping,
    } = req.body;

    // Update fields
    if (name) integration.name = name;
    if (type) integration.type = type;
    if (baseUrl) integration.baseUrl = baseUrl;
    if (apiKey !== undefined) integration.apiKey = apiKey;
    if (authType) integration.authType = authType;
    if (authConfig) integration.authConfig = authConfig;
    if (headers) integration.headers = headers;
    if (endpoints) integration.endpoints = { ...integration.endpoints, ...endpoints };
    if (enabled !== undefined) integration.enabled = enabled;
    if (syncInterval) integration.syncInterval = syncInterval;
    if (dataMapping) integration.dataMapping = dataMapping;

    await integration.save();

    // Clear cached axios instance
    integrationService.clearCache(String(integration._id));

    const safeIntegration = await Integration.findById(integration._id)
      .select('-apiKey -authConfig.password -authConfig.clientSecret -authConfig.accessToken -authConfig.refreshToken');

    res.json(safeIntegration);
  } catch (error: any) {
    console.error('Error updating integration:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   DELETE /api/integrations/:id
 * @desc    Delete an integration
 * @access  Principal, Admin
 */
router.delete('/:id', isAuthenticated, hasRole(['principal', 'shiksan_mantri']), async (req, res) => {
  try {
    const integration = await Integration.findById(req.params.id);

    if (!integration) {
      return res.status(404).json({ message: 'Integration not found' });
    }

    // Check access
    if (!hasAccessToIntegration(integration, req.user!)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await integration.deleteOne();

    // Clear cached axios instance
    integrationService.clearCache(String(integration._id));

    res.json({ message: 'Integration deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting integration:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PATCH /api/integrations/:id/toggle
 * @desc    Toggle integration enabled status
 * @access  Principal, Admin
 */
router.patch('/:id/toggle', isAuthenticated, hasRole(['principal', 'shiksan_mantri']), async (req, res) => {
  try {
    const integration = await Integration.findById(req.params.id);

    if (!integration) {
      return res.status(404).json({ message: 'Integration not found' });
    }

    // Check access
    if (!hasAccessToIntegration(integration, req.user!)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    integration.enabled = req.body.enabled;
    await integration.save();

    const safeIntegration = await Integration.findById(integration._id)
      .select('-apiKey -authConfig.password -authConfig.clientSecret -authConfig.accessToken -authConfig.refreshToken');

    res.json(safeIntegration);
  } catch (error: any) {
    console.error('Error toggling integration:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/integrations/:id/test
 * @desc    Test integration connection
 * @access  Principal, Admin
 */
router.post('/:id/test', isAuthenticated, hasRole(['principal', 'shiksan_mantri']), async (req, res) => {
  try {
    const integration = await Integration.findById(req.params.id);

    if (!integration) {
      return res.status(404).json({ message: 'Integration not found' });
    }

    // Check access
    if (!hasAccessToIntegration(integration, req.user!)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await integrationService.testConnection(req.params.id);

    if (result.success) {
      integration.status = 'active';
      await integration.save();
    }

    res.json(result);
  } catch (error: any) {
    console.error('Error testing integration:', error);
    res.status(500).json({ message: error.message, success: false });
  }
});

/**
 * @route   POST /api/integrations/:id/sync
 * @desc    Manually trigger data sync
 * @access  Principal, Admin
 */
router.post('/:id/sync', isAuthenticated, hasRole(['principal', 'shiksan_mantri']), async (req, res) => {
  try {
    const integration = await Integration.findById(req.params.id);

    if (!integration) {
      return res.status(404).json({ message: 'Integration not found' });
    }

    // Check access
    if (!hasAccessToIntegration(integration, req.user!)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!integration.enabled) {
      return res.status(400).json({ message: 'Integration is disabled' });
    }

    // Trigger sync in background
    integrationService.syncAll(req.params.id).catch(error => {
      console.error('Background sync failed:', error);
    });

    res.json({ message: 'Sync initiated successfully' });
  } catch (error: any) {
    console.error('Error syncing integration:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/integrations/:id/logs
 * @desc    Get sync logs for an integration
 * @access  Principal, Admin
 */
router.get('/:id/logs', isAuthenticated, hasRole(['principal', 'shiksan_mantri']), async (req, res) => {
  try {
    const integration = await Integration.findById(req.params.id);

    if (!integration) {
      return res.status(404).json({ message: 'Integration not found' });
    }

    // Check access
    if (!hasAccessToIntegration(integration, req.user!)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(integration.syncLogs);
  } catch (error: any) {
    console.error('Error fetching sync logs:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/webhooks/integrations/:id
 * @desc    Webhook endpoint for external systems
 * @access  Public (with signature verification)
 */
router.post('/webhooks/integrations/:id', async (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'] as string;
    
    await integrationService.handleWebhook(req.params.id, req.body, signature);

    res.json({ message: 'Webhook processed successfully' });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
