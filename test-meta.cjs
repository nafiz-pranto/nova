const { chromium } = require('playwright');
(async () => {
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Furniture');
    await page.waitForTimeout(5000);
    console.log(await page.title());
    // Try to get some html
    const html = await page.content();
    console.log("HTML LENGTH:", html.length);
    console.log("CONTAINS CAPTCHA:", html.includes("captcha") || html.includes("Security Check"));
    await browser.close();
    console.log("SUCCESS");
  } catch(e) {
    console.error(e);
  }
})();
