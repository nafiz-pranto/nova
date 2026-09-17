import re

with open('src/utils/researchWorkflowRunner.ts', 'r') as f:
    content = f.read()

replacement = """      // Deduplication Rule across keywords and cards
      const dedupKey = item.domain ? item.domain.toLowerCase() : item.pageName.toLowerCase();
      if (seenEntityKeys.has(dedupKey)) {
        onProgress?.({
          jobId,
          stage: 'NORMALIZATION',
          stageLabel: `Deduplicating Record ${i + 1}/${totalToExtract}: ${item.pageName}`,
          percent: progressPercent,
          processedCount: i + 1,
          totalLimit: totalToExtract,
          currentEntityName: item.pageName,
          logMessage: `[00:00:${String(5 + i * 2).padStart(2, '0')}] Deduplicated record "${item.pageName}" (matched existing entity ${dedupKey}).`
        });
        
        // Merge keyword attribution into the same lead
        const existingLead = discoveredAdvertisers.find(a => 
          (a.destinationDomain && a.destinationDomain.toLowerCase() === dedupKey) || 
          (a.canonicalName.toLowerCase() === dedupKey)
        );
        if (existingLead && existingLead.matchedKeywords) {
          const merged = new Set([...existingLead.matchedKeywords, ...keywordsList.slice(0, 3)]);
          existingLead.matchedKeywords = Array.from(merged);
        }
        
        continue;
      }
      seenEntityKeys.add(dedupKey);"""

content = re.sub(r"      // Deduplication Rule across keywords and cards[\s\S]*?seenEntityKeys\.add\(dedupKey\);", replacement, content)

with open('src/utils/researchWorkflowRunner.ts', 'w') as f:
    f.write(content)

