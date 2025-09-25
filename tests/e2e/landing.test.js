import puppeteer from 'puppeteer';

(async () => {
  console.log('Starting Puppeteer test for landing page...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 720 });
    
    // Navigate to the app
    console.log('Navigating to http://localhost:5173...');
    
    // Listen for console messages
    page.on('console', msg => console.log('Browser console:', msg.text()));
    page.on('error', error => console.log('Browser error:', error.message));
    page.on('pageerror', error => console.log('Page error:', error.message));
    
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    
    // Wait a bit for React to render
    await new Promise(r => setTimeout(r, 2000));
    
    // Test 1: Check page title
    const title = await page.title();
    console.log('✓ Page title:', title);
    
    // Debug: Check if root exists and what's in it
    const rootContent = await page.$eval('#root', el => el.innerHTML).catch(() => 'No root element');
    console.log('Root element content:', rootContent.substring(0, 200));
    
    // Test 2: Check main heading - wait for it first
    await page.waitForSelector('h1', { timeout: 5000 });
    const heading = await page.$eval('h1', el => el.textContent);
    if (heading === 'Apartment Management Platform') {
      console.log('✓ Main heading is correct');
    } else {
      throw new Error(`Heading mismatch: ${heading}`);
    }
    
    // Test 3: Check for feature cards
    const cards = await page.$$('.bg-white.rounded-lg.shadow-lg');
    console.log(`✓ Found ${cards.length} feature cards`);
    
    if (cards.length !== 3) {
      throw new Error(`Expected 3 cards, found ${cards.length}`);
    }
    
    // Test 4: Check card titles
    const cardTitles = await page.$$eval('.bg-white h3', elements => 
      elements.map(el => el.textContent)
    );
    
    const expectedTitles = ['Property Management', 'Digital Assets', 'Tenant Portal'];
    for (const title of expectedTitles) {
      if (cardTitles.includes(title)) {
        console.log(`✓ Found card: ${title}`);
      } else {
        throw new Error(`Missing card: ${title}`);
      }
    }
    
    // Test 5: Check for Get Started button
    const button = await page.$('button');
    if (button) {
      const buttonText = await page.$eval('button', el => el.textContent);
      console.log(`✓ Found button: "${buttonText}"`);
    } else {
      throw new Error('Get Started button not found');
    }
    
    // Test 6: Check gradient background
    const bgClass = await page.$eval('div', el => el.className);
    if (bgClass.includes('bg-gradient-to-br')) {
      console.log('✓ Gradient background applied');
    }
    
    // Test 7: Take screenshot
    await page.screenshot({ path: 'tests/e2e/screenshots/landing.png' });
    console.log('✓ Screenshot saved to tests/e2e/screenshots/landing.png');
    
    console.log('\n🎉 All tests passed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();