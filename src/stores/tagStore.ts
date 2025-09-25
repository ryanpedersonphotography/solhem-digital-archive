import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PhotoTag {
  photoId: string;
  eventId: string;
  tags: string[];
  timestamp: string;
}

export interface TagStats {
  totalTaggedPhotos: number;
  tagCounts: Record<string, number>;
  popularTags: { tag: string; count: number }[];
}

// Predefined tag categories
export const TAG_CATEGORIES = {
  people: ['Family', 'Kids', 'Friends', 'Crowd', 'Portrait'],
  animals: ['Dog', 'Cat', 'Pet', 'Wildlife'],
  food: ['Food', 'Food Truck', 'Drinks', 'Dessert', 'BBQ'],
  location: ['Building', 'Rooftop', 'Pool', 'Garden', 'Indoor', 'Outdoor'],
  activities: ['Games', 'Music', 'Dancing', 'Sports', 'Art'],
  mood: ['Fun', 'Candid', 'Formal', 'Sunset', 'Night']
};

export const ALL_TAGS = Object.values(TAG_CATEGORIES).flat();

interface TagStore {
  photoTags: Record<string, PhotoTag>; // keyed by photoId
  
  // Actions
  tagPhoto: (photoId: string, eventId: string, tags: string[]) => void;
  getPhotoTags: (photoId: string) => PhotoTag | null;
  getEventTags: (eventId: string) => PhotoTag[];
  getPhotosWithTag: (eventId: string, tag: string) => PhotoTag[];
  getTagStats: (eventId: string) => TagStats;
  
  // Export/Import
  exportTags: () => string;
  importTags: (jsonData: string) => boolean;
  clearAllTags: () => void;
}

const useTagStore = create<TagStore>()(
  persist(
    (set, get) => ({
      photoTags: {},

      tagPhoto: (photoId, eventId, tags) => {
        set((state) => ({
          photoTags: {
            ...state.photoTags,
            [photoId]: {
              photoId,
              eventId,
              tags: [...new Set(tags)], // Remove duplicates
              timestamp: new Date().toISOString(),
            },
          },
        }));
      },

      getPhotoTags: (photoId) => {
        return get().photoTags[photoId] || null;
      },

      getEventTags: (eventId) => {
        return Object.values(get().photoTags).filter(
          (tag) => tag.eventId === eventId
        );
      },

      getPhotosWithTag: (eventId, tag) => {
        return Object.values(get().photoTags).filter(
          (photoTag) => photoTag.eventId === eventId && photoTag.tags.includes(tag)
        );
      },

      getTagStats: (eventId) => {
        const eventTags = get().getEventTags(eventId);
        const tagCounts: Record<string, number> = {};
        
        eventTags.forEach((photoTag) => {
          photoTag.tags.forEach((tag) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        });

        const popularTags = Object.entries(tagCounts)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        return {
          totalTaggedPhotos: eventTags.length,
          tagCounts,
          popularTags,
        };
      },

      exportTags: () => {
        const data = {
          version: '1.0',
          exportDate: new Date().toISOString(),
          photoTags: get().photoTags,
        };
        return JSON.stringify(data, null, 2);
      },

      importTags: (jsonData) => {
        try {
          const data = JSON.parse(jsonData);
          if (data.version && data.photoTags) {
            set({ photoTags: data.photoTags });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Failed to import tags:', error);
          return false;
        }
      },

      clearAllTags: () => {
        set({ photoTags: {} });
      },
    }),
    {
      name: 'photo-tags',
    }
  )
);

export default useTagStore;