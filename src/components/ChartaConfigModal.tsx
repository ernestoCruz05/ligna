// ============================================
// ChartaConfigModal - Configure Charta connection
// ============================================

import { useState, useEffect } from 'react';
import { pt } from '../i18n/pt';
import {
  getChartaConfig,
  saveChartaConfig,
  clearChartaConfig,
  testChartaConnection,
  type ChartaConfig,
} from '../services/chartaApi';

const t = pt;

interface ChartaConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigured?: () => void;
}

export default function ChartaConfigModal({ isOpen, onClose, onConfigured }: ChartaConfigModalProps) {
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  // Load existing config on mount
  useEffect(() => {
    const config = getChartaConfig();
    if (config) {
      setBaseUrl(config.baseUrl);
      setApiKey(config.apiKey || '');
      setIsConfigured(true);
    }
  }, [isOpen]);

  const handleTest = async () => {
    if (!baseUrl.trim()) {
      setTestResult({ ok: false, message: 'URL do servidor é obrigatório' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const config: ChartaConfig = {
      baseUrl: baseUrl.trim().replace(/\/$/, ''), // Remove trailing slash
      apiKey: apiKey.trim() || undefined,
    };

    const result = await testChartaConnection(config);
    setTestResult(result);
    setIsTesting(false);
  };

  const handleSave = () => {
    if (!baseUrl.trim()) return;

    const config: ChartaConfig = {
      baseUrl: baseUrl.trim().replace(/\/$/, ''),
      apiKey: apiKey.trim() || undefined,
    };

    saveChartaConfig(config);
    setIsConfigured(true);
    onConfigured?.();
    onClose();
  };

  const handleDisconnect = () => {
    clearChartaConfig();
    setBaseUrl('');
    setApiKey('');
    setIsConfigured(false);
    setTestResult(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {/* Charta Icon */}
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t.charta.configureCharta}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Server URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t.charta.serverUrl}
            </label>
            <input
              type="url"
              value={baseUrl}
              onChange={(e) => {
                setBaseUrl(e.target.value);
                setTestResult(null);
              }}
              placeholder={t.charta.serverUrlPlaceholder}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t.charta.apiKey}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setTestResult(null);
              }}
              placeholder={t.charta.apiKeyPlaceholder}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              testResult.ok 
                ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            }`}>
              {testResult.ok ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {testResult.message}
            </div>
          )}

          {/* Test Button */}
          <button
            onClick={handleTest}
            disabled={isTesting || !baseUrl.trim()}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isTesting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t.charta.testing}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                {t.charta.testConnection}
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          {isConfigured ? (
            <button
              onClick={handleDisconnect}
              className="px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              {t.charta.disconnect}
            </button>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {t.charta.cancel}
            </button>
            <button
              onClick={handleSave}
              disabled={!baseUrl.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
            >
              {t.charta.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
