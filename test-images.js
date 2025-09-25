import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Testing Apartment DAM Application - Image Loading');
  console.log('='.repeat(50));

  try {
    // Navigate to the app
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });
    console.log('✓ App loaded successfully');
    
    // Wait for React to render
    await page.waitForSelector('#root', { timeout: 5000 });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check Dashboard
    console.log('\n📊 Dashboard Page:');
    await page.waitForSelector('h1', { timeout: 5000 });
    
    // Check for property cards with images
    const propertyCards = await page.$$eval('img', imgs => 
      imgs.filter(img => img.src.includes('unsplash') || img.src.includes('picsum'))
        .map(img => ({
          src: img.src,
          loaded: img.complete && img.naturalHeight !== 0,
          alt: img.alt || 'No alt text'
        }))
    );
    
    console.log(`  Found ${propertyCards.length} placeholder images`);
    const loadedImages = propertyCards.filter(img => img.loaded).length;
    console.log(`  ${loadedImages}/${propertyCards.length} images loaded successfully`);
    
    if (propertyCards.length > 0) {
      console.log('  Sample images:');
      propertyCards.slice(0, 3).forEach(img => {
        const source = img.src.includes('unsplash') ? 'Unsplash' : 'Picsum';
        console.log(`    - [${source}] ${img.loaded ? '✓' : '✗'} ${img.alt}`);
      });
    }

    // Navigate to Properties page
    console.log('\n🏢 Properties Page:');
    await page.click('a[href="/properties"]');
    await page.waitForSelector('.grid', { timeout: 5000 });
    
    const propertyImages = await page.$$eval('.grid img', imgs => 
      imgs.map(img => ({
        loaded: img.complete && img.naturalHeight !== 0,
        src: img.src.substring(0, 50) + '...'
      }))
    );
    
    console.log(`  Found ${propertyImages.length} property images`);
    const loadedPropertyImages = propertyImages.filter(img => img.loaded).length;
    console.log(`  ${loadedPropertyImages}/${propertyImages.length} images loaded`);

    // Navigate to Media Library
    console.log('\n📸 Media Library Page:');
    await page.click('a[href="/media"]');
    await page.waitForSelector('.grid', { timeout: 5000 });
    
    // Count total media items
    const mediaStats = await page.$$eval('.bg-white.rounded-lg.shadow-sm.p-4', cards => {
      const stats = {};
      cards.forEach(card => {
        const label = card.querySelector('p.text-sm')?.textContent;
        const value = card.querySelector('p.text-2xl')?.textContent;
        if (label && value) stats[label] = value;
      });
      return stats;
    });
    
    console.log('  Media Statistics:');
    Object.entries(mediaStats).forEach(([key, value]) => {
      console.log(`    - ${key}: ${value}`);
    });

    // Check grid view images
    const gridImages = await page.$$eval('.grid img[loading="lazy"]', imgs => 
      imgs.slice(0, 10).map(img => ({
        loaded: img.complete && img.naturalHeight !== 0,
        width: img.naturalWidth,
        height: img.naturalHeight
      }))
    );
    
    if (gridImages.length > 0) {
      const loadedGrid = gridImages.filter(img => img.loaded).length;
      console.log(`  Grid view: ${loadedGrid}/${gridImages.length} thumbnails loaded`);
      
      // Click on first image to test modal
      await page.click('.grid .group:first-child');
      await page.waitForSelector('.fixed.inset-0', { timeout: 2000 });
      
      const modalImage = await page.$eval('.fixed img[alt]', img => ({
        loaded: img.complete && img.naturalHeight !== 0,
        dimensions: `${img.naturalWidth}x${img.naturalHeight}`
      }));
      
      console.log(`  Modal image: ${modalImage.loaded ? '✓ Loaded' : '✗ Not loaded'} (${modalImage.dimensions})`);
      
      // Close modal
      await page.keyboard.press('Escape');
    }

    // Test list view
    console.log('\n📋 Testing List View:');
    await page.click('button[onclick*="list"]');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const listImages = await page.$$eval('table img', imgs => 
      imgs.slice(0, 5).map(img => ({
        loaded: img.complete && img.naturalHeight !== 0
      }))
    );
    
    if (listImages.length > 0) {
      const loadedList = listImages.filter(img => img.loaded).length;
      console.log(`  List view: ${loadedList}/${listImages.length} thumbnails loaded`);
    }

    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    await browser.close();
    process.exit(0);
  }
})();