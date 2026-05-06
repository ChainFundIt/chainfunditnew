import { readFile } from "node:fs/promises";
import path from "node:path";

const ASSOCIATION_FILE_PATH = path.join(
  process.cwd(),
  "public",
  ".well-known",
  "apple-developer-merchantid-domain-association"
);

function getAssociationFromEnv(): string | null {
  const inlineValue =
    process.env.APPLE_PAY_DOMAIN_VERIFICATION_FILE ||
    process.env.PAYSTACK_APPLE_PAY_DOMAIN_VERIFICATION_FILE ||
    process.env.PAYPAL_APPLE_PAY_DOMAIN_ASSOCIATION_FILE;

  if (!inlineValue) return null;
  const trimmed = inlineValue.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function getApplePayDomainAssociation(): Promise<string | null> {
  const envValue = getAssociationFromEnv();
  if (envValue) return envValue;

  try {
    const fileContent = await readFile(ASSOCIATION_FILE_PATH, "utf8");
    const trimmed = fileContent.trim();
    return trimmed.length > 0 ? trimmed : null;
  } catch {
    return null;
  }
}

