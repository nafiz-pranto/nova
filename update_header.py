import re
with open('src/components/GlobalHeader.tsx', 'r') as f:
    content = f.read()

content = content.replace("Bot,", "Hexagon,")
content = content.replace("Bot ", "Hexagon ")
content = content.replace('<Bot className="w-4 h-4 text-emerald-400" />', '<Hexagon className="w-4 h-4 text-purple-400" />')
content = content.replace("Meta Ad Library Lead Research", "Nova")
content = content.replace("bg-emerald-50", "bg-purple-50")
content = content.replace("text-emerald-700", "text-purple-700")
content = content.replace("hover:bg-emerald-100", "hover:bg-purple-100")
content = content.replace("text-emerald-600", "text-purple-600")
content = content.replace("text-emerald-500", "text-purple-500")

with open('src/components/GlobalHeader.tsx', 'w') as f:
    f.write(content)
