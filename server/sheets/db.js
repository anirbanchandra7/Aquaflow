// Generic row-level CRUD on top of Google Sheets.
// Each tab is a table: row 1 = headers, rows 2..n = records.

import { nanoid } from 'nanoid';
import { getSheetsClient, getSpreadsheetId } from './client.js';
import { SHEETS } from './schema.js';

function headersFor(sheetName) {
  const headers = SHEETS[sheetName];
  if (!headers) throw new Error(`Unknown sheet: ${sheetName}`);
  return headers;
}

function rowToObject(headers, row) {
  const obj = {};
  headers.forEach((key, i) => {
    obj[key] = row[i] ?? '';
  });
  return obj;
}

function objectToRow(headers, obj) {
  return headers.map((key) => (obj[key] === undefined || obj[key] === null ? '' : String(obj[key])));
}

export function newId() {
  return nanoid(12);
}

export function nowIso() {
  return new Date().toISOString();
}

/** Return all records in a sheet as objects. Optional predicate filter. */
export async function getAll(sheetName, predicate) {
  const headers = headersFor(sheetName);
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: `${sheetName}!A2:${columnLetter(headers.length)}`,
  });
  const rows = res.data.values || [];
  const records = rows.map((row) => rowToObject(headers, row));
  return predicate ? records.filter(predicate) : records;
}

/** Find a single record by id. Returns null if not found. */
export async function findById(sheetName, id) {
  const records = await getAll(sheetName);
  return records.find((r) => r.id === id) || null;
}

/** Find records matching a set of field values, e.g. { distributor_id: 'x' }. */
export async function findWhere(sheetName, criteria) {
  return getAll(sheetName, (r) =>
    Object.entries(criteria).every(([k, v]) => r[k] === String(v))
  );
}

/** Append a new record. Generates id/created_at when the schema has them. */
export async function insert(sheetName, data) {
  const headers = headersFor(sheetName);
  const record = { ...data };
  if (headers.includes('id') && !record.id) record.id = newId();
  if (headers.includes('created_at') && !record.created_at) record.created_at = nowIso();

  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: getSpreadsheetId(),
    range: `${sheetName}!A1`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [objectToRow(headers, record)] },
  });
  return record;
}

/** Update a record by id with partial fields. Returns the updated record or null. */
export async function updateById(sheetName, id, updates) {
  const headers = headersFor(sheetName);
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: `${sheetName}!A2:${columnLetter(headers.length)}`,
  });
  const rows = res.data.values || [];
  const index = rows.findIndex((row) => (row[0] ?? '') === id);
  if (index === -1) return null;

  const existing = rowToObject(headers, rows[index]);
  const updated = { ...existing, ...updates, id: existing.id };
  const rowNumber = index + 2; // +1 for header row, +1 for 1-based indexing
  await sheets.spreadsheets.values.update({
    spreadsheetId: getSpreadsheetId(),
    range: `${sheetName}!A${rowNumber}:${columnLetter(headers.length)}${rowNumber}`,
    valueInputOption: 'RAW',
    requestBody: { values: [objectToRow(headers, updated)] },
  });
  return updated;
}

/** Convert 1-based column count to an A1-notation column letter (1 -> A, 27 -> AA). */
function columnLetter(n) {
  let s = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}
