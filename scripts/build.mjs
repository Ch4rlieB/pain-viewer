import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const schemaName = 'pain.001.001.03.xsd';
const namespace = 'urn:iso:std:iso:20022:tech:xsd:pain.001.001.03';

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

const schema = await readFile(join(root, 'schemas', schemaName), 'utf8');
const schemaData = `window.__PAIN_SCHEMAS__ = ${JSON.stringify({
  [namespace]: { fileName: schemaName, contents: schema },
})};\n`;
await writeFile(join(dist, 'data', 'schemas-data.js'), schemaData);

console.log(`Built ${dist}`);
