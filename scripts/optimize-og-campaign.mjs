#!/usr/bin/env node
/**
 * Optimizes public/og-campaign.png for social crawlers:
 * - Resize to 1200x630 (Facebook/OG recommended)
 * - Compress to < 300KB so crawlers don't timeout
 * Run: node scripts/optimize-og-campaign.mjs
 */
import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const inputPath = join(root, "public", "og-campaign.png");
const outputPath = inputPath;

const input = readFileSync(inputPath);
const targetWidth = 1200;
const targetHeight = 630;
const maxBytes = 280 * 1024; // 280 KB target

const buffer = await sharp(input)
  .resize(targetWidth, targetHeight, { fit: "cover" })
  .png({ compressionLevel: 9, effort: 10 })
  .toBuffer();

// If still too big, reduce quality by stripping metadata and recompressing
let result = buffer;
if (result.length > maxBytes) {
  result = await sharp(result)
    .png({ compressionLevel: 9, effort: 10, palette: true })
    .toBuffer();
}

writeFileSync(outputPath, result);
console.log(
  `og-campaign.png: ${(result.length / 1024).toFixed(1)} KB (1200x630)`
);
