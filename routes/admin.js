const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const DATA_FILE = path.join(__dirname, '../data/links.json');

function loadLinks() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

function saveLinks(links) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(links, null, 2), 'utf-8');
}

// GET /api/links — liste tous les liens
router.get('/', (req, res) => {
  const links = loadLinks();
  res.json(links);
});

// POST /api/links — crée un nouveau lien
router.post('/', (req, res) => {
  const { id, target, label } = req.body;

  if (!id || !target) {
    return res.status(400).json({ error: 'Les champs "id" et "target" sont obligatoires.' });
  }

  const links = loadLinks();

  if (links[id]) {
    return res.status(409).json({ error: `L'identifiant "${id}" existe déjà.` });
  }

  links[id] = {
    target,
    label: label || '',
    updatedAt: new Date().toISOString().split('T')[0],
  };

  saveLinks(links);
  res.status(201).json({ message: 'Lien créé.', link: links[id] });
});

// PUT /api/links/:id — met à jour l'URL cible d'un lien
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { target, label } = req.body;

  if (!target) {
    return res.status(400).json({ error: 'Le champ "target" est obligatoire.' });
  }

  const links = loadLinks();

  if (!links[id]) {
    return res.status(404).json({ error: `L'identifiant "${id}" est introuvable.` });
  }

  links[id] = {
    ...links[id],
    target,
    label: label !== undefined ? label : links[id].label,
    updatedAt: new Date().toISOString().split('T')[0],
  };

  saveLinks(links);
  res.json({ message: 'Lien mis à jour.', link: links[id] });
});

// DELETE /api/links/:id — supprime un lien
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const links = loadLinks();

  if (!links[id]) {
    return res.status(404).json({ error: `L'identifiant "${id}" est introuvable.` });
  }

  delete links[id];
  saveLinks(links);
  res.json({ message: 'Lien supprimé.' });
});

module.exports = router;
