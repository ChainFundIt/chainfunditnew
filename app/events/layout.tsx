import type { Metadata } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://chainfundit.com";
const baseUrl = appUrl;

export const metadata: Metadata = {
  title: "The Impact Hangout | ChainFundIt",
  description:
    "Bring together friends, family, or colleagues over breakfast or an evening hangout — and turn that gathering into real impact. Register to host your Impact Hangout.",
  metadataBase: new URL(baseUrl),
  openGraph: {
    title: "The Impact Hangout | ChainFundIt",
    description:
      "Small gatherings. Big impact. Register to host your Impact Hangout and support education, medical care, or community relief.",
    url: `${baseUrl}/events`,
    siteName: "ChainFundIt",
    locale: "en_US",
    type: "website",
  },
};

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
