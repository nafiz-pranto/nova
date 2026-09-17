with open('src/server/browserWorker.ts', 'r') as f:
    content = f.read()
    
content = content.replace("    onProgress?: (event: WorkflowProgressEvent) => void\n  , emitEvent: (event: any) => void", "    emitEvent: (event: any) => void")
with open('src/server/browserWorker.ts', 'w') as f:
    f.write(content)
