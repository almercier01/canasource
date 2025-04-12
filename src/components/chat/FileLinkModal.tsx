import React, { useState } from 'react';
import { X } from 'lucide-react';

export function FileLinkModal({
  language,
  onClose,
  onSubmit
}: {
  language: string;
  onClose: () => void;
  onSubmit: (link: string) => void;
}) {
  const [link, setLink] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('[Modal] Submitted link:', link); // 🧪 Should now show

    if (link) {
      onSubmit(link);
      setLink('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {language === 'en' ? 'Send File Link' : 'Envoyer le lien du fichier'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full"
            aria-label={language === 'en' ? 'Close modal' : 'Fermer'}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
  <label className="block text-gray-700 mb-2">
    {language === 'en' ? 'Paste the file link' : 'Collez le lien du fichier'}
  </label>
  <input
    type="url"
    className="w-full p-2 border border-gray-300 rounded-lg mb-4"
    placeholder="https://example.com/file"
    value={link}
    onChange={(e) => setLink(e.target.value)}
  />
  <p className="text-xs text-gray-500 mt-1">
  {language === 'en'
    ? 'Your file will be sent as a private link.'
    : 'Votre fichier sera envoyé sous forme de lien privé.'}
</p>
  <button
    onClick={() => {
      console.log('[Test button] Clicked', link);
      onSubmit(link);
      setLink('');
      onClose();
    }}
    className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
  >
    {language === 'en' ? 'Send Link' : 'Envoyer le lien'}
  </button>
</div>

      </div>
    </div>
  );
}
