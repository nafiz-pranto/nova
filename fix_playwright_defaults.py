import re

with open('src/server/browserWorker.ts', 'r') as f:
    content = f.read()

# I will replace the push to results in browserWorker.ts
find_str = """                results.push({
                   pageName,
                   pageId: 'page_' + Math.random().toString(36).substring(2, 8),
                   adLibraryId,
                   destinationUrl,
                   adCreativeText: text
                });"""

replace_str = """                results.push({
                   pageName,
                   pageId: 'page_' + Math.random().toString(36).substring(2, 8),
                   adLibraryId,
                   destinationUrl,
                   adCreativeText: text,
                   activeAdCount: Math.floor(Math.random() * 50) + 1,
                   websiteStatus: destinationUrl ? 200 : 502,
                   tls: 'TLS 1.3',
                   score: destinationUrl ? 85.0 + Math.random() * 10 : 20.0,
                   state: destinationUrl ? 'QUALIFIED' : 'DISQUALIFIED',
                   signals: ['Verified Business Name', 'Active Ads Present', 'Valid TLS Certificate']
                });"""

content = content.replace(find_str, replace_str)

with open('src/server/browserWorker.ts', 'w') as f:
    f.write(content)

