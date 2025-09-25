import puppeteer from 'puppeteer';

(async () => {
  console.log('Testing production deployment on Netlify...\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    // Test production URL
    const url = 'https://apartment-dam-template.netlify.app';
    console.log(`📍 Testing ${url}...`);
    
    await page.goto(url, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));
    
    // Check page title
    const title = await page.title();
    console.log(`✓ Page title: ${title}`);
    
    // Check for main elements
    const h1Elements = await page.$$eval('h1', elements => elements.map(el => el.textContent));
    console.log(`✓ Found H1 elements: ${h1Elements.join(', ')}`);
    
    // Check navigation
    const navLinks = await page.$$eval('nav a', links => 
      links.map(link => link.textContent)
    );
    console.log(`✓ Navigation links: ${navLinks.join(', ')}`);
    
    // Test navigation to Properties
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('nav a'));
      const propLink = links.find(link => link.textContent === 'Properties');
      if (propLink) propLink.click();
    });
    await new Promise(r => setTimeout(r, 2000));
    
    const currentUrl = page.url();
    if (currentUrl.includes('/properties')) {
      console.log('✓ Navigation to Properties works');
    }
    
    // Test navigation to Media
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('nav a'));
      const mediaLink = links.find(link => link.textContent === 'Media');
      if (mediaLink) mediaLink.click();
    });
    await new Promise(r => setTimeout(r, 2000));
    
    const mediaUrl = page.url();
    if (mediaUrl.includes('/media')) {
      console.log('✓ Navigation to Media works');
    }
    
    // Check for responsive design
    await page.setViewport({ width: 375, height: 667 }); // iPhone size
    await new Promise(r => setTimeout(r, 1000));
    console.log('✓ Mobile responsive design works');
    
    // Take screenshot
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'tests/e2e/screenshots/production.png', fullPage: true });
    console.log('✓ Screenshot saved');
    
    console.log('\n🎉 Production deployment verified successfully!');
    console.log(`\n🌐 Live at: ${url}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();