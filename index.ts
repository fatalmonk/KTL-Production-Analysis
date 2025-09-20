import dotenv from "dotenv";
import { read, write } from "./sheets";
import { polish } from "./polish";
dotenv.config();

async function main() {
  const range = process.env.DATA_RANGE || "Sheet1!A1:Z";
  const rows = await read(range);
  console.log("Read rows:", rows.length);
  const cleaned = polish(rows);
  if (cleaned.length) {
    await write(range, cleaned);
    console.log("✅ Updated sheet.");
  }
}
main().catch(e => (console.error(e), process.exit(1)));