import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PublicPhoto {
  photoId: string;
  eventId: string;
  addedAt: string;
  addedBy?: string;
}

interface PublicStore {
  publicPhotos: Record<string, PublicPhoto>; // keyed by photoId
  
  // Actions
  addToPublic: (photoId: string, eventId: string) => void;
  removeFromPublic: (photoId: string) => void;
  isPhotoPublic: (photoId: string) => boolean;
  getPublicPhotos: (eventId?: string) => PublicPhoto[];
  togglePhotoPublic: (photoId: string, eventId: string) => void;
  
  // Bulk actions
  addMultipleToPublic: (photoIds: string[], eventId: string) => void;
  removeAllFromPublic: (eventId?: string) => void;
  getPublicPhotoCount: (eventId: string) => number;
  
  // Export/Import
  exportPublicPhotos: () => string;
  importPublicPhotos: (jsonData: string) => boolean;
}

const usePublicStore = create<PublicStore>()(
  persist(
    (set, get) => ({
      publicPhotos: {},

      addToPublic: (photoId, eventId) => {
        set((state) => ({
          publicPhotos: {
            ...state.publicPhotos,
            [photoId]: {
              photoId,
              eventId,
              addedAt: new Date().toISOString(),
            },
          },
        }));
      },

      removeFromPublic: (photoId) => {
        set((state) => {
          const { [photoId]: removed, ...rest } = state.publicPhotos;
          return { publicPhotos: rest };
        });
      },

      isPhotoPublic: (photoId) => {
        return !!get().publicPhotos[photoId];
      },

      getPublicPhotos: (eventId) => {
        const photos = Object.values(get().publicPhotos);
        if (eventId) {
          return photos.filter(p => p.eventId === eventId);
        }
        return photos;
      },

      togglePhotoPublic: (photoId, eventId) => {
        const isPublic = get().isPhotoPublic(photoId);
        if (isPublic) {
          get().removeFromPublic(photoId);
        } else {
          get().addToPublic(photoId, eventId);
        }
      },

      addMultipleToPublic: (photoIds, eventId) => {
        const timestamp = new Date().toISOString();
        set((state) => {
          const newPublic = { ...state.publicPhotos };
          photoIds.forEach(photoId => {
            newPublic[photoId] = {
              photoId,
              eventId,
              addedAt: timestamp,
            };
          });
          return { publicPhotos: newPublic };
        });
      },

      removeAllFromPublic: (eventId) => {
        if (!eventId) {
          set({ publicPhotos: {} });
        } else {
          set((state) => {
            const filtered = Object.entries(state.publicPhotos)
              .filter(([_, photo]) => photo.eventId !== eventId)
              .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
            return { publicPhotos: filtered };
          });
        }
      },

      getPublicPhotoCount: (eventId) => {
        return get().getPublicPhotos(eventId).length;
      },

      exportPublicPhotos: () => {
        const data = {
          version: '1.0',
          exportDate: new Date().toISOString(),
          publicPhotos: get().publicPhotos,
        };
        return JSON.stringify(data, null, 2);
      },

      importPublicPhotos: (jsonData) => {
        try {
          const data = JSON.parse(jsonData);
          if (data.version && data.publicPhotos) {
            set({ publicPhotos: data.publicPhotos });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Failed to import public photos:', error);
          return false;
        }
      },
    }),
    {
      name: 'public-photos',
    }
  )
);

export default usePublicStore;