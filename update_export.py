import re

with open('src/components/ExportPipelineStudio.tsx', 'r') as f:
    content = f.read()

# Update generateDynamicCsv
new_csv = """  const generateDynamicCsv = () => {
    const includeInternalMetadata = currentProfileData?.includesInternalMetadata;
    const headers = [
      'AdvertiserId', 'CanonicalName', 'LocationCode', 'MatchedKeywords', 'FacebookPageName', 'FacebookPageUrl', 'AdLibraryId', 'QualificationState', 
      'Score', 'ActiveAds', 'DestinationDomain', 'DestinationUrl', 'WebsiteReachable', 'TlsVersion', 'SsrfValidated', 'Timestamp'
    ];
    if (includeInternalMetadata) {
      headers.push('PresetId', 'PresetVersion');
    }
    
    const rows = activeFilteredLeads.map(adv => {
      const row = [
        adv.advertiserId,
        `"${sanitizeFormulaCell(adv.canonicalName).replace(/"/g, '""')}"`,
        `"${sanitizeFormulaCell(adv.locationCode || '').replace(/"/g, '""')}"`,
        `"${sanitizeFormulaCell((adv.matchedKeywords || []).join('; ')).replace(/"/g, '""')}"`,
        `"${sanitizeFormulaCell(adv.facebookPageName || '').replace(/"/g, '""')}"`,
        `"${sanitizeFormulaCell(adv.facebookPageUrl || '').replace(/"/g, '""')}"`,
        adv.adLibraryId,
        adv.qualificationState,
        adv.qualificationScore.toFixed(1),
        adv.activeAdCount,
        `"${sanitizeFormulaCell(adv.destinationDomain)}"`,
        `"${sanitizeFormulaCell(adv.destinationUrl).replace(/"/g, '""')}"`,
        adv.websiteReachable ? 'true' : 'false',
        adv.tlsVersion,
        adv.ssrfValidated ? 'true' : 'false',
        adv.lastCalculatedAt || new Date().toISOString()
      ];
      if (includeInternalMetadata) {
        row.push(`"${adv.sourcePresetId || ''}"`);
        row.push(`""`); // Preset version might be in metadata, but we'll leave empty if unavailable
      }
      return row.join(',');
    });

    return [headers.join(','), ...rows].join('\\n');
  };"""

content = re.sub(r"  const generateDynamicCsv = \(\) => \{[\s\S]*?return \[headers\.join\(\',\',\), \.\.\.rows\]\.join\(\'\\n\'\);\n  \};", new_csv, content)

# Update generateDynamicJson
new_json = """  const generateDynamicJson = () => {
    return {
      schemaVersion: '1.2.0-phase08-stable',
      exportProfile: selectedProfile,
      generatedAt: new Date().toISOString(),
      recordCount: activeFilteredLeads.length,
      records: activeFilteredLeads.map(adv => ({
        advertiserId: adv.advertiserId,
        canonicalName: adv.canonicalName,
        locationCode: adv.locationCode,
        matchedKeywords: adv.matchedKeywords,
        facebookPageName: adv.facebookPageName,
        facebookPageUrl: adv.facebookPageUrl,
        adLibraryId: adv.adLibraryId,
        activeAdCount: adv.activeAdCount,
        qualificationState: adv.qualificationState,
        qualificationScore: adv.qualificationScore,
        destinationDomain: adv.destinationDomain,
        destinationUrl: adv.destinationUrl,
        websiteReachable: adv.websiteReachable,
        tlsVersion: adv.tlsVersion,
        provenance: currentProfileData?.includesInternalMetadata ? adv.provenanceSummary : undefined
      }))
    };
  };"""

content = re.sub(r"  const generateDynamicJson = \(\) => \{[\s\S]*?\}\)\)\n    \};\n  \};", new_json, content)

with open('src/components/ExportPipelineStudio.tsx', 'w') as f:
    f.write(content)
