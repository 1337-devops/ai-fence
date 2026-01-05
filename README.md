# ai-fence

Git hooks to protect your code from AI rewrites.

![ai-fence demo](demo.gif)

## The Problem

AI coding tools (Cursor, Copilot, etc.) can modify any code in your project. Sometimes they rewrite critical sections — auth logic, billing code, security checks — without you noticing.

## The Solution

Mark code as protected with simple comments. ai-fence blocks any commit that modifies locked code.

## Install
```bash
npm install -g ai-fence
```

## Quick Start

1. Initialize in your repo:
```bash
ai-fence init
```

2. Mark critical code:
```javascript
// @ai-lock
function criticalAuth() {
  // This code is protected
  const secret = process.env.SECRET;
  return verify(secret);
}
// @ai-unlock
```

3. If anyone (or any AI) modifies locked code, the commit is blocked:
```
❌ COMMIT BLOCKED

The following locked code sections were modified:

  auth.js
  └─ Locked lines 12-18

To commit these changes, remove the @ai-lock tags first.
```

## Commands

| Command | Description |
|---------|-------------|
| `ai-fence init` | Install the pre-commit hook |
| `ai-fence check` | Manually check for locked code modifications |
| `ai-fence status` | Show all locked blocks in your repo |

## Supported Languages

| Language | Comment Style |
|----------|---------------|
| JavaScript/TypeScript | `// @ai-lock` |
| Python | `# @ai-lock` |
| Ruby | `# @ai-lock` |
| Shell | `# @ai-lock` |
| YAML | `# @ai-lock` |

## How It Works

ai-fence installs a Git pre-commit hook. Before every commit, it:

1. Scans staged files for `@ai-lock` / `@ai-unlock` markers
2. Checks if any locked lines were modified
3. Blocks the commit if protected code was changed

The AI never knows about the lock. It's enforced by Git, not the editor.

## License

MIT