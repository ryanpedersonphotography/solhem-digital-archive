import { useState } from 'react';
import { TAG_CATEGORIES } from '../../stores/tagStore';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function TagSelector({ selectedTags, onTagsChange, size = 'md' }: TagSelectorProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <div className="space-y-3">
      {Object.entries(TAG_CATEGORIES).map(([category, tags]) => (
        <div key={category} className="space-y-2">
          <button
            onClick={() => toggleCategory(category)}
            className="flex items-center gap-2 text-white opacity-90 hover:opacity-100 transition capitalize font-semibold"
          >
            <svg
              className={`w-4 h-4 transition-transform ${
                expandedCategories.has(category) ? 'rotate-90' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            {category}
          </button>
          
          {expandedCategories.has(category) && (
            <div className="flex flex-wrap gap-2 ml-6">
              {tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`
                    ${sizeClasses[size]}
                    rounded-full
                    transition-all
                    ${
                      selectedTags.includes(tag)
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-700 bg-opacity-50 text-gray-300 hover:bg-gray-600'
                    }
                  `}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
      
      {selectedTags.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-600">
          <div className="text-xs text-gray-400 mb-2">Selected tags ({selectedTags.length}):</div>
          <div className="flex flex-wrap gap-1">
            {selectedTags.map(tag => (
              <span
                key={tag}
                className="text-xs px-2 py-1 bg-primary-500 bg-opacity-30 text-primary-300 rounded-full"
              >
                {tag}
                <button
                  onClick={() => toggleTag(tag)}
                  className="ml-1 text-primary-200 hover:text-white"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}