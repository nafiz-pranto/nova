import re

with open('src/components/ExportPipelineStudio.tsx', 'r') as f:
    content = f.read()

old_csv_headers = """    const headers = [
      'advertiser_id',
      'canonical_name',
      'ad_library_id',
      'qualification_state',
      'qualification_score',
      'active_ad_count',
      'destination_domain',
      'destination_url',
      'website_reachable',
      'tls_version',
      'ssrf_validated',
      'extracted_at'
    ];"""

new_csv_headers = """    const headers = [
      'advertiser_id',
      'canonical_name',
      'location_code',
      'matched_keywords',
      'ad_library_id',
      'qualification_state',
      'qualification_score',
      'active_ad_count',
      'destination_domain',
      'destination_url',
      'website_reachable',
      'tls_version',
      'ssrf_validated',
      'extracted_at'
    ];"""

content = content.replace(old_csv_headers, new_csv_headers)

old_csv_row = """    const rows = activeFilteredLeads.map(adv => [
      adv.advertiserId,
      `"${sanitizeFormulaCell(adv.canonicalName).replace(/"/g, '""')}"`,
      adv.adLibraryId,"""

new_csv_row = """    const rows = activeFilteredLeads.map(adv => [
      adv.advertiserId,
      `"${sanitizeFormulaCell(adv.canonicalName).replace(/"/g, '""')}"`,
      adv.locationCode || '',
      `"${(adv.matchedKeywords || []).join(';')}"`,
      adv.adLibraryId,"""

content = content.replace(old_csv_row, new_csv_row)

old_json_rec = """      records: activeFilteredLeads.map(adv => ({
        advertiserId: adv.advertiserId,
        canonicalName: adv.canonicalName,"""

new_json_rec = """      records: activeFilteredLeads.map(adv => ({
        advertiserId: adv.advertiserId,
        canonicalName: adv.canonicalName,
        locationCode: adv.locationCode,
        matchedKeywords: adv.matchedKeywords,
"""

content = content.replace(old_json_rec, new_json_rec)

with open('src/components/ExportPipelineStudio.tsx', 'w') as f:
    f.write(content)
