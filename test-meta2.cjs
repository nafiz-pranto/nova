const { chromium } = require('playwright');
(async () => {
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Furniture');
    await page.waitForTimeout(5000);
    const body = await page.evaluate(() => document.body.innerText);
    console.log(body.substring(0, 1000));
    await browser.close();
  } catch(e) {
    console.error(e);
  }
})();
