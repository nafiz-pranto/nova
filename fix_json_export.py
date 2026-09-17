import re

with open('src/components/ExportPipelineStudio.tsx', 'r') as f:
    content = f.read()

content = content.replace("""        locationCode: adv.locationCode,
        matchedKeywords: adv.matchedKeywords,

        locationCode: adv.locationCode,
        matchedKeywords: adv.matchedKeywords,""", """        locationCode: adv.locationCode,
        matchedKeywords: adv.matchedKeywords,""")

with open('src/components/ExportPipelineStudio.tsx', 'w') as f:
    f.write(content)
