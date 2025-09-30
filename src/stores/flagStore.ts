import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface FlaggedPhoto {
  photoId: string;
  eventId: string;
  reason: string;
  reporterEmail?: string;
  reporterName?: string;
  flaggedAt: string;
  submitted: boolean; // Whether it's been submitted to Netlify Forms
}

interface FlagStore {
  flaggedPhotos: Record<string, FlaggedPhoto>;
  
  // Flag a photo for removal
  flagPhoto: (photoId: string, eventId: string, reason: string, reporterEmail?: string, reporterName?: string) => void;
  
  // Mark as submitted to Netlify Forms
  markAsSubmitted: (photoId: string) => void;
  
  // Check if a photo is flagged
  isPhotoFlagged: (photoId: string) => boolean;
  
  // Get flag details for a photo
  getPhotoFlag: (photoId: string) => FlaggedPhoto | null;
  
  // Get all flags for an event
  getEventFlags: (eventId: string) => FlaggedPhoto[];
  
  // Remove a flag
  removeFlag: (photoId: string) => void;
  
  // Clear all flags
  clearAllFlags: () => void;
}

const useFlagStore = create<FlagStore>()(
  persist(
    (set, get) => ({
      flaggedPhotos: {},
      
      flagPhoto: (photoId, eventId, reason, reporterEmail, reporterName) => {
        set((state) => ({
          flaggedPhotos: {
            ...state.flaggedPhotos,
            [photoId]: {
              photoId,
              eventId,
              reason,
              reporterEmail,
              reporterName,
              flaggedAt: new Date().toISOString(),
              submitted: false
            }
          }
        }));
      },
      
      markAsSubmitted: (photoId) => {
        set((state) => ({
          flaggedPhotos: {
            ...state.flaggedPhotos,
            [photoId]: state.flaggedPhotos[photoId] 
              ? { ...state.flaggedPhotos[photoId], submitted: true }
              : state.flaggedPhotos[photoId]
          }
        }));
      },
      
      isPhotoFlagged: (photoId) => {
        return !!get().flaggedPhotos[photoId];
      },
      
      getPhotoFlag: (photoId) => {
        return get().flaggedPhotos[photoId] || null;
      },
      
      getEventFlags: (eventId) => {
        return Object.values(get().flaggedPhotos).filter(
          flag => flag.eventId === eventId
        );
      },
      
      removeFlag: (photoId) => {
        set((state) => {
          const { [photoId]: removed, ...rest } = state.flaggedPhotos;
          return { flaggedPhotos: rest };
        });
      },
      
      clearAllFlags: () => {
        set({ flaggedPhotos: {} });
      }
    }),
    {
      name: 'flagged-photos-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useFlagStore;