require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const axios = require('axios');
const https = require('https');
const { v4: uuidv4 } = require('uuid');

class XUIApiService {
  constructor() {
    this.moscowApi = axios.create({
      baseURL: process.env.MOSCOW_URL,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 10000
    });

    this.germanyApi = axios.create({
      baseURL: process.env.GERMANY_URL,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      timeout: 10000
    });

    this.moscowSession = null;
    this.germanySession = null;
  }

  async loginMoscow() {
    try {
      const response = await this.moscowApi.post('/login', {
        username: process.env.MOSCOW_LOGIN,
        password: process.env.MOSCOW_PASSWORD
      });

      if (response.data.success) {
        this.moscowSession = response.headers['set-cookie'];
        this.moscowApi.defaults.headers.Cookie = this.moscowSession;
        return true;
      }
      throw new Error('Moscow login failed');
    } catch (error) {
      console.error('Moscow login error:', error.message);
      throw error;
    }
  }

  async loginGermany() {
    try {
      const response = await this.germanyApi.post('/login', {
        username: process.env.GERMANY_LOGIN,
        password: process.env.GERMANY_PASSWORD
      });

      if (response.data.success) {
        this.germanySession = response.headers['set-cookie'];
        this.germanyApi.defaults.headers.Cookie = this.germanySession;
        return true;
      }
      throw new Error('Germany login failed');
    } catch (error) {
      console.error('Germany login error:', error.message);
      throw error;
    }
  }

  async ensureAuthenticated() {
    if (!this.moscowSession) {
      await this.loginMoscow();
    }
    if (!this.germanySession) {
      await this.loginGermany();
    }
  }

  async createClient(clientName, email = '') {
    await this.ensureAuthenticated();

    const moscowUuid = uuidv4();
    const germanyUuid = uuidv4();

    try {
      const moscowClient = await this.createMoscowClient(clientName, moscowUuid, email);
      const germanyClient = await this.createGermanyClient(clientName, germanyUuid, email);

      return {
        success: true,
        moscow: {
          uuid: moscowUuid,
          id: moscowClient.id,
          server: 'moscow.grozny.site',
          port: 443,
          publicKey: 'ZF6AAUCvUjIn8tI5CPqeJc8rnFzrjxFeIJYEoMsYgEY',
          shortId: '3b'
        },
        germany: {
          uuid: germanyUuid,
          id: germanyClient.id,
          server: 'de.grozny.site',
          port: 443,
          publicKey: 'KibMR-hE7jasSqY7zJAoajwufXRoiy5ucVAQaZmZBB4',
          shortId: 'd1594c7994a38c88'
        }
      };
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  async createMoscowClient(remark, uuid, email) {
    const clientData = {
      id: uuid,
      alterId: 0,
      email: email || `${remark}@vpn.local`,
      limitIp: 2,
      totalGB: 0,
      expiryTime: 0,
      enable: true,
      tgId: '',
      subId: uuidv4().substring(0, 16),
      reset: 0,
      flow: 'xtls-rprx-vision'
    };

    const response = await this.moscowApi.post('/panel/api/inbounds/addClient', {
      id: 1,
      settings: JSON.stringify({
        clients: [clientData]
      })
    });

    if (!response.data.success) {
      throw new Error(`Failed to create Moscow client: ${response.data.msg}`);
    }

    return clientData;
  }

  async createGermanyClient(remark, uuid, email) {
    const clientData = {
      id: uuid,
      alterId: 0,
      email: email || `${remark}@vpn.local`,
      limitIp: 2,
      totalGB: 0,
      expiryTime: 0,
      enable: true,
      tgId: '',
      subId: uuidv4().substring(0, 16),
      reset: 0,
      flow: 'xtls-rprx-vision'
    };

    const response = await this.germanyApi.post('/panel/api/inbounds/addClient', {
      id: 1,
      settings: JSON.stringify({
        clients: [clientData]
      })
    });

    if (!response.data.success) {
      throw new Error(`Failed to create Germany client: ${response.data.msg}`);
    }

    return clientData;
  }

  async getClients() {
    await this.ensureAuthenticated();

    try {
      const [moscowResponse, germanyResponse] = await Promise.all([
        this.moscowApi.get('/panel/api/inbounds/list'),
        this.germanyApi.get('/panel/api/inbounds/list')
      ]);

      // Extract clients from inbound settings
      const extractClients = (inbounds) => {
        const clients = [];
        if (inbounds && inbounds.length > 0) {
          for (const inbound of inbounds) {
            if (inbound.settings) {
              const settings = typeof inbound.settings === 'string' 
                ? JSON.parse(inbound.settings) 
                : inbound.settings;
              if (settings.clients && Array.isArray(settings.clients)) {
                clients.push(...settings.clients);
              }
            }
          }
        }
        return clients;
      };

      return {
        moscow: extractClients(moscowResponse.data.obj),
        germany: extractClients(germanyResponse.data.obj)
      };
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  }
}

module.exports = new XUIApiService();