import { useState } from 'react';
import useTagStore from '../../stores/tagStore';

interface TagManagerProps {
  eventId?: string;
  onClose?: () => void;
}

export default function TagManager({ eventId, onClose }: TagManagerProps) {
  const [showImport, setShowImport] = useState(false);
  const [importData, setImportData] = useState('');
  const [message, setMessage] = useState('');
  
  const { 
    exportTags, 
    importTags, 
    clearAllTags,
    getTagStats
  } = useTagStore();
  
  const stats = eventId ? getTagStats(eventId) : null;
  
  const handleExport = () => {
    const json = exportTags();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `photo-tags-${eventId || 'all'}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMessage('Tags exported successfully!');
    setTimeout(() => setMessage(''), 3000);
  };
  
  const handleImport = () => {
    if (!importData.trim()) {
      setMessage('Please paste JSON data first');
      return;
    }
    
    const success = importTags(importData);
    if (success) {
      setMessage('Tags imported successfully!');
      setImportData('');
      setShowImport(false);
    } else {
      setMessage('Failed to import tags. Please check the JSON format.');
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
    if (window.confirm('Are you sure you want to clear all tags? This cannot be undone.')) {
      clearAllTags();
      setMessage('All tags cleared');
      setTimeout(() => setMessage(''), 3000);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Tag Manager</h2>
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
      {stats && stats.totalTaggedPhotos > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Tag Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-600">Tagged Photos</div>
              <div className="text-2xl font-bold text-primary-600">{stats.totalTaggedPhotos}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Unique Tags Used</div>
              <div className="text-2xl font-bold text-blue-600">{Object.keys(stats.tagCounts).length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Tag Assignments</div>
              <div className="text-2xl font-bold text-green-600">
                {Object.values(stats.tagCounts).reduce((sum, count) => sum + count, 0)}
              </div>
            </div>
          </div>
          
          {/* Popular Tags */}
          {stats.popularTags.length > 0 && (
            <div className="mt-4">
              <div className="text-sm text-gray-600 mb-2">Most Used Tags</div>
              <div className="flex flex-wrap gap-2">
                {stats.popularTags.map(({ tag, count }) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                  >
                    {tag}
                    <span className="bg-primary-200 px-1.5 py-0.5 rounded-full text-xs font-semibold">
                      {count}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Tag Distribution by Category */}
          <div className="mt-4">
            <div className="text-sm text-gray-600 mb-2">Tag Distribution</div>
            <div className="space-y-2">
              {Object.entries(stats.tagCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([tag, count]) => {
                  const percentage = stats.totalTaggedPhotos > 0 
                    ? (count / stats.totalTaggedPhotos) * 100 
                    : 0;
                  return (
                    <div key={tag} className="flex items-center gap-2">
                      <span className="text-sm w-24">{tag}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-400 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-10 text-right">{count}</span>
                    </div>
                  );
                })}
            </div>
          </div>
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
          Export Tags
        </button>
        
        <button
          onClick={() => setShowImport(!showImport)}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Import Tags
        </button>
        
        <button
          onClick={handleClearAll}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear All Tags
        </button>
      </div>
      
      {/* Import Section */}
      {showImport && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-3">Import Tags</h3>
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