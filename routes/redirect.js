const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const DATA_FILE = path.join(__dirname, '../data/links.json');

function loadLinks() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

// GET /r/:id — redirige vers l'URL cible
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const links = loadLinks();

  const entry = links[id];

  if (!entry) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Lien introuvable</title>
        <style>
          body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f5f5f5; }
          h1 { font-size: 4rem; margin: 0; color: #333; }
          p { color: #666; font-size: 1.1rem; }
        </style>
      </head>
      <body>
        <h1>404</h1>
        <p>Le lien <strong>${id}</strong> est introuvable ou a expiré.</p>
      </body>
      </html>
    `);
  }

  res.redirect(302, entry.target);
});

module.exports = router;
