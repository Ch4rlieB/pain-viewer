(function (root, factory) {
  const profile = factory();
  if (typeof module === 'object' && module.exports) module.exports = profile;
  root.PainReaderBankProfiles = root.PainReaderBankProfiles || [];
  root.PainReaderBankProfiles.push(profile);
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const NAMESPACES = [
    'urn:iso:std:iso:20022:tech:xsd:pain.001.001.02',
    'urn:iso:std:iso:20022:tech:xsd:pain.001.001.03',
    'urn:iso:std:iso:20022:tech:xsd:pain.001.001.04',
  ];

  const words = {
    role: {
      debtor: { cs: 'plátce', sk: 'platiteľa', en: 'debtor', de: 'Zahlungspflichtiger' },
      creditor: { cs: 'příjemce', sk: 'príjemcu', en: 'creditor', de: 'Zahlungsempfänger' },
      creditorAgent: { cs: 'banky příjemce', sk: 'banky príjemcu', en: 'creditor agent', de: 'Bank des Empfängers' },
      ultimateDebtor: { cs: 'konečného plátce', sk: 'konečného platiteľa', en: 'ultimate debtor', de: 'endgültiger Zahlungspflichtiger' },
      ultimateCreditor: { cs: 'konečného příjemce', sk: 'konečného príjemcu', en: 'ultimate creditor', de: 'endgültiger Zahlungsempfänger' },
    },
    field: {
      street: { cs: 'ulice (StrtNm)', sk: 'ulica (StrtNm)', en: 'street (StrtNm)', de: 'Straße (StrtNm)' },
      buildingNumber: { cs: 'číslo budovy (BldgNb)', sk: 'číslo budovy (BldgNb)', en: 'building number (BldgNb)', de: 'Hausnummer (BldgNb)' },
      postcode: { cs: 'PSČ (PstCd)', sk: 'PSČ (PstCd)', en: 'postcode (PstCd)', de: 'Postleitzahl (PstCd)' },
      town: { cs: 'město (TwnNm)', sk: 'mesto (TwnNm)', en: 'town (TwnNm)', de: 'Ort (TwnNm)' },
      region: { cs: 'region (CtrySubDvsn)', sk: 'región (CtrySubDvsn)', en: 'region (CtrySubDvsn)', de: 'Region (CtrySubDvsn)' },
      country: { cs: 'země (Ctry)', sk: 'krajina (Ctry)', en: 'country (Ctry)', de: 'Land (Ctry)' },
    },
  };

  function localized(mapper) {
    return Object.fromEntries(['cs', 'sk', 'en', 'de'].map((language) => [language, mapper(language)]));
  }

  function list(items, language) {
    return items.map((item) => words.field[item][language]).join(', ');
  }

  function reference(group, transaction) {
    return {
      paymentId: group.id || `#${group.index}`,
      transactionId: transaction && (transaction.endToEndId || transaction.instructionId || `#${transaction.index}`) || '',
    };
  }

  function addFinding(findings, ruleId, severity, message, path, group, transaction) {
    findings.push({
      ruleId,
      severity,
      message,
      path: path || '',
      ...reference(group, transaction),
    });
  }

  function hasAddress(address) {
    return Boolean(address && address.present);
  }

  function missing(address, fields) {
    return fields.filter((field) => !address || !address[field]);
  }

  function validateAddress(findings, address, role, requiredFields, group, transaction, required) {
    const roleLabel = words.role[role];
    const roleTags = {
      debtor: 'Dbtr',
      creditor: 'Cdtr',
      creditorAgent: 'CdtrAgt/FinInstnId',
      ultimateDebtor: 'UltmtDbtr',
      ultimateCreditor: 'UltmtCdtr',
    };
    let ownerPath = '';
    if (role === 'debtor') ownerPath = group.debtor && group.debtor.path || `${group.path}/Dbtr`;
    else if (transaction) ownerPath = transaction[role] && transaction[role].path || `${transaction.path}/${roleTags[role]}`;
    const basePath = address && address.path ? address.path : `${ownerPath}/PstlAdr`;

    if (!hasAddress(address) && !required) return;
    const absent = missing(address, requiredFields);
    if (absent.length) {
      addFinding(
        findings,
        required ? 'KBSK-ADDR-REQUIRED' : 'KBSK-ADDR-PARTIAL',
        'error',
        localized((language) => {
          const intro = {
            cs: `Strukturovaná adresa ${roleLabel.cs} musí obsahovat: `,
            sk: `Štruktúrovaná adresa ${roleLabel.sk} musí obsahovať: `,
            en: `The structured ${roleLabel.en} address must contain: `,
            de: `Die strukturierte Adresse für ${roleLabel.de} muss Folgendes enthalten: `,
          }[language];
          return intro + list(absent, language) + '.';
        }),
        basePath,
        group,
        transaction
      );
    }

    if (address && address.addressLines.length) {
      addFinding(
        findings,
        'KBSK-ADDR-ADRLINE',
        absent.length ? 'error' : 'warning',
        {
          cs: 'AdrLine nenahrazuje strukturovanou adresu. KB SK požaduje samostatné prvky adresy; AdrLine nedoporučuje používat.',
          sk: 'AdrLine nenahrádza štruktúrovanú adresu. KB SK požaduje samostatné prvky adresy; AdrLine neodporúča používať.',
          en: 'AdrLine does not replace a structured address. KB SK requires separate address elements and recommends not using AdrLine.',
          de: 'AdrLine ersetzt keine strukturierte Adresse. KB SK verlangt separate Adresselemente und empfiehlt, AdrLine nicht zu verwenden.',
        },
        `${address.path}/AdrLine`,
        group,
        transaction
      );
    }
  }

  function isSepa(transaction, group) {
    const value = String(transaction.serviceLevel || group.serviceLevel || '').toUpperCase();
    return value === 'SEPA' || value === 'INST';
  }

  function validate(model) {
    const findings = [];
    if (!NAMESPACES.includes(model.namespace)) {
      addFinding(findings, 'KBSK-NAMESPACE', 'error', {
        cs: 'KB SK podle použité dokumentace přijímá pouze pain.001.001.02, .03 a .04.',
        sk: 'KB SK podľa použitej dokumentácie prijíma iba pain.001.001.02, .03 a .04.',
        en: 'According to the referenced documentation, KB SK accepts only pain.001.001.02, .03 and .04.',
        de: 'Laut der verwendeten Dokumentation akzeptiert KB SK nur pain.001.001.02, .03 und .04.',
      }, '/Document', model.groups[0] || { index: 1 }, null);
      return findings;
    }
    if (!model.namespace.endsWith('.03')) {
      addFinding(findings, 'KBSK-VERSION-NOTE', 'warning', {
        cs: 'Detailní tabulky použité dokumentace KB SK platí pouze pro pain.001.001.03; kontrola této verze je proto orientační.',
        sk: 'Detailné tabuľky použitej dokumentácie KB SK platia iba pre pain.001.001.03; kontrola tejto verzie je preto orientačná.',
        en: 'The detailed tables in the referenced KB SK document apply only to pain.001.001.03, so this version is checked on a best-effort basis.',
        de: 'Die Detailtabellen des verwendeten KB-SK-Dokuments gelten nur für pain.001.001.03; diese Version wird daher nur näherungsweise geprüft.',
      }, '/Document', model.groups[0] || { index: 1 }, null);
    }

    for (const group of model.groups) {
      const groupIsSepa = ['SEPA', 'INST'].includes(String(group.serviceLevel || '').toUpperCase())
        || group.transactions.some((transaction) => isSepa(transaction, group));
      if (groupIsSepa && !model.header.controlSum) {
        addFinding(findings, 'KBSK-SEPA-CTRLSUM', 'error', {
          cs: 'Pro SEPA platby KB SK požaduje kontrolní součet GrpHdr/CtrlSum.',
          sk: 'Pre SEPA platby KB SK požaduje kontrolný súčet GrpHdr/CtrlSum.',
          en: 'KB SK requires GrpHdr/CtrlSum for SEPA payments.',
          de: 'KB SK verlangt GrpHdr/CtrlSum für SEPA-Zahlungen.',
        }, '/Document/CstmrCdtTrfInitn/GrpHdr/CtrlSum', group, null);
      }

      if (hasAddress(group.debtor && group.debtor.address)) {
        validateAddress(
          findings,
          group.debtor.address,
          'debtor',
          groupIsSepa ? ['town', 'country'] : ['street', 'town', 'country'],
          group,
          null,
          false
        );
      }

      for (const transaction of group.transactions) {
        const sepa = isSepa(transaction, group);
        const creditorCountry = transaction.creditor && transaction.creditor.address && transaction.creditor.address.country || '';
        const agent = transaction.creditorAgent;

        if (sepa) {
          const localSkId = agent && agent.otherId && (!creditorCountry || creditorCountry === 'SK');
          if (!agent || (!agent.bic && !localSkId)) {
            addFinding(findings, 'KBSK-SEPA-BIC', 'error', {
              cs: 'Pro SEPA platbu je povinný BIC banky příjemce; u platby v rámci Slovenska může být použit lokální identifikátor Othr.',
              sk: 'Pre SEPA platbu je povinný BIC banky príjemcu; pri platbe v rámci Slovenska môže byť použitý lokálny identifikátor Othr.',
              en: 'The creditor-agent BIC is mandatory for SEPA; a local Othr identifier may be used for a payment within Slovakia.',
              de: 'Für SEPA ist der BIC der Empfängerbank erforderlich; bei einer Zahlung innerhalb der Slowakei kann eine lokale Othr-Kennung verwendet werden.',
            }, agent ? agent.path : `${transaction.path}/CdtrAgt`, group, transaction);
          }
        } else if (!agent || !agent.bic) {
          if (!agent || !agent.name) {
            addFinding(findings, 'KBSK-AGENT-NAME', 'error', {
              cs: 'Pokud u zahraniční platby není BIC, musí být uveden název banky příjemce (CdtrAgt/FinInstnId/Nm).',
              sk: 'Ak pri zahraničnej platbe nie je BIC, musí byť uvedený názov banky príjemcu (CdtrAgt/FinInstnId/Nm).',
              en: 'When a foreign payment has no BIC, the creditor-agent name (CdtrAgt/FinInstnId/Nm) is required.',
              de: 'Wenn bei einer Auslandszahlung kein BIC vorhanden ist, ist der Name der Empfängerbank (CdtrAgt/FinInstnId/Nm) erforderlich.',
            }, agent ? agent.path : `${transaction.path}/CdtrAgt`, group, transaction);
          }
          validateAddress(findings, agent && agent.address, 'creditorAgent', ['street', 'town', 'country'], group, transaction, true);
        } else if (hasAddress(agent.address)) {
          validateAddress(findings, agent.address, 'creditorAgent', ['street', 'town', 'country'], group, transaction, false);
        }

        validateAddress(
          findings,
          transaction.creditor && transaction.creditor.address,
          'creditor',
          sepa ? ['town', 'country'] : ['street', 'town', 'country'],
          group,
          transaction,
          !sepa
        );

        for (const role of ['ultimateDebtor', 'ultimateCreditor']) {
          const address = transaction[role] && transaction[role].address;
          if (hasAddress(address)) {
            validateAddress(findings, address, role, sepa ? ['town', 'country'] : ['street', 'town', 'country'], group, transaction, false);
          }
        }

        const amountCurrency = String(transaction.amount.currency || '').toUpperCase();
        if (amountCurrency === 'USD' && creditorCountry === 'US') {
          const address = transaction.creditor && transaction.creditor.address;
          const recommended = missing(address, ['buildingNumber', 'postcode', 'region']);
          if (recommended.length) {
            addFinding(
              findings,
              'KBSK-US-ADDRESS',
              'warning',
              localized((language) => ({
                cs: `Pro platbu v USD do USA KB SK požaduje doplnit: ${list(recommended, language)}.`,
                sk: `Pre platbu v USD do USA KB SK požaduje doplniť: ${list(recommended, language)}.`,
                en: `For a USD payment to the USA, KB SK requests: ${list(recommended, language)}.`,
                de: `Für eine USD-Zahlung in die USA verlangt KB SK zusätzlich: ${list(recommended, language)}.`,
              }[language])),
              address ? address.path : `${transaction.path}/Cdtr/PstlAdr`,
              group,
              transaction
            );
          }
        }
      }
    }
    return findings;
  }

  return {
    id: 'kbsk-2026',
    label: {
      cs: 'KB Slovensko — od 20. 6. 2026',
      sk: 'KB Slovensko — od 20. 6. 2026',
      en: 'KB Slovakia — from 20 Jun 2026',
      de: 'KB Slowakei — ab 20.06.2026',
    },
    description: {
      cs: 'Pravidla formátu klientské iniciace plateb, zejména strukturované adresy.',
      sk: 'Pravidlá formátu klientskej iniciácie platieb, najmä štruktúrované adresy.',
      en: 'Client payment initiation rules, particularly structured addresses.',
      de: 'Regeln für die kundenseitige Zahlungsinitiierung, insbesondere strukturierte Adressen.',
    },
    source: {
      title: 'Klientský formát XML pro iniciaci plateb v KBSK (platnost od 20. 06. 2026)',
      url: 'https://www.kb.cz/getmedia/32b8497e-92b2-49cc-ac8a-c5b4e4b0e8b2/kbsk_format_xml_iniciace_.pdf',
      effectiveFrom: '2026-06-20',
    },
    supportedNamespaces: NAMESPACES,
    validate,
  };
});
