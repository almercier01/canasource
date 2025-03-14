import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { supabase } from '../lib/supabaseClient';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  language: Language;
}

const REPORT_TYPES = [
  'misleading_info',
  'inappropriate_content',
  'fake_business',
  'offensive_content',
  'spam',
  'wrong_category',
  'closed_business',
  'duplicate_listing',
  'wrong_location',
  'other'
] as const;

type ReportType = typeof REPORT_TYPES[number];

export function ReportModal({ isOpen, onClose, businessId, language }: ReportModalProps) {
  const [type, setType] = useState<ReportType>('misleading_info');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error(translations.report.signInRequired[language]);
      }

      const { error: submitError } = await supabase
        .from('business_reports')
        .insert([
          {
            business_id: businessId,
            reporter_id: user.id,
            type,
            details: details.trim()
          }
        ]);

      if (submitError) throw submitError;

      setSuccess(true);
      setType('misleading_info');
      setDetails('');
    } catch (err) {
      setError(err instanceof Error ? err.message : translations.errors.generic[language]);
    } finally {
      setLoading(false);
    }
  };

  const getReportTypeLabel = (type: ReportType): string => {
    const labels: Record<ReportType, { en: string; fr: string }> = {
      misleading_info: {
        en: 'Misleading Information',
        fr: 'Information trompeuse'
      },
      inappropriate_content: {
        en: 'Inappropriate Content',
        fr: 'Contenu inapproprié'
      },
      fake_business: {
        en: 'Fake Business',
        fr: 'Entreprise fictive'
      },
      offensive_content: {
        en: 'Offensive Content',
        fr: 'Contenu offensant'
      },
      spam: {
        en: 'Spam',
        fr: 'Spam'
      },
      wrong_category: {
        en: 'Wrong Category',
        fr: 'Mauvaise catégorie'
      },
      closed_business: {
        en: 'Business is Closed',
        fr: 'Entreprise fermée'
      },
      duplicate_listing: {
        en: 'Duplicate Listing',
        fr: 'Annonce en double'
      },
      wrong_location: {
        en: 'Wrong Location',
        fr: 'Mauvaise localisation'
      },
      other: {
        en: 'Other',
        fr: 'Autre'
      }
    };

    return labels[type][language];
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <div className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <h2 className="text-xl font-semibold">
              {translations.report.title[language]}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center">
              <p className="text-green-600 mb-4">
                {translations.report.success[language]}
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                {translations.common.close[language]}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {translations.report.reason[language]}
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as ReportType)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  required
                >
                  {REPORT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {getReportTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {translations.report.details[language]}
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={4}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  placeholder={translations.report.detailsPlaceholder[language]}
                  required
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  {translations.common.cancel[language]}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? translations.common.processing[language] : translations.report.submit[language]}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}