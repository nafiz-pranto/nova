import re

with open('src/components/ResearchWorkspace.tsx', 'r') as f:
    content = f.read()

content = content.replace("Create Idempotent Research Scraper Job", "Create Research Job")
content = content.replace("Launch Scraper Job", "Launch Research Job")
content = content.replace("Dispatching Worker...", "Starting Research...")
content = content.replace("bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs", "bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs")
content = content.replace("text-emerald-600", "text-purple-600")

with open('src/components/ResearchWorkspace.tsx', 'w') as f:
    f.write(content)

