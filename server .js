const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());

// Dashboard
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// API handlers (files sit next to server.js)
for (const name of ['ask', 'ingest', 'reports', 'route', 'state']) {
  app.all('/api/' + name, require('./' + name));
}

app.listen(process.env.PORT || 3000, () => console.log('EcoTwin running'));
