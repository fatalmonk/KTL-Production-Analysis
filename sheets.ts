import { google } from "googleapis";
import dotenv from "dotenv";
import { getSpreadsheetId, getDataRange } from "./config";
dotenv.config();

const scopes = ["https://www.googleapis.com/auth/spreadsheets"];

export async function getClient() {
  const auth = new google.auth.GoogleAuth({ keyFile: "credentials.json", scopes });
  return await auth.getClient();
}

export async function read(range = getDataRange()) {
  const auth = await getClient();
  const sheets = google.sheets({ version: "v4", auth: auth as any });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range,
  });
  return res.data.values ?? [];
}

export async function write(range: string, values: any[][]) {
  const auth = await getClient();
  const sheets = google.sheets({ version: "v4", auth: auth as any });
  await sheets.spreadsheets.values.update({
    spreadsheetId: getSpreadsheetId(),
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}

export async function getSheetInfo() {
  const auth = await getClient();
  const sheets = google.sheets({ version: "v4", auth: auth as any });
  const res = await sheets.spreadsheets.get({
    spreadsheetId: getSpreadsheetId(),
  });
  return res.data;
}