# Pain Viewer

Pain Viewer is a privacy-first, browser-only viewer and validator for ISO
20022 `pain.001` payment initiation files. Files never leave the browser.

The first release:

- reads `pain.001` XML and displays its summary, payment groups, transactions,
  every leaf value and formatted source XML;
- validates `pain.001.001.03` and `pain.001.001.09` with their XSDs locally
  through WebAssembly;
- applies optional bank profiles independently from XSD validation;
- includes profiles for **KB Slovensko — rules effective from 20 June 2026**,
  **Fio banka — API documentation version 1.9**, and **Česká spořitelna —
  rules effective from 14 November 2026**;
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

## GitHub Pages

Every push to `main` also runs the tests, builds `dist/` and deploys it with
GitHub Actions. After GitHub Pages is configured to use **GitHub Actions** as
its source in the repository settings, the public site is available at:

<https://ch4rlieb.github.io/pain-viewer/>

The deployment can also be started manually from the **Actions** tab by running
the *Deploy to GitHub Pages* workflow. The generated `dist/` directory remains
ignored by Git and is transferred only as a deployment artifact.

## Validation layers

The application deliberately keeps these results separate:

1. **XML parsing** — well-formed XML, expected `Document` root and a `pain.001`
   namespace.
2. **XSD validation** — exact validation for namespaces with a bundled schema.
   The project bundles the generic `pain.001.001.03` and `pain.001.001.09`
   schemas; other versions are still displayed but clearly report that no XSD
   is bundled.
3. **Bank profile** — additional rules that an XSD cannot express. A profile
   never hides loaded data and never changes the XSD result.

## Add another bank profile

Copy `src/banks/kbsk-2026.js` and keep the same small contract:

```js
{
  id: 'bank-profile-id',
  label: { cs: '…', sk: '…', en: '…', de: '…' },
  description: { cs: '…', sk: '…', en: '…', de: '…' },
  source: { title: '…', url: 'https://…', effectiveFrom: 'YYYY-MM-DD' },
  detection: { debtorAgentBics: ['BANKBICX'] },
  supportedNamespaces: ['urn:iso:std:iso:20022:tech:xsd:pain.…'],
  rules: [{
    id: 'BANK-RULE-ID',
    label: { cs: '…', sk: '…', en: '…', de: '…' }
  }],
  validate(model) { return findings; }
}
```

Each finding has a stable rule ID, severity (`error`, `warning` or `info`), a
localized message, and an optional XML path, payment ID and transaction ID.
The validator references the same rule objects exposed in `rules`; the online
rules dialog therefore lists the active profile definitions rather than a
separately maintained copy. Keep rule IDs stable because the dialog uses them
to match validation findings to the loaded document.
`debtorAgentBics` contains the 8- or 11-character BIC/SWIFT codes of the bank
that owns the profile. The viewer uses `DbtrAgt/FinInstnId/BIC` (or `BICFI`)
to select a profile automatically. An unknown, missing or mixed-bank BIC leaves
the profile unselected; users can still select one manually.

Register the new script in `src/index.html`, add focused tests, then run `npm
run check`. This separation is intentional: on the next bank document, the
parser and UI do not need to change.

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

## Fio banka profile scope

The profile is based on *Fio API Bankovnictví, version 1.9 (16 October 2025)*.
For `pain.001` payment orders, that document lists `pain.001.001.03` and
`pain.001.001.09` and permits imports only in EUR. The profile is selected
automatically for debtor-agent BIC `FIOBCZPP` and checks both constraints.

The same document also describes `pain.008.001.02`. That identifier is a SEPA
direct-debit initiation message, not version 8 of `pain.001`; parsing and
displaying it therefore requires a separate document model and is outside the
current `pain.001` viewer scope.

## Česká spořitelna profile scope

The profile is based on Česká spořitelna's announcement *Změna formátu plateb –
strukturovaná adresa příjemce* and the linked 2026 technical packages. It is
selected automatically for debtor-agent BIC `GIBACZPX` and checks rules taking
effect on 14 November 2026:

- `pain.001.001.03` requires the creditor postal address with `Ctry` and one or
  two `AdrLine` elements; structured address elements are not allowed by the
  bank-specific `.03` schema;
- `pain.001.001.09` requires structured creditor address fields `TwnNm` and
  `Ctry`;
- for `.09`, missing `StrtNm`, `BldgNb` or `PstCd` produces a recommendation,
  not an error.

The `.03` rule is intentionally different from `.09`: Česká spořitelna's 2026
FAQ and restricted `.03` schema still represent the creditor address as
`Ctry` plus one or two free-text `AdrLine` elements. The viewer shows an
informational note for this accepted legacy form so it is not confused with
the structured `TwnNm` rule for `.09`.

## Privacy and security

- There is no upload endpoint, analytics, CDN or runtime network call.
- One functional `pain_viewer_language` cookie remembers the selected language
  for one year. It contains only the language code and is not used for tracking.
- The light/dark preference is stored locally in the browser.
- XML containing `DOCTYPE` is rejected before parsing/validation.
- Dynamic values are HTML-escaped before display.
- The upload limit is 10 MiB to keep browser validation predictable.

## Public repository notes

Application code is MIT licensed. Review `THIRD_PARTY_NOTICES.md` before public
redistribution, particularly the separate status of the ISO 20022 schema. The
UI uses neutral design tokens compatible with the visual language of the ABRA
tools, but it does not ship an ABRA logo or proprietary font.
