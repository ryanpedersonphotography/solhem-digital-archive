import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1280, height: 800 }
  });
  const page = await browser.newPage();
  
  console.log('Opening application...');
  
  try {
    await page.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' });
    
    // Wait a bit for React to render
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Take screenshot
    await page.screenshot({ path: 'app-screenshot.png', fullPage: true });
    console.log('Screenshot saved as app-screenshot.png');
    
    // Get page content
    const content = await page.content();
    const hasImages = content.includes('unsplash') || content.includes('picsum');
    const hasReact = content.includes('Dashboard') || content.includes('Properties');
    
    console.log('Page analysis:');
    console.log('  - Has placeholder images:', hasImages);
    console.log('  - Has React content:', hasReact);
    
    // Count images
    const images = await page.$$eval('img', imgs => 
      imgs.map(img => ({
        src: img.src,
        loaded: img.complete,
        visible: img.offsetWidth > 0 && img.offsetHeight > 0
      }))
    );
    
    console.log(`  - Found ${images.length} images`);
    if (images.length > 0) {
      const loaded = images.filter(img => img.loaded).length;
      const visible = images.filter(img => img.visible).length;
      console.log(`    - Loaded: ${loaded}/${images.length}`);
      console.log(`    - Visible: ${visible}/${images.length}`);
      
      console.log('\nFirst 3 images:');
      images.slice(0, 3).forEach(img => {
        const shortSrc = img.src.length > 60 ? img.src.substring(0, 60) + '...' : img.src;
        console.log(`  ${img.loaded ? '✓' : '✗'} ${shortSrc}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  console.log('\nBrowser will close in 5 seconds...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  await browser.close();
})();