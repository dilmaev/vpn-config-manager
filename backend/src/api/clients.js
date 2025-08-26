const express = require('express');
const router = express.Router();
const xuiApi = require('../services/xuiApi');
const configGenerator = require('../services/configGenerator');
const Database = require('../models/database');

const db = new Database();
db.init();

router.post('/create', async (req, res) => {
  try {
    const { name, email, platform } = req.body;

    if (!name || !platform) {
      return res.status(400).json({
        success: false,
        message: 'Name and platform are required'
      });
    }

    const validPlatforms = ['ios', 'android', 'windows'];
    if (!validPlatforms.includes(platform.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid platform. Must be: ios, android, or windows'
      });
    }

    const existingClient = await db.getClient(name);
    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: 'Client with this name already exists'
      });
    }

    console.log(`Creating client: ${name} for ${platform}`);
    const clientData = await xuiApi.createClient(name, email);

    const config = configGenerator.generateConfig(
      platform,
      clientData.moscow,
      clientData.germany
    );

    const savedConfig = await configGenerator.saveConfig(name, platform, config);

    await db.addClient({
      name,
      email,
      platform,
      moscowUuid: clientData.moscow.uuid,
      germanyUuid: clientData.germany.uuid,
      configFile: savedConfig.fileName,
      publicUrl: savedConfig.publicUrl
    });

    res.json({
      success: true,
      data: {
        name,
        platform,
        configUrl: savedConfig.publicUrl,
        directUrl: `https://config.test-internet.ru/${savedConfig.fileName}`,
        moscow: clientData.moscow,
        germany: clientData.germany
      }
    });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create client'
    });
  }
});

router.get('/list', async (req, res) => {
  try {
    const clients = await db.getClients();
    const configs = await configGenerator.listConfigs();

    const enrichedClients = clients.map(client => {
      const configInfo = configs.find(c => c.fileName === client.config_file);
      return {
        ...client,
        configInfo,
        directUrl: `https://config.test-internet.ru/${client.config_file}`
      };
    });

    res.json({
      success: true,
      data: enrichedClients
    });
  } catch (error) {
    console.error('Error listing clients:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to list clients'
    });
  }
});

router.get('/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const client = await db.getClient(name);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...client,
        directUrl: `https://config.test-internet.ru/${client.config_file}`
      }
    });
  } catch (error) {
    console.error('Error getting client:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get client'
    });
  }
});

router.post('/:name/regenerate', async (req, res) => {
  try {
    const { name } = req.params;
    console.log(`Regenerating config for client: ${name}`);
    
    const client = await db.getClient(name);
    console.log('Client from DB:', client);

    if (!client) {
      console.log('Client not found in database');
      return res.status(404).json({
        success: false,
        message: 'Client not found in database'
      });
    }
    
    // Get current client data from 3x-ui servers
    console.log('Fetching clients from 3x-ui servers...');
    const clientsData = await xuiApi.getClients();
    
    // Find client UUIDs
    console.log('Looking for Moscow UUID:', client.moscow_uuid);
    console.log('Looking for Germany UUID:', client.germany_uuid);
    
    const moscowClient = clientsData.moscow.find(c => c.uuid === client.moscow_uuid);
    const germanyClient = clientsData.germany.find(c => c.uuid === client.germany_uuid);
    
    console.log('Moscow client found:', !!moscowClient);
    console.log('Germany client found:', !!germanyClient);
    
    if (!moscowClient || !germanyClient) {
      console.log('Client not found on 3x-ui servers');
      return res.status(404).json({
        success: false,
        message: 'Client not found on 3x-ui servers'
      });
    }

    // Prepare data for config generation
    const moscowData = {
      uuid: client.moscow_uuid,
      server: 'moscow.grozny.site',
      port: 443,
      publicKey: 'ZF6AAUCvUjIn8tI5CPqeJc8rnFzrjxFeIJYEoMsYgEY',
      shortId: '3b'
    };

    const germanyData = {
      uuid: client.germany_uuid,
      server: 'de.grozny.site',
      port: 443,
      publicKey: 'KibMR-hE7jasSqY7zJAoajwufXRoiy5ucVAQaZmZBB4',
      shortId: 'd1594c7994a38c88'
    };

    // Generate new config with updated templates
    console.log('Generating new config...');
    const config = configGenerator.generateConfig(
      client.platform,
      moscowData,
      germanyData
    );

    // Save updated config
    console.log('Saving config...');
    const savedConfig = await configGenerator.saveConfig(name, client.platform, config);
    console.log('Config saved:', savedConfig);

    res.json({
      success: true,
      message: 'Config regenerated successfully',
      data: {
        name,
        platform: client.platform,
        configUrl: savedConfig.publicUrl,
        directUrl: `https://config.test-internet.ru/${savedConfig.fileName}`
      }
    });
  } catch (error) {
    console.error('Error regenerating config:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to regenerate config'
    });
  }
});

router.delete('/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const client = await db.getClient(name);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    await configGenerator.deleteConfig(client.config_file);
    await db.deleteClient(name);

    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete client'
    });
  }
});

router.get('/status/servers', async (req, res) => {
  try {
    await xuiApi.ensureAuthenticated();
    const clients = await xuiApi.getClients();

    res.json({
      success: true,
      data: {
        moscow: {
          connected: true,
          clientsCount: clients.moscow.length
        },
        germany: {
          connected: true,
          clientsCount: clients.germany.length
        }
      }
    });
  } catch (error) {
    res.json({
      success: false,
      data: {
        moscow: { connected: false },
        germany: { connected: false }
      }
    });
  }
});

module.exports = router;