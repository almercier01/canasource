import { EditBusinessForm } from "../components/EditBusinessForm";

export const translations = {
  siteTitle: {
    en: 'CanaSource - Discover Canadian Local Offers',
    fr: 'CanaSource - Découvrez les Offres Locales Canadiennes'
  },
  search: {
    title: {
      en: 'Search Offers',
      fr: 'Rechercher des Offres'
    },
    whatLookingFor: {
      en: 'What are you looking for?',
      fr: 'Que recherchez-vous ?'
    },
    searchPlaceholder: {
      en: 'Enter name, products, or services...',
      fr: 'Entrez le nom, les produits ou les services...'
    },
    province: {
      en: 'Province',
      fr: 'Province'
    },
    allProvinces: {
      en: 'All Provinces and Territories',
      fr: 'Toutes les Provinces et Territoires'
    },
    category: {
      en: 'Category',
      fr: 'Catégorie'
    },
    allCategories: {
      en: 'All Categories',
      fr: 'Toutes les Catégories'
    },
    noResults: {
      en: 'No offers found matching your criteria',
      fr: 'Aucune offre trouvée correspondant à vos critères'
    },
    searchButton: {
      en: 'Search',
      fr: 'Rechercher'
    },
    criteriaRequired: {
      en: 'Please enter search criteria',
      fr: 'Veuillez entrer des critères de recherche'
    },
    selectProvince: {
      en: 'Select province',
      fr: 'Sélectionner une province'
    },
    selectCategory: {
      en: 'Select category',
      fr: 'Sélectionner une catégorie'
    }
  },
  categories: {
    'Artisans & Crafts': { en: 'Artisans & Crafts', fr: 'Artisanat et Métiers' },
    'Food & Beverage': { en: 'Food & Beverage', fr: 'Alimentation et Boissons' },
    'Health & Wellness': { en: 'Health & Wellness', fr: 'Santé et Bien-être' },
    'Home & Garden': { en: 'Home & Garden', fr: 'Maison et Jardin' },
    'Professional Services': { en: 'Professional Services', fr: 'Services Professionnels' },
    Retail: { en: 'Retail', fr: 'Commerce de Détail' },
    Technology: { en: 'Technology', fr: 'Technologie' },
    Other: { en: 'Other', fr: 'Autre' },
  } as Record<string, { en: string; fr: string }>,  // ✅ Fix added here
  provinces: {
    'Alberta': {
      en: 'Alberta',
      fr: 'Alberta'
    },
    'British Columbia': {
      en: 'British Columbia',
      fr: 'Colombie-Britannique'
    },
    'Manitoba': {
      en: 'Manitoba',
      fr: 'Manitoba'
    },
    'New Brunswick': {
      en: 'New Brunswick',
      fr: 'Nouveau-Brunswick'
    },
    'Newfoundland and Labrador': {
      en: 'Newfoundland and Labrador',
      fr: 'Terre-Neuve-et-Labrador'
    },
    'Nova Scotia': {
      en: 'Nova Scotia',
      fr: 'Nouvelle-Écosse'
    },
    'Ontario': {
      en: 'Ontario',
      fr: 'Ontario'
    },
    'Prince Edward Island': {
      en: 'Prince Edward Island',
      fr: 'Île-du-Prince-Édouard'
    },
    'Quebec': {
      en: 'Quebec',
      fr: 'Québec'
    },
    'Saskatchewan': {
      en: 'Saskatchewan',
      fr: 'Saskatchewan'
    },
    'Northwest Territories': {
      en: 'Northwest Territories',
      fr: 'Territoires du Nord-Ouest'
    },
    'Nunavut': {
      en: 'Nunavut',
      fr: 'Nunavut'
    },
    'Yukon': {
      en: 'Yukon',
      fr: 'Yukon'
    }
  }as Record<string, { en: string; fr: string }>,  // ✅ Fix added here
  about: {
    title: {
      en: 'About CanaSource',
      fr: 'À propos de CanaSource'
    },
    description: {
      en: 'CanaSource is a platform dedicated to connecting Canadian consumers with local offers, fostering community growth and supporting local economies.',
      fr: 'CanaSource est une plateforme dédiée à la connexion des consommateurs canadiens avec des offres locales, favorisant la croissance des communautés et soutenant les économies locales.'
    },
    mission: {
      title: {
        en: 'Our Mission',
        fr: 'Notre Mission'
      },
      description: {
        en: 'We strive to create a vibrant marketplace where local offers can thrive and where consumers can easily discover and support their local community.',
        fr: 'Nous visons à créer un marché dynamique où les offres locales peuvent prospérer et où les consommateurs peuvent facilement découvrir et soutenir leur communauté locale.'
      }
    },
    values: {
      title: {
        en: 'Our Values',
        fr: 'Nos Valeurs'
      },
      items: [
        {
          en: 'Community First: Supporting local economic growth and development',
          fr: 'Communauté avant tout : Soutenir la croissance et le développement économique local'
        },
        {
          en: 'Transparency: Building trust through open communication',
          fr: 'Transparence : Bâtir la confiance grâce à une communication ouverte'
        },
        {
          en: 'Sustainability: Promoting environmentally conscious local commerce',
          fr: 'Durabilité : Promouvoir un commerce local respectueux de l\'environnement'
        },
        {
          en: 'Innovation: Continuously improving our platform to better serve our community',
          fr: 'Innovation : Améliorer continuellement notre plateforme pour mieux servir notre communauté'
        }
      ]
    }
  },

  status: {
    pending: {
      en: 'Pending Approval',
      fr: 'En attente d\'approbation'
    },
    approved: {
      en: 'Approved',
      fr: 'Approuvée'
    },
    rejected: {
      en: 'Rejected',
      fr: 'Rejetée'
    }
  },
  register: {
    en: 'Register Offer',
    fr: 'Inscrire une Offre',
    title: {
      en: 'Register Your Offer',
      fr: 'Inscrivez Votre Offre'
    },
    success: {
      en: 'Your offer has been successfully registered!',
      fr: 'Votre offre a été enregistrée avec succès!'
    },
    businessName: {
      en: 'Name',
      fr: 'Nom'
    },
    businessNamePlaceholder: {
      en: 'Enter name',
      fr: 'Entrez le nom'
    },
    address: {
      en: 'Street Address',
      fr: 'Adresse'
    },
    addressPlaceholder: {
      en: 'Enter street address',
      fr: 'Entrez l\'adresse'
    },
    descriptionEn: {
      en: 'Description (English)',
      fr: 'Description (Anglais)'
    },
    descriptionFr: {
      en: 'Description (French)',
      fr: 'Description (Français)'
    },
    descriptionPlaceholder: {
      en: 'Describe your offer...',
      fr: 'Décrivez votre offre...'
    },
    category: {
      en: 'Category',
      fr: 'Catégorie'
    },
    selectCategory: {
      en: 'Select a category',
      fr: 'Sélectionnez une catégorie'
    },
    province: {
      en: 'Province',
      fr: 'Province'
    },
    selectProvince: {
      en: 'Select a province',
      fr: 'Sélectionnez une province'
    },
    city: {
      en: 'City',
      fr: 'Ville'
    },
    cityPlaceholder: {
      en: 'Enter city name',
      fr: 'Entrez le nom de la ville'
    },
    products: {
      en: 'Products',
      fr: 'Produits'
    },
    productsPlaceholder: {
      en: 'e.g., Furniture, Home Decor, Custom Pieces',
      fr: 'ex: Meubles, Décoration, Pièces sur mesure'
    },
    services: {
      en: 'Services',
      fr: 'Services'
    },
    servicesPlaceholder: {
      en: 'e.g., Custom Design, Installation, Restoration',
      fr: 'ex: Design personnalisé, Installation, Restauration'
    },
    website: {
      en: 'Website',
      fr: 'Site Web'
    },
    websitePlaceholder: {
      en: 'https://example.com',
      fr: 'https://exemple.com'
    },
    phone: {
      en: 'Phone',
      fr: 'Téléphone'
    },
    email: {
      en: 'Email',
      fr: 'Courriel'
    },
    phonePlaceholder: {
      en: '(123) 456-7890',
      fr: '(123) 456-7890'
    },
    submit: {
      en: 'Register Offer',
      fr: 'Inscrire l\'offre'
    }
  },
  editBusiness: {
    title: {
      en: 'Update your listing',
      fr: 'Mettre à jour votre offre'
    },
  },
  fetching: {
    en: 'Fetching boutique details...',
    fr: 'Chargement des détails de la boutique...'
  },
  mission: {
    en: 'Empowering Canadian communities by connecting local offers with conscious consumers.',
    fr: 'Favoriser l\'autonomie des communautés canadiennes en connectant les offres locales avec des consommateurs engagés.'
  },
  hero: {
    title1: {
      en: 'Discover Local Sourcing',
      fr: 'Découvrez l\'achat local'
    },
    title2: {
      en: 'Support Canadian Businesses',
      fr: 'Soutenez les Entreprises Canadiennes'
    },
    exploreButton: {
      en: 'Explore Offers',
      fr: 'Explorer les Offres'
    }
  },
  dashboard: {
    overview: { en: 'Overview', fr: 'Aperçu' },
    reports: { en: 'Reports', fr: 'Rapports' },
    images: { en: 'Images', fr: 'Images' },
    settings: { en: 'Settings', fr: 'Paramètres' },

    totalBusinesses: { en: 'Total Businesses', fr: 'Entreprises totales' },
    totalReports: { en: 'Total Reports', fr: 'Rapports totaux' },
    pendingReports: { en: 'Pending Reports', fr: 'Rapports en attente' },
    resolvedReports: { en: 'Resolved Reports', fr: 'Rapports résolus' },
    pendingImages: { en: 'Pending Images', fr: 'Images en attente' },
    noReports: { en: 'No reports found', fr: 'Aucun rapport trouvé' },
    noPendingItems: { en: 'No pending items', fr: 'Aucun élément en attente' },

    // MISSING KEYS:
    tabs: {  // "tabs" object for each route name
      overview: { en: 'Overview', fr: 'Aperçu' },
      reports: { en: 'Reports', fr: 'Rapports' },
      images: { en: 'Images', fr: 'Images' },
      settings: { en: 'Settings', fr: 'Paramètres' }
    },
    unknownBusiness: { en: 'Unknown Business', fr: 'Entreprise inconnue' },
    approve: { en: 'Approve', fr: 'Approuver' },
    reject: { en: 'Reject', fr: 'Rejeter' },
    settingsDescription: {
      en: 'Configure your site settings here',
      fr: 'Configurez les paramètres du site ici'
    },
  },
  nav: {
    search: {
      en: 'Search offers...',
      fr: 'Rechercher des offres...'
    },
    backToHome: {
      en: 'Back to Home',
      fr: 'Retour à l\'accueil'
    },
    about: {
      en: 'About',
      fr: 'À propos'
    },
    contact: {
      en: 'Contact',
      fr: 'Contact'
    }
  },
  auth: {
    signInRequired: {
      en: 'Please sign in to register your offer',
      fr: 'Veuillez vous connecter pour inscrire votre offre'
    }
  },
  errors: {
    fetchingBoutique: {
      en: 'Error fetching boutique details. Please try again.',
      fr: 'Erreur lors du chargement des détails de la boutique. Veuillez réessayer.'
    },
    creatingBoutique: {
      en: 'Error creating boutique. Please try again.',
      fr: 'Erreur lors de la création de la boutique. Veuillez réessayer.'
    },
    authRequired: {
      en: 'You must be logged in to create a boutique.',
      fr: 'Vous devez être connecté pour créer une boutique.'
    },
    generic: {
      en: 'An error occurred',
      fr: 'Une erreur s\'est produite'
    },
    addressRequired: {
      en: 'Street address is required',
      fr: 'L\'adresse est requise'
    },
    coordinatesNotFound: {
      en: 'Coordinates not found',
      fr: 'Les coordonnées n\'ont pas été trouvées'
    },
    businessNotFound: {
      en: 'Business not found',
      fr: 'L\'entreprise n\'a pas été trouvé'
    },
    userNotFound: {
      en: 'User not found',
      fr: 'L\'utilisateur n\'a pas été trouvé'
    }
  },

  boutique: {
    defaultName: {
      en: 'New Boutique',
      fr: 'Nouvelle boutique'
    },
    defaultDescription: {
      en: 'A new boutique to showcase your products and services',
      fr: 'Une nouvelle boutique pour présenter vos produits et services'
    },
    title: {
      en: 'My Boutique',
      fr: 'Ma boutique'
    },
    create: {
      en: 'Create Boutique',
      fr: 'Créer une boutique'
    },
    confirmCreate: {
      en: 'Confirm Boutique Creation',
      fr: 'Confirmer la création de la boutique'
    },
    createNow: {
      en: 'Create Now',
      fr: 'Créer maintenant'
    },
    createLater: {
      en: 'Create Later',
      fr: 'Créer plus tard'
    },
    noBoutique: {
      en: 'You have not created a boutique yet.',
      fr: 'Vous n\'avez pas encore créé de boutique.'
    },
    status: {
      pending: {
        en: 'Pending',
        fr: 'En attente'
      },
      approved: {
        en: 'Approved',
        fr: 'Approuvé'
      },
      rejected: {
        en: 'Rejected',
        fr: 'Rejeté'
      }
    }
  },


  common: {
    cancel: {
      en: 'Cancel',
      fr: 'Annuler'
    },
    back: {
      en: 'Back',
      fr: 'Reculer'
    },
    processing: {
      en: 'Processing...',
      fr: 'Traitement...'
    },
    close: {
      en: 'Close',
      fr: 'Fermer'
    },
    save: {
      en: 'Save',
      fr: 'Sauvegarder'
    },
    loading: { en: 'Loading...', fr: 'Chargement...' }
  },
  featured: {
    en: 'Featured Offer',
    fr: 'Offre en Vedette'
  },
  contact: {
    title: {
      en: 'Contact Us',
      fr: 'Contactez-nous'
    },
    name: {
      en: 'Name',
      fr: 'Nom'
    },
    namePlaceholder: {
      en: 'Enter your name',
      fr: 'Entrez votre nom'
    },
    email: {
      en: 'Email',
      fr: 'Email'
    },
    emailPlaceholder: {
      en: 'Enter your email',
      fr: 'Entrez votre email'
    },
    message: {
      en: 'Message',
      fr: 'Message'
    },
    messagePlaceholder: {
      en: 'How can we help you?',
      fr: 'Comment pouvons-nous vous aider ?'
    },
    submit: {
      en: 'Send Message',
      fr: 'Envoyer le Message'
    },
    success: {
      en: 'Thank you for your message. We will get back to you soon!',
      fr: 'Merci pour votre message. Nous vous répondrons bientôt !'
    },
    error: {
      en: 'There was an error sending your message. Please try again.',
      fr: 'Une erreur s\'est produite lors de l\'envoi de votre message. Veuillez réessayer.'
    },
    sendAnother: {
      en: 'Send another message',
      fr: 'Envoyer un autre message'
    }
  },

  report: {
    signInRequired: {
      en: 'Please sign in to report a listing',
      fr: 'Veuillez vous connecter pour signaler une offre'
    },
    button: {
      en: 'Report Listing',
      fr: 'Signaler l\'annonce'
    },
    title: {
      en: 'Report Listing',
      fr: 'Signaler l\'annonce'
    },
    success: {
      en: 'Report sent',
      fr: 'Signalement envoyé'
    },
    reason: {
      en: 'Reason for Report',
      fr: 'Raison du signalement'
    },
    details: {
      en: 'Report details',
      fr: 'Détails du signalement'
    },
    detailsPlaceholder: {
      en: 'Report details',
      fr: 'Détails du signalement'
    },
    submit: {
      en: 'Submit Report',
      fr: 'Envoyé le Signalement'
    },
    reasons: {
      misleading_information: {
        en: 'Misleading Information',
        fr: 'Information trompeuse'
      },
      inappropriate_content: {
        en: 'Inappropriate Content',
        fr: 'Contenu inapproprié'
      },
      spam: {
        en: 'Spam or Advertising',
        fr: 'Spam ou publicité'
      },
      fraud: {
        en: 'Suspected Fraud',
        fr: 'Fraude suspectée'
      },
      other: {
        en: 'Other',
        fr: 'Autre'
      }
    }
  },
};
