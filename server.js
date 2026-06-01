require('dotenv').config();
const express = require('express');
const path = require('path');

const redirectRouter = require('./routes/redirect');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Lib qr-code-styling servie localement
app.get('/lib/qr-code-styling.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'node_modules/qr-code-styling/lib/qr-code-styling.js'));
});

// Interface admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Routes
app.use('/r', redirectRouter);
app.use('/api/links', adminRouter);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
  });
}

module.exports = app;
