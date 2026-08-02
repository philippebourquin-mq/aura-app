# AURA — Brief projet

> Résumé du jeu physique original et cahier des charges de départ pour l'app React miroir.
> Source : `Aura_vImpression.pdf` (fichier prêt à imprimer, 68 pages, format cartes Poker).

## 1. Contexte & intention

**AURA** est un jeu de cartes de défis physique, créé par un père (« Papa ») et « Marianne » comme cadeau pour **Lucas, 15 ans**, à l'entrée au lycée. Ce n'est pas un jeu de survie ou de performance : c'est un objet bienveillant pour aider un ado à **gagner en confiance en lui**, à travers des petits défis progressifs classés par thème.

Citation de la carte d'intro (lettre de Papa à Lucas) :

> « Le collège est derrière toi, et je suis fier de ce que tu deviens [...] Je sais aussi que tu aimerais parfois être boosté et gagner en confiance [...] Alors j'ai construit ce jeu avec Marianne pour toi. [...] la confiance, ça se construit petit à petit, chaque jour et qu'une fois qu'elle est là, elle ouvre des portes nouvelles. »

Baseline du jeu (carte règles) :

> « Le jeu de défis bienveillants pour Lucas, et tous les ados pour qui grandir peut parfois piquer un peu. »
> « Enchaîne les défis des 5 catégories. Ton but : plus confiant, plus toi, plus d'aura auprès des autres. »

**Objectif de l'app** : créer une version React qui **reproduit fidèlement le contenu et les codes graphiques** du jeu physique (mêmes catégories, mêmes défis, même identité visuelle), mais y ajoute une couche **gamifiée numérique** : suivi de progression, statuts, badges/récompenses, historique — quelque chose que le support carton ne permet pas.

## 2. Le jeu physique — contenu

| Élément | Quantité | Détail |
|---|---|---|
| Cartes défis (recto-verso) | ~35 (annoncées « une trentaine ») | Réparties dans 5 catégories + 1 catégorie bonus |
| Cartes défis vierges | 10 (2 par catégorie) | À remplir à la main pour ajouter ses propres défis |
| Carte d'intro | 1 | Lettre personnelle de Papa à Lucas |
| Carte règles | 1 (recto-verso) | Étapes du jeu + liste des 5 catégories |
| Cartes joker | 3 | Switch, Boomerang, Flemme — usage unique |
| Stickers | ~50, 15×15 mm | Collés sur les cartes une fois le défi validé |
| Boîte | 1 | Boîte carton format cartes poker, « édition Lucas 2026 » |

**Format carte** : Poker, 63 × 90 mm, coins arrondis, fabrication qualité « carte à jouer » (épaisseur, glaçage).

