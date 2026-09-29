const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../src/core.js');
const kbsk = require('../src/banks/kbsk-2026.js');

function modelWithBics(...bics) {
  return {
    groups: bics.map((bic) => ({ debtorAgent: bic ? { bic } : null })),
  };
}

test('detects KB SK profile from 8-character debtor-agent BIC', () => {
  assert.equal(core.detectBankProfile(modelWithBics('KOMASK2X'), [kbsk]), kbsk);
});

test('detects KB SK profile from 11-character debtor-agent BIC', () => {
  assert.equal(core.detectBankProfile(modelWithBics('KOMASK2XXXX'), [kbsk]), kbsk);
});

test('does not select a profile for another debtor bank', () => {
  assert.equal(core.detectBankProfile(modelWithBics('TATRSKBX'), [kbsk]), null);
});

test('does not guess when debtor-agent BIC is absent', () => {
  assert.equal(core.detectBankProfile(modelWithBics(''), [kbsk]), null);
});

test('does not select one profile for a mixed-bank document', () => {
  assert.equal(core.detectBankProfile(modelWithBics('KOMASK2X', 'TATRSKBX'), [kbsk]), null);
});

test('parses an invalid ISO date-time XSD error into structured data', () => {
  const error = core.parseXsdError("Schemas validity error : Element '{urn:iso:std:iso:20022:tech:xsd:pain.001.001.03}CreDtTm': 'MASKED_DATETIME' is not a valid value of the atomic type '{urn:iso:std:iso:20022:tech:xsd:pain.001.001.03}ISODateTime'.");
  assert.deepEqual({ kind: error.kind, element: error.element, value: error.value, type: error.type }, {
    kind: 'invalidValue', element: 'CreDtTm', value: 'MASKED_DATETIME', type: 'ISODateTime',
  });
});
