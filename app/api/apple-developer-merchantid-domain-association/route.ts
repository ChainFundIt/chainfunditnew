import { NextResponse } from "next/server";
import { getApplePayDomainAssociation } from "@/lib/apple-pay/domain-association";

export async function GET() {
  const associationFile = await getApplePayDomainAssociation();

  if (!associationFile) {
    return new NextResponse("Apple Pay domain association file not configured.", {
      status: 404,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  return new NextResponse(associationFile, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

