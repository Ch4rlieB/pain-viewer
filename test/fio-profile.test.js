const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../src/core.js');
const profile = require('../src/banks/fio-cz-2025.js');

function model({ namespace = 'urn:iso:std:iso:20022:tech:xsd:pain.001.001.09', currencies = ['EUR'] } = {}) {
  const group = {
    index: 1,
    id: 'PAY-1',
    debtorAgent: { bic: 'FIOBCZPPXXX' },
    path: '/Document/CstmrCdtTrfInitn/PmtInf',
    transactions: currencies.map((currency, index) => ({
      index: index + 1,
      instructionId: '',
      endToEndId: `E2E-${index + 1}`,
      amount: { value: '10.00', currency },
      path: `/Document/CstmrCdtTrfInitn/PmtInf/CdtTrfTxInf[${index + 1}]`,
    })),
  };
  return { namespace, groups: [group] };
}

test('accepts documented pain.001.001.03 and .09 EUR payments', () => {
  assert.deepEqual(profile.validate(model()), []);
  assert.deepEqual(profile.validate(model({
    namespace: 'urn:iso:std:iso:20022:tech:xsd:pain.001.001.03',
  })), []);
});

test('rejects a non-EUR transaction and identifies it', () => {
  const findings = profile.validate(model({ currencies: ['EUR', 'CZK'] }));
  assert.equal(findings.length, 1);
  assert.equal(findings[0].ruleId, 'FIO-CURRENCY-EUR');
  assert.equal(findings[0].transactionId, 'E2E-2');
  assert.match(findings[0].message.cs, /CZK/);
});

test('rejects pain.001 versions not listed by Fio', () => {
  const findings = profile.validate(model({
    namespace: 'urn:iso:std:iso:20022:tech:xsd:pain.001.001.08',
  }));
  assert.equal(findings.length, 1);
  assert.equal(findings[0].ruleId, 'FIO-NAMESPACE');
});

test('detects the Fio profile from either 8- or 11-character debtor-agent BIC', () => {
  assert.equal(core.detectBankProfile(model(), [profile]), profile);
  const shortBicModel = model();
  shortBicModel.groups[0].debtorAgent.bic = 'FIOBCZPP';
  assert.equal(core.detectBankProfile(shortBicModel, [profile]), profile);
});
