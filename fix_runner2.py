import re

with open('src/utils/researchWorkflowRunner.ts', 'r') as f:
    content = f.read()

new_logic = """  public static async executeRun(
    request: ResearchWorkflowRequest,
    onProgress?: (event: WorkflowProgressEvent) => void
  ): Promise<ResearchExecutionResult> {
    const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
    });
    
    if (!response.body) throw new Error("No response body");
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = null;
    let buffer = "";
    
    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split('\\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer
        
        for (const line of lines) {
            if (!line.trim()) continue;
            try {
                const event = JSON.parse(line);
                if (event.type === 'error') {
                    throw new Error(event.message);
                } else if (event.job) {
                    // This is the final ResearchExecutionResult
                    result = event;
                } else {
                    // This is a progress event
                    if (onProgress) onProgress(event);
                }
            } catch (e) {
                console.error("Failed to parse JSON line:", line, e);
            }
        }
    }
    
    if (!result) throw new Error("Failed to receive final result from server.");
    return result;
  }"""

# We just want to replace the `public static async executeRun( ... ) { ... }` function body.
start_idx = content.find("public static async executeRun(")
if start_idx != -1:
    # find the end of the class, it's the last closing brace
    # Actually, we can just cut from start_idx to the end, and then add closing brace
    content = content[:start_idx] + new_logic + "\n}\n"
    
with open('src/utils/researchWorkflowRunner.ts', 'w') as f:
    f.write(content)

