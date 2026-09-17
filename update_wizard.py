import re
with open('src/components/ResearchWizard.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'className="w-full py-4 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"',
    'className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"'
)

with open('src/components/ResearchWizard.tsx', 'w') as f:
    f.write(content)
