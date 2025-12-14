import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import PerformanceMonitor from "@/components/performance/PerformanceMonitor";
import ClientToaster from "@/components/ui/client-toaster";
import { GoogleAnalytics } from "@/components/layout/GoogleAnalytics";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { AutoFavoriteHandler } from "@/components/auth/auto-favorite-handler";
import  StartCampaignFab from "@/components/layout/StartCampaignFab";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const logoUrl = `/images/logo.svg`;
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "Chainfundit",
  description: "Raise funds, support dreams",
  openGraph: {
    title: "Chainfundit",
    description: "Raise funds, support dreams",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://chainfundit.com",
    siteName: "Chainfundit",
    images: [
      {
        url: logoUrl,
        width: 512,
        height: 512,
        alt: "Chainfundit Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Chainfundit",
    description: "Raise funds, support dreams",
    images: [logoUrl],
  },
  icons: {
    icon: "/images/logo.svg",
    apple: "/images/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-7VNFF33E8Z"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              
              // Check for existing consent
              const consent = localStorage.getItem('chainfundit_cookie_consent');
              let analyticsGranted = false;
              if (consent) {
                try {
                  const consentData = JSON.parse(consent);
                  analyticsGranted = consentData.accepted === true;
                } catch (e) {
                  analyticsGranted = false;
                }
              }
              
              // Set default consent state (denied until user accepts)
              gtag('consent', 'default', {
                analytics_storage: analyticsGranted ? 'granted' : 'denied',
              });
              
              // Only configure if consent is granted
              if (analyticsGranted) {
                gtag('config', 'G-7VNFF33E8Z', {
                  page_path: window.location.pathname,
                });
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jakarta.variable}`}
      >
        <div className="app-root">
          {children}
          <StartCampaignFab />
          <GoogleAnalytics />
          <PerformanceMonitor />
          <ClientToaster />
          <CookieBanner />
          <AutoFavoriteHandler />
        </div>
      </body>
    </html>
  );
}
