import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (/\.(tsx|jsx)$/.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

const clientHooks = [
  'useState',
  'useEffect',
  'useCallback',
  'useMemo',
  'useRef',
  'useRouter',
  'usePathname',
  'useSearchParams',
  'useParams',
  'useSWR',
  'useAlert',
  'useSession'
];

const allFiles = walk('src/app');
const missingUseClient = [];

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  // Check if first 300 chars have 'use client'
  const hasUseClient = /['"]use client['"]/.test(content.slice(0, 300));
  if (!hasUseClient) {
    for (const hook of clientHooks) {
      // Look for imports of these hooks
      const importRegex = new RegExp(`import\\s+[^;]*\\b${hook}\\b[^;]*from`);
      if (importRegex.test(content)) {
        missingUseClient.push({ file: file.replace(/\\/g, '/'), hook });
        break;
      }
    }
  }
}

console.log('Files importing client hooks without "use client":', missingUseClient.length);
missingUseClient.forEach(m => console.log(`${m.hook} -> ${m.file}`));
