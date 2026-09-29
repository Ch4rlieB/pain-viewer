(function (root, factory) {
  const profile = factory();
  if (typeof module === 'object' && module.exports) module.exports = profile;
  root.PainReaderBankProfiles = root.PainReaderBankProfiles || [];
  root.PainReaderBankProfiles.push(profile);
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const VERSION_03 = 'urn:iso:std:iso:20022:tech:xsd:pain.001.001.03';
  const VERSION_09 = 'urn:iso:std:iso:20022:tech:xsd:pain.001.001.09';
  const NAMESPACES = [VERSION_03, VERSION_09];

  const fieldLabels = {
    street: { cs: 'ulice (StrtNm)', sk: 'ulica (StrtNm)', en: 'street (StrtNm)', de: 'Straße (StrtNm)' },
    buildingNumber: { cs: 'číslo domu (BldgNb)', sk: 'číslo domu (BldgNb)', en: 'building number (BldgNb)', de: 'Hausnummer (BldgNb)' },
    postcode: { cs: 'PSČ (PstCd)', sk: 'PSČ (PstCd)', en: 'postcode (PstCd)', de: 'Postleitzahl (PstCd)' },
  };

  function localized(mapper) {
    return Object.fromEntries(['cs', 'sk', 'en', 'de'].map((language) => [language, mapper(language)]));
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

  function addressPath(transaction) {
    const address = transaction.creditor && transaction.creditor.address;
    return address && address.path || `${transaction.path}/Cdtr/PstlAdr`;
  }

  function validateVersion03(findings, group, transaction) {
    const address = transaction.creditor && transaction.creditor.address;
    const missing = [];
    if (!address || !address.country) missing.push('Ctry');
    if (!address || !address.addressLines || !address.addressLines.length) missing.push('AdrLine');
    if (missing.length) {
      addFinding(findings, 'CSAS-03-CREDITOR-ADDRESS', 'error', localized((language) => ({
        cs: `Pro pain.001.001.03 Česká spořitelna vyžaduje poštovní adresu příjemce se zemí (Ctry) a alespoň jedním řádkem adresy (AdrLine). Chybí: ${missing.join(', ')}.`,
        sk: `Pre pain.001.001.03 Česká sporiteľňa vyžaduje poštovú adresu príjemcu s krajinou (Ctry) a aspoň jedným riadkom adresy (AdrLine). Chýba: ${missing.join(', ')}.`,
        en: `For pain.001.001.03, Česká spořitelna requires the creditor postal address with country (Ctry) and at least one address line (AdrLine). Missing: ${missing.join(', ')}.`,
        de: `Für pain.001.001.03 verlangt Česká spořitelna die Postanschrift des Empfängers mit Land (Ctry) und mindestens einer Adresszeile (AdrLine). Es fehlt: ${missing.join(', ')}.`,
      }[language])), addressPath(transaction), group, transaction);
    }

    if (!address) return;
    const structuredFields = [
      ['type', 'AdrTp'], ['department', 'Dept'], ['subDepartment', 'SubDept'],
      ['street', 'StrtNm'], ['buildingNumber', 'BldgNb'], ['buildingName', 'BldgNm'],
      ['floor', 'Flr'], ['postBox', 'PstBx'], ['room', 'Room'], ['postcode', 'PstCd'],
      ['town', 'TwnNm'], ['townLocation', 'TwnLctnNm'], ['district', 'DstrctNm'],
      ['region', 'CtrySubDvsn'],
    ].filter(([field]) => address[field]).map(([, tag]) => tag);
    if (structuredFields.length) {
      addFinding(findings, 'CSAS-03-STRUCTURED-NOT-ALLOWED', 'error', localized((language) => ({
        cs: `Bankovní formát České spořitelny pain.001.001.03 povoluje v PstlAdr pouze Ctry a AdrLine. Odstraňte strukturované prvky: ${structuredFields.join(', ')}.`,
        sk: `Bankový formát Českej sporiteľne pain.001.001.03 povoľuje v PstlAdr iba Ctry a AdrLine. Odstráňte štruktúrované prvky: ${structuredFields.join(', ')}.`,
        en: `Česká spořitelna's pain.001.001.03 format permits only Ctry and AdrLine inside PstlAdr. Remove these structured elements: ${structuredFields.join(', ')}.`,
        de: `Das pain.001.001.03-Format von Česká spořitelna erlaubt in PstlAdr nur Ctry und AdrLine. Entfernen Sie diese strukturierten Elemente: ${structuredFields.join(', ')}.`,
      }[language])), address.path, group, transaction);
    }

    if (address.addressLines.length > 2) {
      addFinding(findings, 'CSAS-03-ADRLINE-LIMIT', 'error', {
        cs: `Česká spořitelna povoluje v pain.001.001.03 nejvýše dva prvky AdrLine; uvedeno je ${address.addressLines.length}.`,
        sk: `Česká sporiteľňa povoľuje v pain.001.001.03 najviac dva prvky AdrLine; uvedených je ${address.addressLines.length}.`,
        en: `Česká spořitelna permits at most two AdrLine elements in pain.001.001.03; ${address.addressLines.length} are present.`,
        de: `Česká spořitelna erlaubt in pain.001.001.03 höchstens zwei AdrLine-Elemente; vorhanden sind ${address.addressLines.length}.`,
      }, `${address.path}/AdrLine`, group, transaction);
    }
  }

  function validateVersion09(findings, group, transaction) {
    const address = transaction.creditor && transaction.creditor.address;
    const missingRequired = [];
    if (!address || !address.town) missingRequired.push('TwnNm');
    if (!address || !address.country) missingRequired.push('Ctry');

    if (missingRequired.length) {
      addFinding(findings, 'CSAS-09-CREDITOR-ADDRESS', 'error', localized((language) => ({
        cs: `Pro pain.001.001.09 Česká spořitelna vyžaduje ve strukturované adrese příjemce město (TwnNm) a zemi (Ctry). Chybí: ${missingRequired.join(', ')}.`,
        sk: `Pre pain.001.001.09 Česká sporiteľňa vyžaduje v štruktúrovanej adrese príjemcu mesto (TwnNm) a krajinu (Ctry). Chýba: ${missingRequired.join(', ')}.`,
        en: `For pain.001.001.09, Česká spořitelna requires town (TwnNm) and country (Ctry) in the structured creditor address. Missing: ${missingRequired.join(', ')}.`,
        de: `Für pain.001.001.09 verlangt Česká spořitelna Ort (TwnNm) und Land (Ctry) in der strukturierten Empfängeradresse. Es fehlt: ${missingRequired.join(', ')}.`,
      }[language])), addressPath(transaction), group, transaction);
      return;
    }

    const recommended = ['street', 'buildingNumber', 'postcode'].filter((field) => !address[field]);
    if (!recommended.length) return;
    addFinding(findings, 'CSAS-09-ADDRESS-RECOMMENDED', 'warning', localized((language) => {
      const labels = recommended.map((field) => fieldLabels[field][language]).join(', ');
      return {
        cs: `Česká spořitelna doporučuje pro spolehlivé zpracování doplnit také: ${labels}.`,
        sk: `Česká sporiteľňa odporúča pre spoľahlivé spracovanie doplniť aj: ${labels}.`,
        en: `For reliable processing, Česká spořitelna also recommends providing: ${labels}.`,
        de: `Für eine zuverlässige Verarbeitung empfiehlt Česká spořitelna außerdem: ${labels}.`,
      }[language];
    }), addressPath(transaction), group, transaction);
  }

  function validate(model) {
    const findings = [];
    const firstGroup = model.groups[0] || { index: 1 };
    if (!NAMESPACES.includes(model.namespace)) {
      addFinding(findings, 'CSAS-NAMESPACE', 'error', {
        cs: 'Česká spořitelna podle použité dokumentace přijímá SEPA příkazy pain.001 ve verzích pain.001.001.03 a pain.001.001.09.',
        sk: 'Česká sporiteľňa podľa použitej dokumentácie prijíma SEPA príkazy pain.001 vo verziách pain.001.001.03 a pain.001.001.09.',
        en: 'According to the referenced documentation, Česká spořitelna accepts pain.001 SEPA orders as pain.001.001.03 or pain.001.001.09.',
        de: 'Laut der verwendeten Dokumentation akzeptiert Česká spořitelna pain.001-SEPA-Aufträge als pain.001.001.03 oder pain.001.001.09.',
      }, '/Document', firstGroup, null);
      return findings;
    }

    if (model.namespace === VERSION_03) {
      addFinding(findings, 'CSAS-03-LEGACY-ADDRESS', 'info', {
        cs: 'Tento soubor používá starší pain.001.001.03. Česká spořitelna v této verzi výslovně přijímá adresu příjemce jako Ctry a jeden až dva volné řádky AdrLine; strukturované TwnNm vyžaduje až u pain.001.001.09.',
        sk: 'Tento súbor používa starší pain.001.001.03. Česká sporiteľňa v tejto verzii výslovne prijíma adresu príjemcu ako Ctry a jeden až dva voľné riadky AdrLine; štruktúrované TwnNm vyžaduje až pri pain.001.001.09.',
        en: 'This file uses the older pain.001.001.03. For this version, Česká spořitelna explicitly accepts the creditor address as Ctry plus one or two free-text AdrLine elements; structured TwnNm is required for pain.001.001.09.',
        de: 'Diese Datei verwendet das ältere pain.001.001.03. Für diese Version akzeptiert Česká spořitelna ausdrücklich Ctry und ein bis zwei freie AdrLine-Zeilen; ein strukturiertes TwnNm ist erst bei pain.001.001.09 erforderlich.',
      }, '/Document', firstGroup, null);
    }

    for (const group of model.groups) {
      for (const transaction of group.transactions) {
        if (model.namespace === VERSION_03) validateVersion03(findings, group, transaction);
        else validateVersion09(findings, group, transaction);
      }
    }
    return findings;
  }

  return {
    id: 'csas-2026',
    label: {
      cs: 'Česká spořitelna — od 14. 11. 2026',
      sk: 'Česká sporiteľňa — od 14. 11. 2026',
      en: 'Česká spořitelna — from 14 Nov 2026',
      de: 'Česká spořitelna — ab 14.11.2026',
    },
    description: {
      cs: 'Pravidla adresy příjemce pro SEPA a přeshraniční platby.',
      sk: 'Pravidlá adresy príjemcu pre SEPA a cezhraničné platby.',
      en: 'Creditor address rules for SEPA and cross-border payments.',
      de: 'Regeln für Empfängeradressen bei SEPA- und grenzüberschreitenden Zahlungen.',
    },
    source: {
      title: 'Změna formátu plateb – strukturovaná adresa příjemce',
      url: 'https://www.csas.cz/cs/george-help/george-business/co-je-noveho/2026/change-to-payment-format',
      effectiveFrom: '2026-11-14',
    },
    detection: {
      debtorAgentBics: ['GIBACZPX'],
    },
    supportedNamespaces: NAMESPACES,
    validate,
  };
});
