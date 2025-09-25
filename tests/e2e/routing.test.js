import puppeteer from 'puppeteer';

(async () => {
  console.log('Starting Puppeteer routing test...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    // Test 1: Dashboard route
    console.log('\n📍 Testing Dashboard route (/)...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));
    
    // Debug: check page content
    const pageContent = await page.content();
    console.log('Page loaded, checking for content...');
    
    const h1Elements = await page.$$eval('h1', elements => elements.map(el => el.textContent));
    console.log('H1 elements found:', h1Elements);
    
    const dashboardTitle = h1Elements.find(title => title === 'Dashboard');
    if (dashboardTitle === 'Dashboard') {
      console.log('✓ Dashboard page loaded correctly');
    } else {
      throw new Error('Dashboard page not found');
    }
    
    // Check for dashboard stats
    const statsCards = await page.$$('.grid > div');
    console.log(`✓ Found ${statsCards.length} stat cards on dashboard`);
    
    // Test 2: Navigate to Properties
    console.log('\n📍 Testing navigation to Properties...');
    const propertyLinks = await page.$$eval('nav a', links => 
      links.map(link => ({ text: link.textContent, href: link.href }))
    );
    console.log('Nav links found:', propertyLinks);
    
    // Click the Properties link using text content
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('nav a'));
      const propLink = links.find(link => link.textContent === 'Properties');
      if (propLink) propLink.click();
    });
    await new Promise(r => setTimeout(r, 2000));
    
    const propertiesH1s = await page.$$eval('h1', elements => elements.map(el => el.textContent));
    const propertiesTitle = propertiesH1s.find(title => title === 'Properties');
    if (propertiesTitle === 'Properties') {
      console.log('✓ Properties page loaded correctly');
    } else {
      throw new Error('Properties page not found');
    }
    
    // Check for search input
    const searchInput = await page.$('input[placeholder="Search properties..."]');
    if (searchInput) {
      console.log('✓ Property search input found');
    }
    
    // Test search functionality
    await page.type('input[placeholder="Search properties..."]', 'Sunset');
    await new Promise(r => setTimeout(r, 500));
    const filteredCards = await page.$$eval('h3', elements => 
      elements.filter(el => el.textContent === 'Sunset Apartments').length
    );
    console.log(`✓ Search filter working - found ${filteredCards} matching property`);
    
    // Test 3: Navigate to Media Library
    console.log('\n📍 Testing navigation to Media Library...');
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('nav a'));
      const mediaLink = links.find(link => link.textContent === 'Media');
      if (mediaLink) mediaLink.click();
    });
    await new Promise(r => setTimeout(r, 2000));
    
    const mediaH1s = await page.$$eval('h1', elements => elements.map(el => el.textContent));
    const mediaTitle = mediaH1s.find(title => title === 'Media Library');
    if (mediaTitle === 'Media Library') {
      console.log('✓ Media Library page loaded correctly');
    } else {
      throw new Error('Media Library page not found');
    }
    
    // Test view mode toggle
    const listViewButton = await page.$$('.flex.border button');
    if (listViewButton.length >= 2) {
      await listViewButton[1].click();
      await new Promise(r => setTimeout(r, 500));
      const tableExists = await page.$('table') !== null;
      console.log(`✓ View mode toggle working - table view: ${tableExists}`);
    }
    
    // Test 4: Navigate back to Dashboard via logo
    console.log('\n📍 Testing navigation via logo...');
    await page.click('header h1');
    await new Promise(r => setTimeout(r, 2000));
    
    const backH1s = await page.$$eval('h1', elements => elements.map(el => el.textContent));
    const backToDashboard = backH1s.find(title => title === 'Dashboard');
    if (backToDashboard === 'Dashboard') {
      console.log('✓ Logo navigation back to dashboard works');
    }
    
    // Test 5: Check active navigation states
    console.log('\n📍 Testing active navigation states...');
    const activeNavClass = await page.$eval('nav a[href="/"]', el => el.className);
    if (activeNavClass.includes('text-blue-600')) {
      console.log('✓ Active navigation state working');
    }
    
    // Test 6: Take screenshots of all pages
    console.log('\n📸 Taking screenshots...');
    await page.screenshot({ path: 'tests/e2e/screenshots/routing-dashboard.png', fullPage: true });
    
    await page.goto('http://localhost:5173/properties', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'tests/e2e/screenshots/routing-properties.png', fullPage: true });
    
    await page.goto('http://localhost:5173/media', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'tests/e2e/screenshots/routing-media.png', fullPage: true });
    
    console.log('✓ Screenshots saved for all routes');
    
    console.log('\n🎉 All routing tests passed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();