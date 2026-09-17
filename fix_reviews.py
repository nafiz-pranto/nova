import re

with open('src/components/ReviewQueuesWorkspace.tsx', 'r') as f:
    content = f.read()

content = content.replace("'bg-neutral-900 text-white shadow-xs'", "'bg-purple-600 text-white shadow-xs'")
content = content.replace("'bg-neutral-900 hover:bg-neutral-800 text-white'", "'bg-purple-600 hover:bg-purple-700 text-white'")

with open('src/components/ReviewQueuesWorkspace.tsx', 'w') as f:
    f.write(content)
