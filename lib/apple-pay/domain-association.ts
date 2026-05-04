import { existsSync, readFileSync } from "fs";
import { join } from "path";

/**
 * Apple Pay on the web (including PayPal Apple Pay) must serve raw bytes with
 * `Content-Type: application/octet-stream`.
 *
 * You may place the downloaded file at `public/.well-known/apple-developer-merchantid-domain-association`.
 * It must be the **decoded** association payload (binary JSON), not a hex-encoded ASCII string —
 * `normalizeAssociationBuffer` still auto-decodes hex if someone pastes PSP hex by mistake.
 *
 * Next.js may serve `public/` files for `/.well-known/...` directly (before rewrites). Keep this file
 * binary-correct; optional rewrite → `/api/apple-developer-merchantid-domain-association` uses the same loader.
 */

/** Paste env values from dashboard (often still hex text — we decode when applicable). */
function bufferFromStoredValue(raw: string): Buffer {
  const compact = raw.trim().replace(/\s+/g, "");
  if (
    /^[0-9a-fA-F]+$/.test(compact) &&
    compact.length % 2 === 0 &&
    compact.length >= 64
  ) {
    try {
      return Buffer.from(compact, "hex");
    } catch {
      // fall through
    }
  }
  return Buffer.from(raw, "utf8");
}

/** PayPal may give you a binary blob; some PSPs ship a hex-encoded ASCII file instead. */
function normalizeAssociationBuffer(buf: Buffer): Buffer {
  const compact = buf.toString("latin1").trim().replace(/\s+/g, "");
  if (
    /^[0-9a-fA-F]+$/.test(compact) &&
    compact.length % 2 === 0 &&
    compact.length >= 64
  ) {
    try {
      return Buffer.from(compact, "hex");
    } catch {
      return buf;
    }
  }
  return buf;
}

function readAssociationFromDisk(absPath: string): Buffer | null {
  if (!existsSync(absPath)) {
    return null;
  }
  const buf = readFileSync(absPath);
  return normalizeAssociationBuffer(buf);
}

/**
 * Bytes for `/.well-known/apple-developer-merchantid-domain-association`.
 *
 * Precedence:
 * 1. `PAYPAL_APPLE_PAY_DOMAIN_ASSOCIATION` — paste file contents (preferred for PayPal Apple Pay).
 * 2. `APPLE_PAY_DOMAIN_VERIFICATION_FILE` / `PAYSTACK_APPLE_PAY_DOMAIN_VERIFICATION_FILE`
 * 3. `public/.well-known/apple-developer-merchantid-domain-association` (typical drop location after PayPal download — binary).
 * 4. `lib/apple-pay/apple-developer-merchantid-domain-association`
 * 5. Legacy: `lib/apple-pay/fallback-domain-association.hex`
 *
 * Register the domain in PayPal Developer Dashboard for Apple Pay either way.
 */
export function getApplePayDomainAssociationBytes(): Buffer | null {
  const fromEnv =
    process.env.PAYPAL_APPLE_PAY_DOMAIN_ASSOCIATION?.trim() ||
    process.env.APPLE_PAY_DOMAIN_VERIFICATION_FILE?.trim() ||
    process.env.PAYSTACK_APPLE_PAY_DOMAIN_VERIFICATION_FILE?.trim();

  if (fromEnv) {
    return bufferFromStoredValue(fromEnv);
  }

  const publicWellKnown = join(
    process.cwd(),
    "public",
    ".well-known",
    "apple-developer-merchantid-domain-association"
  );
  const fromPublicWellKnown = readAssociationFromDisk(publicWellKnown);
  if (fromPublicWellKnown?.length) {
    return fromPublicWellKnown;
  }

  const repoRoot = join(process.cwd(), "lib", "apple-pay");

  const canonical = join(repoRoot, "apple-developer-merchantid-domain-association");
  const legacyHex = join(repoRoot, "fallback-domain-association.hex");

  const fromCanonical = readAssociationFromDisk(canonical);
  if (fromCanonical?.length) {
    return fromCanonical;
  }

  const fromLegacy = readAssociationFromDisk(legacyHex);
  if (fromLegacy?.length) {
    return fromLegacy;
  }

  return null;
}
