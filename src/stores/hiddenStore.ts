import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface HiddenPhoto {
  photoId: string;
  eventId: string;
  hiddenAt: string;
  reason?: string;
}

interface HiddenStore {
  hiddenPhotos: Record<string, HiddenPhoto>; // keyed by photoId
  
  // Actions
  hidePhoto: (photoId: string, eventId: string, reason?: string) => void;
  unhidePhoto: (photoId: string) => void;
  isPhotoHidden: (photoId: string) => boolean;
  getHiddenPhotos: (eventId?: string) => HiddenPhoto[];
  togglePhotoHidden: (photoId: string, eventId: string) => void;
  
  // Bulk actions
  hideMultiplePhotos: (photoIds: string[], eventId: string, reason?: string) => void;
  unhideAll: (eventId?: string) => void;
  
  // Export/Import
  exportHidden: () => string;
  importHidden: (jsonData: string) => boolean;
}

const useHiddenStore = create<HiddenStore>()(
  persist(
    (set, get) => ({
      hiddenPhotos: {},

      hidePhoto: (photoId, eventId, reason) => {
        set((state) => ({
          hiddenPhotos: {
            ...state.hiddenPhotos,
            [photoId]: {
              photoId,
              eventId,
              hiddenAt: new Date().toISOString(),
              reason,
            },
          },
        }));
      },

      unhidePhoto: (photoId) => {
        set((state) => {
          const { [photoId]: removed, ...rest } = state.hiddenPhotos;
          return { hiddenPhotos: rest };
        });
      },

      isPhotoHidden: (photoId) => {
        return !!get().hiddenPhotos[photoId];
      },

      getHiddenPhotos: (eventId) => {
        const hidden = Object.values(get().hiddenPhotos);
        if (eventId) {
          return hidden.filter(h => h.eventId === eventId);
        }
        return hidden;
      },

      togglePhotoHidden: (photoId, eventId) => {
        const isHidden = get().isPhotoHidden(photoId);
        if (isHidden) {
          get().unhidePhoto(photoId);
        } else {
          get().hidePhoto(photoId, eventId);
        }
      },

      hideMultiplePhotos: (photoIds, eventId, reason) => {
        const timestamp = new Date().toISOString();
        set((state) => {
          const newHidden = { ...state.hiddenPhotos };
          photoIds.forEach(photoId => {
            newHidden[photoId] = {
              photoId,
              eventId,
              hiddenAt: timestamp,
              reason,
            };
          });
          return { hiddenPhotos: newHidden };
        });
      },

      unhideAll: (eventId) => {
        if (!eventId) {
          set({ hiddenPhotos: {} });
        } else {
          set((state) => {
            const filtered = Object.entries(state.hiddenPhotos)
              .filter(([_, hidden]) => hidden.eventId !== eventId)
              .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
            return { hiddenPhotos: filtered };
          });
        }
      },

      exportHidden: () => {
        const data = {
          version: '1.0',
          exportDate: new Date().toISOString(),
          hiddenPhotos: get().hiddenPhotos,
        };
        return JSON.stringify(data, null, 2);
      },

      importHidden: (jsonData) => {
        try {
          const data = JSON.parse(jsonData);
          if (data.version && data.hiddenPhotos) {
            set({ hiddenPhotos: data.hiddenPhotos });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Failed to import hidden photos:', error);
          return false;
        }
      },
    }),
    {
      name: 'hidden-photos',
    }
  )
);

export default useHiddenStore;