**Structure d'une carte défi** (recto/verso) :
- **Verso** : fond de la couleur de la catégorie (bicolore : bande crème en haut avec le logo « A U R A » espacé + bande couleur en bas avec l'illustration du personnage — un ado en pleine action, style croquis crayon).
- **Recto** : bandeau supérieur coloré (couleur catégorie) avec le nom de la catégorie en petit + une icône pictographique + le titre du défi en gros caractères gras ; corps crème avec le texte de description du défi ; en bas, le wordmark « AURA » en filigrane (bas gauche) et un badge pilule avec les **points** du défi (bas droite, ex. `+600`).

## 3. Charte graphique (à affiner avec les fichiers source Keynote)

- **Fond général / carte** : crème très clair (ivoire), ex. `#F5EFDE` (à vérifier).
- **Noir** : texte, titres bold.
- **Couleurs de catégories** (valeurs approximatives à extraire des fichiers source pour être exactes) :
  - `stranger things` → orange vif (`~#F0501E`)
  - `mode machine` → bleu pétrole (`~#0F7EA3`)
  - `cash sans clash` → jaune moutarde (`~#F2C230`)
  - `ya quoi ?` → mauve/violet (`~#9C4F9C`)
  - `numero 10` → vert-bleu / teal (`~#2CA6A0`)
  - `bonus` → beige doré / camel (`~#C7A06E`)
  - `joker` → bleu-gris grisé (`~#8CACB6`)
- **Typographies** (identification visuelle, à confirmer) :
  - Un sans-serif **condensé / bold** très noir pour les titres de défis et les headers de section (« CARTES », « LE SELFIE »...) — proche d'Archivo Black / Poppins ExtraBold.
  - Un sans-serif **arrondi et doux** pour le corps de texte et le wordmark « AURA » (lettres espacées) — proche de Quicksand / Baloo / Nunito.
- **Iconographie** : pictogrammes noirs simples (ligne pleine), un par défi, thématiques (appareil photo, hameçon, mains, stade, téléphone, flamme, haltère, flocon, nageur, casque, guitare, cerveau, tirelire, etc.)
- **Personnage** : illustration récurrente au crayon (line art) d'un ado en mouvement (parkour/skate), décliné dans toutes les couleurs de catégorie, utilisé comme identité visuelle du jeu (couvertures, versos, jokers).

> ⚠️ Pour une réplique pixel-perfect, il faudra récupérer les fichiers sources (Keynote mentionné dans le PDF) pour les codes couleur exacts, la police exacte et les tracés d'icônes/illustrations en vectoriel.

## 4. Règles du jeu (carte règles)

1. Décide quand tu veux réaliser un défi.
2. Choisis la catégorie du jour.
3. Ta team choisit un défi parmi les non réalisés.
4. Ta team valide le défi ou le remet en jeu.
5. Collectionne des points et obtiens des surprises.

*(note sur la carte : « tu as quelques jokers... au cas où »)*

## 5. Les catégories

| Catégorie | Couleur | Sens / compétence visée |
|---|---|---|
| **stranger things** | orange | dépasser la gêne de parler aux inconnus |
| **mode machine** | bleu | se sentir fier de ses capacités physiques |
| **cash sans clash** | jaune | affirmer ses goûts, faire ses propres choix |
| **ya quoi ?** | violet | ne pas se cacher, être remarqué, s'afficher |
| **numero 10** | teal | prendre le lead, décider pour le groupe |
| **bonus** *(hors des 5 « officielles »)* | camel | défis transverses/wildcard (ex. gestion du temps, dire oui) |

## 6. Catalogue des défis recensés

> Défis identifiés dans le PDF source, avec leur valeur en points. Cette liste sert de **contenu de référence** pour peupler l'app (peut être complétée/corrigée par le fichier source si des cartes manquent).

### 🟠 stranger things (8 défis)
| Défi | Description | Points |
|---|---|---|
| Le Selfie | Prends un selfie avec un inconnu dans la rue. Débrouille-toi comme tu veux pour l'aborder, mais il faut une photo, et il faut le sourire. | +800 |
| La Pêche aux Infos | Va pêcher une anecdote sur 3 nouveaux élèves à la rentrée. Lance la conversation, écoute activement, et ramène l'info. | +600 |
| La Deuxième Balle | Réécris à quelqu'un que tu as perdu de vue. Sans raison, juste pour prendre de ses nouvelles. | +200 |
| Elle a pas dit bonjour ! | Dis bonjour à tous ceux que tu croises sur un trajet dans Boulogne. Tous, sans exception, comme en randonnée. | +400 |
| L'Arène | Repère un groupe de ton âge et va leur demander une info : une adresse, un chemin, l'heure d'un truc. Le but : oser aller vers plusieurs personnes à la fois, pas juste une. | +900 |
| Le Mode Multijoueur | Intègre-toi dans un groupe que tu ne connais pas pour jouer au basket ou au foot. | +600 |
| L'Appel Pratique | Appelle un commerce, une association pour demander une info : horaires, disponibilité, tarifs. Le but est d'obtenir un maximum de détails. | +500 |
| L'Appel de Secours | Trouve un moyen d'appeler tes parents sans utiliser ton téléphone ni ton argent. | +800 |

### 🔵 mode machine (6 défis)
| Défi | Description | Points |
|---|---|---|
| Parkour Mode | Franchis tous les obstacles sur ton passage en mode parkour pendant 1h. Ne contourne rien ! | +600 |
| Le Grand Saut | Saute du plongeoir de 5m dans une piscine. Tu as le droit de crier si c'est flippant ou de viser le 10m si c'est trop facile. | +900 |
| Le Salto | Fais un salto, avec ou sans élan, sans aide, au premier essai. (Choisis quand même le bon terrain pour ne pas te faire mal.) | +1200 |
| Pull Up Week | Fais ton max de tractions chaque jour, en une seule fois, pendant toute une semaine. | +500 |
| La Douche Froide | À la fin de ta douche, une minute sous l'eau froide. Vraiment froide. Zéro triche, zéro négociation avec toi-même. | +400 |
| La Nage de Champion | Nage 1km, en piscine, en 23min. C'est à ta portée en brasse mais si tu te mettais au crawl ce serait vraiment un temps très facile ! Entraîne-toi. | +600 |

### 🟡 cash sans clash (6 défis)
| Défi | Description | Points |
|---|---|---|
| Le Bon Choix | Donne toujours un avis ou un choix. Pendant une journée entière, tu as l'interdiction de répondre « je sais pas » aux questions qui te sont posées. | +400 |
| Tarte au Concombre | Choisis uniquement des aliments nouveaux, que tu n'as jamais goûtés sur toute une journée. | +500 |
| La Patate Douce | Révèle à tes parents un plat, un lieu ou une activité que tu détestes en secret depuis longtemps. Ça doit être une vraie surprise. | +300 |
| Le Poulet à la Menthe | Zappe un dimanche à Montesson pour faire un truc pour toi. Pas de raison majeure, juste tes arguments et l'accord de Maman. | +700 |
| No Filter | Dis la vérité toute la journée, ce que tu penses vraiment, avec politesse, mais sans ménager les susceptibilités. | +500 |
| La Playlist Assumée | Mets ta musique, celle que t'écoutes vraiment, pas celle pour faire style, dans la voiture ou à table en famille. Tu ne la coupes pas, même si on te charrie. | +200 |

### 🟣 ya quoi ? (6 défis)
| Défi | Description | Points |
|---|---|---|
| Le Pitch | Prépare un pitch d'une minute pour te présenter à un groupe : une anecdote, un peu d'autodérision. Défi validé si ton pitch donne envie de déj avec toi. | +500 |
| Le Métro | Traverse une rame de métro bondée d'un bout à l'autre avant la prochaine station, en t'excusant pour te frayer un chemin. | +400 |
| Le Look | Laisse Marianne te construire un look, et assume-le toute la journée. Avec fierté, pas en traînant les pieds. | +600 |
| Le Détail Qui Tue Pas | Sors avec un truc qui ne passe pas inaperçu : couleur flashy, motif improbable, accessoire décalé. Toute la journée, si on te pose la question, tu assumes, sans te justifier. | +500 |
| Live From The Parc | Joue de la guitare dans un lieu public. Ce n'est pas un concert, juste le kiff de jouer pour soi... avec du monde autour. | +900 |
| Zéro Miroir | Prépare-toi et pars sans un seul coup d'œil dans un miroir, une vitre ou ton reflet sur ton téléphone. Toute la matinée, tu avances sans vérifier, et tu assumes la tête que t'as. | +600 |

### 🟢 numero 10 (7 défis)
| Défi | Description | Points |
|---|---|---|
| Le Road Trip | Choisis la prochaine destination du road trip, dans un rayon de 300km. Tu dois tenir compte du budget quotidien, de la disponibilité de l'hôtel et de l'intérêt du spot. | +500 |
| Le Menu | Passe la commande au restaurant pour toute la table avec assurance et décontraction. | +300 |
| Allez, tu fiens ? | À ton tour de convaincre tes potes d'aller là où ils ne seraient pas aller sans toi. Choisis tes arguments mais c'est toi qui gagnes ! | +500 |
| La Carte Blanche | Guide toute la journée comme tu l'entends. Tu as un budget de 150€ pour organiser une sortie avec Marianne et Papa, y compris transports, repas... | +700 |
| Le Birthday Planner | Organise ton anniv entre potes de bout en bout : lieu, invités, heure, rendez-vous. Zéro logistique laissée au hasard. Crédit de 150€ offert. | +600 |
| La Charge Mentale | Prends en charge, seul, une tâche de la maison que tu n'as jamais faite : les courses de la semaine, un bricolage, autre chose. Tu gères de A à Z et tu nous dis de quoi tu as besoin. | +500 |
| Le P'tit Business | Vends un premier truc sur internet, de l'annonce jusqu'à la remise en main propre. Tu peux poser des questions à ceux qui savent, mais c'est toi qui écris l'annonce, qui négocies, et qui conclus. | +800 |

### 🟤 bonus (2 défis)
| Défi | Description | Points |
|---|---|---|
| Zen Express | Douche, fringues, sac : tout bouclé en moins de 15 minutes, chrono en main. Mais interdiction de stresser ou de gueuler sur qui que ce soit. Vitesse et calme, en même temps. | +600 |
| Oui Oui | Dis oui à toutes les propositions qui te sont faites dans la journée. N'aie crainte, ta team sera bienveillante envers toi. | +600 |

### 🃏 Cartes joker (usage unique)
| Joker | Effet |
|---|---|
| Switch | Ce défi ne te tente pas ? Pioche une autre carte de la même catégorie. |
| Boomerang | Ce défi ne sera pas pour toi. Refile-le à un membre de ta team, qui le fera à ta place ! |
| Flemme | Pas la motivation... Ce défi attendra demain. |

## 7. Vision fonctionnelle de l'app React

L'app doit être un **miroir fidèle** du jeu de cartes (mêmes contenus/catégories/défis/visuels) **augmenté d'une couche de gamification numérique** :

### Fonctionnalités « miroir » (fidélité au jeu physique)
- Reproduction des 5 catégories + bonus, avec leurs couleurs, icônes et intitulés exacts.
- Cartes défis fidèles visuellement (bandeau coloré, titre, description, points, wordmark).
- Système de pioche par catégorie (tirer un défi parmi les non-réalisés d'une catégorie choisie).
- Jokers (Switch / Boomerang / Flemme) utilisables une fois chacun.
- Possibilité d'ajouter des défis personnalisés (équivalent des cartes vierges).

### Fonctionnalités de gamification (valeur ajoutée numérique)
- **Suivi de progression** : statut de chaque défi (à faire / en cours / à valider / validé / refusé-remis en jeu).
- **Système de points/score** total et par catégorie, avec une notion de niveau ou de « jauge d'Aura ».
- **Validation** : qui valide le défi ? (rôle « team » = parents/proches ? système de validation avec preuve photo/note ?)
- **Badges / récompenses** : équivalent numérique des stickers (déblocables par défi validé, par catégorie complétée à 100%, par streaks...)
- **Historique / journal** des défis relevés (façon « carnet de bord »)
- **Statistiques** : répartition par catégorie, progression dans le temps, défis favoris/évités.
- **Notifications / rappels** éventuels.
- **Mode multi-joueur / partage** éventuel (comparer avec des amis) — à valider avec l'utilisateur.

## 8. Points ouverts à clarifier avant de démarrer le développement

1. **Utilisateur(s) cible** : app mono-utilisateur (Lucas) ou multi-comptes (fratrie/amis) ?
2. **Rôle de la « team »** : validation des défis par un parent (compte séparé) ou auto-déclaratif ?
3. **Preuves** : upload photo/texte pour valider un défi, ou simple case à cocher ?
4. **Récompenses** : les « surprises » évoquées dans les règles doivent-elles être configurables (récompenses réelles définies par les parents) ?
5. **Persistance** : stockage local uniquement (le jeu reste privé/familial) ou backend avec compte ?
6. **Fidélité graphique exacte** : accès aux fichiers sources (Keynote / assets stickers-boîte) pour récupérer couleurs exactes, police, icônes vectorielles ?
7. **Contenu complet** : valider si tous les défis du PDF ont bien été capturés ci-dessus (certaines pages non visibles à 100% pourraient contenir des variantes).

## 9. Proposition de stack technique (à valider)

- **React** + **Vite** (SPA légère)
- **TypeScript** pour la robustesse des données de contenu (défis, catégories)
- Contenu des défis en **JSON/TS** structuré (catégorie, couleur, icône, titre, description, points) — facilement enrichissable
- **Tailwind CSS** pour matcher rapidement la charte graphique (couleurs custom par catégorie)
- **localStorage** (ou IndexedDB) pour la persistance côté client dans un premier temps, migration possible vers un backend léger (Supabase/Firebase) si multi-device/compte est souhaité

---

*Prochaine étape suggérée : valider les points ouverts (section 8) avec l'utilisateur, puis définir l'arborescence des écrans (accueil, pioche par catégorie, détail défi, profil/progression, historique) avant de démarrer le scaffolding React.*
