import re

with open('src/utils/researchWorkflowRunner.ts', 'r') as f:
    content = f.read()

old_loop = """    // Process Cards through the 6-stage DAG
    for (let i = 0; i < totalToExtract; i++) {"""

new_loop = """    // Process Cards through the 6-stage DAG
    const targetLimit = request.maxResults;
    for (let i = 0; i < SAAS_CORPUS.length; i++) {
      if (discoveredAdvertisers.length >= targetLimit) break;"""

content = content.replace(old_loop, new_loop)

# Also fix totalToExtract variable definition so we use targetLimit where appropriate
content = content.replace("const totalToExtract = Math.min(request.maxResults, SAAS_CORPUS.length);", "const totalToExtract = request.maxResults; // Will be capped by available unique corpus")

with open('src/utils/researchWorkflowRunner.ts', 'w') as f:
    f.write(content)
