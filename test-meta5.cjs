const { chromium } = require('playwright');
(async () => {
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Wayfair');
    await page.waitForTimeout(5000);
    const items = await page.evaluate(() => {
        const results = [];
        const spans = Array.from(document.querySelectorAll('span')).filter(s => s.innerText === 'Sponsored');
        for (let span of spans) {
            // Traverse up to find the card container
            let container = span.parentElement;
            for (let i = 0; i < 8; i++) {
                if (container && container.parentElement) container = container.parentElement;
            }
            if (container) {
                const links = Array.from(container.querySelectorAll('a')).map(a => a.href).filter(l => l && !l.includes('facebook.com'));
                const pageNameElement = container.querySelector('a'); // Often the first link is the page
                let pageName = 'Unknown';
                if (pageNameElement && pageNameElement.innerText) {
                    pageName = pageNameElement.innerText;
                } else {
                    // fallback to finding the first text before "Sponsored"
                    const text = container.innerText || "";
                    const sponsoredIdx = text.indexOf("Sponsored");
                    if (sponsoredIdx > 0) {
                        pageName = text.substring(0, sponsoredIdx).trim().split('\n').pop();
                    }
                }
                
                results.push({
                   pageName,
                   links,
                   text: (container.innerText || "").substring(0, 150).replace(/\n/g, ' ')
                });
            }
        }
        return results;
    });
    console.log(items.slice(0, 3));
    await browser.close();
  } catch(e) {
    console.error(e);
  }
})();
