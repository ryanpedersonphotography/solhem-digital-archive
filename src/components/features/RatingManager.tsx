import { useState } from 'react';
import useRatingStore from '../../stores/ratingStore';
import StarRating from './StarRating';

interface RatingManagerProps {
  eventId?: string;
  onClose?: () => void;
}

export default function RatingManager({ eventId, onClose }: RatingManagerProps) {
  const [showImport, setShowImport] = useState(false);
  const [importData, setImportData] = useState('');
  const [message, setMessage] = useState('');
  
  const { 
    exportRatings, 
    importRatings, 
    clearAllRatings,
    getRatingStats,
    getTopRatedPhotos,
    getEventRatings
  } = useRatingStore();
  
  const stats = eventId ? getRatingStats(eventId) : null;
  const topPhotos = eventId ? getTopRatedPhotos(eventId, 5) : [];
  const allRatings = eventId ? getEventRatings(eventId) : [];
  
  const handleExport = () => {
    const json = exportRatings();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `photo-ratings-${eventId || 'all'}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMessage('Ratings exported successfully!');
    setTimeout(() => setMessage(''), 3000);
  };
  
  const handleImport = () => {
    if (!importData.trim()) {
      setMessage('Please paste JSON data first');
      return;
    }
    
    const success = importRatings(importData);
    if (success) {
      setMessage('Ratings imported successfully!');
      setImportData('');
      setShowImport(false);
    } else {
      setMessage('Failed to import ratings. Please check the JSON format.');
    }
    setTimeout(() => setMessage(''), 3000);
  };
  
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportData(text);
    };
    reader.readAsText(file);
  };
  
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all ratings? This cannot be undone.')) {
      clearAllRatings();
      setMessage('All ratings cleared');
      setTimeout(() => setMessage(''), 3000);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Rating Manager</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Statistics */}
      {stats && stats.totalRatings > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Event Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600">Average Rating</div>
              <div className="flex items-center gap-2">
                <StarRating rating={stats.averageRating} readonly size="sm" />
                <span className="font-semibold">{stats.averageRating.toFixed(1)}</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Ratings</div>
              <div className="text-2xl font-bold text-primary-600">{stats.totalRatings}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">5-Star Photos</div>
              <div className="text-2xl font-bold text-green-600">{stats.distribution[5] || 0}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Photos Rated</div>
              <div className="text-2xl font-bold text-blue-600">{allRatings.length}</div>
            </div>
          </div>
          
          {/* Rating Distribution */}
          <div className="mt-4">
            <div className="text-sm text-gray-600 mb-2">Rating Distribution</div>
            {[5, 4, 3, 2, 1].map(star => {
              const count = stats.distribution[star] || 0;
              const percentage = stats.totalRatings > 0 ? (count / stats.totalRatings) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 mb-1">
                  <span className="text-sm w-4">{star}</span>
                  <StarRating rating={star} readonly size="sm" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-10 text-right">{count}</span>
                </div>
              );
            })}
          </div>
          
          {/* Top Rated Photos */}
          {topPhotos.length > 0 && (
            <div className="mt-4">
              <div className="text-sm text-gray-600 mb-2">Top Rated Photos</div>
              <div className="space-y-1">
                {topPhotos.map((photo, index) => (
                  <div key={photo.photoId} className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">#{index + 1}</span>
                    <span className="text-sm font-medium">{photo.photoId.split('-').pop()}</span>
                    <StarRating rating={photo.rating} readonly size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Ratings
        </button>
        
        <button
          onClick={() => setShowImport(!showImport)}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Import Ratings
        </button>
        
        <button
          onClick={handleClearAll}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear All
        </button>
      </div>
      
      {/* Import Section */}
      {showImport && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-3">Import Ratings</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload JSON File
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Or Paste JSON Data
              </label>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste your exported JSON data here..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={handleImport}
              disabled={!importData.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Import Now
            </button>
          </div>
        </div>
      )}
      
      {/* Message Display */}
      {message && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${
          message.includes('success') ? 'bg-green-100 text-green-700' : 
          message.includes('Failed') ? 'bg-red-100 text-red-700' : 
          'bg-blue-100 text-blue-700'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}