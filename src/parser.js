import path from 'path';

const COMMENT_STYLES = {
  '.js': '//',
  '.jsx': '//',
  '.ts': '//',
  '.tsx': '//',
  '.mjs': '//',
  '.cjs': '//',
  '.py': '#',
  '.sh': '#',
  '.bash': '#',
  '.rb': '#',
  '.yaml': '#',
  '.yml': '#',
};

export function findLockedRanges(fileContent, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const commentStyle = COMMENT_STYLES[ext];
  
  if (!commentStyle) {
    return []; // Unsupported file type
  }

  const lines = fileContent.split('\n');
  const ranges = [];
  let lockStart = null;

  const lockRegex = new RegExp(`^\\s*${escapeRegex(commentStyle)}\\s*@ai-lock`);
  const unlockRegex = new RegExp(`^\\s*${escapeRegex(commentStyle)}\\s*@ai-unlock`);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1; // 1-indexed

    if (lockRegex.test(line)) {
      lockStart = lineNum;
    } else if (unlockRegex.test(line) && lockStart !== null) {
      ranges.push({ start: lockStart, end: lineNum });
      lockStart = null;
    }
  }

  // Handle unclosed lock (lock until end of file)
  if (lockStart !== null) {
    ranges.push({ start: lockStart, end: lines.length });
  }

  return ranges;
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}