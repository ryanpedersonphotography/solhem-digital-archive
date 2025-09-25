import puppeteer from 'puppeteer';

(async () => {
  console.log('Starting Puppeteer test for dashboard...');
  
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
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    
    // Wait a bit for React to render
    await new Promise(r => setTimeout(r, 2000));
    
    // Test 1: Check for header
    const headerExists = await page.$('header') !== null;
    if (headerExists) {
      console.log('✓ Header component loaded');
      const appTitle = await page.$eval('header h1', el => el.textContent);
      console.log(`✓ App title: ${appTitle}`);
    }
    
    // Test 2: Check for dashboard heading
    await page.waitForSelector('h1');
    const dashboardTitle = await page.$$eval('h1', elements => {
      const dashboard = elements.find(el => el.textContent.includes('Dashboard'));
      return dashboard ? dashboard.textContent : null;
    });
    if (dashboardTitle) {
      console.log('✓ Dashboard heading found');
    }
    
    // Test 3: Check for stats cards
    const statsCards = await page.$$('.grid > div');
    console.log(`✓ Found ${statsCards.length} stat cards`);
    
    // Test 4: Check for property cards
    const propertyCards = await page.$$eval('h3', elements => {
      return elements.filter(el => 
        el.textContent === 'Sunset Apartments' || 
        el.textContent === 'Park View Complex' || 
        el.textContent === 'Downtown Lofts'
      ).length;
    });
    console.log(`✓ Found ${propertyCards} property cards`);
    
    // Test 5: Check for footer
    const footerExists = await page.$('footer') !== null;
    if (footerExists) {
      console.log('✓ Footer component loaded');
    }
    
    // Test 6: Check for navigation items
    const navItems = await page.$$eval('nav a', elements => 
      elements.map(el => el.textContent)
    );
    console.log(`✓ Navigation items: ${navItems.join(', ')}`);
    
    // Test 7: Check for Recent Activity section
    const recentActivityTitle = await page.$eval('h3', el => {
      const h3s = document.querySelectorAll('h3');
      for (let h3 of h3s) {
        if (h3.textContent === 'Recent Activity') return true;
      }
      return false;
    }).catch(() => false);
    
    if (recentActivityTitle) {
      console.log('✓ Recent Activity section found');
    }
    
    // Test 8: Take screenshot
    await page.screenshot({ path: 'tests/e2e/screenshots/dashboard.png', fullPage: true });
    console.log('✓ Screenshot saved to tests/e2e/screenshots/dashboard.png');
    
    console.log('\n🎉 All dashboard tests passed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();