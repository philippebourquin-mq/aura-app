import type { Challenge } from '../types'

export const challenges: Challenge[] = [
  // stranger things
  {
    id: 'st-selfie',
    categoryId: 'stranger-things',
    title: 'Le Selfie',
    description:
      "Prends un selfie avec un inconnu dans la rue. Débrouille-toi comme tu veux pour l'aborder, mais il faut une photo, et il faut le sourire.",
    points: 800,
  },
  {
    id: 'st-peche-aux-infos',
    categoryId: 'stranger-things',
    title: 'La Pêche aux Infos',
    description:
      'Va pêcher une anecdote sur 3 nouveaux élèves à la rentrée. Lance la conversation, écoute activement, et ramène l\'info.',
    points: 600,
  },
  {
    id: 'st-deuxieme-balle',
    categoryId: 'stranger-things',
    title: 'La Deuxième Balle',
    description:
      "Réécris à quelqu'un que tu as perdu de vue. Sans raison, juste pour prendre de ses nouvelles.",
    points: 200,
  },
  {
    id: 'st-elle-a-pas-dit-bonjour',
    categoryId: 'stranger-things',
    title: 'Elle a pas dit bonjour !',
    description:
      'Dis bonjour à tous ceux que tu croises sur un trajet. Tous, sans exception, comme en randonnée.',
    points: 400,
  },
  {
    id: 'st-arene',
    categoryId: 'stranger-things',
    title: "L'Arène",
    description:
      "Repère un groupe de ton âge et va leur demander une info : une adresse, un chemin, l'heure d'un truc. Le but : oser aller vers plusieurs personnes à la fois, pas juste une.",
    points: 900,
  },
  {
    id: 'st-mode-multijoueur',
    categoryId: 'stranger-things',
    title: 'Le Mode Multijoueur',
    description:
      'Intègre-toi dans un groupe que tu ne connais pas pour jouer au basket ou au foot.',
    points: 600,
  },
  {
    id: 'st-appel-pratique',
    categoryId: 'stranger-things',
    title: "L'Appel Pratique",
    description:
      'Appelle un commerce, une association pour demander une info : horaires, disponibilité, tarifs. Le but est d\'obtenir un maximum de détails.',
    points: 500,
  },
  {
    id: 'st-appel-de-secours',
    categoryId: 'stranger-things',
    title: "L'Appel de Secours",
    description:
      'Trouve un moyen d\'appeler tes parents sans utiliser ton téléphone ni ton argent.',
    points: 800,
  },

  // mode machine
  {
    id: 'mm-parkour-mode',
    categoryId: 'mode-machine',
    title: 'Parkour Mode',
    description:
      'Franchis tous les obstacles sur ton passage en mode parkour pendant 1h. Ne contourne rien !',
    points: 600,
  },
  {
    id: 'mm-grand-saut',
    categoryId: 'mode-machine',
    title: 'Le Grand Saut',
    description:
      "Saute du plongeoir de 5m dans une piscine. Tu as le droit de crier si c'est flippant ou de viser le 10m si c'est trop facile.",
    points: 900,
  },
  {
    id: 'mm-salto',
    categoryId: 'mode-machine',
    title: 'Le Salto',
    description:
      'Fais un salto, avec ou sans élan, sans aide, au premier essai. (Choisis quand même le bon terrain pour ne pas te faire mal.)',
    points: 1200,
  },
  {
    id: 'mm-pull-up-week',
    categoryId: 'mode-machine',
    title: 'Pull Up Week',
    description:
      'Fais ton max de tractions chaque jour, en une seule fois, pendant toute une semaine.',
    points: 500,
  },
  {
    id: 'mm-douche-froide',
    categoryId: 'mode-machine',
    title: 'La Douche Froide',
    description:
      'À la fin de ta douche, une minute sous l\'eau froide. Vraiment froide. Zéro triche, zéro négociation avec toi-même.',
    points: 400,
  },
  {
    id: 'mm-nage-de-champion',
    categoryId: 'mode-machine',
    title: 'La Nage de Champion',
    description:
      "Nage 1km, en piscine, en 23min. C'est à ta portée en brasse mais si tu te mettais au crawl ce serait vraiment un temps très facile ! Entraîne-toi.",
    points: 600,
  },

  // cash sans clash
  {
    id: 'csc-bon-choix',
    categoryId: 'cash-sans-clash',
    title: 'Le Bon Choix',
    description:
      "Donne toujours un avis ou un choix. Pendant une journée entière, tu as l'interdiction de répondre « je sais pas » aux questions qui te sont posées.",
    points: 400,
  },
  {
    id: 'csc-tarte-au-concombre',
    categoryId: 'cash-sans-clash',
    title: 'Tarte au Concombre',
    description:
      "Choisis uniquement des aliments nouveaux, que tu n'as jamais goûtés sur toute une journée.",
    points: 500,
  },
  {
    id: 'csc-patate-douce',
    categoryId: 'cash-sans-clash',
    title: 'La Patate Douce',
    description:
      'Révèle à tes parents un plat, un lieu ou une activité que tu détestes en secret depuis longtemps. Ça doit être une vraie surprise.',
    points: 300,
  },
  {
    id: 'csc-poulet-a-la-menthe',
    categoryId: 'cash-sans-clash',
    title: 'Le Poulet à la Menthe',
    description:
      "Zappe un rendez-vous familial habituel pour faire un truc pour toi. Pas de raison majeure, juste tes arguments et l'accord d'un parent.",
    points: 700,
  },
  {
    id: 'csc-no-filter',
    categoryId: 'cash-sans-clash',
    title: 'No Filter',
    description:
      'Dis la vérité toute la journée, ce que tu penses vraiment, avec politesse, mais sans ménager les susceptibilités.',
    points: 500,
  },
  {
    id: 'csc-playlist-assumee',
    categoryId: 'cash-sans-clash',
    title: 'La Playlist Assumée',
    description:
      "Mets ta musique, celle que t'écoutes vraiment, pas celle pour faire style, dans la voiture ou à table en famille. Tu ne la coupes pas, même si on te charrie.",
    points: 200,
  },

  // ya quoi ?
  {
    id: 'yq-pitch',
    categoryId: 'ya-quoi',
    title: 'Le Pitch',
    description:
      "Prépare un pitch d'une minute pour te présenter à un groupe : une anecdote, un peu d'autodérision. Défi validé si ton pitch donne envie de déj avec toi.",
    points: 500,
  },
  {
    id: 'yq-metro',
    categoryId: 'ya-quoi',
    title: 'Le Métro',
    description:
      "Traverse une rame de métro bondée d'un bout à l'autre avant la prochaine station, en t'excusant pour te frayer un chemin.",
    points: 400,
  },
  {
    id: 'yq-look',
    categoryId: 'ya-quoi',
    title: 'Le Look',
    description:
      "Laisse quelqu'un te construire un look, et assume-le toute la journée. Avec fierté, pas en traînant les pieds.",
    points: 600,
  },
  {
    id: 'yq-detail-qui-tue-pas',
    categoryId: 'ya-quoi',
    title: 'Le Détail Qui Tue Pas',
    description:
      'Sors avec un truc qui ne passe pas inaperçu : couleur flashy, motif improbable, accessoire décalé. Toute la journée, si on te pose la question, tu assumes, sans te justifier.',
    points: 500,
  },
  {
    id: 'yq-live-from-the-parc',
    categoryId: 'ya-quoi',
    title: 'Live From The Parc',
    description:
      "Joue de la guitare dans un lieu public. Ce n'est pas un concert, juste le kiff de jouer pour soi... avec du monde autour.",
    points: 900,
  },
  {
    id: 'yq-zero-miroir',
    categoryId: 'ya-quoi',
    title: 'Zéro Miroir',
    description:
      "Prépare-toi et pars sans un seul coup d'œil dans un miroir, une vitre ou ton reflet sur ton téléphone. Toute la matinée, tu avances sans vérifier, et tu assumes la tête que t'as.",
    points: 600,
  },

  // numero 10
  {
    id: 'n10-road-trip',
    categoryId: 'numero-10',
    title: 'Le Road Trip',
    description:
      "Choisis la prochaine destination d'une sortie, dans un rayon de 300km. Tu dois tenir compte du budget, de la disponibilité et de l'intérêt du spot.",
    points: 500,
  },
  {
    id: 'n10-menu',
    categoryId: 'numero-10',
    title: 'Le Menu',
    description:
      'Passe la commande au restaurant pour toute la table avec assurance et décontraction.',
    points: 300,
  },
  {
    id: 'n10-allez-tu-fiens',
    categoryId: 'numero-10',
    title: 'Allez, tu fiens ?',
    description:
      "À ton tour de convaincre tes potes d'aller là où ils ne seraient pas allés sans toi. Choisis tes arguments mais c'est toi qui gagnes !",
    points: 500,
  },
  {
    id: 'n10-carte-blanche',
    categoryId: 'numero-10',
    title: 'La Carte Blanche',
    description:
      'Guide toute la journée comme tu l\'entends. Tu as un budget donné pour organiser une sortie en famille, transports et repas compris.',
    points: 700,
  },
  {
    id: 'n10-birthday-planner',
    categoryId: 'numero-10',
    title: 'Le Birthday Planner',
    description:
      'Organise ton anniv entre potes de bout en bout : lieu, invités, heure, rendez-vous. Zéro logistique laissée au hasard.',
    points: 600,
  },
  {
    id: 'n10-charge-mentale',
    categoryId: 'numero-10',
    title: 'La Charge Mentale',
    description:
      "Prends en charge, seul, une tâche de la maison que tu n'as jamais faite. Tu gères de A à Z et tu dis de quoi tu as besoin.",
    points: 500,
  },
  {
    id: 'n10-ptit-business',
    categoryId: 'numero-10',
    title: 'Le P\'tit Business',
    description:
      "Vends un premier truc sur internet, de l'annonce jusqu'à la remise en main propre. Tu peux poser des questions à ceux qui savent, mais c'est toi qui écris l'annonce, qui négocies, et qui conclus.",
    points: 800,
  },

  // bonus
  {
    id: 'bonus-zen-express',
    categoryId: 'bonus',
    title: 'Zen Express',
    description:
      'Douche, fringues, sac : tout bouclé en moins de 15 minutes, chrono en main. Mais interdiction de stresser ou de gueuler sur qui que ce soit.',
    points: 600,
  },
  {
    id: 'bonus-oui-oui',
    categoryId: 'bonus',
    title: 'Oui Oui',
    description:
      "Dis oui à toutes les propositions qui te sont faites dans la journée. N'aie crainte, ta team sera bienveillante envers toi.",
    points: 600,
  },
]

export const challengesByCategory = (categoryId: string) =>
  challenges.filter((c) => c.categoryId === categoryId)
