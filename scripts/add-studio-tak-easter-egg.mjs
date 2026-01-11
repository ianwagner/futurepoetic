import {promises as fs} from 'node:fs';
import path from 'node:path';

const EASTER_EGG = String.raw`<!--
         __            ___          __        __
   _____/ /___  ______/ (_)___     / /_____ _/ /__
  / ___/ __/ / / / __  / / __ \   / __/ __ \`/ //_/
 (__  ) /_/ /_/ / /_/ / / /_/ /  / /_/ /_/ / ,<
/____/\__/\__,_/\__,_/_/\____/   \__/\__,_/_/|_|
-->
`;

const TARGET_DIRS = [
  'dist',
  'out',
  'public',
  path.join('studio', 'dist'),
];

const SKIP_DIRS = new Set(['.next', 'node_modules', '.git']);

const walkHtmlFiles = async (dir) => {
  const entries = await fs.readdir(dir, {withFileTypes: true});
  const files = [];

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkHtmlFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }

  return files;
};

const prependEasterEgg = async (filePath) => {
  const contents = await fs.readFile(filePath, 'utf8');
  if (contents.startsWith(EASTER_EGG)) {
    return false;
  }

  await fs.writeFile(filePath, `${EASTER_EGG}${contents}`, 'utf8');
  return true;
};

const run = async () => {
  const root = process.cwd();
  let updatedCount = 0;

  for (const relativeDir of TARGET_DIRS) {
    const dirPath = path.join(root, relativeDir);
    try {
      await fs.access(dirPath);
    } catch {
      continue;
    }

    const htmlFiles = await walkHtmlFiles(dirPath);
    for (const filePath of htmlFiles) {
      if (await prependEasterEgg(filePath)) {
        updatedCount += 1;
      }
    }
  }

  if (updatedCount > 0) {
    console.log(`Added Studio Tak easter egg to ${updatedCount} HTML file(s).`);
  }
};

run().catch((error) => {
  console.error('Failed to add Studio Tak easter egg:', error);
  process.exit(1);
});
