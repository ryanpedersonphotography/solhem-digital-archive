import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PhotoRating {
  photoId: string;
  eventId: string;
  rating: number; // 1-5 stars
  timestamp: string;
  comment?: string;
}

export interface RatingStats {
  averageRating: number;
  totalRatings: number;
  distribution: Record<number, number>; // 1-5 star distribution
}

interface RatingStore {
  ratings: Record<string, PhotoRating>; // keyed by photoId
  
  // Actions
  ratePhoto: (photoId: string, eventId: string, rating: number, comment?: string) => void;
  getPhotoRating: (photoId: string) => PhotoRating | null;
  getEventRatings: (eventId: string) => PhotoRating[];
  getTopRatedPhotos: (eventId: string, limit?: number) => { photoId: string; rating: number }[];
  getRatingStats: (eventId: string) => RatingStats;
  
  // Export/Import
  exportRatings: () => string;
  importRatings: (jsonData: string) => boolean;
  clearAllRatings: () => void;
}

const useRatingStore = create<RatingStore>()(
  persist(
    (set, get) => ({
      ratings: {},

      ratePhoto: (photoId, eventId, rating, comment) => {
        set((state) => ({
          ratings: {
            ...state.ratings,
            [photoId]: {
              photoId,
              eventId,
              rating: Math.min(5, Math.max(1, rating)),
              timestamp: new Date().toISOString(),
              comment,
            },
          },
        }));
      },

      getPhotoRating: (photoId) => {
        return get().ratings[photoId] || null;
      },

      getEventRatings: (eventId) => {
        return Object.values(get().ratings).filter(
          (rating) => rating.eventId === eventId
        );
      },

      getTopRatedPhotos: (eventId, limit = 10) => {
        const eventRatings = get().getEventRatings(eventId);
        return eventRatings
          .sort((a, b) => b.rating - a.rating)
          .slice(0, limit)
          .map((r) => ({ photoId: r.photoId, rating: r.rating }));
      },

      getRatingStats: (eventId) => {
        const eventRatings = get().getEventRatings(eventId);
        
        if (eventRatings.length === 0) {
          return {
            averageRating: 0,
            totalRatings: 0,
            distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          };
        }

        const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let totalScore = 0;

        eventRatings.forEach((rating) => {
          distribution[rating.rating] = (distribution[rating.rating] || 0) + 1;
          totalScore += rating.rating;
        });

        return {
          averageRating: totalScore / eventRatings.length,
          totalRatings: eventRatings.length,
          distribution,
        };
      },

      exportRatings: () => {
        const data = {
          version: '1.0',
          exportDate: new Date().toISOString(),
          ratings: get().ratings,
        };
        return JSON.stringify(data, null, 2);
      },

      importRatings: (jsonData) => {
        try {
          const data = JSON.parse(jsonData);
          if (data.version && data.ratings) {
            set({ ratings: data.ratings });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Failed to import ratings:', error);
          return false;
        }
      },

      clearAllRatings: () => {
        set({ ratings: {} });
      },
    }),
    {
      name: 'photo-ratings',
    }
  )
);

export default useRatingStore;