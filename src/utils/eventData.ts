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

// Helper to generate photo URLs for Archive 2025 event
const generateArchive2025Photos = (): EventPhoto[] => {
  const filenames = [
    '7Y5A2032.jpg', '7Y5A2037.jpg', '7Y5A2040.jpg', '7Y5A2042.jpg', '7Y5A2045.jpg', '7Y5A2046.jpg', 
    '7Y5A2047.jpg', '7Y5A2048.jpg', '7Y5A2049.jpg', '7Y5A2050.jpg', '7Y5A2051.jpg', '7Y5A2052.jpg', 
    '7Y5A2054.jpg', '7Y5A2056.jpg', '7Y5A2057.jpg', '7Y5A2058.jpg', '7Y5A2060.jpg', '7Y5A2061.jpg', 
    '7Y5A2062.jpg', '7Y5A2063.jpg', '7Y5A2064.jpg', '7Y5A2065.jpg', '7Y5A2066.jpg', '7Y5A2068.jpg', 
    '7Y5A2069.jpg', '7Y5A2070.jpg', '7Y5A2071.jpg', '7Y5A2072.jpg', '7Y5A2073.jpg', '7Y5A2074.jpg', 
    '7Y5A2077.jpg', '7Y5A2080.jpg', '7Y5A2082.jpg', '7Y5A2084.jpg', '7Y5A2085.jpg', '7Y5A2087.jpg', 
    '7Y5A2090.jpg', '7Y5A2091.jpg', '7Y5A2094.jpg', '7Y5A2095.jpg', '7Y5A2096.jpg', '7Y5A2097.jpg', 
    '7Y5A2101.jpg', '7Y5A2102.jpg', '7Y5A2111.jpg', '7Y5A2112.jpg', '7Y5A2113.jpg', '7Y5A2114.jpg', 
    '7Y5A2115.jpg', '7Y5A2116.jpg', '7Y5A2117.jpg', '7Y5A2120.jpg', '7Y5A2121.jpg', '7Y5A2123.jpg', 
    '7Y5A2126.jpg', '7Y5A2129.jpg', '7Y5A2132.jpg', '7Y5A2135.jpg', '7Y5A2137.jpg', '7Y5A2140.jpg', 
    '7Y5A2142.jpg', '7Y5A2144.jpg', '7Y5A2146.jpg', '7Y5A2154.jpg', '7Y5A2155.jpg', '7Y5A2156.jpg', 
    '7Y5A2158.jpg', '7Y5A2160.jpg', '7Y5A2163.jpg', '7Y5A2166.jpg', '7Y5A2169.jpg', '7Y5A2173.jpg', 
    '7Y5A2174.jpg', '7Y5A2175.jpg', '7Y5A2179.jpg', '7Y5A2181.jpg', '7Y5A2182.jpg', '7Y5A2188.jpg', 
    '7Y5A2189.jpg', '7Y5A2190.jpg', '7Y5A2192.jpg', '7Y5A2194.jpg', '7Y5A2195.jpg', '7Y5A2196.jpg', 
    '7Y5A2197.jpg', '7Y5A2198.jpg', '7Y5A2200.jpg', '7Y5A2202.jpg', '7Y5A2204.jpg', '7Y5A2205.jpg', 
    '7Y5A2206.jpg', '7Y5A2208.jpg', '7Y5A2209.jpg', '7Y5A2212.jpg', '7Y5A2215.jpg', '7Y5A2217.jpg', 
    '7Y5A2221.jpg', '7Y5A2222.jpg', '7Y5A2223.jpg', '7Y5A2225.jpg', '7Y5A2226.jpg', '7Y5A2227.jpg', 
    '7Y5A2228.jpg', '7Y5A2229.jpg', '7Y5A2230.jpg', '7Y5A2233.jpg', '7Y5A2235.jpg', '7Y5A2236.jpg', 
    '7Y5A2238.jpg', '7Y5A2240.jpg', '7Y5A2241.jpg', '7Y5A2242.jpg', '7Y5A2245.jpg', '7Y5A2247.jpg', 
    '7Y5A2250.jpg', '7Y5A2253.jpg', '7Y5A2255.jpg', '7Y5A2257.jpg', '7Y5A2259.jpg', '7Y5A2261.jpg', 
    '7Y5A2264.jpg', '7Y5A2267.jpg', '7Y5A2268.jpg', '7Y5A2269.jpg', '7Y5A2270.jpg', '7Y5A2271.jpg', 
    '7Y5A2273.jpg', '7Y5A2274.jpg', '7Y5A2275.jpg', '7Y5A2277.jpg', '7Y5A2278.jpg', '7Y5A2279.jpg', 
    '7Y5A2283.jpg', '7Y5A2284.jpg', '7Y5A2285.jpg', '7Y5A2287.jpg', '7Y5A2288.jpg', '7Y5A2290.jpg', 
    '7Y5A2292.jpg', '7Y5A2293.jpg', '7Y5A2294.jpg', '7Y5A2295.jpg', '7Y5A2296.jpg', '7Y5A2297.jpg', 
    '7Y5A2298.jpg', '7Y5A2300.jpg', '7Y5A2302.jpg', '7Y5A2304.jpg', '7Y5A2306.jpg', '7Y5A2308.jpg', 
    '7Y5A2311.jpg', '7Y5A2312.jpg', '7Y5A2313.jpg', '7Y5A2314.jpg', '7Y5A2319.jpg', '7Y5A2322.jpg', 
    '7Y5A2323.jpg', '7Y5A2325.jpg', '7Y5A2326.jpg', '7Y5A2328.jpg', '7Y5A2333.jpg', '7Y5A2334.jpg', 
    '7Y5A2338.jpg', '7Y5A2340.jpg', '7Y5A2341.jpg', '7Y5A2344.jpg', '7Y5A2346.jpg', '7Y5A2347.jpg', 
    '7Y5A2348.jpg', '7Y5A2350.jpg', '7Y5A2351.jpg', '7Y5A2352.jpg', '7Y5A2355.jpg', '7Y5A2358.jpg', 
    '7Y5A2359.jpg', '7Y5A2360.jpg', '7Y5A2361.jpg', '7Y5A2364.jpg', '7Y5A2365.jpg', '7Y5A2366.jpg', 
    '7Y5A2367.jpg', '7Y5A2369.jpg', '7Y5A2371.jpg', '7Y5A2373.jpg', '7Y5A2375.jpg', '7Y5A2376.jpg', 
    '7Y5A2377.jpg', '7Y5A2378.jpg', '7Y5A2379.jpg', '7Y5A2381.jpg', '7Y5A2383.jpg', '7Y5A2385.jpg', 
    '7Y5A2387.jpg', '7Y5A2389.jpg', '7Y5A2391.jpg', '7Y5A2394.jpg', '7Y5A2396.jpg', '7Y5A2397.jpg', 
    '7Y5A2398.jpg', '7Y5A2401.jpg', '7Y5A2404.jpg', '7Y5A2406.jpg', '7Y5A2409.jpg', '7Y5A2412.jpg', 
    '7Y5A2413.jpg', '7Y5A2416.jpg', '7Y5A2417.jpg', '7Y5A2419.jpg', '7Y5A2422.jpg', '7Y5A2424.jpg', 
    '7Y5A2425.jpg', '7Y5A2428.jpg', '7Y5A2430.jpg', '7Y5A2432.jpg', '7Y5A2433.jpg', '7Y5A2436.jpg', 
    '7Y5A2437.jpg', '7Y5A2438.jpg', '7Y5A2440.jpg', '7Y5A2442.jpg', '7Y5A2445.jpg', '7Y5A2446.jpg', 
    '7Y5A2448.jpg', '7Y5A2449.jpg', '7Y5A2450.jpg', '7Y5A2451.jpg', '7Y5A2454.jpg', '7Y5A2458.jpg', 
    '7Y5A2460.jpg', '7Y5A2463.jpg', '7Y5A2468.jpg', '7Y5A2472.jpg', '7Y5A2473.jpg', '7Y5A2475.jpg', 
    '7Y5A2477.jpg', '7Y5A2480.jpg', '7Y5A2485.jpg', '7Y5A2493.jpg', '7Y5A2495.jpg', '7Y5A2502.jpg', 
    '7Y5A2507.jpg', '7Y5A2509.jpg', '7Y5A2510.jpg', '7Y5A2513.jpg', '7Y5A2515.jpg', '7Y5A2516.jpg', 
    '7Y5A2518.jpg', '7Y5A2519.jpg', '7Y5A2524.jpg', '7Y5A2527.jpg', '7Y5A2531.jpg', '7Y5A2532.jpg', 
    '7Y5A2534.jpg', '7Y5A2536.jpg', '7Y5A2537.jpg', '7Y5A2539.jpg', '7Y5A2542.jpg', '7Y5A2544.jpg', 
    '7Y5A2546.jpg', '7Y5A2550.jpg', '7Y5A2553.jpg', '7Y5A2556.jpg', '7Y5A2559.jpg', '7Y5A2567.jpg', 
    '7Y5A2568.jpg', '7Y5A2570.jpg', '7Y5A2578.jpg', '7Y5A2583.jpg', '7Y5A2585.jpg', '7Y5A2588.jpg', 
    '7Y5A2590.jpg', '7Y5A2593.jpg', '7Y5A2597.jpg', '7Y5A2598.jpg', '7Y5A2600.jpg', '7Y5A2601.jpg', 
    '7Y5A2603.jpg', '7Y5A2604.jpg', '7Y5A2605.jpg', '7Y5A2606.jpg', '7Y5A2609.jpg', '7Y5A2613.jpg', 
    '7Y5A2616.jpg', '7Y5A2618.jpg', '7Y5A2619.jpg', '7Y5A2620.jpg', '7Y5A2622.jpg', '7Y5A2623.jpg', 
    '7Y5A2624.jpg', '7Y5A2626.jpg', '7Y5A2629.jpg', '7Y5A2636.jpg', '7Y5A2637.jpg', '7Y5A2639.jpg', 
    '7Y5A2640.jpg', '7Y5A2643.jpg', '7Y5A2644.jpg', '7Y5A2646.jpg', '7Y5A2648.jpg', '7Y5A2650.jpg', 
    '7Y5A2657.jpg', '7Y5A2662.jpg', '7Y5A2664.jpg', '7Y5A2666.jpg', '7Y5A2667.jpg', '7Y5A2669.jpg', 
    '7Y5A2674.jpg', '7Y5A2675.jpg', '7Y5A2677.jpg', '7Y5A2678.jpg', '7Y5A2679.jpg', '7Y5A2684.jpg', 
    '7Y5A2685.jpg', '7Y5A2686.jpg', '7Y5A2687.jpg', '7Y5A2688.jpg', '7Y5A2689.jpg', '7Y5A2691.jpg', 
    '7Y5A2692.jpg', '7Y5A2693.jpg', '7Y5A2694.jpg', '7Y5A2695.jpg', '7Y5A2696.jpg', '7Y5A2697.jpg', 
    '7Y5A2698.jpg', '7Y5A2700.jpg', '7Y5A2701.jpg', '7Y5A2703.jpg', '7Y5A2704.jpg', '7Y5A2705.jpg', 
    '7Y5A2706.jpg', '7Y5A2708.jpg', '7Y5A2709.jpg', '7Y5A2710.jpg', '7Y5A2715.jpg', '7Y5A2716.jpg', 
    '7Y5A2717.jpg', '7Y5A2718.jpg', '7Y5A2720.jpg', '7Y5A2721.jpg', '7Y5A2723.jpg', '7Y5A2725.jpg', 
    '7Y5A2727.jpg', '7Y5A2728.jpg', '7Y5A2729.jpg', '7Y5A2731.jpg', '7Y5A2732.jpg', '7Y5A2733.jpg', 
    '7Y5A2734.jpg', '7Y5A2735.jpg', '7Y5A2736.jpg', '7Y5A2737.jpg', '7Y5A2738.jpg', '7Y5A2739.jpg', 
    '7Y5A2740.jpg', '7Y5A2741.jpg', '7Y5A2742.jpg', '7Y5A2743.jpg', '7Y5A2744.jpg', '7Y5A2745.jpg', 
    '7Y5A2746.jpg', '7Y5A2747.jpg', '7Y5A2748.jpg', '7Y5A2749.jpg', '7Y5A2750.jpg', '7Y5A2751.jpg', 
    '7Y5A2752.jpg', '7Y5A2753.jpg', '7Y5A2754.jpg', '7Y5A2756.jpg', '7Y5A2757.jpg', '7Y5A2758.jpg', 
    '7Y5A2759.jpg', '7Y5A2760.jpg', '7Y5A2761.jpg', '7Y5A2762.jpg', '7Y5A2763.jpg', '7Y5A2764.jpg', 
    '7Y5A2766.jpg', '7Y5A2767.jpg', '7Y5A2769.jpg', '7Y5A2770.jpg', '7Y5A2771.jpg', '7Y5A2772.jpg', 
    '7Y5A2773.jpg', '7Y5A2774.jpg', '7Y5A2775.jpg', '7Y5A2776.jpg', '7Y5A2777.jpg', '7Y5A2778.jpg', 
    '7Y5A2779.jpg', '7Y5A2780.jpg', '7Y5A2782.jpg', '7Y5A2783.jpg', '7Y5A2784.jpg', '7Y5A2785.jpg', 
    '7Y5A2786.jpg', '7Y5A2787.jpg', '7Y5A2788.jpg', '7Y5A2789.jpg', '7Y5A2790.jpg', '7Y5A2791.jpg', 
    '7Y5A2792.jpg', '7Y5A2793.jpg', '7Y5A2794.jpg', '7Y5A2795.jpg', '7Y5A2796.jpg', '7Y5A2800.jpg', 
    '7Y5A2801.jpg', '7Y5A2802.jpg', '7Y5A2803.jpg', '7Y5A2804.jpg', '7Y5A2805.jpg', '7Y5A2806.jpg', 
    '7Y5A2807.jpg', '7Y5A2808.jpg', '7Y5A2809.jpg', '7Y5A2810.jpg', '7Y5A2811.jpg', '7Y5A2812.jpg', 
    '7Y5A2814.jpg', '7Y5A2815.jpg', '7Y5A2816.jpg', '7Y5A2817.jpg', '7Y5A2820.jpg', '7Y5A2821.jpg', 
    '7Y5A2823.jpg', '7Y5A2825.jpg', '7Y5A2826.jpg', '7Y5A2831.jpg', '7Y5A2835.jpg', '7Y5A2838.jpg', 
    '7Y5A2839.jpg', '7Y5A2844.jpg', '7Y5A2851.jpg', '7Y5A2854.jpg', '7Y5A2856.jpg', '7Y5A2857.jpg', 
    '7Y5A2858.jpg', '7Y5A2860.jpg', '7Y5A2861.jpg', '7Y5A2862.jpg', '7Y5A2864.jpg', '7Y5A2867.jpg', 
    '7Y5A2869.jpg', '7Y5A2872.jpg', '7Y5A2874.jpg', '7Y5A2879.jpg', '7Y5A2880.jpg', '7Y5A2882.jpg', 
    '7Y5A2883.jpg', '7Y5A2888.jpg', '7Y5A2890.jpg', '7Y5A2891.jpg', '7Y5A2896.jpg', '7Y5A2897.jpg', 
    '7Y5A2898.jpg', '7Y5A2903.jpg', '7Y5A2905.jpg', '7Y5A2906.jpg', '7Y5A2907.jpg', '7Y5A2909.jpg', 
    '7Y5A2911.jpg', '7Y5A2912.jpg', '7Y5A2914.jpg', '7Y5A2916.jpg'
  ];
  
  return filenames.map((filename, index) => ({
    id: `archive-2025-${index + 1}`,
    url: `/events/2025/archive/${filename}`,
    thumbnail: `/events/2025/archive/${filename}`,
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
        title: 'Fall Rooftop Celebration 2025',
        date: new Date('2025-09-25'),
        description: 'Exclusive rooftop party with panoramic city views, craft cocktails, and live DJ sets at The Archive.',
        photos: generateArchive2025Photos(),
        coverPhoto: '/events/2025/archive/7Y5A2032.jpg',
        attendees: 370,
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