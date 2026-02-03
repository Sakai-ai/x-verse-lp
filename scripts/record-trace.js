const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

// Configuration
const TRACE_DIR = '.agent-traces';
const SPEC_VERSION = '0.1.0';

// Ensure trace directory exists
if (!fs.existsSync(TRACE_DIR)) {
    fs.mkdirSync(TRACE_DIR);
}

// Helper to generate UUID
function generateUUID() {
    return crypto.randomUUID();
}

// Helper to execute git commands
function git(command) {
    try {
        return execSync(`git ${command}`, { encoding: 'utf8' }).trim();
    } catch (e) {
        return null; // Return null if command fails (e.g. no changes)
    }
}

// Parse git diff to find changed line ranges
function parseDiff(diff) {
    const files = [];
    let currentFile = null;
    let currentRanges = [];

    const lines = diff.split('\n');

    for (const line of lines) {
        if (line.startsWith('diff --git')) {
            if (currentFile) {
                files.push({ path: currentFile, conversations: [{ contributor: { type: 'ai' }, ranges: currentRanges }] });
            }
            currentFile = null;
            currentRanges = [];
        } else if (line.startsWith('+++ b/')) {
            currentFile = line.substring(6);
        } else if (line.startsWith('@@ ')) {
            // Parse hunk header: @@ -1,7 +1,7 @@
            // We care about the new file range: +1,7
            const match = line.match(/\+(\d+)(?:,(\d+))?/);
            if (match) {
                const start = parseInt(match[1]);
                const count = match[2] ? parseInt(match[2]) : 1;
                // Only track added/modified lines logic could be complex diff parsing.
                // For simplified Agent Trace, we blindly attribute the whole hunk range for now.
                // Spec allows "ranges". 
                if (count > 0) {
                    currentRanges.push({ start_line: start, end_line: start + count - 1 });
                }
            }
        }
    }

    if (currentFile && currentRanges.length > 0) {
        files.push({ path: currentFile, conversations: [{ contributor: { type: 'ai' }, ranges: currentRanges }] });
    }

    return files;
}

function main() {
    const message = process.argv[2] || 'Manual trace recording';

    // 1. Try to get staged changes first
    let diff = git('diff --cached --unified=0');

    // 2. If no staged changes, try unstaged changes
    if (!diff) {
        diff = git('diff --unified=0');
    }

    // 3. If still no changes, look at the last commit
    if (!diff) {
        diff = git('show HEAD --unified=0');
    }

    if (!diff) {
        console.error('No changes found to trace.');
        process.exit(1);
    }

    const changedFiles = parseDiff(diff);

    if (changedFiles.length === 0) {
        console.log('No file changes detected in diff.');
        process.exit(0);
    }

    // Identify current commit hash if possible
    const revision = git('rev-parse HEAD');

    const traceRecord = {
        version: SPEC_VERSION,
        id: generateUUID(),
        timestamp: new Date().toISOString(),
        vcs: revision ? { type: 'git', revision: revision } : undefined,
        files: changedFiles,
        metadata: {
            message: message,
            generator: 'node-record-trace-script'
        }
    };

    const filename = `${traceRecord.id}.json`;
    const filepath = path.join(TRACE_DIR, filename);

    fs.writeFileSync(filepath, JSON.stringify(traceRecord, null, 2));

    console.log(`Agent Trace recorded: ${filepath}`);
    console.log(`Summary: ${changedFiles.length} files attributed to AI.`);
}

main();
