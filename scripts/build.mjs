import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const schemaDefinitions = [
  {
    fileName: 'pain.001.001.03.xsd',
    namespace: 'urn:iso:std:iso:20022:tech:xsd:pain.001.001.03',
  },
  {
    fileName: 'pain.001.001.09.xsd',
    namespace: 'urn:iso:std:iso:20022:tech:xsd:pain.001.001.09',
  },
];

await rm(dist, { recursive: true, force: true });
await mkdir(join(dist, 'banks'), { recursive: true });
await mkdir(join(dist, 'vendor'), { recursive: true });
await mkdir(join(dist, 'data'), { recursive: true });
await mkdir(join(dist, 'assets'), { recursive: true });
await mkdir(join(dist, 'examples'), { recursive: true });

for (const file of ['index.html', 'styles.css', 'core.js', 'app.js']) {
  await cp(join(root, 'src', file), join(dist, file));
}
await cp(join(root, 'src', 'banks', 'kbsk-2026.js'), join(dist, 'banks', 'kbsk-2026.js'));
await cp(join(root, 'vendor', 'xmllint-wasm-bundle.js'), join(dist, 'vendor', 'xmllint-wasm-bundle.js'));
await cp(join(root, 'assets'), join(dist, 'assets'), { recursive: true });
await cp(join(root, 'examples'), join(dist, 'examples'), { recursive: true });
await cp(join(root, 'LICENSE'), join(dist, 'LICENSE.txt'));
await cp(join(root, 'THIRD_PARTY_NOTICES.md'), join(dist, 'THIRD_PARTY_NOTICES.md'));
await cp(join(root, 'layout.json'), join(dist, 'layout.json'));
await cp(join(root, 'l10n.json'), join(dist, 'l10n.json'));

const schemas = {};
for (const definition of schemaDefinitions) {
  schemas[definition.namespace] = {
    fileName: definition.fileName,
    contents: await readFile(join(root, 'schemas', definition.fileName), 'utf8'),
  };
}
const schemaData = `window.__PAIN_SCHEMAS__ = ${JSON.stringify(schemas)};\n`;
await writeFile(join(dist, 'data', 'schemas-data.js'), schemaData);

const versionedAssets = [
  'styles.css',
  'vendor/xmllint-wasm-bundle.js',
  'data/schemas-data.js',
  'core.js',
  'banks/kbsk-2026.js',
  'app.js',
];
const indexPath = join(dist, 'index.html');
let indexHtml = await readFile(indexPath, 'utf8');
for (const asset of versionedAssets) {
  const contents = await readFile(join(dist, asset));
  const fingerprint = createHash('sha256').update(contents).digest('hex').slice(0, 12);
  indexHtml = indexHtml.replaceAll(asset, `${asset}?v=${fingerprint}`);
}
await writeFile(indexPath, indexHtml);

console.log(`Built ${dist}`);
