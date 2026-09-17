import re

with open('src/components/GlobalHeader.tsx', 'r') as f:
    content = f.read()

content = re.sub(r'  const \[unresolvedAnomaliesCount\] = useState\(\n    SAMPLE_ANOMALIES\.filter\(a => a\.status === \'UNRESOLVED\'\)\.length\n  \);\n', '', content)
content = re.sub(r'import \{ SAMPLE_ANOMALIES \} from \'\.\./data/phase12FixturesAndStore\';\n', '', content)

with open('src/components/GlobalHeader.tsx', 'w') as f:
    f.write(content)
