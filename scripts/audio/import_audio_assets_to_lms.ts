import fs from "node:fs/promises";
import path from "node:path";
async function main() {
  const manifestPath = path.resolve(process.cwd(), "data/manifests/aws_polly_batch_manifest.csv");
  const csv = await fs.readFile(manifestPath, "utf8");
  const lines = csv.trim().split(/\r?\n/);
  console.log(`Ready to import ${lines.length - 1} BEA Polly audio assets into LMS media_assets.`);
  console.log("TODO: connect DB and attach media URLs to courses/modules/lessons/activities.");
}
main().catch((error) => { console.error(error); process.exit(1); });
