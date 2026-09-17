const { chromium } = require('playwright');
(async () => {
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Wayfair');
    await page.waitForTimeout(5000);
    const body = await page.evaluate(() => document.body.innerText);
    console.log(body.substring(0, 1000));
    const advertisers = await page.evaluate(() => {
        const divs = Array.from(document.querySelectorAll('div'));
        const results = [];
        for (let div of divs) {
            // Find advertiser name. It usually follows "Sponsored" or is inside the ad card.
            // Let's just find elements that look like advertiser headers.
            if (div.innerText && div.innerText.includes('Sponsored')) {
                results.push(div.innerText);
            }
        }
        return results;
    });
    console.log("Found Ad Containers:", advertisers.length);
    await browser.close();
  } catch(e) {
    console.error(e);
  }
})();
