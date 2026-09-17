import re

with open('src/server/browserWorker.ts', 'r') as f:
    content = f.read()

playwright_logic = """
    // Playwright extraction
    emitEvent({
      jobId,
      stage: 'INGESTION',
      stageLabel: 'Playwright Browser Worker Launch',
      percent: 15,
      processedCount: 0,
      totalLimit: targetLimit,
      logMessage: `[00:00:03] Browser worker launched for target location "${locationDisplayName}". Navigating to public Meta Ad Library search URL for "${keywordsList[0]}".`
    });

    const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const context = await browser.newContext();
    const page = await context.newPage();
    const searchUrl = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=${cleanLocationCode}&q=${encodeURIComponent(keywordsList[0])}`;
    
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000); // Allow time for dynamic results
    
    // Simple pagination / scroll
    for (let i = 0; i < 3; i++) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1000);
    }
    
    const items = await page.evaluate((targetLimit) => {
        const results = [];
        const spans = Array.from(document.querySelectorAll('span')).filter(s => s.innerText === 'Sponsored');
        let counter = 1;
        for (let span of spans) {
            let container = span.parentElement;
            for (let i = 0; i < 8; i++) {
                if (container && container.parentElement) container = container.parentElement;
            }
            if (container) {
                const text = container.innerText || "";
                
                // Get Page Name
                let pageName = 'Unknown';
                const sponsoredIdx = text.indexOf("Sponsored");
                if (sponsoredIdx > 0) {
                    pageName = text.substring(0, sponsoredIdx).trim().split('\\n').pop();
                }
                
                // Regex for domain
                const domainMatch = text.match(/([a-zA-Z0-9-]+\\.(com|org|net|co\\.uk|io|ai|co|store|shop))/i);
                let destinationUrl = domainMatch ? `https://${domainMatch[0].toLowerCase()}` : '';
                
                // Library ID
                let adLibraryId = `meta_ad_${Date.now()}_${counter++}`;
                const idMatch = text.match(/Library ID:\\s*(\\d+)/);
                if (idMatch) {
                    adLibraryId = idMatch[1];
                }
                
                results.push({
                   pageName,
                   pageId: 'page_' + Math.random().toString(36).substring(2, 8),
                   adLibraryId,
                   destinationUrl,
                   adCreativeText: text
                });
            }
        }
        return results;
    }, targetLimit);
    
    await browser.close();
    
    for (let i = 0; i < items.length; i++) {
      if (discoveredAdvertisers.length >= targetLimit) break;
      const item = items[i];
      const progressPercent = Math.round(20 + ((i + 1) / items.length) * 70);
"""

def replacer(match):
    return playwright_logic

content = re.sub(
    r'for \(let i = 0; i < SAAS_CORPUS\.length; i\+\+\) \{.*?const progressPercent = Math\.round.*?;\n',
    replacer,
    content,
    flags=re.DOTALL
)

with open('src/server/browserWorker.ts', 'w') as f:
    f.write(content)

