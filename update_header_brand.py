import re

with open('src/components/GlobalHeader.tsx', 'r') as f:
    content = f.read()

import_statement = "import { BRAND_CONFIG } from '../config/brand';\n"
if "import { BRAND_CONFIG }" not in content:
    content = content.replace("import { SAMPLE_RESEARCH_JOBS", import_statement + "import { SAMPLE_RESEARCH_JOBS")

content = content.replace(">Nova<", ">{BRAND_CONFIG.productName}<")

with open('src/components/GlobalHeader.tsx', 'w') as f:
    f.write(content)

