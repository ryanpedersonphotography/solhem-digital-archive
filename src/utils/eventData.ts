import type { PropertyEvent, EventPhoto, EventYear } from '../types';

// Helper to generate photo URLs for Lucille 2025 event
const generateLucille2025Photos = (): EventPhoto[] => {
  const filenames = [
    '7Y5A0804.jpg', '7Y5A0806.jpg', '7Y5A0808.jpg', '7Y5A0811.jpg', '7Y5A0812.jpg', '7Y5A0814.jpg', 
    '7Y5A0816.jpg', '7Y5A0824.jpg', '7Y5A0827.jpg', '7Y5A0829.jpg', '7Y5A0831.jpg', '7Y5A0837.jpg', 
    '7Y5A0838.jpg', '7Y5A0842.jpg', '7Y5A0845.jpg', '7Y5A0847.jpg', '7Y5A0849.jpg', '7Y5A0850.jpg', 
    '7Y5A0853.jpg', '7Y5A0854.jpg', '7Y5A0855.jpg', '7Y5A0857.jpg', '7Y5A0863.jpg', '7Y5A0864.jpg', 
    '7Y5A0868.jpg', '7Y5A0872-2.jpg', '7Y5A0872.jpg', '7Y5A0881.jpg', '7Y5A0882.jpg', '7Y5A0884.jpg', 
    '7Y5A0886.jpg', '7Y5A0891.jpg', '7Y5A0892.jpg', '7Y5A0893.jpg', '7Y5A0894-2.jpg', '7Y5A0895.jpg', 
    '7Y5A0896.jpg', '7Y5A0897.jpg', '7Y5A0900.jpg', '7Y5A0901.jpg', '7Y5A0903-2.jpg', '7Y5A0903.jpg', 
    '7Y5A0904-2.jpg', '7Y5A0904.jpg', '7Y5A0905.jpg', '7Y5A0906.jpg', '7Y5A0908.jpg', '7Y5A0909.jpg', 
    '7Y5A0913.jpg', '7Y5A0914.jpg', '7Y5A0919.jpg', '7Y5A0923.jpg', '7Y5A0925.jpg', '7Y5A0927.jpg', 
    '7Y5A0929.jpg', '7Y5A0935.jpg', '7Y5A0937.jpg', '7Y5A0938-2.jpg', '7Y5A0938.jpg', '7Y5A0940.jpg', 
    '7Y5A0943.jpg', '7Y5A0946.jpg', '7Y5A0953.jpg', '7Y5A0957.jpg', '7Y5A0963-2.jpg', '7Y5A0963.jpg', 
    '7Y5A0967.jpg', '7Y5A0970-2.jpg', '7Y5A0970.jpg', '7Y5A0975.jpg', '7Y5A0976.jpg', '7Y5A0978.jpg', 
    '7Y5A0982.jpg', '7Y5A0983.jpg', '7Y5A0985.jpg', '7Y5A0986.jpg', '7Y5A0987.jpg', '7Y5A0989.jpg', 
    '7Y5A0991.jpg', '7Y5A0993.jpg', '7Y5A0995.jpg', '7Y5A0996.jpg', '7Y5A0998.jpg', '7Y5A1000.jpg', 
    '7Y5A1004.jpg', '7Y5A1007-2.jpg', '7Y5A1007.jpg', '7Y5A1010.jpg', '7Y5A1012.jpg', '7Y5A1013.jpg', 
    '7Y5A1014.jpg', '7Y5A1020.jpg', '7Y5A1021.jpg', '7Y5A1022.jpg', '7Y5A1023.jpg', '7Y5A1025.jpg', 
    '7Y5A1026.jpg', '7Y5A1027.jpg', '7Y5A1029.jpg', '7Y5A1035.jpg', '7Y5A1037.jpg', '7Y5A1040.jpg', 
    '7Y5A1041.jpg', '7Y5A1049.jpg', '7Y5A1050.jpg', '7Y5A1053.jpg', '7Y5A1063.jpg', '7Y5A1065.jpg', 
    '7Y5A1067.jpg', '7Y5A1074.jpg', '7Y5A1075-2.jpg', '7Y5A1075.jpg', '7Y5A1079.jpg', '7Y5A1081.jpg', 
    '7Y5A1082.jpg', '7Y5A1084.jpg', '7Y5A1085.jpg', '7Y5A1090.jpg', '7Y5A1093.jpg', '7Y5A1095.jpg', 
    '7Y5A1096.jpg', '7Y5A1098.jpg', '7Y5A1101.jpg', '7Y5A1107.jpg', '7Y5A1111.jpg', '7Y5A1113.jpg', 
    '7Y5A1115.jpg', '7Y5A1118.jpg', '7Y5A1122.jpg', '7Y5A1125.jpg', '7Y5A1127-2.jpg', '7Y5A1127.jpg', 
    '7Y5A1132.jpg', '7Y5A1133-2.jpg', '7Y5A1133.jpg', '7Y5A1134.jpg', '7Y5A1135.jpg', '7Y5A1141.jpg', 
    '7Y5A1143.jpg', '7Y5A1146.jpg', '7Y5A1151.jpg', '7Y5A1152.jpg', '7Y5A1154.jpg', '7Y5A1160.jpg', 
    '7Y5A1162.jpg', '7Y5A1168.jpg', '7Y5A1174.jpg', '7Y5A1177.jpg', '7Y5A1180.jpg', '7Y5A1189-2.jpg', 
    '7Y5A1192.jpg', '7Y5A1199.jpg', '7Y5A1201.jpg', '7Y5A1204.jpg', '7Y5A1207.jpg', '7Y5A1213.jpg', 
    '7Y5A1215.jpg', '7Y5A1216.jpg', '7Y5A1221.jpg', '7Y5A1224.jpg', '7Y5A1233.jpg', '7Y5A1235.jpg', 
    '7Y5A1243.jpg', '7Y5A1245.jpg', '7Y5A1251.jpg', '7Y5A1265.jpg', '7Y5A1268.jpg', '7Y5A1272.jpg', 
    '7Y5A1275.jpg', '7Y5A1279.jpg', '7Y5A1281.jpg', '7Y5A1291.jpg', '7Y5A1293.jpg', '7Y5A1347.jpg', 
    '7Y5A1357.jpg', '7Y5A1358.jpg', '7Y5A1370.jpg', '7Y5A1372.jpg', '7Y5A1376.jpg', '7Y5A1380.jpg', 
    '7Y5A1383.jpg', '7Y5A1385.jpg', '7Y5A1387.jpg', '7Y5A1388.jpg', '7Y5A1390.jpg', '7Y5A1391.jpg', 
    '7Y5A1395.jpg', '7Y5A1396.jpg', '7Y5A1400.jpg', '7Y5A1401.jpg', '7Y5A1406.jpg', '7Y5A1408.jpg', 
    '7Y5A1418.jpg', '7Y5A1428.jpg', '7Y5A1430.jpg', '7Y5A1434.jpg', '7Y5A1435.jpg', '7Y5A1442.jpg', 
    '7Y5A1461.jpg', '7Y5A1473.jpg', '7Y5A1476.jpg', '7Y5A1478.jpg', '7Y5A1482.jpg', '7Y5A1488.jpg', 
    '7Y5A1493.jpg', '7Y5A1496.jpg', '7Y5A1497.jpg', '7Y5A1498.jpg', '7Y5A1503.jpg', '7Y5A1507.jpg', 
    '7Y5A1512.jpg', '7Y5A1515.jpg', '7Y5A1522.jpg', '7Y5A1523.jpg', '7Y5A1526.jpg', '7Y5A1545-2-Edit.jpg', 
    '7Y5A1547.jpg'
  ];
  
  return filenames.map((filename, index) => ({
    id: `lucille-2025-${index + 1}`,
    url: `/events/2025/lucille/${filename}`,
    thumbnail: `/events/2025/lucille/${filename}`,
    order: index,
  }));
};

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
        title: 'Fall Harvest Festival 2025',
        date: new Date('2025-09-18'),
        description: 'Celebrating the season with live music, local food vendors, and rooftop festivities at The Lucille apartments.',
        photos: generateLucille2025Photos(),
        coverPhoto: '/events/2025/lucille/7Y5A0804.jpg',
        attendees: 220,
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