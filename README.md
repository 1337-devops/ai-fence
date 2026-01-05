# ai-fence

Git hooks to protect your code from AI rewrites.

## The Problem

AI coding tools (Cursor, Copilot, etc.) can modify any code in your project. Sometimes they rewrite critical sections — auth logic, billing code, security checks — without you noticing.

## The Solution

Mark code as protected with simple comments. ai-fence blocks any commit that modifies locked code.

## Install
```bash
npm install -g ai-fence
```

## Usage

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

## Supported Languages

| Language | Comment Style |
|----------|---------------|
| JavaScript/TypeScript | `// @ai-lock` |
| Python | `# @ai-lock` |
| Ruby | `# @ai-lock` |
| Shell | `# @ai-lock` |
| YAML | `# @ai-lock` |

## License

MIT