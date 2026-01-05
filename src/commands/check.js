import { execSync } from 'child_process';
import fs from 'fs';
import chalk from 'chalk';
import { findLockedRanges } from '../parser.js';

export async function check() {
  // Get list of staged files
  let stagedFiles;
  try {
    const output = execSync('git diff --cached --name-only', { encoding: 'utf-8' });
    stagedFiles = output.trim().split('\n').filter(f => f.length > 0);
  } catch {
    console.log(chalk.red('❌ Failed to get staged files'));
    process.exit(1);
  }

  if (stagedFiles.length === 0) {
    console.log(chalk.green('✅ No staged files to check'));
    process.exit(0);
  }

  const violations = [];

  for (const file of stagedFiles) {
    // Skip if file was deleted
    if (!fs.existsSync(file)) continue;

    // Get the HEAD version of the file to find locks
    let headContent;
    try {
      headContent = execSync(`git show HEAD:${file}`, { encoding: 'utf-8' });
    } catch {
      // File is new, no HEAD version exists
      continue;
    }

    const lockedRanges = findLockedRanges(headContent, file);
    if (lockedRanges.length === 0) continue;

    // Get the changed line numbers
    const changedLines = getChangedLines(file);

    // Check for intersections
    for (const range of lockedRanges) {
      for (const line of changedLines) {
        if (line >= range.start && line <= range.end) {
          violations.push({
            file,
            range,
            line,
          });
          break; // One violation per range is enough
        }
      }
    }
  }

  if (violations.length === 0) {
    console.log(chalk.green('✅ No locked code modified'));
    process.exit(0);
  }

  // Print violations
  console.log(chalk.red('\n❌ COMMIT BLOCKED\n'));
  console.log(chalk.red('The following locked code sections were modified:\n'));

  for (const v of violations) {
    console.log(chalk.white(`  ${v.file}`));
    console.log(chalk.gray(`  └─ Locked lines ${v.range.start}-${v.range.end}`));
    console.log('');
  }

  console.log(chalk.yellow('To commit these changes, remove the @ai-lock tags first.'));
  console.log('');

  process.exit(1);
}

function getChangedLines(file) {
  const lines = [];
  
  try {
    const diff = execSync(`git diff --cached -U0 ${file}`, { encoding: 'utf-8' });
    
    // Parse diff headers like @@ -10,5 +10,7 @@
    const headerRegex = /@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/g;
    let match;

    while ((match = headerRegex.exec(diff)) !== null) {
      const startLine = parseInt(match[1], 10);
      const lineCount = match[2] ? parseInt(match[2], 10) : 1;

      for (let i = 0; i < lineCount; i++) {
        lines.push(startLine + i);
      }
    }
  } catch {
    // Ignore errors
  }

  return lines;
}