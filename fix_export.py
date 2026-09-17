import re

with open('src/components/ExportPipelineStudio.tsx', 'r') as f:
    content = f.read()

content = content.replace("'border-neutral-900 bg-neutral-900 text-white'", "'border-purple-600 bg-purple-600 text-white'")
content = content.replace("bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white font-semibold text-xs shadow-xs", "bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-xs shadow-xs")
content = content.replace("bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5", "bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5")
content = content.replace("text-emerald-", "text-purple-")
content = content.replace("bg-emerald-", "bg-purple-")
content = content.replace("border-emerald-", "border-purple-")

with open('src/components/ExportPipelineStudio.tsx', 'w') as f:
    f.write(content)
