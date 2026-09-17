import re

with open('src/components/ResearchWorkspace.tsx', 'r') as f:
    content = f.read()

old_thead = """            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/50 text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
                <th scope="col" className="py-2.5 px-3">Canonical Advertiser</th>
                <th scope="col" className="py-2.5 px-3">Ad Library Page ID</th>
                <th scope="col" className="py-2.5 px-3">Active Ads</th>
                <th scope="col" className="py-2.5 px-3">Destination Domain</th>
                <th scope="col" className="py-2.5 px-3">Website Reachability</th>
                <th scope="col" className="py-2.5 px-3">Score & Status</th>
                <th scope="col" className="py-2.5 px-3">Freshness</th>
                <th scope="col" className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>"""

new_thead = """            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/50 text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
                <th scope="col" className="py-2.5 px-3">Advertiser</th>
                <th scope="col" className="py-2.5 px-3">Facebook Page & Location</th>
                <th scope="col" className="py-2.5 px-3">Matched Keywords</th>
                <th scope="col" className="py-2.5 px-3">Active Ads</th>
                <th scope="col" className="py-2.5 px-3">Website</th>
                <th scope="col" className="py-2.5 px-3">Score & Status</th>
                <th scope="col" className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>"""

content = content.replace(old_thead, new_thead)

old_cells_regex = re.compile(
    r'<td className="py-3 px-3 font-mono text-\[11px\] text-neutral-500">.*?<td className="py-3 px-3 text-right">',
    re.DOTALL
)

new_cells_template = """<td className="py-3 px-3 font-mono text-[11px] text-neutral-500">
                    <div className="flex flex-col gap-1">
                      <span className="text-neutral-900 font-medium">{adv.facebookPageName || adv.canonicalName}</span>
                      <span>{adv.locationCode || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-xs text-neutral-600">
                    {adv.matchedKeywords && adv.matchedKeywords.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {adv.matchedKeywords.map((k, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded-sm bg-neutral-100 text-neutral-600 text-[10px] font-mono">{k}</span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-neutral-400">None</span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-neutral-700">{adv.activeAdCount}</td>
                  <td className="py-3 px-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-neutral-900 font-mono text-[11px] truncate max-w-[150px]">
                        {adv.destinationDomain || adv.destinationUrl || 'No Website'}
                      </span>
                      <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                        {adv.websiteReachable ? (
                          <><CheckCircle2 className="w-3 h-3 text-green-600" /> Found</>
                        ) : (
                          adv.destinationDomain || adv.destinationUrl ? <><AlertTriangle className="w-3 h-3 text-yellow-600" /> Not Reachable</> : <><Search className="w-3 h-3 text-neutral-400" /> Not Found</>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-col items-start gap-1.5">
                      <StatusBadge status={adv.qualificationState} size="sm" showPrefix={true} />
                      {adv.qualificationState === 'QUALIFIED' && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
                          <Check className="w-2.5 h-2.5" />
                          <span>{adv.qualificationScore.toFixed(0)}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">"""

content = re.sub(old_cells_regex, new_cells_template, content)

with open('src/components/ResearchWorkspace.tsx', 'w') as f:
    f.write(content)
