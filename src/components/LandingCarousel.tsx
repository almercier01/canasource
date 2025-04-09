import React from 'react';

interface CarouselSlide {
  img: string;
  text: string;
}

interface CarouselProps {
  language: 'en' | 'fr';
}

export const Carousel: React.FC<CarouselProps> = ({ language }) => {
  const isFrench = language === 'fr';

  const slides: CarouselSlide[] = [
    {
      img: '/images/carouselImage1.png',
      text: isFrench
        ? 'Vous cherchez une alternative locale pour ce parasol de jardin ?'
        : 'Looking for a local manufacturer alternative for this Garden Umbrella?',
    },
    {
      img: isFrench ? '/images/carousel_image2Fr.png' : '/images/carousel_image2En.png',
      text: isFrench
        ? 'Trouvez facilement un fournisseur local avec notre outil de recherche.'
        : 'Easily find a local supplier with our search tool.',
    },
    {
      img: isFrench ? '/images/carousel_image3Fr.png' : '/images/carousel_image3En.png',
      text: isFrench
        ? 'Discutez directement avec les fournisseurs pour passer à l’action.'
        : 'Connect directly with suppliers and take action.',
    },
    {
      img: isFrench ? '/images/carousel_image4Fr.png' : '/images/carousel_image4En.png',
      text: isFrench
        ? 'Répondre à nos besoins, un lien local à la fois.'
        : 'Supporting our own needs — one local connection at a time.',
    },
  ];

  return (
    <div className="w-full overflow-hidden py-8 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-xl font-bold text-center mb-2">
          {isFrench
            ? 'Votre parcours vers l’approvisionnement local commence ici'
            : 'Your Path to Local Sourcing Starts Here'}
        </h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          {isFrench
            ? 'Du besoin à la solution locale — Découvrez le parcours CanaSource'
            : 'From Need to Local Solution — Discover the CanaSource Journey'}
        </p>
        <div className="flex overflow-x-auto snap-x gap-4">
          {slides.map((slide, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-full sm:w-[300px] md:w-[360px] snap-center rounded shadow-md bg-gray-50"
            >
              <div className="flex flex-col items-center justify-between h-[340px] bg-white rounded-lg shadow p-4">
                <img
                  src={slide.img}
                  alt={slide.text}
                  className="max-h-[220px] object-contain"
                />
                <p className="text-sm text-center text-gray-700 mt-2">{slide.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
