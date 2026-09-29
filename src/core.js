(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.PainReaderCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const PAIN_NAMESPACE_PREFIX = 'urn:iso:std:iso:20022:tech:xsd:pain.001.';
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  function localName(node) {
    const name = node && (node.localName || node.nodeName) || '';
    return name.includes(':') ? name.slice(name.indexOf(':') + 1) : name;
  }

  function children(node, name) {
    if (!node) return [];
    return Array.from(node.children || []).filter((item) => !name || localName(item) === name);
  }

  function child(node, name) {
    return children(node, name)[0] || null;
  }

  function at(node, ...path) {
    let current = node;
    for (const part of path) {
      current = child(current, part);
      if (!current) return null;
    }
    return current;
  }

  function text(node, ...path) {
    const target = path.length ? at(node, ...path) : node;
    return target ? target.textContent.trim() : '';
  }

  function textAny(node, paths) {
    for (const path of paths) {
      const value = text(node, ...path);
      if (value) return value;
    }
    return '';
  }

  function indexedPath(node) {
    if (!node || node.nodeType !== 1) return '';
    const parts = [];
    let current = node;
    while (current && current.nodeType === 1) {
      const name = localName(current);
      const siblings = current.parentElement
        ? children(current.parentElement, name)
        : [];
      const suffix = siblings.length > 1 ? `[${siblings.indexOf(current) + 1}]` : '';
      parts.unshift(`${name}${suffix}`);
      current = current.parentElement;
    }
    return `/${parts.join('/')}`;
  }

  function parseAddress(node) {
    if (!node) return null;
    const addressLines = children(node, 'AdrLine').map((item) => text(item)).filter(Boolean);
    const address = {
      type: text(node, 'AdrTp'),
      department: text(node, 'Dept'),
      subDepartment: text(node, 'SubDept'),
      street: text(node, 'StrtNm'),
      buildingNumber: text(node, 'BldgNb'),
      buildingName: text(node, 'BldgNm'),
      floor: text(node, 'Flr'),
      postBox: text(node, 'PstBx'),
      room: text(node, 'Room'),
      postcode: text(node, 'PstCd'),
      town: textAny(node, [['TwnNm'], ['TownNm']]),
      townLocation: text(node, 'TwnLctnNm'),
      district: text(node, 'DstrctNm'),
      region: text(node, 'CtrySubDvsn'),
      country: text(node, 'Ctry'),
      addressLines,
      path: indexedPath(node),
    };
    address.present = Object.entries(address).some(([key, value]) =>
      !['path', 'present'].includes(key) && (Array.isArray(value) ? value.length > 0 : Boolean(value))
    );
    return address;
  }

  function parseParty(node) {
    if (!node) return null;
    const addressNode = child(node, 'PstlAdr');
    return {
      name: text(node, 'Nm'),
      countryOfResidence: text(node, 'CtryOfRes'),
      address: parseAddress(addressNode),
      organisationBic: textAny(node, [
        ['Id', 'OrgId', 'BICOrBEI'],
        ['Id', 'OrgId', 'AnyBIC'],
      ]),
      organisationId: textAny(node, [
        ['Id', 'OrgId', 'Othr', 'Id'],
        ['Id', 'PrvtId', 'Othr', 'Id'],
      ]),
      path: indexedPath(node),
    };
  }

  function parseAgent(node) {
    if (!node) return null;
    const institution = child(node, 'FinInstnId') || node;
    return {
      bic: textAny(institution, [['BIC'], ['BICFI']]),
      clearingMemberId: text(institution, 'ClrSysMmbId', 'MmbId'),
      lei: text(institution, 'LEI'),
      name: text(institution, 'Nm'),
      otherId: text(institution, 'Othr', 'Id'),
      address: parseAddress(child(institution, 'PstlAdr')),
      path: indexedPath(node),
    };
  }

  function parseAccount(node) {
    if (!node) return null;
    return {
      iban: text(node, 'Id', 'IBAN'),
      otherId: text(node, 'Id', 'Othr', 'Id'),
      currency: text(node, 'Ccy'),
      name: text(node, 'Nm'),
      path: indexedPath(node),
    };
  }

  function parseAmount(transaction) {
    const amountNode = at(transaction, 'Amt', 'InstdAmt') || at(transaction, 'Amt', 'EqvtAmt', 'Amt');
    return {
      value: amountNode ? text(amountNode) : '',
      currency: amountNode ? (amountNode.getAttribute('Ccy') || amountNode.getAttribute('CcyOfTrf') || '') : '',
    };
  }

  function parseTransaction(node, group, index) {
    const serviceLevel = textAny(node, [
      ['PmtTpInf', 'SvcLvl', 'Cd'],
      ['PmtTpInf', 'SvcLvl', 'Prtry'],
    ]) || group.serviceLevel;
    return {
      index: index + 1,
      instructionId: text(node, 'PmtId', 'InstrId'),
      endToEndId: text(node, 'PmtId', 'EndToEndId'),
      transactionId: text(node, 'PmtId', 'TxId'),
      uetr: text(node, 'PmtId', 'UETR'),
      amount: parseAmount(node),
      serviceLevel,
      categoryPurpose: textAny(node, [
        ['PmtTpInf', 'CtgyPurp', 'Cd'],
        ['PmtTpInf', 'CtgyPurp', 'Prtry'],
      ]),
      purpose: textAny(node, [['Purp', 'Cd'], ['Purp', 'Prtry']]),
      chargeBearer: text(node, 'ChrgBr') || group.chargeBearer,
      requestedExecutionDate: group.requestedExecutionDate,
      debtor: group.debtor,
      debtorAccount: group.debtorAccount,
      debtorAgent: group.debtorAgent,
      ultimateDebtor: parseParty(child(node, 'UltmtDbtr')),
      creditorAgent: parseAgent(child(node, 'CdtrAgt')),
      creditor: parseParty(child(node, 'Cdtr')),
      creditorAccount: parseAccount(child(node, 'CdtrAcct')),
      ultimateCreditor: parseParty(child(node, 'UltmtCdtr')),
      remittance: children(child(node, 'RmtInf'), 'Ustrd').map((item) => text(item)).filter(Boolean),
      path: indexedPath(node),
    };
  }

  function parsePaymentGroup(node, index) {
    const group = {
      index: index + 1,
      id: text(node, 'PmtInfId'),
      method: text(node, 'PmtMtd'),
      batchBooking: text(node, 'BtchBookg'),
      declaredTransactionCount: text(node, 'NbOfTxs'),
      controlSum: text(node, 'CtrlSum'),
      serviceLevel: textAny(node, [
        ['PmtTpInf', 'SvcLvl', 'Cd'],
        ['PmtTpInf', 'SvcLvl', 'Prtry'],
      ]),
      localInstrument: textAny(node, [
        ['PmtTpInf', 'LclInstrm', 'Cd'],
        ['PmtTpInf', 'LclInstrm', 'Prtry'],
      ]),
      requestedExecutionDate: textAny(node, [['ReqdExctnDt', 'Dt'], ['ReqdExctnDt']]),
      chargeBearer: text(node, 'ChrgBr'),
      debtor: parseParty(child(node, 'Dbtr')),
      debtorAccount: parseAccount(child(node, 'DbtrAcct')),
      debtorAgent: parseAgent(child(node, 'DbtrAgt')),
      transactions: [],
      path: indexedPath(node),
    };
    group.transactions = children(node, 'CdtTrfTxInf').map((transaction, txIndex) =>
      parseTransaction(transaction, group, txIndex)
    );
    return group;
  }

  function flattenFields(documentElement) {
    const result = [];
    function visit(node) {
      if (node.nodeType !== 1) return;
      const elementChildren = children(node);
      for (const attribute of Array.from(node.attributes || [])) {
        if (attribute.name === 'xmlns' || attribute.name.startsWith('xmlns:')) continue;
        result.push({ path: `${indexedPath(node)}/@${attribute.name}`, value: attribute.value });
      }
      if (!elementChildren.length) {
        const value = text(node);
        if (value) result.push({ path: indexedPath(node), value });
        return;
      }
      elementChildren.forEach(visit);
    }
    visit(documentElement);
    return result;
  }

  function parseDocument(xmlText, domParser) {
    if (typeof xmlText !== 'string') throw new Error('XML input must be text.');
    if (new TextEncoder().encode(xmlText).length > MAX_FILE_SIZE) {
      throw new Error('FILE_TOO_LARGE');
    }
    if (/<!DOCTYPE/i.test(xmlText)) throw new Error('DOCTYPE_NOT_ALLOWED');
    const Parser = domParser || (typeof DOMParser !== 'undefined' ? DOMParser : null);
    if (!Parser) throw new Error('DOMParser is not available.');
    const xml = new Parser().parseFromString(xmlText, 'application/xml');
    const parserError = xml.querySelector('parsererror');
    if (parserError) throw new Error(`INVALID_XML: ${parserError.textContent.trim()}`);
    const rootElement = xml.documentElement;
    const namespace = rootElement.namespaceURI || rootElement.getAttribute('xmlns') || '';
    if (localName(rootElement) !== 'Document') throw new Error('INVALID_ROOT');
    if (!namespace.startsWith(PAIN_NAMESPACE_PREFIX)) throw new Error('INVALID_NAMESPACE');
    const initiation = child(rootElement, 'CstmrCdtTrfInitn');
    if (!initiation) throw new Error('MISSING_INITIATION');
    const header = child(initiation, 'GrpHdr');
    const groups = children(initiation, 'PmtInf').map(parsePaymentGroup);
    const transactions = groups.flatMap((group) => group.transactions.map((transaction) => ({
      ...transaction,
      paymentGroupId: group.id,
      paymentGroupIndex: group.index,
    })));
    return {
      xml,
      namespace,
      version: namespace.slice(PAIN_NAMESPACE_PREFIX.length),
      header: {
        messageId: text(header, 'MsgId'),
        creationDateTime: text(header, 'CreDtTm'),
        declaredTransactionCount: text(header, 'NbOfTxs'),
        controlSum: text(header, 'CtrlSum'),
        initiatingParty: parseParty(child(header, 'InitgPty')),
      },
      groups,
      transactions,
      fields: flattenFields(rootElement),
    };
  }

  async function validateXsd(xmlText, namespace, engine, schemas) {
    const schemaMap = schemas || (typeof window !== 'undefined' ? window.__PAIN_SCHEMAS__ : null);
    const validate = engine || (typeof window !== 'undefined' ? window.validateXML : null);
    const schema = schemaMap && schemaMap[namespace];
    if (!schema) return { status: 'unsupported', valid: null, errors: [] };
    if (typeof validate !== 'function') return { status: 'unavailable', valid: null, errors: [] };
    const result = await validate({
      xml: [{ fileName: 'document.xml', contents: xmlText }],
      schema: [{ fileName: schema.fileName, contents: schema.contents }],
    });
    return {
      status: result.valid ? 'valid' : 'invalid',
      valid: Boolean(result.valid),
      errors: (result.errors || []).map((error) => ({
        message: error.message || error.rawMessage || String(error),
        line: error.loc && error.loc.lineNumber ? error.loc.lineNumber : null,
        column: error.loc && error.loc.columnNumber ? error.loc.columnNumber : null,
      })),
    };
  }

  function formatXml(xml) {
    const parser = new DOMParser();
    const documentNode = parser.parseFromString(xml, 'application/xml');
    if (documentNode.querySelector('parsererror')) return xml;
    const serializer = new XMLSerializer();
    const lines = [];
    function serialize(node, depth) {
      const indent = '  '.repeat(depth);
      const tag = node.nodeName;
      const attributes = Array.from(node.attributes || [])
        .map((attribute) => ` ${attribute.name}="${attribute.value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`)
        .join('');
      const elementChildren = children(node);
      const directText = Array.from(node.childNodes || [])
        .filter((item) => item.nodeType === 3 || item.nodeType === 4)
        .map((item) => item.nodeValue.trim())
        .filter(Boolean)
        .join(' ');
      if (!elementChildren.length) {
        if (!directText) lines.push(`${indent}<${tag}${attributes}/>`);
        else lines.push(`${indent}<${tag}${attributes}>${directText}</${tag}>`);
        return;
      }
      lines.push(`${indent}<${tag}${attributes}>`);
      elementChildren.forEach((item) => serialize(item, depth + 1));
      lines.push(`${indent}</${tag}>`);
    }
    const declaration = /^\s*<\?xml[^>]*\?>/.exec(xml);
    if (declaration) lines.push(declaration[0].trim());
    serialize(documentNode.documentElement, 0);
    return lines.join('\n') || serializer.serializeToString(documentNode);
  }

  return {
    MAX_FILE_SIZE,
    PAIN_NAMESPACE_PREFIX,
    at,
    child,
    children,
    formatXml,
    indexedPath,
    localName,
    parseAddress,
    parseDocument,
    text,
    validateXsd,
  };
});
