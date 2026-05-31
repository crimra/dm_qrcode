# DM QRcode — Système de QR Codes Dynamiques pour Liens V3D

## Contexte

Dans le cadre de projets de numérisation 3D (V3D), les maquettes générées possèdent des URL qui changent fréquemment à chaque mise à jour. Ces changements brisent les QR codes physiques déjà imprimés.

Ce micro-service résout ce problème en introduisant une **URL pivot fixe** : le QR code imprimé ne pointe plus vers la destination finale, mais vers ce serveur. Lors du scan, le serveur retrouve la vraie URL en base et redirige l'utilisateur instantanément.

```
[QR Code imprimé] → https://monserveur.com/r/maquette-01 → [URL V3D actuelle]
```

## Fonctionnement

1. Un QR code est généré une seule fois et pointe vers `/r/:id` (ex: `/r/maquette-01`)
2. L'utilisateur scanne le QR code
3. Le serveur cherche l'URL cible associée à l'identifiant dans le fichier de données
4. Le serveur redirige l'utilisateur (HTTP 301/302) vers l'URL V3D actuelle
5. Si l'URL V3D change, on met à jour uniquement la correspondance — le QR code reste valide

## Stack Technique

| Composant | Choix | Raison |
|-----------|-------|--------|
| Runtime | Node.js | Léger, universel |
| Framework | Express.js | Minimal, bien documenté |
| Stockage | Fichier JSON | Simple, sans dépendance externe |
| Interface admin | HTML/CSS servi par Express | Accessible sans outil tiers |
| Déploiement | Railway | Gratuit, connexion GitHub directe |

## Structure du Projet

```
DM_QRcode/
├── server.js           # Point d'entrée — serveur Express
├── data/
│   └── links.json      # Correspondances id → URL cible
├── public/
│   └── admin.html      # Interface d'administration web
├── routes/
│   ├── redirect.js     # Route GET /r/:id — logique de redirection
│   └── admin.js        # Routes API admin (CRUD des liens)
├── package.json
├── .gitignore
└── README.md
```

## Routes

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/r/:id` | Redirige vers l'URL cible associée à l'identifiant |
| `GET` | `/admin` | Interface web d'administration |
| `GET` | `/api/links` | Liste tous les liens |
| `POST` | `/api/links` | Crée un nouveau lien |
| `PUT` | `/api/links/:id` | Met à jour l'URL cible d'un lien existant |
| `DELETE` | `/api/links/:id` | Supprime un lien |

## Format des données (`links.json`)

```json
{
  "maquette-01": {
    "target": "https://v3d.example.com/projet-alpha/v3",
    "label": "Maquette Projet Alpha",
    "updatedAt": "2026-05-31"
  },
  "maquette-02": {
    "target": "https://v3d.example.com/projet-beta/v1",
    "label": "Maquette Projet Beta",
    "updatedAt": "2026-05-31"
  }
}
```

## Installation & Lancement

```bash
# Cloner le projet
git clone <url-du-repo>
cd DM_QRcode

# Installer les dépendances
npm install

# Lancer le serveur en développement
npm run dev

# Lancer en production
npm start
```

Le serveur démarre sur `http://localhost:3000`.

## Déploiement sur Railway

1. Pousser le projet sur GitHub
2. Créer un compte sur [railway.app](https://railway.app)
3. "New Project" → "Deploy from GitHub repo"
4. Sélectionner ce dépôt — Railway détecte automatiquement Node.js
5. Le service est en ligne avec une URL publique

## Évolutions Futures Envisagées

- Authentification de l'interface admin (token API)
- Migration du stockage vers SQLite ou PostgreSQL
- Statistiques de scan (nombre de redirections par lien)
- Génération des QR codes directement depuis l'interface admin
- Expiration automatique de liens

# dm_qrcode
