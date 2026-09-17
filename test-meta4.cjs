const { chromium } = require('playwright');
(async () => {
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Wayfair');
    await page.waitForTimeout(5000);
    const items = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('div')).filter(d => d.innerText && d.innerText.includes('Sponsored') && d.innerText.includes('Library ID:'));
        return cards.map(c => {
           const links = Array.from(c.querySelectorAll('a')).map(a => a.href);
           return {
               text: c.innerText.substring(0, 100),
               links: links.filter(l => l && !l.includes('facebook.com') && !l.includes('instagram.com'))
           };
        });
    });
    console.log(items.slice(0, 3));
    await browser.close();
  } catch(e) {
    console.error(e);
  }
})();
