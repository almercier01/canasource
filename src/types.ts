export interface Business {
  id: string;
  name: string;

  // Replaced the nested `description: { en, fr }` 
  // with two direct string fields:
  description_en: string;
  description_fr: string;

  category_en: string;
  category_fr: string;
  province_en: string;
  province_fr: string;

  city: string;
  address?: string;

  // Instead of `coordinates.lat/lng`, 
  // store lat and lng directly as numeric fields:
  lat?: number;
  lng?: number;

  rating: number;
  reviewCount: number;

  // products and services are typically arrays of strings
  // (assuming your code is parsing JSON into an array).
  products: string[];
  services: string[];

  website?: string;
  phone?: string;
  email?: string;

  // Rename `imageUrl` to `image_url` to match the DB column
  image_url?: string;

  image_status?: string;

  // If you need to track the owner user:
  owner_id?: string;

  issample?: boolean;
  about_en?: string;
  about_fr?: string;
  languages: string[];
}

export type Language = 'en' | 'fr';

export interface LocaleStrings {
  [key: string]: {
    en: string;
    fr: string;
  };
}

export interface SiteConfig {
  country: string;
  currency: string;
  googleMapsApiKey: string;
  initialized: boolean;
}

export interface AdminState {
  isAuthenticated: boolean;
  user?: any;
}
export interface HeaderProps {
  language: Language;
  setLanguage: (language: Language) => void;
  config: SiteConfig | null;
  onUpdateConfig: (config: SiteConfig) => void;
  adminState: AdminState;
  onAdminLogin: (email: string, password: string) => Promise<boolean>;  // ✅ Update here
  onAdminLogout: () => void;
  onRegisterClick: () => void;
  onAdminDashboardClick: () => void;
  onSearch: (term?: string) => void;
  onNavigate: (page: 'home' | 'about' | 'contact' | 'create-boutique') => void;
}


export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  error: string | null;
}

export const PROVINCES = {
  AB: { en: 'Alberta', fr: 'Alberta' },
  BC: { en: 'British Columbia', fr: 'Colombie-Britannique' },
  MB: { en: 'Manitoba', fr: 'Manitoba' },
  NB: { en: 'New Brunswick', fr: 'Nouveau-Brunswick' },
  NL: { en: 'Newfoundland and Labrador', fr: 'Terre-Neuve-et-Labrador' },
  NS: { en: 'Nova Scotia', fr: 'Nouvelle-Écosse' },
  ON: { en: 'Ontario', fr: 'Ontario' },
  PE: { en: 'Prince Edward Island', fr: 'Île-du-Prince-Édouard' },
  QC: { en: 'Quebec', fr: 'Québec' },
  SK: { en: 'Saskatchewan', fr: 'Saskatchewan' },
  NT: { en: 'Northwest Territories', fr: 'Territoires du Nord-Ouest' },
  YT: { en: 'Yukon', fr: 'Yukon' },
  NU: { en: 'Nunavut', fr: 'Nunavut' }
};

export type ProvinceCode = keyof typeof PROVINCES;

export type ProvinceTranslations = {
  en: string;
  fr: string;
};

export interface Boutique {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  owner_id: string;
}

export interface BoutiqueProps {
  language: Language;
  onClose: () => void;
}

export const CATEGORIES = [
  'Artisans & Crafts',
  'Food & Beverage',
  'Health & Wellness',
  'Home & Garden',
  'Professional Services',
  'Retail',
  'Technology',
  'Other'
] as const;

export type Category = typeof CATEGORIES[number];