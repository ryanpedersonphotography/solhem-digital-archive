import type { PropertyEvent, EventPhoto, EventYear } from '../types';

// Helper to generate photo URLs for Fred 2025 event
const generateFred2025Photos = (): EventPhoto[] => {
  const photos: EventPhoto[] = [];
  
  // We have 290 photos available with different suffixes:
  // 001-072: -all.jpg
  // 073-250: -top.jpg
  // 251-290: -all.jpg
  for (let i = 1; i <= 290; i++) {
    const num = i.toString().padStart(3, '0');
    const suffix = (i >= 73 && i <= 250) ? 'top' : 'all';
    
    photos.push({
      id: `fred-2025-${num}`,
      url: `/events/2025/fred/2025-fred-${num}-${suffix}.jpg`,
      thumbnail: `/events/2025/fred/2025-fred-${num}-${suffix}.jpg`,
      order: i - 1,
    });
  }
  
  return photos;
};

// Events data organized by year
export const eventsData: EventYear[] = [
  {
    year: 2025,
    events: [
      {
        id: 'fred-2025',
        year: 2025,
        propertyId: 'fred',
        propertyName: 'The Fred',
        title: 'Summer Solstice Party 2025',
        date: new Date('2025-06-21'),
        description: 'Annual summer celebration at The Fred Edina featuring live music, gourmet food trucks, and rooftop festivities.',
        photos: generateFred2025Photos(),
        coverPhoto: '/events/2025/fred/2025-fred-001-all.jpg',
        attendees: 420,
      },
      // Placeholder for future events
      {
        id: 'archive-2025',
        year: 2025,
        propertyId: 'archive',
        propertyName: 'The Archive',
        title: 'Fall Art Gallery Opening 2025',
        date: new Date('2025-09-15'),
        description: 'Celebrating local artists in our hallway galleries with wine, cheese, and live jazz.',
        photos: [],
        coverPhoto: 'https://picsum.photos/seed/archive-2025/800/600',
        attendees: 200,
      },
      {
        id: 'lucille-2025',
        year: 2025,
        propertyId: 'lucille',
        propertyName: 'Lucille',
        title: 'Holiday Lights Celebration 2025',
        date: new Date('2025-12-15'),
        description: 'Winter wonderland rooftop party with hot cocoa, holiday treats, and spectacular city views.',
        photos: [],
        coverPhoto: 'https://picsum.photos/seed/lucille-2025/800/600',
        attendees: 150,
      },
    ],
  },
  {
    year: 2024,
    events: [
      {
        id: 'archive-2024',
        year: 2024,
        propertyId: 'archive',
        propertyName: 'The Archive',
        title: 'Spring Garden Party 2024',
        date: new Date('2024-05-01'),
        description: 'Welcoming spring with rooftop garden activities and outdoor yoga sessions.',
        photos: [],
        coverPhoto: 'https://picsum.photos/seed/archive-2024/800/600',
        attendees: 180,
      },
      {
        id: 'fred-2024',
        year: 2024,
        propertyId: 'fred',
        propertyName: 'The Fred',
        title: 'Pool Opening Bash 2024',
        date: new Date('2024-06-01'),
        description: 'Kicking off summer with our resort-style pool opening celebration.',
        photos: [],
        coverPhoto: 'https://picsum.photos/seed/fred-2024/800/600',
        attendees: 350,
      },
    ],
  },
];

// Helper functions
export const getEventsByYear = (year: number): PropertyEvent[] => {
  const yearData = eventsData.find(y => y.year === year);
  return yearData ? yearData.events : [];
};

export const getEventsByProperty = (propertyId: string): PropertyEvent[] => {
  const allEvents: PropertyEvent[] = [];
  eventsData.forEach(year => {
    year.events.forEach(event => {
      if (event.propertyId === propertyId) {
        allEvents.push(event);
      }
    });
  });
  return allEvents.sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const getEvent = (eventId: string): PropertyEvent | undefined => {
  for (const year of eventsData) {
    const event = year.events.find(e => e.id === eventId);
    if (event) return event;
  }
  return undefined;
};

export const getAllYears = (): number[] => {
  return eventsData.map(y => y.year).sort((a, b) => b - a);
};