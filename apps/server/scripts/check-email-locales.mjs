import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, '..');

const SRC_DIR = path.join(serverRoot, 'src');
const LOCALES_DIR = path.join(SRC_DIR, 'notifications', 'locales');

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function get(obj, keyPath) {
  const parts = keyPath.split('.');
  let cur = obj;
  for (const part of parts) {
    if (cur && Object.prototype.hasOwnProperty.call(cur, part)) {
      cur = cur[part];
    } else {
      return undefined;
    }
  }
  return cur;
}

function extractEmailKeysFromTs(code) {
  const keys = new Set();

  // Matches: t('email.xxx'), translator("email.xxx"), t(`email.xxx`)
  const re = /\b(?:t|translator)\(\s*['"`](email\.[^'"`]+)['"`]/g;
  let m;
  while ((m = re.exec(code)) !== null) {
    const key = m[1];
    // Ignore dynamic keys like `email.foo.${bar}`
    if (key.includes('${')) continue;
    keys.add(key);
  }

  return keys;
}

function loadLocale(locale) {
  const filePath = path.join(LOCALES_DIR, `${locale}.json`);
  const raw = fs.readFileSync(filePath, 'utf8');
  return { filePath, json: JSON.parse(raw) };
}

function main() {
  const tsFiles = walk(SRC_DIR).filter((f) => f.endsWith('.ts'));
  const allKeys = new Set();

  for (const file of tsFiles) {
    const code = fs.readFileSync(file, 'utf8');
    for (const key of extractEmailKeysFromTs(code)) allKeys.add(key);
  }

  const locales = ['en', 'pt'];
  let hasErrors = false;

  for (const locale of locales) {
    const { filePath, json } = loadLocale(locale);
    const missing = [];

    for (const key of Array.from(allKeys).sort()) {
      if (get(json, key) === undefined) missing.push(key);
    }

    if (missing.length > 0) {
      hasErrors = true;
      console.error(
        `\nMissing ${missing.length} keys in ${locale} (${filePath}):`,
      );
      for (const k of missing) console.error(`- ${k}`);
    } else {
      console.log(`OK: no missing keys in ${locale}`);
    }
  }

  if (hasErrors) {
    console.error(
      '\nFix missing locale keys before deploying email templates.',
    );
    process.exit(1);
  }
}

main();
