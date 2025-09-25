import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  
  console.log('🔍 Testing Apartment DAM - Image Loading');
  console.log('='.repeat(50));
  
  try {
    // Load the app
    await page.goto('http://localhost:4174', { 
      waitUntil: 'networkidle2',
      timeout: 15000 
    });
    
    // Wait for initial render
    await page.waitForSelector('h1', { timeout: 5000 });
    console.log('✓ App loaded successfully');
    
    // Check Dashboard
    const dashboardTitle = await page.$eval('h1', el => el.textContent);
    console.log(`\n📊 Dashboard: "${dashboardTitle}"`);
    
    // Count images
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for images to start loading
    
    const images = await page.$$eval('img', imgs => 
      imgs.map(img => ({
        src: img.src,
        loaded: img.complete && img.naturalHeight > 0,
        isPlaceholder: img.src.includes('unsplash') || img.src.includes('picsum')
      }))
    );
    
    const placeholderImages = images.filter(img => img.isPlaceholder);
    const loadedImages = placeholderImages.filter(img => img.loaded);
    
    console.log(`  Total images found: ${images.length}`);
    console.log(`  Placeholder images: ${placeholderImages.length}`);
    console.log(`  Successfully loaded: ${loadedImages.length}/${placeholderImages.length}`);
    
    if (placeholderImages.length > 0) {
      console.log('\n  First 3 placeholder URLs:');
      placeholderImages.slice(0, 3).forEach(img => {
        const source = img.src.includes('unsplash') ? 'Unsplash' : 'Picsum';
        const status = img.loaded ? '✓' : '✗';
        console.log(`    ${status} [${source}] ${img.src.substring(0, 60)}...`);
      });
    }
    
    // Navigate to Properties
    await page.click('a[href="/properties"]');
    await page.waitForSelector('h1', { timeout: 5000 });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const propertiesTitle = await page.$eval('h1', el => el.textContent);
    console.log(`\n🏢 Properties Page: "${propertiesTitle}"`);
    
    const propertyCards = await page.$$eval('.grid img', imgs => imgs.length);
    console.log(`  Property card images: ${propertyCards}`);
    
    // Navigate to Media Library
    await page.click('a[href="/media"]');
    await page.waitForSelector('h1', { timeout: 5000 });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mediaTitle = await page.$eval('h1', el => el.textContent);
    console.log(`\n📸 Media Library: "${mediaTitle}"`);
    
    // Get media stats
    const totalImages = await page.$eval('.bg-white .text-2xl', el => el.textContent);
    console.log(`  Total images in library: ${totalImages}`);
    
    // Check grid images
    const gridImages = await page.$$eval('.grid img', imgs => imgs.length);
    console.log(`  Grid view images: ${gridImages}`);
    
    // Test image modal
    if (gridImages > 0) {
      await page.click('.grid .group:first-child');
      await page.waitForSelector('.fixed.inset-0', { timeout: 2000 });
      console.log('  ✓ Image modal opens successfully');
      await page.keyboard.press('Escape');
    }
    
    // Final summary
    console.log('\n' + '='.repeat(50));
    if (loadedImages.length > 0) {
      console.log('✅ SUCCESS: Placeholder images are loading properly!');
      console.log(`   ${loadedImages.length} images loaded from Unsplash/Picsum`);
    } else if (placeholderImages.length > 0) {
      console.log('⚠️  WARNING: Images found but not fully loaded');
      console.log('   This might be due to network delays');
    } else {
      console.log('❌ ERROR: No placeholder images found');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();