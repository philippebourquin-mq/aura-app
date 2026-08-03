# AURA — app de défis gamifiée

Version React du jeu de cartes physique **AURA** : mêmes catégories, mêmes défis, mêmes codes
graphiques, avec un suivi de progression, des statuts et des jokers numériques en plus.

Voir [`docs/BRIEF.md`](docs/BRIEF.md) pour le contexte complet (contenu du jeu original, règles,
catalogue des défis, décisions produit).

## Démarrer en local

```bash
npm install
npm run dev
```

L'app est disponible sur `http://localhost:5173`.

## Scripts

- `npm run dev` — serveur de développement
- `npm run build` — build de production (`dist/`)
- `npm run lint` — vérification ESLint

## État actuel (MVP)

- Contenu des 5 catégories + bonus et des ~35 défis, fidèle au jeu physique (`src/data/`).
- Pioche aléatoire d'un défi par catégorie, avec les 3 jokers (Switch / Boomerang / Flemme).
- Suivi de statut par défi (à faire / à valider / validé) et score total, persistés en
  `localStorage`.
- Page de progression (score, avancement par catégorie, journal des défis validés).

## À venir

- Rôles Lucas / parent avec authentification et validation des défis par un tiers
  (voir section 8 du brief) — nécessite un backend (Supabase envisagé : Auth + Postgres).
- Badges/récompenses virtuelles.
- Charte graphique pixel-perfect (couleurs exactes, police, icônes vectorielles) une fois les
  fichiers source du jeu physique disponibles.
