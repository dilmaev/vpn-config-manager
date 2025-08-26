const express = require('express');
const router = express.Router();
const path = require('path');
const configGenerator = require('../services/configGenerator');

router.get('/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    
    if (!fileName.endsWith('.json')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid config file name'
      });
    }

    const config = await configGenerator.getConfig(fileName);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(config);
  } catch (error) {
    res.status(404).json({
      success: false,
      message: 'Config file not found'
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const configs = await configGenerator.listConfigs();
    
    res.json({
      success: true,
      data: configs.map(config => ({
        ...config,
        directUrl: `https://config.test-internet.ru/${config.fileName}`
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to list configs'
    });
  }
});

router.put('/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const newConfig = req.body;

    if (!fileName.endsWith('.json')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid config file name'
      });
    }

    const result = await configGenerator.updateConfig(fileName, newConfig);
    
    res.json({
      success: true,
      data: {
        ...result,
        directUrl: `https://config.test-internet.ru/${fileName}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update config'
    });
  }
});

router.delete('/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;

    if (!fileName.endsWith('.json')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid config file name'
      });
    }

    const deleted = await configGenerator.deleteConfig(fileName);
    
    res.json({
      success: deleted,
      message: deleted ? 'Config deleted successfully' : 'Failed to delete config'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete config'
    });
  }
});

module.exports = router;