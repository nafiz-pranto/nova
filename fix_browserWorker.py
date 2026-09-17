import re

with open('src/server/browserWorker.ts', 'r') as f:
    content = f.read()

# Replace the class export with function export
content = content.replace("export class ResearchWorkflowRunner {", "")
content = content.replace("  public static async executeRun(", "export async function runBrowserWorker(")
content = content.replace("  ): Promise<ResearchExecutionResult> {", "  , emitEvent: (event: any) => void\n): Promise<ResearchExecutionResult> {")

# Remove the wrapper instance method executeRun
content = re.sub(r'  /\*\*.*?  \*/\n  public async executeRun.*?\n  }\n', '', content, flags=re.DOTALL)
# Remove the final closing brace of the class
content = content.rstrip()
if content.endswith('}'):
    content = content[:-1]

# Make sure to import playwright
content = "import { chromium } from 'playwright';\n" + content

# Replace onProgress?. with emitEvent
content = content.replace("onProgress?.(", "emitEvent(")

with open('src/server/browserWorker.ts', 'w') as f:
    f.write(content)

