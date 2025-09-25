import puppeteer from 'puppeteer';

(async () => {
  console.log('Checking CSS styling...\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    // Check local dev server
    console.log('Testing local dev server...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));
    
    // Check if CSS is loaded
    const styles = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      if (h1) {
        const computedStyle = window.getComputedStyle(h1);
        return {
          fontSize: computedStyle.fontSize,
          fontWeight: computedStyle.fontWeight,
          color: computedStyle.color
        };
      }
      return null;
    });
    
    console.log('H1 styles:', styles);
    
    // Check for gradient background
    const bgGradient = await page.evaluate(() => {
      const elem = document.querySelector('.bg-gradient-to-br');
      if (elem) {
        const computedStyle = window.getComputedStyle(elem);
        return {
          backgroundImage: computedStyle.backgroundImage,
          backgroundColor: computedStyle.backgroundColor
        };
      }
      return null;
    });
    
    console.log('Background gradient:', bgGradient);
    
    // Check for Tailwind classes
    const tailwindClasses = await page.evaluate(() => {
      const elem = document.querySelector('.container.mx-auto');
      return elem ? elem.className : null;
    });
    
    console.log('Container classes:', tailwindClasses);
    
    // Check production site
    console.log('\nTesting production site...');
    await page.goto('https://apartment-dam-template.netlify.app', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));
    
    const prodStyles = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      if (h1) {
        const computedStyle = window.getComputedStyle(h1);
        return {
          fontSize: computedStyle.fontSize,
          fontWeight: computedStyle.fontWeight,
          color: computedStyle.color
        };
      }
      return null;
    });
    
    console.log('Production H1 styles:', prodStyles);
    
    // Take screenshots
    await page.screenshot({ path: 'tests/e2e/screenshots/css-check-local.png' });
    await page.goto('https://apartment-dam-template.netlify.app');
    await page.screenshot({ path: 'tests/e2e/screenshots/css-check-prod.png' });
    
    console.log('\nScreenshots saved for comparison');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();