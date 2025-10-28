import { create } from 'zustand';
import { dataApi } from '../utils/dataApi';

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

interface ServerRatingStore {
  ratings: Record<string, PhotoRating>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  ratePhoto: (photoId: string, eventId: string, rating: number, comment?: string) => Promise<void>;
  getPhotoRating: (photoId: string) => PhotoRating | null;
  getEventRatings: (eventId: string) => PhotoRating[];
  getTopRatedPhotos: (eventId: string, limit?: number) => { photoId: string; rating: number }[];
  getRatingStats: (eventId: string) => RatingStats;
  
  // Data management
  loadFromServer: () => Promise<void>;
  saveToServer: () => Promise<void>;
  
  // Export/Import (still available as backup)
  exportRatings: () => string;
  importRatings: (jsonData: string) => boolean;
  clearAllRatings: () => void;
}

const useServerRatingStore = create<ServerRatingStore>((set, get) => ({
  ratings: {},
  isLoading: false,
  error: null,

  loadFromServer: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await dataApi.get<{ ratings: Record<string, PhotoRating> }>('ratings');
      set({ 
        ratings: data.ratings || {},
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to load ratings from server:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false 
      });
      // Fallback to localStorage if server fails
      const localData = localStorage.getItem('photo-ratings');
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          set({ ratings: parsed.state?.ratings || {} });
        } catch (e) {
          console.error('Failed to parse local ratings:', e);
        }
      }
    }
  },

  saveToServer: async () => {
    try {
      const { ratings } = get();
      await dataApi.save('ratings', { ratings });
      set({ error: null });
    } catch (error) {
      console.error('Failed to save ratings to server:', error);
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  },

  ratePhoto: async (photoId, eventId, rating, comment) => {
    // Store previous state for potential rollback
    const previousRating = get().ratings[photoId];
    
    // Optimistic update
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

    // Save to server
    try {
      await get().saveToServer();
    } catch (error) {
      // Revert optimistic update on failure
      if (previousRating) {
        set((state) => ({
          ratings: {
            ...state.ratings,
            [photoId]: previousRating,
          },
        }));
      } else {
        set((state) => {
          const { [photoId]: removed, ...rest } = state.ratings;
          return { ratings: rest };
        });
      }
      throw error;
    }
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
        // Auto-save to server after import
        get().saveToServer().catch(console.error);
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
    // Auto-save to server
    get().saveToServer().catch(console.error);
  },
}));

export default useServerRatingStore;