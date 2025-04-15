import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Language } from '../types';

interface Step {
  img: string;
  text: string;
}

export function GuidedStepsCarousel({ language }: { language: Language }) {
  const isFrench = language === 'fr';

  const steps: Step[] = [
    {
      img: '/images/carouselImage1.png',
      text: isFrench
        ? 'Cherchez un produit que vous voulez localement.'
        : 'Search for the product you want locally.',
    },
    {
      img: isFrench ? '/images/carousel_image2Fr.png' : '/images/carousel_image2En.png',
      text: isFrench
        ? 'Trouvez un fournisseur canadien.'
        : 'Find a Canadian supplier.',
    },
    {
      img: isFrench ? '/images/carousel_image3Fr.png' : '/images/carousel_image3En.png',
      text: isFrench
        ? 'Parlez-lui directement via la messagerie.'
        : 'Message them directly.',
    },
    {
      img: isFrench ? '/images/carousel_image4Fr.png' : '/images/carousel_image4En.png',
      text: isFrench
        ? 'Achetez ou proposez une demande publique.'
        : 'Buy or post a public request.',
    },
  ];

  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFocusedIndex((prev) => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const positions = [
    'top-0 left-0',
    'top-0 right-0',
    'bottom-0 left-0',
    'bottom-0 right-0',
  ];

  return (
    <div className="bg-white py-12">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl mb-2">
          {isFrench
            ? 'Découvrez comment utiliser CanaSource'
            : 'See How CanaSource Works'}
        </h2>
        <p className="text-sm text-gray-600 mb-8">
          {isFrench
            ? 'Une démonstration en 4 étapes simples'
            : 'A 4-step visual walkthrough'}
        </p>

        {/* Container for all cards */}
        <div className="relative aspect-[4/3] max-w-3xl mx-auto">
          {steps.map((step, index) => {
            const isFocused = index === focusedIndex;
            const baseStyle = `absolute w-1/2 h-1/2 p-2 transition-all duration-500 ease-in-out ${positions[index]}`;

            return (
              <motion.div
                key={index}
                className={baseStyle}
                animate={{
                  zIndex: isFocused ? 20 : 1,
                  scale: isFocused ? 1.5 : 1,
                  top: isFocused ? '25%' : undefined,
                  left: isFocused ? '25%' : undefined,
                  right: isFocused ? 'auto' : undefined,
                  bottom: isFocused ? 'auto' : undefined,
                  opacity: isFocused ? 1 : 0.5,
                }}
                transition={{ duration: 0.6 }}
              >
                <div className="bg-white rounded-lg shadow-md h-full w-full flex flex-col items-center justify-center p-3">
                  <img
                    src={step.img}
                    alt={step.text}
                    className="object-contain max-h-[70%] w-full"
                  />
                  <p className="text-sm text-gray-700 mt-2 text-center">{step.text}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
