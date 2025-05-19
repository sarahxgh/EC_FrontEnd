// src/components/TranslateTitle.tsx
import React, { useState } from 'react';

export default function TranslateTitle() {
  const [original, setOriginal] = useState('');
  const [translated, setTranslated] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTranslate = async () => {
    setLoading(true);
    setError('');
    setTranslated('');
    try {
      const response = await fetch('http://localhost:5000/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: original })
      });

      const data = await response.json();
      if (response.ok) {
        setTranslated(data.translated);
      } else {
        setError(data.error || 'Translation failed');
      }
    } catch (err) {
      setError('Failed to connect to the translation server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-xl shadow-lg bg-white w-full max-w-2xl mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4 text-center">Document Title Translator</h2>
      <input
        type="text"
        value={original}
        onChange={(e) => setOriginal(e.target.value)}
        placeholder="Enter document title in English"
        className="w-full p-3 border border-gray-300 rounded-lg mb-4"
      />
      <button
        onClick={handleTranslate}
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
      >
        {loading ? 'Translating...' : 'Translate'}
      </button>

      {translated && (
        <div className="mt-4 p-4 border-l-4 border-green-500 bg-green-100 text-green-800">
          <strong>Translated Title:</strong> {translated}
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 border-l-4 border-red-500 bg-red-100 text-red-800">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}