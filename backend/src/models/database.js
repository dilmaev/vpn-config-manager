const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.dbPath = path.join(__dirname, '../../vpn_clients.db');
    this.db = null;
  }

  init() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  createTables() {
    return new Promise((resolve, reject) => {
      const sql = `
        CREATE TABLE IF NOT EXISTS clients (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          email TEXT,
          platform TEXT NOT NULL,
          moscow_uuid TEXT NOT NULL,
          germany_uuid TEXT NOT NULL,
          config_file TEXT NOT NULL,
          public_url TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      this.db.run(sql, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Tables created successfully');
          resolve();
        }
      });
    });
  }

  async addClient(clientData) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO clients (name, email, platform, moscow_uuid, germany_uuid, config_file, public_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(sql, [
        clientData.name,
        clientData.email || '',
        clientData.platform,
        clientData.moscowUuid,
        clientData.germanyUuid,
        clientData.configFile,
        clientData.publicUrl
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...clientData });
        }
      });
    });
  }

  async getClients() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM clients ORDER BY created_at DESC';
      
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async getClient(name) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM clients WHERE name = ?';
      
      this.db.get(sql, [name], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async updateClient(name, updateData) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updateData);
      values.push(name);
      
      const sql = `UPDATE clients SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE name = ?`;
      
      this.db.run(sql, values, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  async deleteClient(name) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM clients WHERE name = ?';
      
      this.db.run(sql, [name], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ deleted: this.changes > 0 });
        }
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database connection closed');
          resolve();
        }
      });
    });
  }
}

module.exports = Database;