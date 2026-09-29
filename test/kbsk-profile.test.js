const test = require('node:test');
const assert = require('node:assert/strict');
const profile = require('../src/banks/kbsk-2026.js');

function address(values = {}) {
  return {
    street: '', buildingNumber: '', postcode: '', town: '', region: '', country: '',
    addressLines: [], path: '/Document/Cdtr/PstlAdr', present: true, ...values,
  };
}

function model(overrides = {}) {
  const transaction = {
    index: 1,
    endToEndId: 'E2E-1',
    instructionId: '',
    serviceLevel: 'SEPA',
    amount: { value: '10.00', currency: 'EUR' },
    creditor: { name: 'Supplier', address: address({ street: 'Hlavná', town: 'Bratislava', country: 'SK' }), path: '/Document/Cdtr' },
    creditorAgent: { bic: 'KOMASK2X', otherId: '', name: '', address: null, path: '/Document/CdtrAgt' },
    ultimateDebtor: null,
    ultimateCreditor: null,
    path: '/Document/CdtTrfTxInf',
  };
  const group = {
    index: 1,
    id: 'PAY-1',
    serviceLevel: 'SEPA',
    debtor: { name: 'Buyer', address: null, path: '/Document/Dbtr' },
    transactions: [transaction],
    path: '/Document/PmtInf',
  };
  const base = {
    namespace: 'urn:iso:std:iso:20022:tech:xsd:pain.001.001.03',
    header: { controlSum: '10.00' },
    groups: [group],
  };
  return Object.assign(base, overrides);
}

test('valid SEPA structured address passes KB SK profile', () => {
  assert.deepEqual(profile.validate(model()), []);
});

test('AdrLine-only SEPA address fails even though it is XSD-valid', () => {
  const input = model();
  input.groups[0].transactions[0].creditor.address = address({
    street: '', town: '', country: '', addressLines: ['Hlavná 10', 'Bratislava'],
  });
  const findings = profile.validate(input);
  assert.ok(findings.some((item) => item.ruleId === 'KBSK-ADDR-PARTIAL' && item.severity === 'error'));
  assert.ok(findings.some((item) => item.ruleId === 'KBSK-ADDR-ADRLINE' && item.severity === 'error'));
});

test('foreign payment without BIC requires agent name and structured address', () => {
  const input = model();
  const transaction = input.groups[0].transactions[0];
  input.groups[0].serviceLevel = '';
  transaction.serviceLevel = '';
  transaction.creditorAgent = { bic: '', otherId: '', name: '', address: null, path: '/Document/CdtrAgt' };
  const findings = profile.validate(input);
  assert.ok(findings.some((item) => item.ruleId === 'KBSK-AGENT-NAME'));
  assert.ok(findings.some((item) => item.ruleId === 'KBSK-ADDR-REQUIRED' && item.path.includes('CdtrAgt')));
});

test('USD payment to USA warns about recommended detailed address fields', () => {
  const input = model();
  const transaction = input.groups[0].transactions[0];
  input.groups[0].serviceLevel = '';
  transaction.serviceLevel = '';
  transaction.amount.currency = 'USD';
  transaction.creditor.address = address({ street: 'Main Street', town: 'New York', country: 'US' });
  transaction.creditorAgent = { bic: 'BOFAUS3N', otherId: '', name: '', address: null, path: '/Document/CdtrAgt' };
  const findings = profile.validate(input);
  assert.ok(findings.some((item) => item.ruleId === 'KBSK-US-ADDRESS' && item.severity === 'warning'));
  assert.ok(!findings.some((item) => item.ruleId === 'KBSK-ADDR-REQUIRED'));
});

test('unsupported namespace is rejected by the bank profile', () => {
  const input = model({ namespace: 'urn:iso:std:iso:20022:tech:xsd:pain.001.001.09' });
  const findings = profile.validate(input);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].ruleId, 'KBSK-NAMESPACE');
});
