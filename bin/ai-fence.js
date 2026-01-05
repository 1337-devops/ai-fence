#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';

const program = new Command();

program
  .name('ai-fence')
  .description('Git hooks to protect your code from AI rewrites')
  .version('0.1.0');

program
  .command('init')
  .description('Install the pre-commit hook')
  .action(async () => {
    const { init } = await import('../src/commands/init.js');
    await init();
  });

program
  .command('check')
  .description('Check staged files for locked code modifications')
  .action(async () => {
    const { check } = await import('../src/commands/check.js');
    await check();
  });

program.parse();