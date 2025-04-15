import React, { useState, useEffect } from 'react';
import { Language } from '../../types';
import { X, Globe2 } from 'lucide-react';

interface TermsAndPrivacyProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  language: Language;
  standalone?: boolean;
}

export function TermsAndPrivacy({ isOpen, onClose, onAccept, language, standalone = false }: TermsAndPrivacyProps) {
  const [displayLanguage, setDisplayLanguage] = useState<Language>('en');

  useEffect(() => {
    if (isOpen) {
      setDisplayLanguage(language);
    }
  }, [isOpen, language]);
  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Terms of Use & Privacy Policy / Conditions d'utilisation et politique de confidentialité
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDisplayLanguage(displayLanguage === 'en' ? 'fr' : 'en')}
              className="flex items-center text-sm text-red-600 hover:text-red-700"
            >
              <Globe2 className="h-4 w-4 mr-1" />
              {displayLanguage === 'en' ? 'Voir en Français' : 'View in English'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="space-y-8">
            {/* Terms of Use */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {displayLanguage === 'en' ? 'Terms of Use' : 'Conditions d\'utilisation'}
              </h3>
              <div className="prose prose-sm max-w-none">
                {displayLanguage === 'en' ? (
                  <>
                    <p>Welcome to CanaSource (Beta). By using our service, you agree to these terms:</p>
                    <h4>1. Beta Status</h4>
                    <p>This is a beta version of CanaSource. Features and functionality may change without notice.</p>
                    
                    <h4>2. Account Registration</h4>
                    <p>You must provide accurate information when registering and keep your account secure.</p>
                    
                    <h4>3. Business Listings</h4>
                    <p>Business owners are responsible for:</p>
                    <ul>
                      <li>Providing accurate business information</li>
                      <li>Maintaining and updating their listings</li>
                      <li>Ensuring compliance with local laws and regulations</li>
                    </ul>
                    
                    <h4>4. Prohibited Content</h4>
                    <p>Users may not post content that is:</p>
                    <ul>
                      <li>False or misleading</li>
                      <li>Illegal or promotes illegal activities</li>
                      <li>Harmful, threatening, or discriminatory</li>
                      <li>Infringing on intellectual property rights</li>
                    </ul>
                    
                    <h4>5. Service Modifications</h4>
                    <p>We reserve the right to modify or discontinue any part of the service at any time.</p>
                  </>
                ) : (
                  <>
                    <p>Bienvenue sur CanaSource (Bêta). En utilisant notre service, vous acceptez ces conditions :</p>
                    <h4>1. Statut Bêta</h4>
                    <p>Il s'agit d'une version bêta de CanaSource. Les fonctionnalités peuvent changer sans préavis.</p>
                    
                    <h4>2. Inscription</h4>
                    <p>Vous devez fournir des informations exactes lors de l'inscription et sécuriser votre compte.</p>
                    
                    <h4>3. Annonces d'entreprises</h4>
                    <p>Les propriétaires d'entreprises sont responsables de :</p>
                    <ul>
                      <li>Fournir des informations exactes sur l'entreprise</li>
                      <li>Maintenir et mettre à jour leurs annonces</li>
                      <li>Assurer la conformité aux lois et règlements locaux</li>
                    </ul>
                    
                    <h4>4. Contenu Interdit</h4>
                    <p>Les utilisateurs ne peuvent pas publier de contenu :</p>
                    <ul>
                      <li>Faux ou trompeur</li>
                      <li>Illégal ou promouvant des activités illégales</li>
                      <li>Nuisible, menaçant ou discriminatoire</li>
                      <li>Violant les droits de propriété intellectuelle</li>
                    </ul>
                    
                    <h4>5. Modifications du Service</h4>
                    <p>Nous nous réservons le droit de modifier ou d'interrompre toute partie du service à tout moment.</p>
                  </>
                )}
              </div>
            </section>

            {/* Privacy Policy */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {displayLanguage === 'en' ? 'Privacy Policy' : 'Politique de confidentialité'}
              </h3>
              <div className="prose prose-sm max-w-none">
                {displayLanguage === 'en' ? (
                  <>
                    <h4>1. Information We Collect</h4>
                    <p>We collect information you provide, including:</p>
                    <ul>
                      <li>Account information (email, password)</li>
                      <li>Business information (name, address, contact details)</li>
                      <li>Usage data and interactions with the service</li>
                    </ul>

                    <h4>2. How We Use Your Information</h4>
                    <p>We use your information to:</p>
                    <ul>
                      <li>Provide and improve our services</li>
                      <li>Communicate with you about your account</li>
                      <li>Ensure platform safety and security</li>
                    </ul>

                    <h4>3. Information Sharing</h4>
                    <p>We share information:</p>
                    <ul>
                      <li>With other users as part of the platform functionality</li>
                      <li>With service providers who assist our operations</li>
                      <li>When required by law or to protect rights</li>
                    </ul>

                    <h4>4. Data Security</h4>
                    <p>We implement reasonable security measures but cannot guarantee absolute security.</p>

                    <h4>5. Your Rights</h4>
                    <p>You have the right to:</p>
                    <ul>
                      <li>Access your personal information</li>
                      <li>Correct inaccurate information</li>
                      <li>Request deletion of your information</li>
                    </ul>
                  </>
                ) : (
                  <>
                    <h4>1. Informations Collectées</h4>
                    <p>Nous collectons les informations que vous fournissez, notamment :</p>
                    <ul>
                      <li>Informations de compte (email, mot de passe)</li>
                      <li>Informations d'entreprise (nom, adresse, coordonnées)</li>
                      <li>Données d'utilisation et interactions avec le service</li>
                    </ul>

                    <h4>2. Utilisation de vos Informations</h4>
                    <p>Nous utilisons vos informations pour :</p>
                    <ul>
                      <li>Fournir et améliorer nos services</li>
                      <li>Communiquer avec vous concernant votre compte</li>
                      <li>Assurer la sécurité de la plateforme</li>
                    </ul>

                    <h4>3. Partage d'Informations</h4>
                    <p>Nous partageons les informations :</p>
                    <ul>
                      <li>Avec d'autres utilisateurs dans le cadre du fonctionnement de la plateforme</li>
                      <li>Avec des prestataires de services qui assistent nos opérations</li>
                      <li>Lorsque requis par la loi ou pour protéger des droits</li>
                    </ul>

                    <h4>4. Sécurité des Données</h4>
                    <p>Nous mettons en œuvre des mesures de sécurité raisonnables mais ne pouvons garantir une sécurité absolue.</p>

                    <h4>5. Vos Droits</h4>
                    <p>Vous avez le droit de :</p>
                    <ul>
                      <li>Accéder à vos informations personnelles</li>
                      <li>Corriger les informations inexactes</li>
                      <li>Demander la suppression de vos informations</li>
                    </ul>
                  </>
                )}
              </div>
            </section>
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-gray-50">
          <div className="flex justify-end space-x-4">
            {!standalone && (
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                {displayLanguage === 'en' ? 'Decline' : 'Refuser'}
              </button>
            )}
            <button
              onClick={onAccept}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              {standalone ? (displayLanguage === 'en' ? 'Close' : 'Fermer') : (displayLanguage === 'en' ? 'Accept' : 'Accepter')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}