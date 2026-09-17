import re

with open('src/components/WatchlistWorkspace.tsx', 'r') as f:
    content = f.read()

content = content.replace("bg-neutral-900 text-white rounded-lg hover:bg-neutral-800", "bg-purple-600 text-white rounded-lg hover:bg-purple-700")
content = content.replace("bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs", "bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs")
content = content.replace("'bg-neutral-900 text-white border-neutral-900 shadow-xs'", "'bg-purple-600 text-white border-purple-600 shadow-xs'")
content = content.replace("'bg-neutral-900 text-white shadow-xs'", "'bg-purple-600 text-white shadow-xs'")

with open('src/components/WatchlistWorkspace.tsx', 'w') as f:
    f.write(content)
