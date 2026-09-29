(function (root, factory) {
  const profile = factory();
  if (typeof module === 'object' && module.exports) module.exports = profile;
  root.PainReaderBankProfiles = root.PainReaderBankProfiles || [];
  root.PainReaderBankProfiles.push(profile);
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const NAMESPACES = [
    'urn:iso:std:iso:20022:tech:xsd:pain.001.001.03',
    'urn:iso:std:iso:20022:tech:xsd:pain.001.001.09',
  ];

  const RULES = {
    namespace: { id: 'FIO-NAMESPACE', label: { cs: 'Podporovaná verze pain.001', sk: 'Podporovaná verzia pain.001', en: 'Supported pain.001 version', de: 'Unterstützte pain.001-Version' } },
    currency: { id: 'FIO-CURRENCY-EUR', label: { cs: 'Měna každé platby musí být EUR', sk: 'Mena každej platby musí byť EUR', en: 'Every payment must use EUR', de: 'Jede Zahlung muss EUR verwenden' } },
  };

  function reference(group, transaction) {
    return {
      paymentId: group.id || `#${group.index}`,
      transactionId: transaction && (transaction.endToEndId || transaction.instructionId || `#${transaction.index}`) || '',
    };
  }

  function addFinding(findings, rule, message, path, group, transaction) {
    findings.push({
      ruleId: rule.id,
      severity: 'error',
      message,
      path: path || '',
      ...reference(group, transaction),
    });
  }

  function validate(model) {
    const findings = [];
    const firstGroup = model.groups[0] || { index: 1 };

    if (!NAMESPACES.includes(model.namespace)) {
      addFinding(findings, RULES.namespace, {
        cs: 'Fio podle použité dokumentace přijímá platební příkazy pain.001 pouze ve verzích pain.001.001.03 a pain.001.001.09.',
        sk: 'Fio podľa použitej dokumentácie prijíma platobné príkazy pain.001 iba vo verziách pain.001.001.03 a pain.001.001.09.',
        en: 'According to the referenced documentation, Fio accepts pain.001 payment orders only as pain.001.001.03 or pain.001.001.09.',
        de: 'Laut der verwendeten Dokumentation akzeptiert Fio pain.001-Zahlungsaufträge nur als pain.001.001.03 oder pain.001.001.09.',
      }, '/Document', firstGroup, null);
      return findings;
    }

    for (const group of model.groups) {
      for (const transaction of group.transactions) {
        const currency = String(transaction.amount && transaction.amount.currency || '').toUpperCase();
        if (currency !== 'EUR') {
          addFinding(findings, RULES.currency, {
            cs: `Fio dovoluje import pain.001 pouze v měně EUR; tato platba používá ${currency || 'neuvedenou měnu'}.`,
            sk: `Fio dovoľuje import pain.001 iba v mene EUR; táto platba používa ${currency || 'neuvedenú menu'}.`,
            en: `Fio permits pain.001 imports in EUR only; this payment uses ${currency || 'an unspecified currency'}.`,
            de: `Fio erlaubt pain.001-Importe nur in EUR; diese Zahlung verwendet ${currency || 'keine angegebene Währung'}.`,
          }, `${transaction.path}/Amt/InstdAmt/@Ccy`, group, transaction);
        }
      }
    }

    return findings;
  }

  return {
    id: 'fio-cz-2025',
    label: {
      cs: 'Fio banka — API 1.9',
      sk: 'Fio banka — API 1.9',
      en: 'Fio banka — API 1.9',
      de: 'Fio banka — API 1.9',
    },
    description: {
      cs: 'Pravidla importu SEPA plateb přes Fio API.',
      sk: 'Pravidlá importu SEPA platieb cez Fio API.',
      en: 'SEPA payment import rules for the Fio API.',
      de: 'Regeln für den SEPA-Zahlungsimport über die Fio-API.',
    },
    source: {
      title: 'Fio API Bankovnictví, verze 1.9 (16. 10. 2025)',
      url: 'https://www.fio.cz/docs/cz/API_Bankovnictvi.pdf',
      effectiveFrom: '2025-10-16',
    },
    detection: {
      debtorAgentBics: ['FIOBCZPP'],
    },
    supportedNamespaces: NAMESPACES,
    rules: Object.values(RULES),
    validate,
  };
});
