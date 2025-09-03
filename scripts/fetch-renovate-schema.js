import fs from "fs";
import fetch from "node-fetch";

async function main() {
  const url = "https://docs.renovatebot.com/renovate-schema.json";
  console.log("Fetching Renovate schema...");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch schema: ${res.statusText}`);
  const schema = await res.json();
  fs.writeFileSync("renovate-schema.json", JSON.stringify(schema, null, 2));
  console.log("Renovate schema saved to renovate-schema.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
