import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { findLockedRanges } from '../parser.js';

export async function status() {
  // Check if we're in a git repo
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
  } catch {
    console.log(chalk.red('❌ Not a git repository.'));
    process.exit(1);
  }

  // Get all tracked files
  let files;
  try {
    const output = execSync('git ls-files', { encoding: 'utf-8' });
    files = output.trim().split('\n').filter(f => f.length > 0);
  } catch {
    console.log(chalk.red('❌ Failed to list files'));
    process.exit(1);
  }

  const allLocks = [];

  for (const file of files) {
    if (!fs.existsSync(file)) continue;

    let content;
    try {
      content = fs.readFileSync(file, 'utf-8');
    } catch {
      continue;
    }

    const ranges = findLockedRanges(content, file);
    if (ranges.length === 0) continue;

    const lines = content.split('\n');

    for (const range of ranges) {
      // Get preview (first line of locked content, after the @ai-lock line)
      const previewLineIndex = range.start; // line after @ai-lock
      const preview = lines[previewLineIndex] 
        ? lines[previewLineIndex].trim().substring(0, 40) 
        : '';

      allLocks.push({
        file,
        start: range.start,
        end: range.end,
        preview,
      });
    }
  }

  if (allLocks.length === 0) {
    console.log(chalk.gray('No locked blocks found.'));
    console.log('');
    console.log(chalk.gray('To lock code, add comments like:'));
    console.log(chalk.cyan('  // @ai-lock'));
    console.log(chalk.cyan('  // @ai-unlock'));
    process.exit(0);
  }

  console.log('');
  console.log(chalk.white.bold(`🔒 ${allLocks.length} locked block${allLocks.length === 1 ? '' : 's'} found:`));
  console.log('');

  for (const lock of allLocks) {
    console.log(chalk.cyan(`  ${lock.file}`));
    console.log(chalk.gray(`  └─ Lines ${lock.start}-${lock.end}`));
    if (lock.preview) {
      console.log(chalk.gray(`     ${lock.preview}${lock.preview.length >= 40 ? '...' : ''}`));
    }
    console.log('');
  }

  const totalLines = allLocks.reduce((sum, l) => sum + (l.end - l.start + 1), 0);
  console.log(chalk.gray(`Total: ${allLocks.length} block${allLocks.length === 1 ? '' : 's'}, ${totalLines} lines protected`));
}