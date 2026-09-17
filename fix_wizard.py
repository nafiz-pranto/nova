import re

with open('src/components/ResearchWizard.tsx', 'r') as f:
    content = f.read()

content = content.replace(
"""export const ResearchWizard: React.FC<ResearchWizardProps> = ({
  onRunComplete,
  onNavigateToExport,
  onSelectAdvertiser,
}) => {""",
"""export const ResearchWizard: React.FC<ResearchWizardProps> = ({
  onRunComplete,
  onNavigateToLeads,
  onNavigateToExport,
  onSelectAdvertiser,
}) => {"""
)

with open('src/components/ResearchWizard.tsx', 'w') as f:
    f.write(content)

with open('src/components/LocationSelector.tsx', 'r') as f:
    loc_content = f.read()

old_label = """      <div className="flex items-center justify-between">
        <label htmlFor="location-selector-trigger" className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-neutral-600" />
          <span>Meta Ad Library Search Location (Target Market)</span>
        </label>
        <span className="text-[10px] text-neutral-500 font-mono">
          Catalogue {META_AD_LIBRARY_LOCATION_CATALOGUE_VERSION}
        </span>
      </div>"""

new_label = """      <div className="flex items-center justify-end">
        <span className="text-[10px] text-neutral-500 font-mono">
          Catalogue {META_AD_LIBRARY_LOCATION_CATALOGUE_VERSION}
        </span>
      </div>"""

loc_content = loc_content.replace(old_label, new_label)

with open('src/components/LocationSelector.tsx', 'w') as f:
    f.write(loc_content)
