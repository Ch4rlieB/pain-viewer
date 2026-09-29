(function () {
  'use strict';

  const core = window.PainReaderCore;
  const profiles = window.PainReaderBankProfiles || [];
  const languages = ['cs', 'sk', 'en', 'de'];
  const languageCookieName = 'pain_viewer_language';
  const ui = {
    cs: {
      headline: 'Zkontrolujte platební příkaz před importem do banky', intro: 'Soubor se zobrazí a ověří přímo ve vašem prohlížeči. Nikam se neodesílá.', dropTitle: 'Vyberte soubor pain.001', dropText: 'Přetáhněte XML sem, nebo ho vyberte z disku.', chooseFile: 'Vybrat XML', privacy: 'Zpracování probíhá pouze lokálně · maximálně 10 MB', loadAnother: 'Načíst jiný soubor', checks: 'Kontroly', validationTitle: 'Výsledek validace', bankProfile: 'Pravidla banky', loadedData: 'Načtená data', documentContent: 'Obsah příkazu', tabOverview: 'Přehled', tabPayments: 'Platby', tabFields: 'Všechna data', tabXml: 'XML', footer: 'Soukromé zpracování v prohlížeči · bez odesílání dat', xmlTitle: 'Formát XML', xmlOk: 'XML je dobře strukturované a používá namespace pain.001.', xsdTitle: 'XSD schéma', xsdPending: 'Probíhá přesná kontrola struktury…', xsdOk: 'Dokument odpovídá schématu {0}.', xsdInvalid: 'XSD našlo {0} chyb.', xsdUnsupported: 'Pro verzi {0} zatím není přibalené ověřené XSD. Data jsou přesto zobrazena.', xsdUnavailable: 'Validační engine se nepodařilo načíst.', bankTitle: 'Pravidla banky', bankOff: 'Není vybraný žádný bankovní profil.', bankOk: 'Všechna pravidla vybraného profilu prošla.', bankProblems: '{0} chyb · {1} varování', noProfile: 'Bez bankovního profilu', source: 'Zdroj pravidel', effective: 'účinnost od', noFindings: 'Kontroly nenašly žádný problém.', messageId: 'ID zprávy', created: 'Vytvořeno', transactions: 'Transakce', total: 'Celkem', namespace: 'Namespace / verze', initiatingParty: 'Iniciující strana', declaredTransactions: 'Deklarovaný počet transakcí', controlSum: 'Kontrolní součet', paymentGroup: 'Platební skupina', method: 'Metoda', serviceLevel: 'Úroveň služby', executionDate: 'Datum provedení', debtor: 'Plátce', debtorAccount: 'Účet plátce', debtorAgent: 'Banka plátce', creditor: 'Příjemce', creditorAccount: 'Účet příjemce', creditorAgent: 'Banka příjemce', amount: 'Částka', endToEnd: 'EndToEnd ID', instructionId: 'Instruction ID', purpose: 'Účel', remittance: 'Zpráva pro příjemce', address: 'Adresa', path: 'XML cesta', value: 'Hodnota', filter: 'Filtrovat cestu nebo hodnotu…', copyXml: 'Kopírovat XML', copied: 'Zkopírováno', empty: 'neuvedeno', fileTooLarge: 'Soubor je větší než povolených 10 MB.', doctype: 'XML s deklarací DOCTYPE není z bezpečnostních důvodů podporováno.', invalidXml: 'Soubor není platné XML.', invalidRoot: 'Kořenovým prvkem musí být Document.', invalidNamespace: 'Soubor nepoužívá namespace ISO 20022 pain.001.', missingInitiation: 'V dokumentu chybí CstmrCdtTrfInitn.', readError: 'Soubor se nepodařilo načíst.', validationError: 'XSD validaci se nepodařilo dokončit.', theme: 'Přepnout světlý/tmavý motiv', size: 'Velikost', profileVersionNote: 'Bankovní pravidla jsou oddělená od XSD kontroly a nemění načtená data.', profileAuto: 'Profil byl automaticky vybrán podle BIC banky plátce: {0}.'
    },
    sk: {
      headline: 'Skontrolujte platobný príkaz pred importom do banky', intro: 'Súbor sa zobrazí a overí priamo vo vašom prehliadači. Nikam sa neodosiela.', dropTitle: 'Vyberte súbor pain.001', dropText: 'Pretiahnite XML sem alebo ho vyberte z disku.', chooseFile: 'Vybrať XML', privacy: 'Spracovanie prebieha iba lokálne · maximálne 10 MB', loadAnother: 'Načítať iný súbor', checks: 'Kontroly', validationTitle: 'Výsledok validácie', bankProfile: 'Pravidlá banky', loadedData: 'Načítané údaje', documentContent: 'Obsah príkazu', tabOverview: 'Prehľad', tabPayments: 'Platby', tabFields: 'Všetky údaje', tabXml: 'XML', footer: 'Súkromné spracovanie v prehliadači · bez odosielania údajov', xmlTitle: 'Formát XML', xmlOk: 'XML je správne štruktúrované a používa namespace pain.001.', xsdTitle: 'XSD schéma', xsdPending: 'Prebieha presná kontrola štruktúry…', xsdOk: 'Dokument zodpovedá schéme {0}.', xsdInvalid: 'XSD našlo {0} chýb.', xsdUnsupported: 'Pre verziu {0} zatiaľ nie je pribalené overené XSD. Údaje sú napriek tomu zobrazené.', xsdUnavailable: 'Validačný engine sa nepodarilo načítať.', bankTitle: 'Pravidlá banky', bankOff: 'Nie je vybraný žiadny bankový profil.', bankOk: 'Všetky pravidlá vybraného profilu prešli.', bankProblems: '{0} chýb · {1} varovaní', noProfile: 'Bez bankového profilu', source: 'Zdroj pravidiel', effective: 'účinnosť od', noFindings: 'Kontroly nenašli žiadny problém.', messageId: 'ID správy', created: 'Vytvorené', transactions: 'Transakcie', total: 'Celkom', namespace: 'Namespace / verzia', initiatingParty: 'Iniciujúca strana', declaredTransactions: 'Deklarovaný počet transakcií', controlSum: 'Kontrolný súčet', paymentGroup: 'Platobná skupina', method: 'Metóda', serviceLevel: 'Úroveň služby', executionDate: 'Dátum vykonania', debtor: 'Platiteľ', debtorAccount: 'Účet platiteľa', debtorAgent: 'Banka platiteľa', creditor: 'Príjemca', creditorAccount: 'Účet príjemcu', creditorAgent: 'Banka príjemcu', amount: 'Suma', endToEnd: 'EndToEnd ID', instructionId: 'Instruction ID', purpose: 'Účel', remittance: 'Správa pre príjemcu', address: 'Adresa', path: 'XML cesta', value: 'Hodnota', filter: 'Filtrovať cestu alebo hodnotu…', copyXml: 'Kopírovať XML', copied: 'Skopírované', empty: 'neuvedené', fileTooLarge: 'Súbor je väčší ako povolených 10 MB.', doctype: 'XML s deklaráciou DOCTYPE nie je z bezpečnostných dôvodov podporované.', invalidXml: 'Súbor nie je platné XML.', invalidRoot: 'Koreňovým prvkom musí byť Document.', invalidNamespace: 'Súbor nepoužíva namespace ISO 20022 pain.001.', missingInitiation: 'V dokumente chýba CstmrCdtTrfInitn.', readError: 'Súbor sa nepodarilo načítať.', validationError: 'XSD validáciu sa nepodarilo dokončiť.', theme: 'Prepnúť svetlý/tmavý motív', size: 'Veľkosť', profileVersionNote: 'Bankové pravidlá sú oddelené od XSD kontroly a nemenia načítané údaje.', profileAuto: 'Profil bol automaticky vybraný podľa BIC banky platiteľa: {0}.'
    },
    en: {
      headline: 'Check a payment order before importing it into your bank', intro: 'The file is displayed and validated entirely in your browser. It is never uploaded.', dropTitle: 'Choose a pain.001 file', dropText: 'Drop XML here or select it from your device.', chooseFile: 'Choose XML', privacy: 'Processed locally only · maximum 10 MB', loadAnother: 'Load another file', checks: 'Checks', validationTitle: 'Validation result', bankProfile: 'Bank rules', loadedData: 'Loaded data', documentContent: 'Order contents', tabOverview: 'Overview', tabPayments: 'Payments', tabFields: 'All data', tabXml: 'XML', footer: 'Private in-browser processing · no data upload', xmlTitle: 'XML format', xmlOk: 'The XML is well-formed and uses a pain.001 namespace.', xsdTitle: 'XSD schema', xsdPending: 'Checking the exact structure…', xsdOk: 'The document conforms to schema {0}.', xsdInvalid: 'XSD found {0} errors.', xsdUnsupported: 'No verified XSD is bundled for version {0} yet. The data is still shown.', xsdUnavailable: 'The validation engine could not be loaded.', bankTitle: 'Bank rules', bankOff: 'No bank profile is selected.', bankOk: 'All rules in the selected profile passed.', bankProblems: '{0} errors · {1} warnings', noProfile: 'No bank profile', source: 'Rules source', effective: 'effective from', noFindings: 'The checks found no problems.', messageId: 'Message ID', created: 'Created', transactions: 'Transactions', total: 'Total', namespace: 'Namespace / version', initiatingParty: 'Initiating party', declaredTransactions: 'Declared transactions', controlSum: 'Control sum', paymentGroup: 'Payment group', method: 'Method', serviceLevel: 'Service level', executionDate: 'Execution date', debtor: 'Debtor', debtorAccount: 'Debtor account', debtorAgent: 'Debtor agent', creditor: 'Creditor', creditorAccount: 'Creditor account', creditorAgent: 'Creditor agent', amount: 'Amount', endToEnd: 'EndToEnd ID', instructionId: 'Instruction ID', purpose: 'Purpose', remittance: 'Remittance information', address: 'Address', path: 'XML path', value: 'Value', filter: 'Filter path or value…', copyXml: 'Copy XML', copied: 'Copied', empty: 'not provided', fileTooLarge: 'The file is larger than the 10 MB limit.', doctype: 'XML containing a DOCTYPE declaration is not supported for security reasons.', invalidXml: 'The file is not valid XML.', invalidRoot: 'The root element must be Document.', invalidNamespace: 'The file does not use an ISO 20022 pain.001 namespace.', missingInitiation: 'CstmrCdtTrfInitn is missing from the document.', readError: 'The file could not be read.', validationError: 'XSD validation could not be completed.', theme: 'Toggle light/dark theme', size: 'Size', profileVersionNote: 'Bank rules are separate from XSD validation and never change the loaded data.', profileAuto: 'The profile was selected automatically from the debtor-agent BIC: {0}.'
    },
    de: {
      headline: 'Zahlungsauftrag vor dem Bankimport prüfen', intro: 'Die Datei wird vollständig in Ihrem Browser angezeigt und geprüft. Sie wird nicht hochgeladen.', dropTitle: 'pain.001-Datei auswählen', dropText: 'XML hier ablegen oder vom Gerät auswählen.', chooseFile: 'XML auswählen', privacy: 'Nur lokale Verarbeitung · maximal 10 MB', loadAnother: 'Andere Datei laden', checks: 'Prüfungen', validationTitle: 'Validierungsergebnis', bankProfile: 'Bankregeln', loadedData: 'Geladene Daten', documentContent: 'Auftragsinhalt', tabOverview: 'Übersicht', tabPayments: 'Zahlungen', tabFields: 'Alle Daten', tabXml: 'XML', footer: 'Private Verarbeitung im Browser · kein Datenupload', xmlTitle: 'XML-Format', xmlOk: 'Das XML ist wohlgeformt und verwendet einen pain.001-Namespace.', xsdTitle: 'XSD-Schema', xsdPending: 'Die genaue Struktur wird geprüft…', xsdOk: 'Das Dokument entspricht dem Schema {0}.', xsdInvalid: 'XSD hat {0} Fehler gefunden.', xsdUnsupported: 'Für Version {0} ist noch kein geprüftes XSD enthalten. Die Daten werden trotzdem angezeigt.', xsdUnavailable: 'Die Validierungs-Engine konnte nicht geladen werden.', bankTitle: 'Bankregeln', bankOff: 'Es ist kein Bankprofil ausgewählt.', bankOk: 'Alle Regeln des ausgewählten Profils wurden erfüllt.', bankProblems: '{0} Fehler · {1} Warnungen', noProfile: 'Kein Bankprofil', source: 'Regelquelle', effective: 'gültig ab', noFindings: 'Die Prüfungen haben keine Probleme gefunden.', messageId: 'Nachrichten-ID', created: 'Erstellt', transactions: 'Transaktionen', total: 'Summe', namespace: 'Namespace / Version', initiatingParty: 'Initiierende Partei', declaredTransactions: 'Deklarierte Transaktionen', controlSum: 'Kontrollsumme', paymentGroup: 'Zahlungsgruppe', method: 'Methode', serviceLevel: 'Service-Level', executionDate: 'Ausführungsdatum', debtor: 'Zahlungspflichtiger', debtorAccount: 'Konto des Zahlers', debtorAgent: 'Bank des Zahlers', creditor: 'Zahlungsempfänger', creditorAccount: 'Empfängerkonto', creditorAgent: 'Bank des Empfängers', amount: 'Betrag', endToEnd: 'EndToEnd-ID', instructionId: 'Instruction-ID', purpose: 'Zweck', remittance: 'Verwendungszweck', address: 'Adresse', path: 'XML-Pfad', value: 'Wert', filter: 'Pfad oder Wert filtern…', copyXml: 'XML kopieren', copied: 'Kopiert', empty: 'nicht angegeben', fileTooLarge: 'Die Datei überschreitet die Grenze von 10 MB.', doctype: 'XML mit DOCTYPE-Deklaration wird aus Sicherheitsgründen nicht unterstützt.', invalidXml: 'Die Datei ist kein gültiges XML.', invalidRoot: 'Das Wurzelelement muss Document sein.', invalidNamespace: 'Die Datei verwendet keinen ISO-20022-pain.001-Namespace.', missingInitiation: 'CstmrCdtTrfInitn fehlt im Dokument.', readError: 'Die Datei konnte nicht gelesen werden.', validationError: 'Die XSD-Validierung konnte nicht abgeschlossen werden.', theme: 'Helles/dunkles Design umschalten', size: 'Größe', profileVersionNote: 'Bankregeln sind von der XSD-Validierung getrennt und ändern nie die geladenen Daten.', profileAuto: 'Das Profil wurde automatisch anhand des BIC der Bank des Zahlers ausgewählt: {0}.'
    }
  };

  const xsdText = {
    cs: {
      invalidValue: 'Pole „{0}“ obsahuje neplatnou hodnotu „{1}“. {2}', missingAttribute: 'V poli „{0}“ chybí povinný atribut „{1}“.', unexpectedElement: 'Pole „{0}“ je na tomto místě neočekávané. Očekává se „{1}“; zkontrolujte také pořadí elementů.', missingElement: 'V části „{0}“ chybí povinné pole „{1}“.', pattern: 'Pole „{0}“ obsahuje hodnotu „{1}“ v neplatném formátu. Očekávaný vzor: {2}.', technical: 'Technický detail', generic: 'XSD kontrola našla problém: {0}', noHint: 'Hodnota neodpovídá datovému typu {0}.',
      fields: { CreDtTm: 'Vytvořeno', MsgId: 'ID zprávy', NbOfTxs: 'Počet transakcí', CtrlSum: 'Kontrolní součet', ReqdExctnDt: 'Datum provedení', InstdAmt: 'Částka', EndToEndId: 'EndToEnd ID', Ccy: 'Měna', IBAN: 'IBAN', BIC: 'BIC', BICFI: 'BIC' },
      hints: { ISODateTime: 'Očekává se datum a čas ISO 8601, např. 2026-09-29T10:30:00.', ISODate: 'Očekává se datum ve formátu RRRR-MM-DD, např. 2026-09-29.', ActiveOrHistoricCurrencyCode: 'Očekává se třípísmenný kód měny, např. EUR.', IBAN2007Identifier: 'Očekává se platný IBAN bez mezer.', Max35Text: 'Text musí mít nejvýše 35 znaků.' },
    },
    sk: {
      invalidValue: 'Pole „{0}“ obsahuje neplatnú hodnotu „{1}“. {2}', missingAttribute: 'V poli „{0}“ chýba povinný atribút „{1}“.', unexpectedElement: 'Pole „{0}“ je na tomto mieste neočakávané. Očakáva sa „{1}“; skontrolujte aj poradie elementov.', missingElement: 'V časti „{0}“ chýba povinné pole „{1}“.', pattern: 'Pole „{0}“ obsahuje hodnotu „{1}“ v neplatnom formáte. Očakávaný vzor: {2}.', technical: 'Technický detail', generic: 'XSD kontrola našla problém: {0}', noHint: 'Hodnota nezodpovedá dátovému typu {0}.',
      fields: { CreDtTm: 'Vytvorené', MsgId: 'ID správy', NbOfTxs: 'Počet transakcií', CtrlSum: 'Kontrolný súčet', ReqdExctnDt: 'Dátum vykonania', InstdAmt: 'Suma', EndToEndId: 'EndToEnd ID', Ccy: 'Mena', IBAN: 'IBAN', BIC: 'BIC', BICFI: 'BIC' },
      hints: { ISODateTime: 'Očakáva sa dátum a čas ISO 8601, napr. 2026-09-29T10:30:00.', ISODate: 'Očakáva sa dátum vo formáte RRRR-MM-DD, napr. 2026-09-29.', ActiveOrHistoricCurrencyCode: 'Očakáva sa trojpísmenový kód meny, napr. EUR.', IBAN2007Identifier: 'Očakáva sa platný IBAN bez medzier.', Max35Text: 'Text môže mať najviac 35 znakov.' },
    },
    en: {
      invalidValue: 'The “{0}” field contains an invalid value, “{1}”. {2}', missingAttribute: 'The required “{1}” attribute is missing from “{0}”.', unexpectedElement: 'The “{0}” field is not expected here. “{1}” is expected; also check the element order.', missingElement: 'The required “{1}” field is missing from “{0}”.', pattern: 'The “{0}” field contains “{1}” in an invalid format. Expected pattern: {2}.', technical: 'Technical detail', generic: 'XSD validation found a problem: {0}', noHint: 'The value does not match the {0} data type.',
      fields: { CreDtTm: 'Created', MsgId: 'Message ID', NbOfTxs: 'Transaction count', CtrlSum: 'Control sum', ReqdExctnDt: 'Execution date', InstdAmt: 'Amount', EndToEndId: 'EndToEnd ID', Ccy: 'Currency', IBAN: 'IBAN', BIC: 'BIC', BICFI: 'BIC' },
      hints: { ISODateTime: 'An ISO 8601 date and time is expected, for example 2026-09-29T10:30:00.', ISODate: 'A YYYY-MM-DD date is expected, for example 2026-09-29.', ActiveOrHistoricCurrencyCode: 'A three-letter currency code is expected, for example EUR.', IBAN2007Identifier: 'A valid IBAN without spaces is expected.', Max35Text: 'The text may contain at most 35 characters.' },
    },
    de: {
      invalidValue: 'Das Feld „{0}“ enthält den ungültigen Wert „{1}“. {2}', missingAttribute: 'Im Feld „{0}“ fehlt das erforderliche Attribut „{1}“.', unexpectedElement: 'Das Feld „{0}“ wird an dieser Stelle nicht erwartet. Erwartet wird „{1}“; prüfen Sie auch die Reihenfolge der Elemente.', missingElement: 'Im Abschnitt „{0}“ fehlt das erforderliche Feld „{1}“.', pattern: 'Das Feld „{0}“ enthält den Wert „{1}“ in einem ungültigen Format. Erwartetes Muster: {2}.', technical: 'Technisches Detail', generic: 'Die XSD-Prüfung hat ein Problem gefunden: {0}', noHint: 'Der Wert entspricht nicht dem Datentyp {0}.',
      fields: { CreDtTm: 'Erstellt', MsgId: 'Nachrichten-ID', NbOfTxs: 'Transaktionsanzahl', CtrlSum: 'Kontrollsumme', ReqdExctnDt: 'Ausführungsdatum', InstdAmt: 'Betrag', EndToEndId: 'EndToEnd-ID', Ccy: 'Währung', IBAN: 'IBAN', BIC: 'BIC', BICFI: 'BIC' },
      hints: { ISODateTime: 'Erwartet wird Datum und Uhrzeit nach ISO 8601, z. B. 2026-09-29T10:30:00.', ISODate: 'Erwartet wird ein Datum im Format JJJJ-MM-TT, z. B. 2026-09-29.', ActiveOrHistoricCurrencyCode: 'Erwartet wird ein dreistelliger Währungscode, z. B. EUR.', IBAN2007Identifier: 'Erwartet wird eine gültige IBAN ohne Leerzeichen.', Max35Text: 'Der Text darf höchstens 35 Zeichen enthalten.' },
    },
  };

  const state = {
    language: readLanguage(),
    file: null,
    xmlText: '',
    model: null,
    xsd: null,
    selectedProfileId: '',
    profileSelectionSource: '',
    detectedDebtorBic: '',
    bankFindings: [],
    validationToken: 0,
  };

  const elements = Object.fromEntries([
    'language', 'theme-toggle', 'drop-zone', 'file-input', 'choose-file', 'fatal', 'workspace',
    'file-name', 'file-meta', 'load-another', 'bank-profile', 'xml-status', 'xsd-status',
    'bank-status', 'profile-source', 'findings', 'panel-overview', 'panel-payments',
    'panel-fields', 'panel-xml', 'intro',
  ].map((id) => [id.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), document.getElementById(id)]));

  function readLanguage() {
    const requested = new URLSearchParams(location.search).get('language');
    if (languages.includes(requested)) {
      writeLanguageCookie(requested);
      return requested;
    }
    const saved = document.cookie.split(';')
      .map((item) => item.trim())
      .find((item) => item.startsWith(`${languageCookieName}=`));
    if (saved) {
      const value = decodeURIComponent(saved.slice(languageCookieName.length + 1));
      if (languages.includes(value)) return value;
    }
    const browser = (navigator.language || 'cs').slice(0, 2).toLowerCase();
    return languages.includes(browser) ? browser : 'cs';
  }

  function writeLanguageCookie(language) {
    document.cookie = `${languageCookieName}=${encodeURIComponent(language)}; Max-Age=31536000; Path=/; SameSite=Lax`;
  }

  function t(key, ...values) {
    const value = (ui[state.language] && ui[state.language][key]) || ui.en[key] || key;
    return String(value).replace(/\{(\d+)\}/g, (_, index) => values[Number(index)] ?? '');
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function valueOrEmpty(value) {
    return value ? escapeHtml(value) : `<span class="muted">${escapeHtml(t('empty'))}</span>`;
  }

  function localized(value) {
    if (!value || typeof value === 'string') return value || '';
    return value[state.language] || value.en || value.cs || Object.values(value)[0] || '';
  }

  function xsdFormat(template, ...values) {
    return String(template).replace(/\{(\d+)\}/g, (_, index) => values[Number(index)] ?? '');
  }

  function xsdFieldName(name) {
    const dictionary = xsdText[state.language] || xsdText.en;
    const label = dictionary.fields[name];
    return label ? `${label} (${name})` : name;
  }

  function friendlyXsdMessage(rawMessage) {
    const dictionary = xsdText[state.language] || xsdText.en;
    const parsed = core.parseXsdError(rawMessage);
    if (parsed.kind === 'invalidValue') {
      const hint = dictionary.hints[parsed.type] || xsdFormat(dictionary.noHint, parsed.type);
      return xsdFormat(dictionary.invalidValue, xsdFieldName(parsed.element), parsed.value, hint);
    }
    if (parsed.kind === 'missingAttribute') return xsdFormat(dictionary.missingAttribute, xsdFieldName(parsed.element), parsed.attribute);
    if (parsed.kind === 'unexpectedElement') return xsdFormat(dictionary.unexpectedElement, xsdFieldName(parsed.element), xsdFieldName(parsed.expected));
    if (parsed.kind === 'missingElement') return xsdFormat(dictionary.missingElement, xsdFieldName(parsed.element), xsdFieldName(parsed.expected));
    if (parsed.kind === 'pattern') return xsdFormat(dictionary.pattern, xsdFieldName(parsed.element), parsed.value, parsed.pattern);
    return xsdFormat(dictionary.generic, parsed.cleaned || parsed.raw);
  }

  function formatBytes(size) {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} kB`;
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  }

  function formatAmount(value, currency) {
    const number = Number(value);
    if (!Number.isFinite(number)) return [value, currency].filter(Boolean).join(' ');
    try {
      return new Intl.NumberFormat(state.language, currency ? { style: 'currency', currency } : {}).format(number);
    } catch (_) {
      return [value, currency].filter(Boolean).join(' ');
    }
  }

  function account(accountValue) {
    if (!accountValue) return '';
    return accountValue.iban || accountValue.otherId || accountValue.name || '';
  }

  function agent(agentValue) {
    if (!agentValue) return '';
    return [agentValue.name, agentValue.bic || agentValue.clearingMemberId || agentValue.otherId].filter(Boolean).join(' · ');
  }

  function address(addressValue) {
    if (!addressValue) return '';
    const street = [addressValue.street, addressValue.buildingNumber].filter(Boolean).join(' ');
    return [street, addressValue.postcode, addressValue.town, addressValue.region, addressValue.country, ...addressValue.addressLines].filter(Boolean).join(', ');
  }

  function applyTranslations() {
    document.documentElement.lang = state.language;
    document.querySelectorAll('[data-i18n]').forEach((node) => { node.textContent = t(node.dataset.i18n); });
    elements.language.value = state.language;
    elements.themeToggle.setAttribute('aria-label', t('theme'));
    elements.themeToggle.title = t('theme');
    renderProfileOptions();
    if (state.model) renderEverything();
  }

  function renderProfileOptions() {
    const previous = state.selectedProfileId;
    elements.bankProfile.innerHTML = `<option value="">${escapeHtml(t('noProfile'))}</option>` + profiles.map((profile) =>
      `<option value="${escapeHtml(profile.id)}">${escapeHtml(localized(profile.label))}</option>`
    ).join('');
    elements.bankProfile.value = previous;
  }

  function setStatus(element, status, title, note) {
    const icon = status === 'valid' ? '✓' : status === 'invalid' ? '!' : status === 'pending' ? '…' : 'i';
    element.dataset.status = status;
    element.innerHTML = `<div class="status-head"><span class="status-icon" aria-hidden="true">${icon}</span><span>${escapeHtml(title)}</span></div><p>${escapeHtml(note)}</p>`;
  }

  function renderStatuses() {
    setStatus(elements.xmlStatus, 'valid', t('xmlTitle'), t('xmlOk'));
    if (!state.xsd || state.xsd.status === 'pending') {
      setStatus(elements.xsdStatus, 'pending', t('xsdTitle'), t('xsdPending'));
    } else if (state.xsd.status === 'valid') {
      setStatus(elements.xsdStatus, 'valid', t('xsdTitle'), t('xsdOk', state.model.version));
    } else if (state.xsd.status === 'invalid') {
      setStatus(elements.xsdStatus, 'invalid', t('xsdTitle'), t('xsdInvalid', state.xsd.errors.length));
    } else if (state.xsd.status === 'unsupported') {
      setStatus(elements.xsdStatus, 'warning', t('xsdTitle'), t('xsdUnsupported', state.model.version));
    } else {
      setStatus(elements.xsdStatus, 'warning', t('xsdTitle'), t('xsdUnavailable'));
    }

    const profile = profiles.find((item) => item.id === state.selectedProfileId);
    if (!profile) {
      setStatus(elements.bankStatus, 'warning', t('bankTitle'), t('bankOff'));
      elements.profileSource.innerHTML = escapeHtml(t('profileVersionNote'));
      return;
    }
    const errors = state.bankFindings.filter((item) => item.severity === 'error').length;
    const warnings = state.bankFindings.filter((item) => item.severity === 'warning').length;
    setStatus(elements.bankStatus, errors ? 'invalid' : warnings ? 'warning' : 'valid', localized(profile.label), errors || warnings ? t('bankProblems', errors, warnings) : t('bankOk'));
    const automaticNote = state.profileSelectionSource === 'auto' && state.detectedDebtorBic
      ? `<strong>${escapeHtml(t('profileAuto', state.detectedDebtorBic))}</strong> `
      : '';
    elements.profileSource.innerHTML = `${automaticNote}${escapeHtml(t('source'))}: <a href="${escapeHtml(profile.source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(profile.source.title)}</a> · ${escapeHtml(t('effective'))} ${escapeHtml(profile.source.effectiveFrom)}`;
  }

  function renderFindings() {
    const findings = [];
    if (state.xsd && state.xsd.status === 'invalid') {
      state.xsd.errors.forEach((error, index) => findings.push({
        ruleId: `XSD-${index + 1}`,
        severity: 'error',
        message: friendlyXsdMessage(error.message),
        technicalMessage: error.message,
        path: error.line ? `line ${error.line}${error.column ? `:${error.column}` : ''}` : '',
      }));
    }
    findings.push(...state.bankFindings);
    if (!findings.length) {
      elements.findings.innerHTML = `<div class="all-clear">✓ ${escapeHtml(t('noFindings'))}</div>`;
      return;
    }
    elements.findings.innerHTML = findings.map((finding) => {
      const meta = [finding.path, finding.paymentId ? `${t('paymentGroup')}: ${finding.paymentId}` : '', finding.transactionId ? `${t('endToEnd')}: ${finding.transactionId}` : ''].filter(Boolean);
      const technical = finding.technicalMessage
        ? `<details class="finding-technical"><summary>${escapeHtml((xsdText[state.language] || xsdText.en).technical)}</summary><code>${escapeHtml(finding.technicalMessage)}</code></details>`
        : '';
      return `<article class="finding finding-${escapeHtml(finding.severity)}"><span class="finding-badge">${escapeHtml(finding.ruleId)}</span><div><p>${escapeHtml(localized(finding.message))}</p>${technical}</div>${meta.length ? `<div class="finding-meta">${meta.map((item) => `<span>${escapeHtml(item)}</span>`).join('')}</div>` : ''}</article>`;
    }).join('');
  }

  function definitionList(items) {
    return `<dl class="definition-list">${items.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${valueOrEmpty(value)}</dd></div>`).join('')}</dl>`;
  }

  function renderOverview() {
    const model = state.model;
    const totals = new Map();
    model.transactions.forEach((transaction) => {
      const currency = transaction.amount.currency || '—';
      const value = Number(transaction.amount.value);
      if (Number.isFinite(value)) totals.set(currency, (totals.get(currency) || 0) + value);
    });
    const totalText = totals.size
      ? Array.from(totals, ([currency, value]) => formatAmount(value, currency === '—' ? '' : currency)).join(' · ')
      : t('empty');
    elements.panelOverview.innerHTML = `
      <div class="summary-grid">
        <article class="metric"><span class="metric-label">${escapeHtml(t('messageId'))}</span><strong class="metric-value">${valueOrEmpty(model.header.messageId)}</strong></article>
        <article class="metric"><span class="metric-label">${escapeHtml(t('transactions'))}</span><strong class="metric-value">${model.transactions.length}</strong></article>
        <article class="metric"><span class="metric-label">${escapeHtml(t('total'))}</span><strong class="metric-value">${escapeHtml(totalText)}</strong></article>
        <article class="metric"><span class="metric-label">${escapeHtml(t('namespace'))}</span><strong class="metric-value">pain.001.${escapeHtml(model.version)}</strong></article>
      </div>
      <article class="detail-card"><h3>${escapeHtml(t('xmlTitle'))}</h3>${definitionList([
        [t('namespace'), model.namespace],
        [t('created'), model.header.creationDateTime],
        [t('initiatingParty'), model.header.initiatingParty && model.header.initiatingParty.name],
        [t('declaredTransactions'), model.header.declaredTransactionCount],
        [t('controlSum'), model.header.controlSum],
      ])}</article>`;
  }

  function transactionHtml(transaction) {
    const creditorName = transaction.creditor && transaction.creditor.name || t('empty');
    const amountText = formatAmount(transaction.amount.value, transaction.amount.currency);
    return `<details class="transaction" open><summary><span class="transaction-title">${escapeHtml(transaction.endToEndId || transaction.instructionId || `#${transaction.index}`)}</span><span class="transaction-party">${escapeHtml(creditorName)}</span><span class="transaction-amount">${escapeHtml(amountText)}</span></summary><div class="transaction-body">${definitionList([
      [t('endToEnd'), transaction.endToEndId],
      [t('instructionId'), transaction.instructionId],
      [t('amount'), amountText],
      [t('creditor'), creditorName],
      [t('creditorAccount'), account(transaction.creditorAccount)],
      [t('creditorAgent'), agent(transaction.creditorAgent)],
      [t('address'), address(transaction.creditor && transaction.creditor.address)],
      [t('purpose'), transaction.purpose || transaction.categoryPurpose],
      [t('remittance'), transaction.remittance.join(' · ')],
    ])}</div></details>`;
  }

  function renderPayments() {
    elements.panelPayments.innerHTML = state.model.groups.map((group) => `
      <article class="detail-card payment-group">
        <div class="payment-group-header"><h3>${escapeHtml(t('paymentGroup'))} ${escapeHtml(group.id || `#${group.index}`)}</h3><span class="muted">${group.transactions.length} ×</span></div>
        ${definitionList([
          [t('method'), group.method], [t('serviceLevel'), group.serviceLevel], [t('executionDate'), group.requestedExecutionDate],
          [t('debtor'), group.debtor && group.debtor.name], [t('debtorAccount'), account(group.debtorAccount)], [t('debtorAgent'), agent(group.debtorAgent)],
          [t('controlSum'), group.controlSum], [t('declaredTransactions'), group.declaredTransactionCount],
        ])}
        <div class="transaction-list">${group.transactions.map(transactionHtml).join('')}</div>
      </article>`).join('');
  }

  function renderFields(filterValue) {
    const query = String(filterValue || '').trim().toLocaleLowerCase(state.language);
    const fields = state.model.fields.filter((field) => !query || `${field.path}\n${field.value}`.toLocaleLowerCase(state.language).includes(query));
    elements.panelFields.innerHTML = `<div class="field-toolbar"><input id="field-filter" class="search" type="search" value="${escapeHtml(filterValue || '')}" placeholder="${escapeHtml(t('filter'))}" aria-label="${escapeHtml(t('filter'))}"></div><div class="table-wrap"><table><thead><tr><th>${escapeHtml(t('path'))}</th><th>${escapeHtml(t('value'))}</th></tr></thead><tbody>${fields.map((field) => `<tr><td>${escapeHtml(field.path)}</td><td>${escapeHtml(field.value)}</td></tr>`).join('')}</tbody></table></div>`;
    const filter = document.getElementById('field-filter');
    filter.addEventListener('input', () => {
      const position = filter.selectionStart;
      renderFields(filter.value);
      const replacement = document.getElementById('field-filter');
      replacement.focus();
      replacement.setSelectionRange(position, position);
    });
  }

  function renderXml() {
    elements.panelXml.innerHTML = `<div class="code-toolbar"><button id="copy-xml" class="button" type="button">${escapeHtml(t('copyXml'))}</button></div><pre class="xml-code"><code>${escapeHtml(core.formatXml(state.xmlText))}</code></pre>`;
    document.getElementById('copy-xml').addEventListener('click', async (event) => {
      try {
        await navigator.clipboard.writeText(state.xmlText);
        event.currentTarget.textContent = t('copied');
        setTimeout(() => { event.currentTarget.textContent = t('copyXml'); }, 1600);
      } catch (_) {
        event.currentTarget.textContent = t('copyXml');
      }
    });
  }

  function runBankValidation() {
    const profile = profiles.find((item) => item.id === state.selectedProfileId);
    state.bankFindings = profile && state.model ? profile.validate(state.model) : [];
  }

  function renderEverything() {
    runBankValidation();
    elements.fileName.textContent = state.file ? state.file.name : 'pain.001.xml';
    elements.fileMeta.textContent = `${t('size')}: ${formatBytes(state.file ? state.file.size : new TextEncoder().encode(state.xmlText).length)} · pain.001.${state.model.version}`;
    renderStatuses();
    renderFindings();
    renderOverview();
    renderPayments();
    renderFields('');
    renderXml();
  }

  function friendlyError(error) {
    const message = error && error.message || '';
    if (message === 'FILE_TOO_LARGE') return t('fileTooLarge');
    if (message === 'DOCTYPE_NOT_ALLOWED') return t('doctype');
    if (message.startsWith('INVALID_XML')) return t('invalidXml');
    if (message === 'INVALID_ROOT') return t('invalidRoot');
    if (message === 'INVALID_NAMESPACE') return t('invalidNamespace');
    if (message === 'MISSING_INITIATION') return t('missingInitiation');
    return t('readError');
  }

  async function loadFile(file) {
    elements.fatal.hidden = true;
    if (!file) return;
    if (file.size > core.MAX_FILE_SIZE) {
      showFatal(t('fileTooLarge'));
      return;
    }
    try {
      const xmlText = await file.text();
      const model = core.parseDocument(xmlText);
      state.file = file;
      state.xmlText = xmlText;
      state.model = model;
      const detectedProfile = core.detectBankProfile(model, profiles);
      state.selectedProfileId = detectedProfile ? detectedProfile.id : '';
      state.profileSelectionSource = detectedProfile ? 'auto' : '';
      state.detectedDebtorBic = model.groups.map((group) => group.debtorAgent && group.debtorAgent.bic).find(Boolean) || '';
      elements.bankProfile.value = state.selectedProfileId;
      state.xsd = { status: 'pending', errors: [] };
      const token = ++state.validationToken;
      elements.workspace.hidden = false;
      elements.dropZone.hidden = true;
      elements.intro.hidden = true;
      renderEverything();
      try {
        const result = await core.validateXsd(xmlText, model.namespace);
        if (token !== state.validationToken) return;
        state.xsd = result;
      } catch (error) {
        console.error(error);
        state.xsd = { status: 'unavailable', errors: [{ message: t('validationError') }] };
      }
      renderStatuses();
      renderFindings();
    } catch (error) {
      showFatal(friendlyError(error));
    }
  }

  function showFatal(message) {
    elements.fatal.textContent = message;
    elements.fatal.hidden = false;
  }

  function reset() {
    ++state.validationToken;
    state.file = null;
    state.xmlText = '';
    state.model = null;
    state.xsd = null;
    state.bankFindings = [];
    state.selectedProfileId = '';
    state.profileSelectionSource = '';
    state.detectedDebtorBic = '';
    elements.fileInput.value = '';
    elements.workspace.hidden = true;
    elements.dropZone.hidden = false;
    elements.intro.hidden = false;
    elements.fatal.hidden = true;
    elements.dropZone.focus();
  }

  function setupTheme() {
    let saved = '';
    try { saved = localStorage.getItem('pain-viewer-theme') || ''; } catch (_) {}
    const dark = saved ? saved === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('pain-viewer-theme', next); } catch (_) {}
  }

  elements.chooseFile.addEventListener('click', (event) => { event.stopPropagation(); elements.fileInput.click(); });
  elements.dropZone.addEventListener('click', () => elements.fileInput.click());
  elements.dropZone.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); elements.fileInput.click(); }
  });
  elements.fileInput.addEventListener('change', () => loadFile(elements.fileInput.files[0]));
  for (const eventName of ['dragenter', 'dragover']) {
    elements.dropZone.addEventListener(eventName, (event) => { event.preventDefault(); elements.dropZone.classList.add('is-dragging'); });
  }
  for (const eventName of ['dragleave', 'drop']) {
    elements.dropZone.addEventListener(eventName, (event) => { event.preventDefault(); elements.dropZone.classList.remove('is-dragging'); });
  }
  elements.dropZone.addEventListener('drop', (event) => loadFile(event.dataTransfer.files[0]));
  elements.loadAnother.addEventListener('click', reset);
  elements.themeToggle.addEventListener('click', toggleTheme);
  elements.language.addEventListener('change', () => {
    state.language = elements.language.value;
    writeLanguageCookie(state.language);
    applyTranslations();
  });
  elements.bankProfile.addEventListener('change', () => {
    state.selectedProfileId = elements.bankProfile.value;
    state.profileSelectionSource = 'manual';
    runBankValidation();
    renderStatuses();
    renderFindings();
  });
  document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((item) => {
      const active = item === tab;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', String(active));
      document.getElementById(`panel-${item.dataset.tab}`).hidden = !active;
    });
  }));

  setupTheme();
  applyTranslations();
})();
