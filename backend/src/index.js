require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const path = require('path');
const Database = require('./models/database');
const clientRoutes = require('./api/clients');
const configRoutes = require('./api/configs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = new Database();
db.init();

app.use('/api/clients', clientRoutes);
app.use('/api/configs', configRoutes);

// Serve static config files directly at root
app.use('/', express.static(path.join(__dirname, '../../configs')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});