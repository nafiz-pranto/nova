import re

with open('src/components/PresetSelector.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "'bg-neutral-900 text-white'",
    "'bg-purple-600 text-white'"
)
content = content.replace(
    "'bg-emerald-50 text-emerald-900 border border-emerald-200'",
    "'bg-purple-50 text-purple-900 border border-purple-200'"
)
content = content.replace("text-emerald-600", "text-purple-600")

with open('src/components/PresetSelector.tsx', 'w') as f:
    f.write(content)

with open('src/components/LocationSelector.tsx', 'r') as f:
    content2 = f.read()

content2 = content2.replace(
    "'bg-neutral-900 text-white font-bold'",
    "'bg-purple-600 text-white font-bold'"
)
content2 = content2.replace(
    "'bg-neutral-900 text-white font-semibold'",
    "'bg-purple-600 text-white font-semibold'"
)

with open('src/components/LocationSelector.tsx', 'w') as f:
    f.write(content2)

