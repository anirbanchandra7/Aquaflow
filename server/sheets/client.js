import { google } from 'googleapis';
import { readFileSync } from 'node:fs';

let sheetsClient = null;

function loadCredentials() {
  if (process.env.GOOGLE_SHEETS_CREDENTIALS) {
    return JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
  }
  if (process.env.GOOGLE_SHEETS_CREDENTIALS_FILE) {
    return JSON.parse(readFileSync(process.env.GOOGLE_SHEETS_CREDENTIALS_FILE, 'utf8'));
  }
  throw new Error(
    'Missing Google credentials: set GOOGLE_SHEETS_CREDENTIALS or GOOGLE_SHEETS_CREDENTIALS_FILE'
  );
}

export function getSheetsClient() {
  if (!sheetsClient) {
    const credentials = loadCredentials();
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    sheetsClient = google.sheets({ version: 'v4', auth });
  }
  return sheetsClient;
}

export function getSpreadsheetId() {
  const id = process.env.SPREADSHEET_ID;
  if (!id) throw new Error('Missing SPREADSHEET_ID environment variable');
  return id;
}
