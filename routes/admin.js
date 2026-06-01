const express = require('express');
const redis = require('../lib/redis');

const router = express.Router();

// GET /api/links — liste tous les liens
router.get('/', async (req, res) => {
  const links = await redis.hgetall('links');
  res.json(links || {});
});

// GET /api/links/:id/qr-url — retourne l'URL encodée dans le QR
router.get('/:id/qr-url', async (req, res) => {
  const { id } = req.params;
  const base = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  res.json({ url: `${base}/r/${id}` });
});

// POST /api/links — crée un nouveau lien
router.post('/', async (req, res) => {
  const { id, target, label } = req.body;

  if (!id || !target) {
    return res.status(400).json({ error: 'Les champs "id" et "target" sont obligatoires.' });
  }

  const existing = await redis.hget('links', id);
  if (existing) {
    return res.status(409).json({ error: `L'identifiant "${id}" existe déjà.` });
  }

  const entry = { target, label: label || '', updatedAt: new Date().toISOString().split('T')[0] };
  await redis.hset('links', { [id]: entry });

  res.status(201).json({ message: 'Lien créé.', link: entry });
});

// PUT /api/links/:id — met à jour un lien
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { target, label } = req.body;

  if (!target) {
    return res.status(400).json({ error: 'Le champ "target" est obligatoire.' });
  }

  const existing = await redis.hget('links', id);
  if (!existing) {
    return res.status(404).json({ error: `L'identifiant "${id}" est introuvable.` });
  }

  const entry = { ...existing, target, label: label !== undefined ? label : existing.label, updatedAt: new Date().toISOString().split('T')[0] };
  await redis.hset('links', { [id]: entry });

  res.json({ message: 'Lien mis à jour.', link: entry });
});

// DELETE /api/links/:id — supprime un lien
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const existing = await redis.hget('links', id);
  if (!existing) {
    return res.status(404).json({ error: `L'identifiant "${id}" est introuvable.` });
  }

  await redis.hdel('links', id);
  res.json({ message: 'Lien supprimé.' });
});

module.exports = router;
