import { createRequire } from 'node:module';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(repoRoot, 'dist');

const entryNames = ['index', 'contracts', 'economy', 'runtime', 'save', 'scheduler', 'state'];

async function assertFileExists(filePath) {
  await access(filePath);
}

async function verifyEsm(entryName) {
  const moduleUrl = pathToFileURL(path.join(distDir, `${entryName}.js`)).href;
  const loaded = await import(moduleUrl);

  if (!loaded || typeof loaded !== 'object') {
    throw new Error(`Failed to load ESM entry "${entryName}".`);
  }
}

function verifyCjs(entryName) {
  const loaded = require(path.join(distDir, `${entryName}.cjs`));

  if (!loaded || typeof loaded !== 'object') {
    throw new Error(`Failed to load CJS entry "${entryName}".`);
  }
}

for (const entryName of entryNames) {
  await assertFileExists(path.join(distDir, `${entryName}.js`));
  await assertFileExists(path.join(distDir, `${entryName}.cjs`));
  await assertFileExists(path.join(distDir, `${entryName}.d.ts`));
  await verifyEsm(entryName);
  verifyCjs(entryName);
}
