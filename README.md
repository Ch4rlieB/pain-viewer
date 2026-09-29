# Pain Viewer

Pain Viewer is a privacy-first, browser-only viewer and validator for ISO
20022 `pain.001` payment initiation files. Files never leave the browser.

The first release:

- reads `pain.001` XML and displays its summary, payment groups, transactions,
  every leaf value and formatted source XML;
- validates `pain.001.001.03` with its XSD locally through WebAssembly;
- applies optional bank profiles independently from XSD validation;
- includes the **KB Slovensko — rules effective from 20 June 2026** profile;
- is responsive, keyboard-accessible and supports Czech, Slovak, English and
  German plus light/dark mode;
- produces a self-contained static `dist/` directory for upload to a website.

## Run and build

No package installation is needed. Node.js 20+ is used only to assemble the
static distribution and run tests.

```sh
npm test
npm run build
python3 -m http.server 8080 --directory dist
```

Then open <http://localhost:8080>. The generated `dist/` directory is the only
directory that needs to be copied to the web server.

## Validation layers

The application deliberately keeps these results separate:

1. **XML parsing** — well-formed XML, expected `Document` root and a `pain.001`
   namespace.
2. **XSD validation** — exact validation for namespaces with a bundled schema.
   The initial release bundles `pain.001.001.03`; other versions are still
   displayed but clearly report that no XSD is bundled.
3. **Bank profile** — additional rules that an XSD cannot express. A profile
   never hides loaded data and never changes the XSD result.

## Add another bank profile

Copy `src/banks/kbsk-2026.js` and keep the same small contract:

```js
{
  id: 'bank-profile-id',
  label: { cs: '…', sk: '…', en: '…', de: '…' },
  source: { title: '…', url: 'https://…', effectiveFrom: 'YYYY-MM-DD' },
  supportedNamespaces: ['urn:iso:std:iso:20022:tech:xsd:pain.…'],
  validate(model) { return findings; }
}
```

Each finding has a stable rule ID, severity (`error`, `warning` or `info`), a
localized message, and an optional XML path, payment ID and transaction ID.
Register the new script in `src/index.html`, add focused tests, then run
`npm run check`. This separation is intentional: on the next bank document,
the parser and UI do not need to change.

## KB Slovensko profile scope

The implemented profile is based on *Klientský formát XML pro iniciaci plateb
v KBSK (platnost od 20. 06. 2026)*. It checks structured postal addresses,
including the rules described around section 2.77:

- `AdrLine` does not replace structured address elements;
- a supplied SEPA/instant-SEPA address must contain town and country;
- a foreign payment creditor address must contain street, town and country;
- when a foreign payment has no creditor-agent BIC, agent name and structured
  address are required;
- USD payments to the USA warn when building number, postcode or region is
  absent.

The profile is a pre-import aid, not a guarantee that a bank will accept a
payment. Bank rules and supported formats can change.

## Privacy and security

- There is no upload endpoint, analytics, cookie, CDN or runtime network call.
- XML containing `DOCTYPE` is rejected before parsing/validation.
- Dynamic values are HTML-escaped before display.
- The upload limit is 10 MiB to keep browser validation predictable.

## Public repository notes

Application code is MIT licensed. Review `THIRD_PARTY_NOTICES.md` before public
redistribution, particularly the separate status of the ISO 20022 schema. The
UI uses neutral design tokens compatible with the visual language of the ABRA
tools, but it does not ship an ABRA logo or proprietary font.
