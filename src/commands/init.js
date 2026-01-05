import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';

export async function init() {
  // Check if we're in a git repo
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
  } catch {
    console.log(chalk.red('❌ Not a git repository. Run "git init" first.'));
    process.exit(1);
  }

  // Get .git/hooks path
  const gitDir = execSync('git rev-parse --git-dir', { encoding: 'utf-8' }).trim();
  const hooksDir = path.join(gitDir, 'hooks');
  const hookPath = path.join(hooksDir, 'pre-commit');

  // Create hooks dir if it doesn't exist
  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
  }

  // Backup existing hook if present
  if (fs.existsSync(hookPath)) {
    const backupPath = hookPath + '.backup';
    fs.copyFileSync(hookPath, backupPath);
    console.log(chalk.yellow(`⚠️  Existing pre-commit hook backed up to ${backupPath}`));
  }

  // Write the new hook
  const hookContent = `#!/bin/bash
npx ai-fence check
`;

  fs.writeFileSync(hookPath, hookContent);
  fs.chmodSync(hookPath, '755');

  console.log(chalk.green('✅ ai-fence initialized'));
  console.log(chalk.gray(`   Hook installed at ${hookPath}`));
}