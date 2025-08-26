const fs = require('fs').promises;
const path = require('path');
const generateIosConfig = require('../templates/ios.template');
const generateAndroidConfig = require('../templates/android.template');
const generateWindowsConfig = require('../templates/windows.template');

class ConfigGeneratorService {
  constructor() {
    this.configsPath = path.join(__dirname, '../../../configs');
    this.ensureDirectories();
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(this.configsPath, { recursive: true });
    } catch (error) {
      console.error('Error creating directories:', error);
    }
  }

  generateConfig(platform, moscowData, germanyData) {
    switch (platform.toLowerCase()) {
      case 'ios':
        return generateIosConfig(moscowData, germanyData);
      case 'android':
        return generateAndroidConfig(moscowData, germanyData);
      case 'windows':
        return generateWindowsConfig(moscowData, germanyData);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  async saveConfig(clientName, platform, config) {
    const fileName = `${clientName}-${platform}.json`;
    const filePath = path.join(this.configsPath, fileName);
    
    const configJson = JSON.stringify(config, null, 2);
    
    await fs.writeFile(filePath, configJson);
    
    return {
      fileName,
      filePath,
      publicUrl: `/${fileName}`
    };
  }

  async getConfig(fileName) {
    const filePath = path.join(this.configsPath, fileName);
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Config not found: ${fileName}`);
    }
  }

  async listConfigs() {
    try {
      const files = await fs.readdir(this.configsPath);
      const configs = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const [clientName, platformWithExt] = file.split('-');
          const platform = platformWithExt.replace('.json', '');
          const stats = await fs.stat(path.join(this.configsPath, file));
          
          configs.push({
            fileName: file,
            clientName,
            platform,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
            publicUrl: `/${file}`
          });
        }
      }
      
      return configs;
    } catch (error) {
      console.error('Error listing configs:', error);
      return [];
    }
  }

  async deleteConfig(fileName) {
    const filePath = path.join(this.configsPath, fileName);
    
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting config:', error);
      return false;
    }
  }

  async updateConfig(fileName, newConfig) {
    const filePath = path.join(this.configsPath, fileName);
    
    const configJson = JSON.stringify(newConfig, null, 2);
    
    await fs.writeFile(filePath, configJson);
    
    return {
      fileName,
      updated: true,
      publicUrl: `/${fileName}`
    };
  }
}

module.exports = new ConfigGeneratorService();