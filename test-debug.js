import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true
  });
  const page = await browser.newPage();
  
  // Listen for console messages
  page.on('console', msg => {
    console.log(`CONSOLE [${msg.type()}]:`, msg.text());
  });
  
  // Listen for page errors
  page.on('error', err => {
    console.error('PAGE ERROR:', err);
  });
  
  // Listen for page crashes
  page.on('pageerror', err => {
    console.error('PAGE CRASH:', err);
  });
  
  console.log('Loading application...');
  
  try {
    const response = await page.goto('http://localhost:5173', { 
      waitUntil: 'networkidle0',
      timeout: 10000 
    });
    
    console.log('Response status:', response.status());
    
    // Check if React root exists
    const hasRoot = await page.$('#root') !== null;
    console.log('Has #root element:', hasRoot);
    
    // Get the root element's content
    const rootContent = await page.$eval('#root', el => el.innerHTML);
    console.log('Root element content:', rootContent ? rootContent.substring(0, 100) : 'EMPTY');
    
    // Check for any error messages
    const bodyText = await page.$eval('body', el => el.innerText);
    console.log('Body text:', bodyText ? bodyText.substring(0, 200) : 'EMPTY');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  console.log('\nKeeping browser open for debugging...');
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  await browser.close();
})();