// One-time setup script: creates the required tabs in the spreadsheet
// (if missing) and writes the header row for each.
// Usage: npm run sheets:init (from /server, with .env configured)

import 'dotenv/config';
import { getSheetsClient, getSpreadsheetId } from './client.js';
import { SHEETS } from './schema.js';

async function main() {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existing = new Set(meta.data.sheets.map((s) => s.properties.title));

  const missing = Object.keys(SHEETS).filter((name) => !existing.has(name));
  if (missing.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: missing.map((title) => ({ addSheet: { properties: { title } } })),
      },
    });
    console.log(`Created tabs: ${missing.join(', ')}`);
  } else {
    console.log('All tabs already exist.');
  }

  // Write (or overwrite) header rows for every tab.
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'RAW',
      data: Object.entries(SHEETS).map(([title, headers]) => ({
        range: `${title}!A1`,
        values: [headers],
      })),
    },
  });
  console.log('Header rows written for all tabs.');
}

main().catch((err) => {
  console.error('Sheet init failed:', err.message);
  process.exit(1);
});
