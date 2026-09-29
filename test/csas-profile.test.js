const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../src/core.js');
const profile = require('../src/banks/csas-2026.js');

const VERSION_03 = 'urn:iso:std:iso:20022:tech:xsd:pain.001.001.03';
const VERSION_09 = 'urn:iso:std:iso:20022:tech:xsd:pain.001.001.09';

function address(values = {}) {
  return {
    street: '', buildingNumber: '', postcode: '', town: '', country: '',
    addressLines: [], path: '/Document/PmtInf/CdtTrfTxInf/Cdtr/PstlAdr', present: true,
    ...values,
  };
}

function model(namespace, creditorAddress) {
  return {
    namespace,
    groups: [{
      index: 1,
      id: 'PAY-1',
      debtorAgent: { bic: 'GIBACZPX' },
      transactions: [{
        index: 1,
        endToEndId: 'E2E-1',
        instructionId: '',
        creditor: { address: creditorAddress },
        path: '/Document/PmtInf/CdtTrfTxInf',
      }],
    }],
  };
}

test('pain.001.001.03 requires creditor Ctry and AdrLine', () => {
  const validFindings = profile.validate(model(VERSION_03, address({ country: 'DE', addressLines: ['Main Street 1'] })));
  assert.equal(validFindings.length, 1);
  assert.equal(validFindings[0].ruleId, 'CSAS-03-LEGACY-ADDRESS');
  assert.equal(validFindings[0].severity, 'info');
  const findings = profile.validate(model(VERSION_03, address({ country: 'DE' })));
  assert.equal(findings.length, 2);
  const addressFinding = findings.find((finding) => finding.ruleId === 'CSAS-03-CREDITOR-ADDRESS');
  assert.ok(addressFinding);
  assert.match(addressFinding.message.cs, /AdrLine/);
});

test('pain.001.001.03 rejects structured fields even alongside AdrLine', () => {
  const findings = profile.validate(model(VERSION_03, address({
    street: 'Main Street', buildingNumber: '1', postcode: '10115', town: 'Berlin',
    country: 'DE', addressLines: ['Main Street 1', '10115 Berlin'],
  })));
  const structuredFinding = findings.find((finding) => finding.ruleId === 'CSAS-03-STRUCTURED-NOT-ALLOWED');
  assert.ok(structuredFinding);
  assert.match(structuredFinding.message.cs, /StrtNm/);
  assert.match(structuredFinding.message.cs, /TwnNm/);
});

test('pain.001.001.03 permits no more than two AdrLine elements', () => {
  const findings = profile.validate(model(VERSION_03, address({
    country: 'DE', addressLines: ['Main Street 1', '10115', 'Berlin'],
  })));
  assert.ok(findings.some((finding) => finding.ruleId === 'CSAS-03-ADRLINE-LIMIT'));
});

test('pain.001.001.09 requires creditor TwnNm and Ctry', () => {
  const findings = profile.validate(model(VERSION_09, address({ country: 'DE' })));
  assert.equal(findings.length, 1);
  assert.equal(findings[0].ruleId, 'CSAS-09-CREDITOR-ADDRESS');
  assert.match(findings[0].message.cs, /TwnNm/);
});

test('pain.001.001.09 recommends street, building number and postcode', () => {
  const findings = profile.validate(model(VERSION_09, address({ town: 'Berlin', country: 'DE' })));
  assert.equal(findings.length, 1);
  assert.equal(findings[0].ruleId, 'CSAS-09-ADDRESS-RECOMMENDED');
  assert.equal(findings[0].severity, 'warning');

  assert.deepEqual(profile.validate(model(VERSION_09, address({
    street: 'Main Street', buildingNumber: '1', postcode: '10115', town: 'Berlin', country: 'DE',
  }))), []);
});

test('rejects a pain.001 namespace not listed by Česká spořitelna', () => {
  const findings = profile.validate(model('urn:iso:std:iso:20022:tech:xsd:pain.001.001.08', address()));
  assert.equal(findings.length, 1);
  assert.equal(findings[0].ruleId, 'CSAS-NAMESPACE');
});

test('detects Česká spořitelna from either 8- or 11-character BIC', () => {
  const input = model(VERSION_09, address({ town: 'Berlin', country: 'DE' }));
  assert.equal(core.detectBankProfile(input, [profile]), profile);
  input.groups[0].debtorAgent.bic = 'GIBACZPXXXX';
  assert.equal(core.detectBankProfile(input, [profile]), profile);
});
